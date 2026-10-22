const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../practice.js','utf8').replace(/practiceState\(\);render\(\);\s*$/,'');
const ctx={assert,data:{level:0,activities:[]},levels:Array.from({length:6},()=>({})),save(){},prepare(){},addActivity(){},showJourneyCompletion(){},render(){},startSession(){},togglePause(){},$:()=>null};
vm.createContext(ctx);vm.runInContext(source,ctx);
vm.runInContext(`
function add(type,date,stage=data.level){data.activities.push({id:String(data.activities.length),type,date,trainingStage:stage});return practiceCredit(type,date,stage);}
assert.equal(practiceCount(),0);
add('morning','2026-10-01');assert.equal(practiceCount(),0);
add('breath','2026-10-01');assert.equal(practiceCount(),0);
add('evening','2026-10-01');assert.equal(practiceCount(),1);
add('evening','2026-10-01');assert.equal(practiceCount(),1);
for(const date of ['2026-10-03','2026-10-04','2026-10-07']){add('morning',date);add('evening',date);}
assert.equal(practiceCount(),4);assert.equal(data.level,0);
add('morning','2026-10-08');assert.equal(data.level,0);assert.equal(practiceCount(),4);
assert.equal(add('evening','2026-10-08').to,1);assert.equal(data.level,1);assert.equal(practiceCount(),0);
add('morning','2026-10-08');add('evening','2026-10-08');assert.equal(practiceCount(),0);
add('morning','2026-10-09',0);add('evening','2026-10-09',1);assert.equal(practiceCount(),0);
add('morning','2026-10-09',1);assert.equal(practiceCount(),1);
data=JSON.parse(JSON.stringify(data));assert.equal(practiceCount(),1);
data.level=5;assert.equal(practiceCount(),0);
for(let n=10;n<20;n++){add('morning','2026-10-'+n);add('evening','2026-10-'+n);}
assert.equal(data.level,5);assert.equal(practiceCount(),5);assert.equal(practiceState().days.length,5);
`,ctx);console.log('PASS: both Kegel sessions required; breathing optional and never substitutes; five complete distinct days; no duplicate credits; same-level requirement; persistence and final-level cap.');
