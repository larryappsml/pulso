const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function boot(seed){const nodes={},el=()=>({innerHTML:'',style:{setProperty(k,v){this[k]=v;}},dataset:{},setAttribute(k,v){this[k]=v;},querySelector(){return {textContent:''};},classList:{toggle(){}},textContent:''});const c={assert,console,now:0,localStorage:{getItem:()=>seed?JSON.stringify(seed):null,setItem(){}},document:{querySelector:s=>nodes[s]??=el(),querySelectorAll:()=>[],addEventListener(){}},window:{scrollTo(){},addEventListener(){}},location:{hash:''},history:{replaceState(){}},Date,performance:{now:()=>c.now},setTimeout(){},clearInterval(){},setInterval:()=>1,requestAnimationFrame:f=>f(),navigator:{},confirm:()=>true};vm.createContext(c);vm.runInContext(source,c);return c;}
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
data.level=0;prepare('morning');startSession();assert.equal($('#session').dataset.kegelState,'contract');assert.equal($('#session .orb-wrap').dataset.state,'contract');
now=1000;tick();togglePause();const left=active.remaining;assert.equal(left,2);assert.equal($('#session').dataset.kegelState,'paused');assert.equal($('#session .orb-wrap').style['--phase-remaining'],String(2/3));
now+=60000;tick();assert.equal(active.index,0);assert.equal(credits,0);
togglePause();assert.equal(active.deadline,now+left*1000);assert.equal($('#session').dataset.kegelState,'contract');
let transitions=0;
while(active){const p=active.phases[active.index];assert.equal($('#session').dataset.kegelState,p.expand?'contract':'relax');if(p.block==='finish'){assert.equal(credits,0);assert.equal($('#rep').textContent,'RELAJACIÓN FINAL');}if(p.block==='transition'){assert.equal($('#rep').textContent,'DESCANSO ENTRE BLOQUES');transitions++;}now=active.deadline;tick();}
assert.equal(credits,1);assert.equal(transitions,1);tick();assert.equal(credits,1);
prepare('evening');startSession();now+=1000;tick();closeSession();assert.equal(credits,1);assert.equal(active,null);
prepare('breath');assert.equal(active.totalSeconds,120);assert.equal(active.phases.length,24);
`,ctx);
for(let i=0;i<4;i++){const legacy=boot({level:i,days:{'2026-10-21':{morning:1}},activities:[{id:'kept'}]});vm.runInContext(`assert.equal(data.level,${[0,0,1,1][i]});assert.equal(data.days['2026-10-21'].morning,1);assert.equal(data.activities[0].id,'kept');`,legacy);const current=boot({level:i,kegelTimingVersion:2});vm.runInContext(`assert.equal(data.level,${i});`,current);}
console.log('PASS: 4 combined programs, exact durations, short cues/full rests, transition and final rest, block labels, pause/resume, one completion, abort uncredited, breathing unchanged.');




vm.runInContext(`for(const level of levels){const phases=buildKegelPhases(level),segments=sessionTimeline(phases);assert.equal(segments.length,phases.length);assert(Math.abs(segments.reduce((n,s)=>n+s.width,0)-100)<1e-10);assert.equal(segments.at(-1).end,kegelDuration(level));segments.forEach((s,i)=>{assert.equal(s.seconds,phases[i].seconds);assert.equal(s.state,phases[i].expand?'contract':'relax');assert(Math.abs(s.width/(phases[i].seconds/kegelDuration(level)*100)-1)<1e-12);if(i)assert.equal(s.start,segments[i-1].end);});}const parts=sessionTimeline(buildKegelPhases(levels[0]));assert.equal(parts[1].width/parts[0].width,2);assert(timelineMarkup(buildKegelPhases(levels[0])).includes('role="progressbar"'));`,ctx);
console.log('PASS: proportional segment lengths, 100% width, phase colors, contiguous seconds, accessibility.');



vm.runInContext(`for(const level of levels){const s=sessionTimeline(buildKegelPhases(level)),total=kegelDuration(level);s.forEach((p,i)=>{assert.equal(timelineY(p,s[i-1],1),p.state==='contract'?9:29);assert.equal(timelineY(p,s[i-1],0),(s[i-1]||p).state==='contract'?9:29);const d=timelinePath(p,s[i-1],total);assert(d.startsWith('M '+(p.start/total*1000)+' '));assert(d.endsWith('L '+(p.end/total*1000)+' '+(p.state==='contract'?9:29)));});}assert(timelineMarkup(buildKegelPhases(levels[0])).includes('timeline-wave'));`,ctx);
console.log('PASS: waveform endpoints, phase colors and proportional time mapping.');


