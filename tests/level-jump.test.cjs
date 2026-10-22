const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../routines.js','utf8'),ctx);const R=ctx.PulsoRoutines,date='2026-10-22';
const s=R.newState();R.assignment(s,date);
assert(R.jumpLevel(s,5,date).changed);assert.equal(s.level,5);assert.equal(s.day,0);assert.equal(s.calendar[date].level,5);assert.equal(s.sessions.length,0);assert(R.valid(s));
assert(!R.jumpLevel(s,4,date).changed);assert(!R.jumpLevel(s,10,date).changed);assert(!R.jumpLevel(s,6,'invalid').changed);
let i=0;const record=(s,type,date)=>{const a=R.assignment(s,date);return R.record(s,{id:String(++i),type,date,at:1,seconds:100,level:a.level,day:a.day});};
const partial=R.newState();record(partial,'morning',date);const saved=JSON.stringify(partial.sessions);assert(R.jumpLevel(partial,6,date).tomorrow);assert.equal(partial.calendar[date].level,0);record(partial,'evening',date);assert.equal(partial.level,6);assert.equal(partial.day,0);assert.equal(partial.sessions[0].level,0);assert(R.valid(partial));assert.equal(R.assignment(partial,'2026-10-23').level,6);
record(s,'morning',date);assert(record(s,'evening',date).advanced);assert.equal(s.day,1);assert.equal(s.sessions.length,2);assert(R.valid(JSON.parse(JSON.stringify(s))));
console.log('PASS: forward level selection, immediate empty-day reassignment, partial-day preservation, next-day activation, no fake sessions, normal advancement, persistence and validation.');
