/* Simple training progression; XP remain a record of activity. */
function weeklySummary(){
 const dates=Array.from({length:7},(_,i)=>dayKey(shift(i-6)));
 const list=data.activities.filter(a=>dates.includes(a.date));
 const days=new Set(list.map(a=>a.date)).size;
 const timed=list.filter(a=>Number.isFinite(a.seconds));
 const minutes=Math.round(timed.reduce((n,a)=>n+a.seconds,0)/60);
 return '<section class="card weekly-card"><span class="eyebrow">ÚLTIMOS 7 DÍAS</span><h2>Tu semana, a tu ritmo</h2><div class="weekly-values"><div><strong>'+days+'</strong><span>días activos</span></div><div><strong>'+list.length+'</strong><span>sesiones</span></div><div><strong>'+minutes+'</strong><span>min registrados</span></div></div><p class="muted">El tiempo se registra desde esta actualización.</p></section>';
}
const journeyRender=render;
render=function(){
 journeyRender();const s=stats();
 const card=$('.xp-card');
 if(card){card.querySelector('h2').textContent='Nivel '+(data.level+1)+' de 6';card.querySelector('.eyebrow').textContent='DIFICULTAD · '+levels[data.level].name;const track=card.querySelector('.progress-track>div');if(track)track.style.width=((data.level+1)/6*100)+'%';card.querySelector('.muted')?.remove();card.querySelector('.xp-bottom')?.remove();}
  if(tab==='progreso')$('#main').insertAdjacentHTML('beforeend',weeklySummary());
 if(tab==='hoy')$('.right').insertAdjacentHTML('beforeend',weeklySummary());
};
const journeyAddActivity=addActivity;
addActivity=function(type,extra={}){
 const details={...extra};
 if(active?.started&&type!=='control'){details.seconds=active.totalSeconds;details.trainingStage=data.level;}
 return journeyAddActivity(type,details);
};
function saveComfort(id,comfort){
 const activity=data.activities.find(a=>a.id===id);if(!activity||!['comfortable','effort','tension'].includes(comfort))return;
 activity.comfort=comfort;save();
}
function showJourneyCompletion(xp,type,quality=null){
 const s=stats(),isKegel=type==='morning'||type==='evening';
 const activity=data.activities.at(-1),pc=(data.level+1)/6*100;
 $('#session').innerHTML='<div class="session-body journey-finish"><span class="completion-emblem">'+premiumIcon('check')+'</span><span class="eyebrow">'+'SESIÓN COMPLETADA'+'</span><h1>'+ 'Un paso más.'+'</h1><p class="completion-xp">+'+xp+' XP</p><section class="card"><div class="xp-top"><h2>Nivel '+(data.level+1)+' de 6</h2><span>'+s.xp+' XP</span></div><div class="progress-track"><div style="width:'+pc+'%"></div></div><p class="muted">'+levels[data.level].name+(quality?' · Control '+quality+'/10':'')+'</p></section>'+(isKegel?'<section class="comfort-card"><h2>¿Cómo te has sentido?</h2><div class="comfort-options"><button class="secondary" data-comfort="comfortable" aria-pressed="false">Cómodo</button><button class="secondary" data-comfort="effort" aria-pressed="false">Me ha costado</button><button class="secondary" data-comfort="tension" aria-pressed="false">He notado tensión</button></div><p class="muted" id="comfort-advice" aria-live="polite">Opcional. Escuchar tu cuerpo también es avanzar.</p></section>':'')+'<button class="primary" id="journey-back">Volver a mi día</button></div>';
 document.querySelectorAll('[data-comfort]').forEach(b=>b.onclick=()=>{saveComfort(activity.id,b.dataset.comfort);document.querySelectorAll('[data-comfort]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#comfort-advice').textContent=b.dataset.comfort==='comfortable'?'Valoración guardada. Mantén esta etapa hasta dominarla con comodidad.':b.dataset.comfort==='effort'?'Valoración guardada. Mantén o reduce la etapa y descansa si lo necesitas.':'Valoración guardada. Detén las contracciones si persiste la tensión y consulta con un profesional de suelo pélvico.';});
 $('#journey-back').onclick=()=>{$('#session').hidden=true;navigate('hoy');};
}
const journeyFinish=finish;
finish=function(){const type=active?.id;if(!type)return;const before=stats().xp;journeyFinish();showJourneyCompletion(stats().xp-before,type);};
render();
