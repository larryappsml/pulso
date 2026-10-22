const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../progress.js'),'utf8'),ctx);const P=ctx.PulsoProgress;
let n=0;const activity=(type,date,extra={})=>({id:String(++n),type,date,at:1,...extra});
let a=[activity('morning','2026-10-21'),activity('breath','2026-10-21'),activity('control','2026-10-22')];
let s=P.summary(a,'2026-10-22');assert.equal(s.xp,200);assert.equal(s.multiplier,1.2);assert.equal(s.streak,1);assert.equal(s.level,2);
a.push(activity('breath','2026-10-22'));s=P.summary(a,'2026-10-22');assert.equal(s.xp,236);assert.equal(s.streak,2);assert.equal(s.dailyXP['2026-10-22'],156);
assert.equal(P.summary(a,'2026-10-24').streak,0);assert.equal(P.summary(a,'2026-10-24').multiplier,1);
assert.equal(P.summary([...a,a[0]],'2026-10-22').xp,236);
assert.equal(P.summary([],'2026-10-22').level,1);
for(const [xp,level,rank] of [[1600,5,'Intermedio'],[8100,10,'Avanzado']]){let list=Array.from({length:xp/100},()=>activity('control','2026-10-22'));const v=P.summary(list,'2026-10-22');assert.equal(v.level,level);assert(v.rank.includes(rank));}
assert.equal(P.previous('2026-03-01'),'2026-02-28');assert.equal(P.previous('2028-03-01'),'2028-02-29');assert.equal(P.previous('2026-01-01'),'2025-12-31');
let legacy={days:{'2026-10-21':{morning:1,breath:2,_goal:2}},goal:2,level:0};assert(P.valid(legacy));P.migrate(legacy);P.migrate(legacy);assert.equal(legacy.activities.length,2);assert.equal(P.summary(legacy.activities,'2026-10-21').xp,80);
assert(!P.valid({...legacy,activities:[activity('control','2026-10-22',{quality:11,seconds:60,intervals:1})]}));
let now=0;const clock=new P.RhythmClock(()=>now);clock.start();now=10000;assert(clock.alert());assert.equal(clock.elapsed,10000);assert.equal(clock.intervals,1);assert(!clock.alert());now=30000;clock.update();assert.equal(clock.left,10000);assert.equal(clock.elapsed,10000);clock.suspend();now=90000;clock.update();assert.equal(clock.left,10000);clock.unsuspend();now=100000;clock.update();assert.equal(clock.mode,'resume');assert.equal(clock.elapsed,10000);clock.resume();now=105000;clock.update();assert.equal(clock.elapsed,15000);clock.alert();assert.equal(clock.intervals,2);now+=30000;clock.update();clock.stop();assert.equal(clock.elapsed,15000);
console.log('PASS: XP, x1.2, levels, streaks, duplicate protection, migration/import, dates, cooldown, visibility pause, resume, intervals.');

