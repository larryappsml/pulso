/* User-supplied reference routines. Rows: hold, rest, first reps, 3 quick blocks, last hold/rest/reps. No inter-block pauses. */
(function(root){
 const rows=[
 [[3,3,4,8,8,8,3,3,4],[3,3,5,8,8,8,3,3,4],[3,3,5,10,8,8,3,3,4],[3,3,5,10,10,10,3,3,5]],
 [[4,3,5,12,10,10,4,3,5],[4,3,5,12,12,10,4,3,5],[4,3,6,12,12,12,4,3,5],[4,3,6,14,12,12,4,3,5]],
 [[4,3,6,14,14,12,4,3,5],[4,3,6,14,14,14,4,3,6],[4,3,7,14,14,14,3,3,6],[4,3,7,14,14,14,3,3,7],[5,4,7,14,14,14,5,3,6]],
 [[5,4,7,14,14,14,5,4,7],[5,4,7,16,14,14,5,4,7],[5,4,7,16,16,14,5,4,7],[5,4,7,16,16,16,5,4,7],[6,4,6,16,16,16,6,4,6]],
 [[6,4,7,16,16,16,6,4,6],[6,4,7,18,16,16,6,4,6],[6,4,7,18,18,16,6,4,6],[6,4,7,18,18,18,6,4,7],[6,4,7,18,18,18,6,4,7],[6,4,8,18,18,18,6,4,7]],
 [[7,4,8,18,18,18,7,4,7],[7,4,8,18,18,18,7,4,8],[7,4,9,18,18,18,7,4,8],[7,4,8,20,18,18,7,4,8],[7,4,8,20,20,18,7,4,8],[7,4,8,20,20,20,7,4,8]],
 [[8,4,8,20,20,20,8,4,7],[8,4,8,22,20,20,8,4,7],[8,4,8,22,20,20,8,4,8],[8,4,8,22,22,20,8,4,8],[8,4,8,22,22,22,8,4,8],[8,4,8,22,22,22,8,4,8]],
 [[9,4,8,22,22,22,8,4,8],[9,4,8,22,22,22,8,4,8],[9,4,9,22,22,22,8,4,8],[9,4,9,24,22,22,8,4,8],[9,4,9,24,24,22,8,4,8],[9,4,9,24,24,24,8,4,8]],
 [[10,5,9,24,24,24,9,3,8],[10,5,9,24,24,24,9,3,8],[10,5,9,24,24,24,9,3,9],[10,5,9,24,24,24,10,3,9],[10,5,9,26,24,24,10,3,9],[10,5,9,26,26,24,10,3,9]],
 [[10,5,9,26,26,26,10,5,9],[10,5,10,26,26,26,10,5,9],[10,5,10,28,26,26,10,5,9],[10,5,10,28,28,26,10,5,9],[10,5,10,28,28,28,10,5,9],[10,5,10,28,28,28,10,5,10]]
 ];
 const programs=rows.map((days,level)=>({level,days:days.map((r,day)=>({level,day,blocks:[{kind:'long',hold:r[0],rest:r[1],reps:r[2]},...r.slice(3,6).map(reps=>({kind:'quick',hold:1,rest:1,reps})),{kind:'long',hold:r[6],rest:r[7],reps:r[8]}]}))}));
 const validPosition=(l,d)=>Number.isInteger(l)&&Number.isInteger(d)&&!!programs[l]?.days[d];
 const routine=(l,d)=>programs[l]?.days[d];
 const duration=r=>r.blocks.reduce((n,b)=>n+(b.hold+b.rest)*b.reps,0);
 const reps=r=>r.blocks.reduce((n,b)=>n+b.reps,0);
 function phases(r){return r.blocks.flatMap((b,i)=>Array.from({length:b.reps},(_,rep)=>[{block:b.kind,blockNumber:i+1,rep:rep+1,total:b.reps,label:b.kind==='quick'?'Contrae y suelta':'Contrae suavemente',seconds:b.hold,expand:true},{block:b.kind,blockNumber:i+1,rep:rep+1,total:b.reps,label:'Relaja por completo',seconds:b.rest,expand:false}]).flat());}
 function newState(level=0){return {version:1,level:Math.max(0,Math.min(9,Number.isInteger(level)?level:0)),day:0,finished:false,calendar:{},sessions:[]};}
 const same=(a,b)=>a.level===b.level&&a.day===b.day;
 const ordinal=(l,d)=>programs.slice(0,l).reduce((n,p)=>n+p.days.length,0)+d;
 function available(s,l,d){return validPosition(l,d)&&ordinal(l,d)<=ordinal(s.level,s.day);}
 function assignment(s,date){if(!s.calendar[date])s.calendar[date]={level:s.level,day:s.day,slots:{},completed:false};return s.calendar[date];}
 function next(s){if(s.day+1<programs[s.level].days.length)s.day++;else if(s.level<9){s.level++;s.day=0;}else s.finished=true;}
 function record(s,entry){
  if(!validPosition(entry.level,entry.day)||s.sessions.some(x=>x.id===entry.id))return {saved:false,advanced:false};
  if(!['morning','evening','extra','replay'].includes(entry.type))return {saved:false,advanced:false};
  const a=assignment(s,entry.date);
  if(entry.type==='replay'){s.sessions.push({...entry});return {saved:true,advanced:false};}
  if(!same(a,entry)||a.slots[entry.type])return {saved:false,advanced:false};
  if(entry.type==='extra'&&!(a.slots.morning&&a.slots.evening))return {saved:false,advanced:false};
  s.sessions.push({...entry});a.slots[entry.type]=entry.id;
  let advanced=false;
  if(!a.completed&&a.slots.morning&&a.slots.evening){a.completed=true;if(same(s,a)&&!s.finished){next(s);advanced=true;}}
  return {saved:true,advanced,completed:a.completed,finished:s.finished};
 }
 function valid(s){
  if(!s||s.version!==1||!validPosition(s.level,s.day)||typeof s.finished!=='boolean'||!s.calendar||Array.isArray(s.calendar)||typeof s.calendar!=='object'||!Array.isArray(s.sessions))return false;
  if(s.sessions.some(x=>!x||typeof x.id!=='string'||!validPosition(x.level,x.day)||!['morning','evening','extra','replay'].includes(x.type)||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!Number.isFinite(x.at)||!Number.isFinite(x.seconds)||x.seconds<1))return false;
  const ids=new Set(s.sessions.map(x=>x.id));if(ids.size!==s.sessions.length)return false;
  return Object.entries(s.calendar).every(([date,a])=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&a&&validPosition(a.level,a.day)&&typeof a.completed==='boolean'&&a.slots&&typeof a.slots==='object'&&!Array.isArray(a.slots)&&Object.entries(a.slots).every(([type,id])=>['morning','evening','extra'].includes(type)&&typeof id==='string'&&s.sessions.some(x=>x.id===id&&x.date===date&&x.type===type&&same(x,a)))&&a.completed===!!(a.slots.morning&&a.slots.evening));
 }
 root.PulsoRoutines={programs,routine,duration,reps,phases,newState,assignment,record,valid,validPosition,available,ordinal};
})(typeof window!=='undefined'?window:globalThis);
