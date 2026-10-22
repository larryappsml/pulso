/* Constancy milestones are independent of exercise difficulty. */
const journeyNames=['Semilla','Brote','Hoja','Raíces','Rama','Copa','Flor','Árbol'];
const journeyPaths=[
'<ellipse cx="12" cy="13" rx="4" ry="6" transform="rotate(30 12 13)"/>',
'<path d="M12 21V10M12 15C3 15 3 6 3 6s9 0 9 9M12 11c0-7 9-8 9-8s0 8-9 8"/>',
'<path d="M5 20 18 7M4 15C4 4 20 3 20 3s1 16-10 16c-4 0-6-2-6-4Z"/>',
'<path d="M12 3v12m0-5L7 6m5 7 5-5m-5 7-5 6m5-6 5 6m-5-6v7"/>',
'<path d="M12 22V3m0 8-6-5m6 10 7-6M6 6V3m0 3H3m16 4V6m0 4h3"/>',
'<path d="M12 22v-9m-5 3a5 5 0 0 1-2-9 7 7 0 0 1 14 0 5 5 0 0 1-2 9Z"/>',
'<path d="M12 22v-8m0 5 5-3"/><circle cx="12" cy="9" r="3"/><path d="M9 7C3 1 1 11 7 11c-5 6 4 10 5 3 4 6 10-1 5-4 7-2 1-10-3-5-1-7-9-3-5 2Z"/>',
'<path d="M12 22v-9m-3 9h6M12 5 5 13h4l-5 5h16l-5-5h4L12 5Zm0-3v3"/>'
];
function journeyIcon(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+journeyPaths[Math.min(7,Math.max(0,n-1))]+'</svg>';}
function journeyState(xp=stats().xp){const level=Math.floor(Math.sqrt(xp/100))+1;return {level,hit:Math.min(8,level),name:journeyNames[Math.min(7,level-1)]};}
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
 journeyRender();const s=stats(),j=journeyState(s.xp);
 const card=$('.xp-card');
 if(card){card.classList.add('journey-xp');card.querySelector('h2').innerHTML='<span class="journey-mini">'+journeyIcon(j.hit)+'</span> Nivel '+s.level;card.querySelector('.eyebrow').textContent='CONSTANCIA · '+j.name;}
 if(tab==='plan'){
 const intro='<section class="card journey-intro"><span class="eyebrow">TU CONSTANCIA</span><h2>Un paso cada día</h2><p class="muted">8 hitos para ver tu avance. La dificultad de Kegel se elige aparte, cuando te resulte cómoda.</p></section>';
 const route='<div class="journey-route">'+journeyNames.map((name,i)=>{const unlocked=s.level>=i+1,current=j.hit===i+1;return '<button class="journey-step '+(unlocked?'unlocked ':'')+(current?'current':'')+'" data-milestone="'+i+'" aria-label="Hito '+(i+1)+': '+name+(unlocked?', alcanzado':', pendiente')+'" '+(current?'aria-current="step"':'')+'><span class="journey-node">'+journeyIcon(i+1)+'</span><span class="journey-caption"><small>HITO '+(i+1)+'</small><b>'+name+'</b><span>'+((i*i*100).toLocaleString('es-ES'))+' XP</span></span><span class="journey-status">'+(current?'Actual':unlocked?'✓':'')+'</span></button>';}).join('')+'</div><section class="card journey-detail" id="journey-detail" aria-live="polite"></section>';
 $('#main>.sub').insertAdjacentHTML('afterend',intro+route);
 const details=i=>{const target=i*i*100;$('#journey-detail').innerHTML='<span class="eyebrow">HITO '+(i+1)+'</span><h2>'+journeyNames[i]+'</h2><p class="muted">'+(s.xp>=target?'Has alcanzado este hito con tu constancia.':(target-s.xp)+' XP para llegar. Cada sesión completada suma.')+(i<7?' El siguiente hito es '+journeyNames[i+1]+'.':' Después del octavo hito, tu nivel de constancia sigue creciendo.')+'</p>';};
 document.querySelectorAll('[data-milestone]').forEach(b=>b.onclick=()=>details(+b.dataset.milestone));details(j.hit-1);
 const stages=$('.levels');if(stages)stages.insertAdjacentHTML('beforebegin','<div class="section-head"><h2>Etapas de ejercicio · 4</h2></div>');
 }
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
 const s=stats(),j=journeyState(),previous=journeyState(Math.max(0,s.xp-xp)),isKegel=type==='morning'||type==='evening';
 const activity=data.activities.at(-1),up=j.level>previous.level,pc=Math.min(100,(s.xp-s.base)/(s.next-s.base)*100);
 $('#session').innerHTML='<div class="session-body journey-finish"><span class="completion-emblem">'+journeyIcon(j.hit)+'</span><span class="eyebrow">'+(up?'NUEVO NIVEL · '+j.name:'SESIÓN COMPLETADA')+'</span><h1>'+ (up?'Tu constancia crece.':'Un paso más.')+'</h1><p class="completion-xp">+'+xp+' XP</p><section class="card"><div class="xp-top"><h2>Nivel '+s.level+'</h2><span>'+s.xp+' XP</span></div><div class="progress-track"><div style="width:'+pc+'%"></div></div><p class="muted">'+(s.next-s.xp)+' XP para el siguiente nivel'+(quality?' · Control '+quality+'/10':'')+'</p></section>'+(isKegel?'<section class="comfort-card"><h2>¿Cómo te has sentido?</h2><div class="comfort-options"><button class="secondary" data-comfort="comfortable" aria-pressed="false">Cómodo</button><button class="secondary" data-comfort="effort" aria-pressed="false">Me ha costado</button><button class="secondary" data-comfort="tension" aria-pressed="false">He notado tensión</button></div><p class="muted" id="comfort-advice" aria-live="polite">Opcional. Escuchar tu cuerpo también es avanzar.</p></section>':'')+'<button class="primary" id="journey-back">Volver a mi día</button></div>';
 document.querySelectorAll('[data-comfort]').forEach(b=>b.onclick=()=>{saveComfort(activity.id,b.dataset.comfort);document.querySelectorAll('[data-comfort]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#comfort-advice').textContent=b.dataset.comfort==='comfortable'?'Valoración guardada. Mantén esta etapa hasta dominarla con comodidad.':b.dataset.comfort==='effort'?'Valoración guardada. Mantén o reduce la etapa y descansa si lo necesitas.':'Valoración guardada. Detén las contracciones si persiste la tensión y consulta con un profesional de suelo pélvico.';});
 $('#journey-back').onclick=()=>{$('#session').hidden=true;navigate('hoy');};
}
const journeyFinish=finish;
finish=function(){const type=active?.id;if(!type)return;const before=stats().xp;journeyFinish();showJourneyCompletion(stats().xp-before,type);};
render();
