const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const model=fs.readFileSync(__dirname+'/../routines.js','utf8'),source=fs.readFileSync(__dirname+'/../app.js','utf8');
function boot(seed){const nodes={},el=()=>({innerHTML:'',style:{setProperty(k,v){this[k]=v;}},dataset:{},setAttribute(k,v){this[k]=v;},querySelector(){return {textContent:''};},classList:{toggle(){}},textContent:''});const c={assert,console,now:0,localStorage:{getItem:()=>seed?JSON.stringify(seed):null,setItem(){}},document:{querySelector:s=>nodes[s]??=el(),querySelectorAll:()=>[],addEventListener(){}},window:{scrollTo(){},addEventListener(){}},location:{hash:''},history:{replaceState(){}},Date,performance:{now:()=>c.now},setTimeout(){},clearInterval(){},setInterval:()=>1,requestAnimationFrame:f=>f(),navigator:{},confirm:()=>true};vm.createContext(c);vm.runInContext(model,c);vm.runInContext(source,c);return c;}
const ctx=boot({level:0,kegelTimingVersion:4,days:{kept:{morning:1}},habits:[{id:'kept',at:1}]});
vm.runInContext(`
assert.equal(levels.length,10);assert.equal(data.kegelTimingVersion,4);assert.equal(data.habits[0].id,'kept');
let credits=0;finish=()=>{credits++;active=null;};
for(const program of window.PulsoRoutines.programs)for(const r of program.days){
 const phases=window.PulsoRoutines.phases(r);active={id:'morning',phases,index:0,paused:true,started:false,totalSeconds:window.PulsoRoutines.duration(r)};
 const start=now;startSession();const initialCredits=credits;while(active){const p=active.phases[active.index];assert.equal($('#session').dataset.kegelState,p.expand?'contract':'relax');assert($('#rep').textContent.includes('BLOQUE '+p.blockNumber+' DE 5'));now=active.deadline;tick();}
 assert.equal(credits,initialCredits+1);assert.equal((now-start)/1000,window.PulsoRoutines.duration(r));tick();assert.equal(credits,initialCredits+1);
}
prepare('morning');startSession();now+=1250;tick();togglePause();const remaining=active.remaining,index=active.index;now+=90000;tick();assert.equal(active.index,index);assert.equal(active.remaining,remaining);togglePause();assert.equal(active.deadline,now+remaining*1000);closeSession();assert.equal(active,null);
prepare('breath');assert.equal(active.totalSeconds,120);
`,ctx);
for(const i of [0,1,2,3,4,5]){const c=boot({level:i,kegelTimingVersion:3,days:{}});vm.runInContext('assert.equal(data.level,'+i+');assert.equal(data.kegelTimingVersion,4);upgradeKegelTimings();assert.equal(data.level,'+i+');',c);}
console.log('PASS: all 54 real timer sessions, exact elapsed duration, five block labels, one completion each, pause/resume freeze, abort, breathing unchanged and migration without losing history.');
