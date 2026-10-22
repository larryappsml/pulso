const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../routines.js','utf8'),ctx);const R=ctx.PulsoRoutines;
const durations=[[96,102,106,120],[134,138,149,153],[157,168,169,175,195],[210,214,218,222,216],[226,230,234,248,248,258],[273,284,295,288,292,296],[300,304,316,320,324,324],[332,332,345,349,353,357],[375,375,387,396,400,404],[426,441,445,449,453,468]];
assert.equal(R.programs.length,10);assert.equal(R.programs.reduce((n,p)=>n+p.days.length,0),54);
R.programs.forEach((p,l)=>p.days.forEach((r,d)=>{assert.equal(R.duration(r),durations[l][d]);assert.equal(r.blocks.length,5);const phases=R.phases(r);assert.equal(phases.reduce((n,p)=>n+p.seconds,0),durations[l][d]);assert.equal(phases.length,R.reps(r)*2);phases.forEach((p,i)=>{assert(p.seconds>0);assert.equal(p.expand,i%2===0);assert(!['transition','finish'].includes(p.block));if(p.block==='quick')assert.equal(p.seconds,1);});}));
assert.equal(R.reps(R.routine(0,0)),32);assert.equal(R.reps(R.routine(9,5)),104);
assert.equal(R.routine(2,2).blocks[4].hold,3);assert.equal(R.routine(2,4).blocks[4].rest,3);assert.equal(R.routine(8,0).blocks[4].hold,9);
let s=R.newState(),id=0;function entry(type,date,pos=R.assignment(s,date)){return {id:String(++id),type,date,at:Date.now(),seconds:R.duration(R.routine(pos.level,pos.day)),level:pos.level,day:pos.day};}
let a=R.assignment(s,'2026-10-22');assert.equal(R.record(s,entry('extra','2026-10-22')).saved,false);
const first=entry('morning','2026-10-22');R.record(s,first);assert.equal(s.day,0);assert.equal(R.record(s,first).saved,false);
assert.equal(R.record(s,entry('morning','2026-10-22')).saved,false);
assert.equal(R.record(s,entry('evening','2026-10-22')).advanced,true);assert.equal(s.day,1);
assert.equal(R.assignment(s,'2026-10-22').day,0);assert.equal(R.record(s,entry('extra','2026-10-22')).saved,true);assert.equal(s.day,1);
R.record(s,entry('replay','2026-10-22',{level:0,day:0}));assert.equal(s.day,1);assert(R.valid(s));
s=JSON.parse(JSON.stringify(s));assert(R.valid(s));assert.equal(s.sessions.length,4);
R.assignment(s,'2026-10-25');assert.equal(s.day,1);
for(let n=0;n<53;n++){const date=new Date(2026,10,1+n).toISOString().slice(0,10);R.record(s,entry('morning',date));R.record(s,entry('evening',date));assert(R.valid(s));}
assert.equal(s.finished,true);assert.equal(s.level,9);assert.equal(s.day,5);
assert(R.available(s,0,0));assert(!R.available(R.newState(),9,0));
const bad=JSON.parse(JSON.stringify(s));bad.calendar['2026-11-01'].slots.morning='missing';assert(!R.valid(bad));
console.log('PASS: all 54 transcribed routines, exact computed durations, 5 blocks, rapid 1/1, no added rests, two required sessions, optional third, calendar pinning, replay, persistence, all level transitions and import validation.');
