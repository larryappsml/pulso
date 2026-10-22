const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../habits.js','utf8').replace(/render\(\);\s*$/,'');
let saves=0,id=0;const ctx={data:{},crypto:{randomUUID:()=>String(++id)},save:()=>saves++,render(){},setInterval(){},document:{addEventListener(){}},window:{addEventListener(){}},dayKey:d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),assert};
vm.createContext(ctx);vm.runInContext(source,ctx);
vm.runInContext(`
const t=new Date(2026,9,21,10).getTime();
assert.equal(habitSummary(t).today,0);assert.equal(habitSummary(t).average,null);assert.equal(habitSummary(t).interval,null);
const a=habitRecord(t),b=habitRecord(t+60*60000);
assert.equal(habitSummary(t+60*60000).today,2);assert.equal(habitSummary(t+60*60000).interval,60*60000);
assert.equal(habitSummary(t+60*60000).remaining,150*60000);
assert.equal(habitSummary(t+210*60000).remaining,0);
assert.equal(habitReference(habitSummary(t+210*60000)),'Intervalo de referencia alcanzado');
const next=new Date(2026,9,22,10).getTime();assert.equal(habitSummary(next).today,0);assert.equal(habitSummary(next).total,2);assert.equal(habitSummary(next).average,1);
habitRecord(next);assert.equal(habitSummary(next).interval,60*60000);assert.equal(habitSummary(next).today,1);
const removed=habitDelete(b.id);assert.equal(habitEntries().length,2);habitRestore(removed);habitRestore(removed);assert.equal(habitEntries().length,3);
data.habits=JSON.parse(JSON.stringify(data.habits));assert.equal(habitEntries().length,3);
data.habits.push({id:'bad',at:'x'});assert.equal(habitEntries().length,3);
`,ctx);assert(saves>=5);console.log('PASS: timestamps, reference boundary, daily rollover, history persistence, calendar-day average, overnight exclusion, delete/undo and invalid records.');
