import { getBreadcrumbs } from './breadcrumbs.mjs';

const site='https://www.obxncinsurance.com';
export function pageSchema(page) {
  const url=site+(page.slug?`/${page.slug}/`:'/');
  const graph=[
    {'@type':'Organization','@id':site+'/#organization',name:'OBXNCInsurance.com',url:site+'/',email:'obxpropertyinsurance@proton.me'},
    {'@type':'WebSite','@id':site+'/#website',name:'OBXNCInsurance.com',url:site+'/',publisher:{'@id':site+'/#organization'}},
    {'@type':page.sections&&page.image?'Article':'WebPage','@id':url+'#webpage',url,name:page.title,headline:page.h1||page.heading||page.title,description:page.description,dateModified:page.lastReviewed,isPartOf:{'@id':site+'/#website'},publisher:{'@id':site+'/#organization'},...(page.image?{image:page.image.url}:{}),...(page.sources?.length?{citation:page.sources.map(s=>s.url)}:{})},
  ];
  if(!page.slug) graph.push({'@type':'Service','@id':site+'/#request-preparation',name:'Outer Banks insurance request preparation',serviceType:'Educational insurance guides and property request intake',areaServed:'Outer Banks, North Carolina',provider:{'@id':site+'/#organization'}});
  if(page.slug) graph.push({'@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:getBreadcrumbs(page).map((crumb,index)=>(
    {'@type':'ListItem',position:index+1,name:crumb.name,item:site+crumb.href}
  ))});
  if(page.faqs?.length) graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:page.faqs.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))});
  if(page.dataTable) graph.push({'@type':'Dataset','@id':url+'#dataset',name:page.dataTable.title,description:page.dataTable.note||page.dataTable.intro,url,creator:{'@id':site+'/#organization'},variableMeasured:page.dataTable.columns.map(c=>c.label),citation:page.sources.map(s=>s.url)});
  return {'@context':'https://schema.org','@graph':graph};
}
