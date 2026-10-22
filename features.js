const P=window.PulsoProgress;P.migrate(data);save();
const stats=()=>P.summary(data.activities,dayKey());
const originalRender=render,originalBind=bind,originalFinish=finish,originalPrepare=prepare,originalToggle=togglePause;
streak=()=>stats().streak;
complete=d=>!!d&&cleanCount(d)>=2;
doneDays=()=>Object.values(stats().days).filter(a=>a.length>=2).length;
week=function(){const s=stats();return `<div class="week">${Array.from({length:7},(_,i)=>{const d=shift(i-6),c=(s.days[dayKey(d)]?.length||0)>=2;return `<div class="day ${i===6?'today':''} ${c?'complete':''}"><span>${d.toLocaleDateString('es-ES',{weekday:'short'}).slice(0,1).toUpperCase()}</span><i>${c?'✓':d.getDate()}</i></div>`;}).join('')}</div>`;};
function addActivity(type,extra={}){
  const at=Date.now(),date=dayKey();
  if(type!=='control'&&data.activities.some(a=>a.date===date&&a.type===type))return 0;
  const xp=Math.round(P.BASE[type]*stats().multiplier);
  data.activities.push({id:crypto.randomUUID(),type,date,at,...extra});save();return xp;
}
function xpCard(){const s=stats(),pc=Math.min(100,(s.xp-s.base)/(s.next-s.base)*100);return `<section class="card xp-card"><span class="eyebrow">PUNTOS DE CONTROL</span><div class="xp-top"><h2>Nivel ${s.level}</h2><span>${s.xp} XP</span></div><p class="muted">${s.rank}</p><div class="progress-track"><div style="width:${pc}%"></div></div><div class="xp-bottom"><span>${s.next-s.xp} XP para el siguiente nivel</span><span>${s.multiplier===1.2?'×1,2 activo hoy':'Tu próximo paso'}</span></div></section>`;}
render=function(){
  originalRender();const s=stats();
  if(tab==='hoy'){
    const c=s.days[dayKey()]?.length||0;
    const hero=$('.hero');hero.querySelector('h2').innerHTML=c>=2?'Bien hecho.<br>Tu racha sigue.':'Pequeños hábitos.<br>Una base más fuerte.';
    hero.querySelector('p').textContent='Completa 2 actividades para mantener tu racha diaria.';
    hero.querySelector('.pill').textContent=`Nivel de progreso ${s.level}`;
    hero.querySelector('.ring').style.setProperty('--progress',`${Math.min(100,c/2*100)}%`);
    hero.querySelector('.ring strong').innerHTML=`${c}<span style="font-size:19px;color:#9aa88f"> / 2</span>`;
    $('.right').insertAdjacentHTML('afterbegin',xpCard());
    const routine=document.querySelectorAll('.workout');routine[routine.length-1].insertAdjacentHTML('afterend',`<article class="workout"><div class="workout-icon">≈</div><div><span class="tag">04 · ENCUENTRA TU RITMO</span><h3>Control de Ritmo</h3><p>A tu ritmo · Intervalos y calma · +100 XP</p></div><button aria-label="Abrir Control de Ritmo" id="open-control">↗</button></article>`);
    $('#open-control').onclick=()=>prepare('control');
    document.querySelectorAll('.workout p').forEach((p,i)=>{if(i<3)p.textContent=p.textContent.replace(' · Opcional','')+` · +${i===2?30:50} XP`;});
  }
  if(tab==='progreso'){
    $('#main').innerHTML=header('Lo que vas construyendo.','Tu constancia suma. Cada actividad es un pequeño avance.')+xpCard()+`<div class="levels"><section class="card"><span class="eyebrow">RACHA DIARIA</span><div class="big-number">${s.streak}<small>días</small></div><p class="muted">2 actividades completadas al día. ${s.multiplier===1.2?'Hoy sumas ×1,2 XP.':'Completa hoy para sumar ×1,2 mañana.'}</p></section><section class="card"><span class="eyebrow">ACTIVIDADES COMPLETADAS</span><div class="big-number">${data.activities.length}</div><p class="muted">Kegel +50 · Respiración +30 · Control +100 XP</p></section></div><section class="card"><h2>Los últimos 28 días</h2><p class="muted">Verde: 2 o más actividades · ◐: una actividad</p><div class="history">${Array.from({length:28},(_,i)=>{const d=shift(i-27),a=s.days[dayKey(d)]||[];return `<div class="${a.length>=2?'complete':''}" title="${dayKey(d)} · ${s.dailyXP[dayKey(d)]||0} XP">${d.getDate()}<br>${a.length>=2?'✓':a.length?'◐':'·'}</div>`}).join('')}</div></section>`+controlHistory()+`<p class="muted">Guardado en este navegador. Exporta el progreso desde Guía y ajustes para conservar una copia. El recorrido avanza al completar las dos sesiones de Kegel de cada día de rutina.</p>`;
  }
  if(tab==='guia'){
    $('.setting').parentElement.querySelector('p').textContent='Tu rutina sugerida es independiente de la racha: cualquier combinación de 2 actividades mantiene la constancia. El multiplicador ×1,2 se aplica si el día anterior completaste al menos 2; no se acumula.';
    $('#file').onchange=async e=>{try{const v=JSON.parse(await e.target.files[0].text());if(!P.valid(v))throw Error();if(confirm('¿Sustituir el historial de este navegador por el archivo?')){data=P.migrate(v);upgradeKegelTimings();save();render();toast('Progreso importado');}}catch{toast('No se pudo importar: archivo de progreso no válido.');}};
  }
};
function controlHistory(){const a=data.activities.filter(a=>a.type==='control').slice(-5).reverse();return `<section class="card"><h2>Tu control, con perspectiva</h2><p class="muted">${a.length?'Últimas sesiones · Valoración personal, sin comparaciones.':'Aquí aparecerán las sesiones que completes.'}</p>${a.map(a=>`<div class="control-history"><span>${new Date(a.at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span><span>${fmt(Math.floor(a.seconds))} · ${a.intervals} intervalos</span><b>${a.quality}/10</b></div>`).join('')}</section>`;}
finish=function(){const id=active.id,xp=addActivity(id);originalFinish();$('#session .muted').textContent=`Sesión guardada · +${xp} XP. ${stats().days[dayKey()]?.length>=2?'Has mantenido tu racha de hoy.':'Una actividad más y completas tu racha diaria.'}`;};
let rhythm=null,controlTimer=null,returnFocus=null;
prepare=function(id){if(id!=='control')return originalPrepare(id);returnFocus=document.activeElement;rhythm=null;$('#session').hidden=false;$('#session').innerHTML=`<div class="session-head"><button id="close-control" aria-label="Cerrar Control de Ritmo">×</button><span class="eyebrow">CONTROL DE RITMO</span><span></span></div><div class="session-body"><span class="eyebrow">ESCUCHA TU RITMO</span><h1>Control y calma.</h1><p class="muted">Una sesión personal, sin objetivos de duración. Haz una pausa cuando lo necesites.</p><div class="orb-wrap"><div class="orb"><strong style="font-size:40px">≈</strong></div></div><button class="primary" id="start-control">Iniciar Sesión de Control</button><p class="muted">Cada pausa abre 30 segundos de respiración suave. Suelta la tensión de la zona pélvica sin empujar.</p></div>`;$('#close-control').onclick=exitControl;$('#start-control').onclick=startControl;$('#start-control').focus();};
function startControl(){cueStop();cueUnlock();rhythm=new P.RhythmClock();rhythm.start();paintControl();controlTimer=setInterval(updateControl,100);navigator.wakeLock?.request('screen').then(w=>wake=w).catch(()=>{});}
function paintControl(){
 $('#session').innerHTML=`<div class="session-head"><button id="close-control" aria-label="Cerrar Control de Ritmo">×</button><span class="eyebrow">CONTROL DE RITMO</span><button id="mute" aria-label="Sonido"></button></div><div class="session-body control-body"><span class="eyebrow">TIEMPO ACTIVO · SIN PAUSAS</span><div class="control-clock" id="control-clock"></div><p class="muted">Intervalos realizados · <b id="intervals">${rhythm.intervals}</b></p><h2 id="cool-phase">Tu ritmo</h2><div class="orb-wrap" data-state="contract"><button class="orb control-orb" id="alert-control"><strong id="control-action-label">Pausa</strong><small id="control-action-detail">ALERTA ALTA</small></button><svg class="phase-ring" viewBox="0 0 300 300" aria-hidden="true"><circle class="phase-track" cx="150" cy="150" r="142"/><circle class="phase-arc" cx="150" cy="150" r="142"/></svg></div><p class="muted" id="cool-view">Haz una pausa cuando lo necesites.</p><div class="control-actions"><button class="secondary" id="complete-control">Completar</button></div><p class="muted" id="control-status" role="status"></p></div>`;
 $('#close-control').onclick=exitControl;
 $('#alert-control').onclick=()=>{cueUnlock();if(rhythm.suspended){rhythm.unsuspend();updateControl();return;}if(rhythm.mode==='resume'){rhythm.resume();paintControl();return;}if(rhythm.alert()){rhythm.lastCuePhase=null;paintControl();}};
 $('#complete-control').onclick=rateControl;cueButton();updateControl();
}
function updateControl(){
 if(!rhythm||rhythm.mode==='finished')return;rhythm.update();
 $('#control-clock').textContent=fmt(Math.floor(rhythm.elapsed/1000));
 const button=$('#alert-control'),wrap=$('#session .orb-wrap'),cool=rhythm.mode==='cooldown';
 button.disabled=cool&&!rhythm.suspended;
 button.setAttribute('aria-label',rhythm.suspended?'Continuar sesión':rhythm.mode==='resume'?'Reanudar sesión':cool?'Pausa de respiración en curso':'Pausa / Nivel de alerta alto');
 $('#complete-control').disabled=rhythm.elapsed<1000||rhythm.suspended;
 $('#control-action-label').textContent=rhythm.suspended?'Continuar':cool?Math.ceil(rhythm.left/1000):rhythm.mode==='resume'?'Reanudar':'Pausa';
 button.classList.toggle('is-countdown',cool&&!rhythm.suspended);
 $('#control-action-detail').textContent=rhythm.suspended?'EN PAUSA':cool?'SEGUNDOS':rhythm.mode==='resume'?'A TU RITMO':'ALERTA ALTA';
 $('#cool-view').textContent=cool?'Inhala y exhala suavemente. Deja que la zona pélvica se relaje.':'Haz una pausa cuando lo necesites.';
 $('#control-status').textContent=rhythm.suspended?'En pausa. Continúa cuando estés preparado.':rhythm.mode==='resume'?'Pausa completada. Reanuda cuando estés preparado.':'';
 let state=rhythm.suspended?'paused':'contract';
 if(cool){
  const elapsed=(P.COOLDOWN_MS-rhythm.left)/1000,phase=elapsed%10,inhale=phase<4,phaseId=Math.floor(elapsed/10)*2+(inhale?0:1),duration=inhale?4:6;
  if(!rhythm.suspended)state=inhale?'contract':'relax';
  $('#cool-phase').textContent=rhythm.suspended?'En pausa':inhale?'Inspira':'Espira';
  wrap.style.setProperty('--phase-remaining',String(Math.max(0,(inhale?4-phase:10-phase)/duration)));
  if(button.dataset.phase!==String(phaseId)||button.dataset.suspended!==String(rhythm.suspended)){
   button.dataset.phase=phaseId;button.dataset.suspended=String(rhythm.suspended);
   button.style.transitionDuration=(rhythm.suspended?.4:duration)+'s';
   button.style.transform=rhythm.suspended?'scale(.9)':inhale?'scale(1.04)':'scale(.83)';
  }
  if(!rhythm.suspended&&rhythm.lastCuePhase!==phaseId){rhythm.lastCuePhase=phaseId;cuePlay(inhale);}
 }else{
  $('#cool-phase').textContent=rhythm.suspended?'En pausa':rhythm.mode==='resume'?'Cuando quieras':'Tu ritmo';
  wrap.style.setProperty('--phase-remaining','1');button.style.transitionDuration='.6s';button.style.transform='scale(1)';
 }
 wrap.dataset.state=state;$('#session').dataset.kegelState=state;
}
function rateControl(){if(!rhythm||rhythm.elapsed<1000)return;rhythm.suspend();cueStop();clearInterval(controlTimer);controlTimer=null;const backdrop=document.createElement('div');backdrop.className='rating-backdrop';backdrop.innerHTML=`<section class="rating-modal" role="dialog" aria-modal="true" aria-labelledby="rating-title"><h2 id="rating-title">¿Cómo has sentido el control?</h2><p class="muted">Tu valoración personal de esta sesión.</p><div class="rating-options" role="group" aria-label="Calidad del control del 1 al 10">${Array.from({length:10},(_,i)=>`<button class="rating-option" data-score="${i+1}" aria-pressed="false">${i+1}</button>`).join('')}</div><div class="xp-bottom"><span>Menor control</span><span>Mayor control</span></div><button class="primary" id="save-control" disabled>Guardar sesión</button><button class="textbutton" id="cancel-rating">Volver a la sesión</button></section>`;$('#session').append(backdrop);let score=null;document.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>{score=+b.dataset.score;document.querySelectorAll('[data-score]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#save-control').disabled=false;});$('#save-control').onclick=()=>{if(!score||rhythm.mode==='finished')return;rhythm.stop();const xp=addActivity('control',{seconds:Math.floor(rhythm.elapsed/1000),intervals:rhythm.intervals,quality:score});cleanup();rhythm=null;showJourneyCompletion(xp,'control',score);};$('#cancel-rating').onclick=()=>{backdrop.remove();rhythm.unsuspend();paintControl();controlTimer=setInterval(updateControl,100);};backdrop.onkeydown=e=>{if(e.key==='Escape'){$('#cancel-rating').click();return;}if(e.key==='Tab'){const list=[...backdrop.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0].focus();}}};backdrop.querySelector('button').focus();}
function exitControl(){if(rhythm&&rhythm.mode!=='finished'&&!confirm('¿Salir sin guardar esta sesión?'))return;clearInterval(controlTimer);controlTimer=null;cleanup();rhythm=null;$('#session').hidden=true;render();returnFocus?.focus();}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&rhythm&&rhythm.mode!=='finished'){rhythm.suspend();if($('#control-clock'))updateControl();}});
window.addEventListener('pagehide',()=>{clearInterval(controlTimer);rhythm?.suspend();});
render();

