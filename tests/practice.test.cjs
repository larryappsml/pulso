const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');let id=0;
const nodes={};const c={assert,Date,crypto:{randomUUID:()=>String(++id)},data:{level:0,days:{},activities:[],habits:[{id:'untouched',at:1}]},save(){},dayKey:()=> '2026-10-22',window:{},prepare(){},finish(){throw Error('Unexpected legacy finish');},render(){},startSession(){},togglePause(){},showJourneyCompletion(){},premiumIcon:()=>'',fmt:s=>String(s),cleanup(){},closeSession(){},navigate(){},active:null,document:{querySelectorAll:()=>[]},$:s=>nodes[s]??={innerHTML:'',hidden:true,dataset:{},setAttribute(){}}};
c.addActivity=(type,extra)=>{if(c.data.activities.some(a=>a.type===type&&a.date===c.dayKey()))return 0;c.data.activities.push({id:'xp'+(++id),type,date:c.dayKey(),at:Date.now(),...extra});return 50;};
vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../routines.js','utf8'),c);vm.runInContext(fs.readFileSync(__dirname+'/../practice.js','utf8').replace(/routineState\(\);render\(\);\s*$/,''),c);vm.runInContext('showRoutineCompletion=function(){};',c);
vm.runInContext(`
const testRoutine=R.routine(0,0);
for(const [slots,count,next] of [[{},0,'morning'],[{morning:1},1,'evening'],[{morning:1,evening:2},2,'evening']]){
 const card=kegelCard({slots},testRoutine);
 assert(card.includes('aria-valuenow="'+count+'"'));
 assert(card.includes('width:'+(count*50)+'%'));
 assert(card.includes('data-routine-session="'+next+'"'));
 assert.equal(card.includes(' disabled'),count===2);
}
`,c);
c.prepare('morning');assert.equal(c.active.totalSeconds,96);c.active.started=true;c.finish();assert.equal(c.data.routinePlan.day,0);assert.equal(c.data.activities.length,1);
c.prepare('evening');c.active.started=true;c.finish();assert.equal(c.data.routinePlan.day,1);assert.equal(c.data.activities.length,2);
c.prepare('extra');assert.equal(c.active.routine.day,0);c.active.started=true;c.finish();assert.equal(c.data.activities.length,3);assert.equal(c.data.routinePlan.day,1);
c.prepare('replay',{level:0,day:0});c.active.started=true;c.finish();assert.equal(c.data.activities.length,3);assert.equal(c.data.routinePlan.day,1);assert.equal(c.data.routinePlan.sessions.length,4);assert.equal(c.data.habits[0].id,'untouched');
vm.runInContext('assert(R.valid(data.routinePlan));',c);console.log('PASS: session integration, two-required advancement, third retains today routine, replay preserves XP/cursor, habit data retained.');


