/* Day-specific program, two required Kegel sessions and optional third. */
const R=window.PulsoRoutines;
function routineState(){
 if(!R.valid(data.routinePlan)){data.routinePlan=R.newState(data.level);save();}
 data.level=data.routinePlan.level;return data.routinePlan;
}
function routineToday(){const s=routineState(),date=dayKey();const existed=!!s.calendar[date],a=R.assignment(s,date);if(!existed)save();return a;}
function routineCompleted(a){return ['morning','evening'].filter(id=>a.slots[id]).length;}
function routineLabel(r){return 'Nivel '+(r.level+1)+' · Día '+(r.day+1);}
function routineBlocks(r){return '<div class="routine-blocks">'+r.blocks.map((b,i)=>'<div class="routine-block"><span class="routine-block-icon">'+premiumIcon(b.kind==='quick'?'pulse':'strength')+'</span><div><b>'+b.hold+' s contraer · '+b.rest+' s relajar</b><span>'+b.reps+' repeticiones · '+(b.kind==='quick'?'Rápidas':'Largas')+'</span></div><small>'+String(i+1).padStart(2,'0')+'</small></div>').join('')+'</div>';}
let routineNotice=null;
const beforeRoutinePrepare=prepare;
prepare=function(id,selection=null){
 if(!['morning','evening','extra','replay'].includes(id))return beforeRoutinePrepare(id);
 const s=routineState(),a=routineToday(),selected=selection||a;
 if(!R.available(s,selected.level,selected.day))return;
 if(id!=='replay'&&(a.slots[id]||id==='extra'&&routineCompleted(a)<2))return;
 const r=R.routine(selected.level,selected.day);
 active={id,phases:R.phases(r),index:0,paused:true,started:false,totalSeconds:R.duration(r),trainingStage:r.level,routine:{level:r.level,day:r.day}};
 $('#session').hidden=false;delete $('#session').dataset.kegelState;
 $('#session').innerHTML='<div class="session-head"><button id="close" aria-label="Cerrar sesión">×</button><span class="eyebrow">'+routineLabel(r)+'</span><span style="width:42px"></span></div><div class="session-body routine-preview"><span class="eyebrow">'+(id==='replay'?'REPETIR RUTINA':id==='extra'?'TERCERA SESIÓN · OPCIONAL':'KEGEL · SESIÓN '+(id==='morning'?'1':'2')+' DE 2')+'</span><h1>Tu rutina de hoy.</h1><p class="muted">'+fmt(R.duration(r))+' min · '+R.reps(r)+' contracciones</p>'+routineBlocks(r)+'<p class="routine-preview-note">Sin pausas añadidas entre bloques. Respira con naturalidad y relaja por completo. Puedes pausar cuando lo necesites.</p>'+(id==='replay'?'<p class="muted">Repetir no cambia tu avance ni suma XP.</p>':'')+'<button class="primary" id="start">Empezar</button></div>';
 $('#close').onclick=closeSession;$('#start').onclick=startSession;
};
function routineFinish(){
 const session=active;if(!session?.started)return;
 const state=routineState(),date=dayKey(),now=Date.now(),entry={id:crypto.randomUUID(),type:session.id,date,at:now,level:session.routine.level,day:session.routine.day,seconds:session.totalSeconds};
 const result=R.record(state,entry);let xp=0,activityId=null;
 if(result.saved&&session.id!=='replay'){
 const length=data.activities.length;
 xp=addActivity(session.id,{seconds:session.totalSeconds,trainingStage:entry.level,routineDay:entry.day,protocol:'reference-v1'});
 if(data.activities.length>length){const a=data.activities.at(-1);a.trainingStage=entry.level;a.routineDay=entry.day;activityId=a.id;}
 const d=data.days[date]||{_goal:2};d[session.id]=now;data.days[date]=d;
 }
 data.level=state.level;save();cleanup();active=null;
 routineNotice={entry:result.saved?entry:null,result,xp,activityId};
 showRoutineCompletion();
}
const beforeRoutineFinish=finish;
finish=function(){if(active?.routine)return routineFinish();return beforeRoutineFinish();};
function showRoutineCompletion(){
 const {entry,result,xp,activityId}=routineNotice,s=routineState(),a=routineToday(),r=entry?R.routine(entry.level,entry.day):R.routine(a.level,a.day);
 const note=!entry?'Esta sesión no modifica el día actual.':entry.type==='replay'?'Rutina repetida. Tu avance sigue donde estaba.':entry.type==='extra'?'Tercera sesión guardada. No adelanta otro día.':result.finished?'Has completado los 10 niveles. Puedes repetir tus rutinas.':result.advanced?'Día completado. Mañana: '+routineLabel(s)+'.':routineCompleted(a)+'/2 sesiones completadas. La segunda termina este día de rutina.';
 $('#session').innerHTML='<div class="session-body journey-finish"><span class="completion-emblem">'+premiumIcon('check')+'</span><span class="eyebrow">'+routineLabel(r)+'</span><h1>'+(result.advanced?'Día completado.':'Sesión guardada.')+'</h1>'+(xp?'<p class="completion-xp">+'+xp+' XP</p>':'')+'<section class="card"><p class="muted">'+note+'</p></section>'+(entry?'<section class="comfort-card"><h2>¿Cómo te has sentido?</h2><div class="comfort-options"><button class="secondary" data-routine-comfort="comfortable" aria-pressed="false">Cómodo</button><button class="secondary" data-routine-comfort="effort" aria-pressed="false">Me ha costado</button><button class="secondary" data-routine-comfort="tension" aria-pressed="false">He notado tensión</button></div><p class="muted" id="routine-comfort-note" aria-live="polite">Opcional. Escucha tu cuerpo.</p></section>':'')+'<button class="primary" id="routine-back">Volver a mi día</button></div>';
 document.querySelectorAll('[data-routine-comfort]').forEach(b=>b.onclick=()=>{
 const comfort=b.dataset.routineComfort,stored=s.sessions.find(x=>x.id===entry.id);if(stored)stored.comfort=comfort;
 const activity=data.activities.find(x=>x.id===activityId);if(activity)activity.comfort=comfort;
 save();document.querySelectorAll('[data-routine-comfort]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 $('#routine-comfort-note').textContent=comfort==='comfortable'?'Valoración guardada.':comfort==='effort'?'Valoración guardada. Puedes repetir una rutina anterior si necesitas bajar la exigencia.':'Valoración guardada. Detén las contracciones si persiste la tensión y consulta con un profesional.';
 });
 $('#routine-back').onclick=()=>{$('#session').hidden=true;routineNotice=null;navigate('hoy');};
}
function routineCard(id,title,description,icon,disabled=false){
 return '<article class="workout"><div class="workout-icon">'+premiumIcon(icon)+'</div><div><h3>'+title+'</h3><p>'+description+'</p></div><button data-routine-session="'+id+'" aria-label="'+(disabled?'Sesión completada o no disponible':'Empezar '+title)+'" '+(disabled?'disabled':'')+'>'+premiumIcon(disabled&&description.startsWith('Completada')?'check':'arrow')+'</button></article>';
}
function kegelCard(a,r){
 const count=routineCompleted(a),next=!a.slots.morning?'morning':'evening',done=count===2;
 return '<article class="workout kegel-card"><div class="workout-icon">'+premiumIcon('strength')+'</div><div class="kegel-card-info"><h3>Kegel</h3><p>'+fmt(R.duration(r))+' min por sesión</p></div><button data-routine-session="'+next+'" aria-label="'+(done?'Kegel completado hoy':'Empezar Kegel · sesión '+(next==='morning'?'1':'2')+' de 2')+'" '+(done?'disabled':'')+'>'+premiumIcon(done?'check':'arrow')+'</button><div class="kegel-card-progress"><span>'+count+' de 2 sesiones completadas</span><div class="progress-track" role="progressbar" aria-label="Sesiones de Kegel completadas hoy" aria-valuemin="0" aria-valuemax="2" aria-valuenow="'+count+'"><div style="width:'+(count*50)+'%"></div></div></div></article>';
}
function routinePlanView(){
 const s=routineState(),a=routineToday(),total=R.programs.reduce((n,p)=>n+p.days.length,0),completeDays=R.ordinal(s.level,s.day)+(s.finished?1:0);
 $('#main').innerHTML=header('Tu recorrido.','Dos Kegel completan cada día. Una tercera sesión es opcional. Avanzas como máximo un día de rutina por fecha.')+'<section class="card routine-overview"><span class="eyebrow">TU AVANCE</span><h2>'+routineLabel(s)+'</h2><p class="muted">'+completeDays+' de '+total+' días completados'+(s.finished?' · Recorrido completado':'')+'</p></section><div class="routine-levels">'+R.programs.map(p=>'<details class="card routine-level" '+(p.level===s.level?'open':'')+'><summary><span>Nivel '+(p.level+1)+'</span><small>'+p.days.length+' días</small><span aria-hidden="true">⌄</span></summary><div class="routine-days">'+p.days.map(r=>{
 const available=R.available(s,r.level,r.day),past=R.ordinal(r.level,r.day)<R.ordinal(s.level,s.day)||s.finished,current=R.ordinal(r.level,r.day)===R.ordinal(s.level,s.day)&&!s.finished;
 const isToday=r.level===a.level&&r.day===a.day,status=past?'Completado':current?'Actual':'Pendiente';
 return '<button class="routine-day '+(current?'current ':'')+(past?'done':'')+'" data-open-routine="'+r.level+':'+r.day+'" '+(available?'':'disabled')+'><span><b>Día '+(r.day+1)+'</b><small>'+fmt(R.duration(r))+' min · '+R.reps(r)+' contracciones</small></span><span class="routine-day-state">'+(isToday&&a.completed?'Hoy · 2/2':status)+'</span></button>';
 }).join('')+'</div></details>').join('')+'</div><p class="muted">Las repeticiones de días anteriores no cambian tu progreso. Los días sin practicar no borran el avance. Si hay dolor, tensión o dificultad para relajar, pausa o termina.</p>';
 const top=$('.top');if(top)top.insertAdjacentHTML('afterbegin','<span class="mobile-wordmark">pulso<span>®</span></span>');
 bind();
 document.querySelectorAll('[data-open-routine]').forEach(b=>b.onclick=()=>openRoutineDetail(...b.dataset.openRoutine.split(':').map(Number)));
}
function openRoutineDetail(level,day){
 const s=routineState();if(!R.available(s,level,day))return;
 const r=R.routine(level,day),a=routineToday(),isToday=level===a.level&&day===a.day;
 const nextSlot=!a.slots.morning?'morning':!a.slots.evening?'evening':!a.slots.extra?'extra':null;
 const tomorrow=!isToday&&level===s.level&&day===s.day&&!s.finished;
 const replay=!isToday||!nextSlot;
 $('#session').hidden=false;active=null;delete $('#session').dataset.kegelState;
 $('#session').innerHTML='<div class="session-head"><button id="routine-detail-close" aria-label="Cerrar rutina">×</button><span class="eyebrow">'+routineLabel(r)+'</span><span style="width:42px"></span></div><div class="session-body routine-preview"><h1>Día '+(day+1)+'</h1><p class="muted">'+fmt(R.duration(r))+' min · '+R.reps(r)+' contracciones</p>'+routineBlocks(r)+'<p class="routine-preview-note">0 s de descanso entre bloques. Las relajaciones de cada repetición están incluidas.</p>'+(tomorrow?'<p class="muted">La siguiente rutina se activa mañana. Hoy puedes completar la tercera sesión opcional o repetir un día anterior.</p>':'')+'<button class="primary" id="routine-detail-start" '+(tomorrow?'disabled':'')+'>'+(tomorrow?'Disponible mañana':replay?'Repetir rutina':nextSlot==='extra'?'Tercera sesión · Opcional':'Empezar sesión '+(nextSlot==='morning'?'1':'2')+' de 2')+'</button></div>';
 $('#routine-detail-close').onclick=()=>{$('#session').hidden=true;render();};
 $('#routine-detail-start').onclick=()=>prepare(replay?'replay':nextSlot,{level,day});
}
const beforeRoutineRender=render;
render=function(){
 const s=routineState();beforeRoutineRender();const a=routineToday(),r=R.routine(a.level,a.day),c=routineCompleted(a);
 if(tab==='plan'){routinePlanView();return;}
 const xp=$('.xp-card');if(xp){xp.querySelector('h2').textContent='Nivel '+(s.level+1)+' de 10';xp.querySelector('.eyebrow').textContent='RECORRIDO · DÍA '+(s.day+1)+' DE '+R.programs[s.level].days.length;xp.querySelector('.progress-track>div').style.width=((R.ordinal(s.level,s.day)+(s.finished?1:0))/54*100)+'%';}
 if(tab==='hoy'){
 const hero=$('.hero');hero.querySelector('h2').textContent=c===2?'Día completado':'Dos momentos para ti';hero.querySelector('.ring').style.setProperty('--progress',(c/2*100)+'%');hero.querySelector('.ring strong').innerHTML=c+'<span style="font-size:19px"> / 2</span>';hero.querySelector('.ring small').textContent='KEGEL COMPLETADOS';
 hero.querySelector('.eyebrow').textContent=routineLabel(a);
 const optionalReady=c===2&&!a.slots.extra;
 $('#premium-start').innerHTML=(optionalReady?'Sesión opcional':c===2?'Ver rutina':'Empezar')+' '+premiumIcon('arrow');
 $('#premium-start').onclick=()=>optionalReady?prepare('extra'):c===2?openRoutineDetail(a.level,a.day):prepare(!a.slots.morning?'morning':'evening');
 const grid=$('.routine-grid');grid.innerHTML=kegelCard(a,r)+routineCard('breath','Respiración',today().breath?'Completada':'2 min · Aparte del recorrido','breath',!!today().breath)+routineCard('control','Control de ritmo','Libre','rhythm');
 document.querySelectorAll('[data-routine-session]').forEach(b=>b.onclick=()=>prepare(b.dataset.routineSession));
 if(xp)xp.insertAdjacentHTML('beforeend','<p class="practice-caption">'+(a.completed?'Hoy completado · Próxima rutina mañana':c+'/2 Kegel completados hoy')+'</p>');
 }
 if(tab==='guia'){
 $('#goal')?.closest('.setting')?.remove();
 const settings=document.querySelector('.guide .setting')?.parentElement;
 // The original routine settings card remains, but optional third Kegel is fixed in this program.
 document.querySelectorAll('.guide .card').forEach(card=>{if(card.querySelector('h2')?.textContent==='Tu rutina, a tu medida'){card.innerHTML='<h2>Tu rutina diaria</h2><p>Dos sesiones de Kegel completan el día del recorrido. La tercera sesión de Kegel es opcional. La respiración y el control de ritmo son actividades independientes.</p><p>Separa las sesiones a lo largo del día. Repetir una rutina anterior no cambia el avance ni suma XP.</p>';}});
 }
};
function practicePauseUI(){const b=$('#pause');if(!b||!active?.started)return;b.innerHTML='<span aria-hidden="true">'+(active.paused?'▶':'Ⅱ')+'</span> '+(active.paused?'Continuar':'Pausar');b.setAttribute('aria-label',active.paused?'Continuar ejercicio':'Pausar ejercicio');b.setAttribute('aria-pressed',String(active.paused));}
const routineStart=startSession;startSession=function(){const result=routineStart();$('#session').scrollTop=0;practicePauseUI();return result;};
const routinePause=togglePause;togglePause=function(){const result=routinePause();practicePauseUI();return result;};
routineState();render();
