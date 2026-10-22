const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../practice.js','utf8').replace(/practiceState\(\);render\(\);\s*$/,'');
let saved=0;
const ctx={assert,data:{level:0,activities:[]},levels:Array.from({length:6},()=>({})),save:()=>saved++,prepare(){},addActivity(){},showJourneyCompletion(){},render(){},startSession(){},togglePause(){},$:()=>null};
vm.createContext(ctx);vm.runInContext(source,ctx);
vm.runInContext(`
assert.equal(practiceCount(),0);
assert.equal(practiceCredit('breath','2026-10-01',0),false);assert.equal(practiceCount(),0);
practiceCredit('morning','2026-10-01',0);practiceCredit('evening','2026-10-01',0);assert.equal(practiceCount(),1);
practiceCredit('morning','2026-10-03',0);practiceCredit('morning','2026-10-04',0);practiceCredit('morning','2026-10-07',0);assert.equal(practiceCount(),4);assert.equal(data.level,0);
const advance=practiceCredit('evening','2026-10-08',0);assert.equal(advance.to,1);assert.equal(data.level,1);assert.equal(practiceCount(),0);
practiceCredit('evening','2026-10-08',1);assert.equal(practiceCount(),0);
practiceCredit('morning','2026-10-09',0);assert.equal(practiceCount(),0);
practiceCredit('morning','2026-10-09',1);assert.equal(practiceCount(),1);
data=JSON.parse(JSON.stringify(data));assert.equal(practiceCount(),1);
data.level=5;assert.equal(practiceCount(),0);
for(let n=10;n<20;n++)practiceCredit('morning','2026-10-'+n,5);
assert.equal(data.level,5);assert.equal(practiceCount(),5);assert.equal(practiceState().days.length,5);
`,ctx);assert(saved>0);console.log('PASS: 5 distinct practice days, duplicate day suppression, gaps preserved, automatic advancement, no double credit across levels, persistence and level-6 cap.');
