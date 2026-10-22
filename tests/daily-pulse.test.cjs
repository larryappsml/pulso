const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={data:{activities:[],days:{}},dayKey:()=> '2026-10-22',prepare(){},finish(){},render(){},startSession(){},togglePause(){},window:{}};
vm.createContext(ctx);const source=fs.readFileSync(__dirname+'/../practice.js','utf8');vm.runInContext(source.slice(source.indexOf('function dailyPulseCount'),source.indexOf('function kegelCard'))+'\nfunction routineCompleted(a){return [a.slots.morning,a.slots.evening].filter(Boolean).length;}',ctx);
const a={slots:{}};assert.equal(ctx.dailyPulseCount(a),0);a.slots.morning='1';assert.equal(ctx.dailyPulseCount(a),1);a.slots.evening='2';assert.equal(ctx.dailyPulseCount(a),2);
ctx.data.activities.push({type:'breath',date:'2026-10-22'});assert.equal(ctx.dailyPulseCount(a),3);
ctx.data.activities.push({type:'control',date:'2026-10-22'},{type:'control',date:'2026-10-22'},{type:'extra',date:'2026-10-22'});assert.equal(ctx.dailyPulseCount(a),4);
assert.equal(ctx.dailyPulseCount({slots:{}},'2026-10-23'),0);
for(let i=0;i<=4;i++){const m=ctx.dailyPulseMarkup(i);assert(m.includes('aria-label="'+i+' de 4'));assert.equal((m.match(/<path /g)||[]).length,3);assert(!m.includes('NaN'));assert(!m.includes('stroke-dasharray'));assert(m.includes('--daily-scale:'+(.66+i*.085)));}
console.log('PASS: four daily steps, completed sessions only, repeated control and optional Kegel do not overcount, next-day reset, accessible icon progress.');
