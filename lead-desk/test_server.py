import http.client
import json
import tempfile
import threading
import unittest
from pathlib import Path
from http.server import ThreadingHTTPServer
from server import database, import_records, list_leads, make_handler, update_lead


class LeadDeskTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = database(Path(self.tmp.name))
        self.record = {'subject':'A sample inquiry','mailUrl':'https://mail.proton.me/u/2/inbox/sample',
                       'fields':{'name':'Sample Visitor','email':'visitor@example.com','submitted_at':'2026-10-15T10:00:00Z','property_address':'Sample town'}}
        import_records(self.db,[self.record])
        self.lead = list_leads(self.db)[0]

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def test_import_is_idempotent_and_preserves_work(self):
        update_lead(self.db,self.lead['id'],{'revision':1,'notes':'Called visitor','status':'Waiting for customer','due_date':'2026-10-19'})
        self.assertEqual(import_records(self.db,[self.record]),0)
        lead=list_leads(self.db)[0]
        self.assertEqual(lead['notes'],'Called visitor')
        self.assertEqual(lead['status'],'Waiting for customer')

    def test_test_leads_are_retained_but_excluded(self):
        record={'fields':{**self.record['fields'],'name':'QA - Do Not Process','email':'test@example.com'}}
        import_records(self.db,[record])
        test=next(l for l in list_leads(self.db) if l['fields']['email']=='test@example.com')
        self.assertEqual(test['status'],'Test / duplicate')
        self.assertEqual(test['draft'],'')

    def test_import_does_not_invent_a_delayed_email_reply(self):
        self.assertEqual(self.lead['draft'],'')
        update_lead(self.db,self.lead['id'],{'revision':1,'draft':'An operator-prepared reply'})
        import_records(self.db,[self.record])
        self.assertEqual(list_leads(self.db)[0]['draft'],'An operator-prepared reply')

    def test_invalid_import_cannot_partially_add_records(self):
        valid={'fields':{**self.record['fields'],'email':'second@example.com'}}
        invalid={'fields':{**self.record['fields'],'submitted_at':'not a date'}}
        with self.assertRaises(ValueError):
            import_records(self.db,[valid,invalid])
        self.assertEqual(len(list_leads(self.db)),1)

    def test_updates_require_followup_and_reject_invalid_dates(self):
        for bad in ('','2026-02-30','2026-1-1','hello'):
            with self.assertRaises(ValueError):
                update_lead(self.db,self.lead['id'],{'revision':1,'due_date':bad})

    def test_conflicting_edit_cannot_overwrite(self):
        update_lead(self.db,self.lead['id'],{'revision':1,'notes':'First save'})
        with self.assertRaises(RuntimeError):
            update_lead(self.db,self.lead['id'],{'revision':1,'notes':'Stale save'})
        self.assertEqual(list_leads(self.db)[0]['notes'],'First save')

    def test_source_urls_and_fields_are_restricted(self):
        record={'mailUrl':'javascript:alert(1)','fields':{**self.record['fields'],'email':'next@example.com','secret':'should not persist'}}
        import_records(self.db,[record])
        lead=next(l for l in list_leads(self.db) if l['fields']['email']=='next@example.com')
        self.assertEqual(lead['mail_url'],'')
        self.assertNotIn('secret',lead['fields'])

    def test_http_blocks_cross_site_reads_writes_and_host_rebinding(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),make_handler(Path(self.tmp.name),0,'test-token'))
        port=server.server_port
        server.RequestHandlerClass=make_handler(Path(self.tmp.name),port,'test-token')
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        def request(method,path,headers={},body=None):
            conn=http.client.HTTPConnection('127.0.0.1',port)
            conn.request(method,path,body,headers)
            response=conn.getresponse();content=response.read();status=response.status;conn.close()
            return status,content
        try:
            self.assertEqual(request('GET','/api/leads',{'Origin':'https://evil.example'})[0],403)
            self.assertEqual(request('GET','/api/leads',{'Sec-Fetch-Site':'cross-site'})[0],403)
            self.assertEqual(request('GET','/api/leads',{'Host':'attacker.example'})[0],403)
            self.assertEqual(request('PATCH','/api/leads/'+self.lead['id'],{'Origin':f'http://127.0.0.1:{port}'},'{}')[0],403)
            self.assertEqual(request('GET','/api/leads')[0],200)
            self.assertEqual(request('GET','/../../leads.sqlite3')[0],404)
            status,_=request('PATCH','/api/leads/'+self.lead['id'],{'Origin':f'http://127.0.0.1:{port}','X-Desk-CSRF':'test-token','Content-Type':'application/json'},json.dumps({'revision':1,'notes':'Verified update'}))
            self.assertEqual(status,200)
        finally:
            server.shutdown();server.server_close();thread.join()

    def test_shared_response_module_has_an_exact_protected_asset_route(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),make_handler(Path(self.tmp.name),0,'test-token'))
        port=server.server_port
        server.RequestHandlerClass=make_handler(Path(self.tmp.name),port,'test-token')
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        def request(path,headers=None):
            conn=http.client.HTTPConnection('127.0.0.1',port)
            conn.request('GET',path,headers=headers or {})
            response=conn.getresponse();content=response.read()
            result=(response.status,dict(response.getheaders()),content);conn.close()
            return result
        try:
            status,headers,body=request('/lead-response.mjs')
            self.assertEqual(status,200)
            self.assertEqual(headers['Content-Type'],'text/javascript')
            self.assertEqual(headers['X-Content-Type-Options'],'nosniff')
            self.assertEqual(headers['Cache-Control'],'no-store')
            self.assertIn("script-src 'self'",headers['Content-Security-Policy'])
            self.assertIn(b'export',body)
            self.assertIn(b'buildLeadResponse',body)
            self.assertNotIn(b'visitor@example.com',body)
            self.assertIn(b'type="module"',request('/')[2])
            for path in ('/src/leadResponse.mjs','/src/App.jsx','/lead-response.mjs/../server.py',
                         '/%2e%2e/src/leadResponse.mjs','/server.py','/leads.sqlite3'):
                self.assertEqual(request(path)[0],404,path)
            self.assertEqual(request('/lead-response.mjs',{'Origin':'https://evil.example'})[0],403)
            self.assertEqual(request('/lead-response.mjs',{'Sec-Fetch-Site':'cross-site'})[0],403)
            self.assertEqual(request('/lead-response.mjs',{'Host':'attacker.example'})[0],403)
        finally:
            server.shutdown();server.server_close();thread.join()


if __name__=='__main__':
    unittest.main()
