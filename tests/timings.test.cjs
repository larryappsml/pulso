const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function boot(seed){const nodes={},el=()=>({innerHTML:'',style:{},classList:{toggle(){}},textContent:''});const c={assert,console,now:0,localStorage:{getItem:()=>seed?JSON.stringify(seed):null,setItem(){}},document:{querySelector:s=>nodes[s]??=el(),querySelectorAll:()=>[],addEventListener(){}},window:{scrollTo(){},addEventListener(){}},location:{hash:''},history:{replaceState(){}},Date,performance:{now:()=>c.now},setTimeout(){},clearInterval(){},setInterval:()=>1,requestAnimationFrame:f=>f(),navigator:{},confirm:()=>true};vm.createContext(c);vm.runInContext(source,c);return c;}
const ctx=boot();
vm.runInContext(`
const totals=[94,164,196,260];
for(let i=0;i<4;i++){
 const l=levels[i],p=buildKegelPhases(l);assert.equal(kegelDuration(l),totals[i]);
 assert.equal(p.filter(x=>x.block==='long'&&x.expand).length,l.reps);
 assert.equal(p.filter(x=>x.block==='quick'&&x.expand).length,l.quickReps);
 assert(p.filter(x=>x.block==='quick'&&x.expand).every(x=>x.seconds===1));
 assert(p.filter(x=>x.block==='quick'&&!x.expand).every(x=>x.seconds===3));
 assert.equal(p.filter(x=>x.block==='transition').length,1);
 assert.equal(p.at(-1).block,'finish');assert.equal(p.at(-1).seconds,10);
 data.level=i;prepare('morning');assert.equal(active.totalSeconds,totals[i]);
 assert.equal(active.phases.length,2*(l.reps+l.quickReps)+2);
}
let credits=0;finish=()=>{credits++;active=null;};
data.level=0;prepare('morning');startSession();
now=1000;tick();togglePause();const left=active.remaining;assert.equal(left,2);
now+=60000;tick();assert.equal(active.index,0);assert.equal(credits,0);
togglePause();assert.equal(active.deadline,now+left*1000);
let transitions=0;
while(active){const p=active.phases[active.index];if(p.block==='finish'){assert.equal(credits,0);assert.equal($('#rep').textContent,'RELAJACIÓN FINAL');}if(p.block==='transition'){assert.equal($('#rep').textContent,'DESCANSO ENTRE BLOQUES');transitions++;}now=active.deadline;tick();}
assert.equal(credits,1);assert.equal(transitions,1);tick();assert.equal(credits,1);
prepare('evening');startSession();now+=1000;tick();closeSession();assert.equal(credits,1);assert.equal(active,null);
prepare('breath');assert.equal(active.totalSeconds,120);assert.equal(active.phases.length,24);
`,ctx);
for(let i=0;i<4;i++){const legacy=boot({level:i,days:{'2026-10-21':{morning:1}},activities:[{id:'kept'}]});vm.runInContext(`assert.equal(data.level,${[0,0,1,1][i]});assert.equal(data.days['2026-10-21'].morning,1);assert.equal(data.activities[0].id,'kept');`,legacy);const current=boot({level:i,kegelTimingVersion:2});vm.runInContext(`assert.equal(data.level,${i});`,current);}
console.log('PASS: 4 combined programs, exact durations, short cues/full rests, transition and final rest, block labels, pause/resume, one completion, abort uncredited, breathing unchanged.');

