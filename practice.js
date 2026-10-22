/* Five distinct practice days per difficulty, independent of XP. */
function practiceState(){
 const p=data.practiceProgress;
 if(!p||p.version!==2||!Number.isInteger(p.level)||p.level!==data.level||!Array.isArray(p.days)){
 const days=p?.level===data.level&&Array.isArray(p.days)?p.days.filter(date=>{const list=data.activities.filter(a=>a.date===date&&a.trainingStage===data.level);return list.some(a=>a.type==='morning')&&list.some(a=>a.type==='evening');}):[];
 data.practiceProgress={version:2,level:data.level,days,lastDate:days.includes(p?.lastDate)?p.lastDate:null};save();
 }
 return data.practiceProgress;
}
function practiceCount(){return Math.min(5,new Set(practiceState().days).size);}
function practiceCredit(type,date,stage){
 const p=practiceState();
 if(!['morning','evening'].includes(type)||stage!==data.level||p.lastDate===date)return false;
 const sessions=data.activities.filter(a=>a.date===date&&a.trainingStage===stage);
 if(!sessions.some(a=>a.type==='morning')||!sessions.some(a=>a.type==='evening'))return false;
 p.days=[...new Set([...p.days,date])].slice(0,5);p.lastDate=date;
 if(p.days.length>=5&&data.level<levels.length-1){
 const from=data.level;data.level++;
 data.practiceProgress={version:2,level:data.level,days:[],lastDate:date};
 save();return {from,to:data.level};
 }
 save();return false;
}
let practiceAdvance=null;
const practicePrepare=prepare;
prepare=function(id){const result=practicePrepare(id);if(active&&['morning','evening'].includes(id))active.trainingStage=data.level;return result;};
const practiceAdd=addActivity;
addActivity=function(type,extra={}){
 const stage=active?.trainingStage??data.level;
 const before=data.activities.length;
 const xp=practiceAdd(type,extra);
 if(data.activities.length>before){
 const activity=data.activities.at(-1);
 if(['morning','evening'].includes(type)){activity.trainingStage=stage;activity.trainingVersion=3;practiceAdvance=practiceCredit(type,activity.date,stage);save();}
 }
 return xp;
};
const practiceCompletion=showJourneyCompletion;
showJourneyCompletion=function(xp,type,quality=null){
 practiceCompletion(xp,type,quality);
 if(['morning','evening'].includes(type)){
 const count=practiceCount();
 const note=practiceAdvance?'Has completado 5 días. Tu próxima sesión será del nivel '+(data.level+1)+'. Puedes volver al anterior desde Recorrido.':data.level===levels.length-1&&count===5?'Nivel 6 consolidado. Puedes seguir practicando a tu ritmo.':'Día '+count+' de 5 en este nivel. Completa los dos Kegel para sumar el día. Respiración opcional.';
 $('#session .journey-finish .card').insertAdjacentHTML('beforeend','<p class="muted">'+note+'</p>');
 if(practiceAdvance)$('#session .journey-finish h1').textContent='Pasas al nivel '+(data.level+1)+'.';
 practiceAdvance=null;
 }
};
const practiceRender=render;
render=function(){
 practiceRender();const count=practiceCount();
 if(tab==='hoy'){
 const c=['morning','evening'].filter(id=>today()[id]).length,hero=$('.hero');
 if(hero){hero.querySelector('h2').textContent=c===2?'Día completado':'Dos momentos para ti';hero.querySelector('.ring').style.setProperty('--progress',(c/2*100)+'%');hero.querySelector('.ring strong').innerHTML=c+'<span style="font-size:19px"> / 2</span>';hero.querySelector('.ring small').textContent='KEGEL COMPLETADOS';}
 }
 const card=$('.xp-card');
 if(card)card.insertAdjacentHTML('beforeend','<p class="practice-caption">'+(data.level===levels.length-1&&count===5?'Nivel consolidado':'Día '+count+' de 5 · 2 Kegel al día')+' · '+(data.level===levels.length-1?'Último nivel':'Avance automático')+'</p>');
 if(tab==='plan'){
 const sub=$('#main>.sub');if(sub)sub.textContent='5 días completos por nivel. Cada día requiere los dos Kegel; la respiración es opcional. Después avanzas automáticamente.';
 document.querySelectorAll('[data-level]').forEach(b=>{
 const level=+b.dataset.level;
 b.disabled=level>=data.level;
 b.textContent=level===data.level?'Nivel actual · '+count+'/5 días':level>data.level?'Tras 5 días en el anterior':'Volver a este nivel';
 b.onclick=()=>{if(level>=data.level)return;const lastDate=practiceState().lastDate;data.level=level;data.practiceProgress={version:2,level,days:[],lastDate};save();render();};
 });
 const note=$('.levels')?.nextElementSibling;
 if(note)note.textContent='Completa los dos Kegel en 5 días distintos; las pausas entre días no borran el avance. Hacer más sesiones el mismo día no acelera la progresión. Puedes volver a un nivel anterior. Si hay dolor, tensión o dificultad para relajar, detén la sesión y revisa la pauta con un profesional. Cada sesión combina largas, descanso, rápidas y relajación final.';
 }
};
function practicePauseUI(){
 const b=$('#pause');if(!b||!active?.started)return;
 b.innerHTML='<span aria-hidden="true">'+(active.paused?'▶':'Ⅱ')+'</span> '+(active.paused?'Continuar':'Pausar');
 b.setAttribute('aria-label',active.paused?'Continuar ejercicio':'Pausar ejercicio');b.setAttribute('aria-pressed',String(active.paused));
}
const practiceStart=startSession;
startSession=function(){const result=practiceStart();practicePauseUI();return result;};
const practicePause=togglePause;
togglePause=function(){const result=practicePause();practicePauseUI();return result;};
practiceState();render();
