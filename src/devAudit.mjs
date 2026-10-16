// Local QA only. This module is loaded only with ?audit=1 in Vite development.
import axe from 'axe-core';
const panel = document.createElement('aside');
panel.id = 'obx-audit-tools';
panel.setAttribute('aria-label', 'Development accessibility audit');
panel.style.cssText = 'position:fixed;right:16px;bottom:90px;z-index:20000;background:white;color:#082d42;border:2px solid #082d42;padding:12px;max-width:min(700px,90vw);max-height:65vh;overflow:auto;font:14px/1.5 system-ui';
const button = document.createElement('button');
button.textContent = 'Run accessibility audit';
button.style.cssText = 'min-height:44px;padding:8px 14px';
const output = document.createElement('pre');
output.id = 'obx-audit-result';
output.style.cssText = 'white-space:pre-wrap;max-height:50vh;overflow:auto';
async function runAudit() {
  button.disabled = true;
  const result = await axe.run({ exclude: [['#obx-audit-tools']] }, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice'] } });
  output.textContent = JSON.stringify({ url: location.pathname, viewport: [innerWidth,innerHeight], violations: result.violations.map(v => ({ id:v.id, impact:v.impact, description:v.description, helpUrl:v.helpUrl, nodes:v.nodes.map(n => ({target:n.target,summary:n.failureSummary})) })), incomplete:result.incomplete.map(v => ({id:v.id,nodes:v.nodes.map(n => ({target:n.target,summary:n.failureSummary}))})), passes:result.passes.length },null,2);
  button.disabled = false;
}
button.addEventListener('click', runAudit);
document.addEventListener('keydown', event => { if (event.altKey && event.shiftKey && event.code === 'KeyA') { event.preventDefault(); runAudit(); } });
panel.append(button,output); document.body.appendChild(panel);
