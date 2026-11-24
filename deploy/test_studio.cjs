/* A deliberately small deployment smoke test: source data is mocked; no fabricated public metrics. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');const root=path.resolve(__dirname,'../site');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
assert.match(app,/studio:'studio'/);assert.match(app,/navStudio/);
assert.match(app,/case'studio':/);assert.match(html,/src\/studio\.js/);
assert.match(html,/src\/studio\.css/);assert.match(sw,/src\/studio\.js/);
const sandbox={window:{ATLAS_COUNTRIES:[{code:'USA',name:'United States'},{code:'FRA',name:'France'}],ATLAS_I18N:{en:{},ru:{},fr:{},es:{},ar:{},zh:{}},ATLAS_EVENTS:[{id:'a',date:'2026-01-01',country:'FRA',participants:[{code:'USA'}],city:'Paris',title:{en:'Sample test event'},source:'https://www.un.org/test'}],ATLAS_LIVE_EVENTS:{items:[]}},localStorage:{getItem:()=>null,setItem:()=>{}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/studio.js'),'utf8'),sandbox);
assert.equal(sandbox.window.AtlasStudio.prompts.length,5);
assert.equal(sandbox.window.AtlasStudio.related('USA').length,1);
for(const lang of ['en','ru','fr','es','ar','zh']){
 const html=sandbox.window.AtlasStudio.render({state:{lang}});
 assert.match(html,/data-rs-tab/);assert.match(html,/data-rs-case/);
 assert.ok(sandbox.window.ATLAS_I18N[lang].navStudio);
}
console.log('Research Studio route, assets, six languages and evidence-only event connections: OK');
