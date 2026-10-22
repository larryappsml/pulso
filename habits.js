/* Discreet, local habit log. Independent of training, XP and streaks. */
const HABIT_REFERENCE=150*60000;
function habitEntries(){return (Array.isArray(data.habits)?data.habits:[]).filter(r=>r&&typeof r.id==='string'&&Number.isFinite(r.at)&&r.at>0).sort((a,b)=>a.at-b.at);}
function habitDate(at){return dayKey(new Date(at));}
function habitDuration(ms){const m=Math.max(0,Math.floor(ms/60000));return m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':'');}
function habitSummary(now=Date.now()){
 const entries=habitEntries().filter(r=>r.at<=now),date=habitDate(now),today=entries.filter(r=>habitDate(r.at)===date),last=entries.at(-1);
 let gaps=[];for(let i=1;i<entries.length;i++)if(habitDate(entries[i].at)===habitDate(entries[i-1].at))gaps.push(entries[i].at-entries[i-1].at);
 const dayNumber=at=>{const d=new Date(at);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;};
 const days=entries.length?dayNumber(now)-dayNumber(entries[0].at)+1:0;
 return {today:today.length,last: last?.at,elapsed:last?Math.max(0,now-last.at):null,remaining:last?Math.max(0,HABIT_REFERENCE-(now-last.at)):null,average:days?entries.length/days:null,interval:gaps.length?gaps.reduce((a,b)=>a+b,0)/gaps.length:null,days,total:entries.length};
}
function habitReference(s){return s.last?(s.remaining>0?'Referencia de 2 h 30 min · faltan '+habitDuration(s.remaining+59999):'Intervalo de referencia alcanzado'):'Referencia orientativa · 2 h 30 min';}
function habitRecord(now=Date.now()){
 const record={id:crypto.randomUUID(),at:now};data.habits=[...habitEntries(),record];save();return record;
}
function habitDelete(id){const entries=habitEntries(),record=entries.find(r=>r.id===id);if(!record)return null;data.habits=entries.filter(r=>r.id!==id);save();return record;}
function habitRestore(record){if(record&&!habitEntries().some(r=>r.id===record.id)){data.habits=[...habitEntries(),record];save();}}
function habitCard(){
 const s=habitSummary();
 return '<section class="card habit-card"><div class="habit-heading"><span class="eyebrow">HÁBITOS</span><button class="textbutton" id="habit-history">Historial</button></div><div class="habit-main"><div><strong id="habit-count">'+s.today+'</strong><span>registros hoy</span></div><button class="habit-add" id="habit-add" aria-label="Registrar visita">+</button></div><p class="habit-last" id="habit-last">'+(s.last?'Último · hace '+habitDuration(s.elapsed):'Sin registros todavía')+'</p><p class="habit-reference" id="habit-reference">'+habitReference(s)+'</p><p class="habit-note">Solo una referencia. Ve cuando lo necesites.</p><div class="habit-feedback" id="habit-feedback" role="status"></div></section>';
}
function updateHabitCard(){
 const s=habitSummary();
 if($('#habit-count'))$('#habit-count').textContent=s.today;
 if($('#habit-last'))$('#habit-last').textContent=s.last?'Último · hace '+habitDuration(s.elapsed):'Sin registros todavía';
 if($('#habit-reference'))$('#habit-reference').textContent=habitReference(s);
}
function habitFeedback(record){
 const feedback=$('#habit-feedback');if(!feedback)return;
 feedback.innerHTML='Registro guardado <button class="textbutton" id="habit-undo-add">Deshacer</button>';
 $('#habit-undo-add').onclick=()=>{habitDelete(record.id);updateHabitCard();feedback.textContent='Registro eliminado';};
}
let habitReturnFocus=null;
function openHabitHistory(){
 if($('.habit-backdrop'))return;
 habitReturnFocus=document.activeElement;const backdrop=document.createElement('div');backdrop.className='habit-backdrop';
 backdrop.innerHTML='<section class="habit-modal" role="dialog" aria-modal="true" aria-labelledby="habit-title"><div class="habit-heading"><h2 id="habit-title">Tus hábitos</h2><button class="habit-close" id="habit-close" aria-label="Cerrar historial">×</button></div><div id="habit-stats"></div><div class="habit-history-note">Promedio diario: desde el primer registro hasta hoy, incluidos días sin registros. Intervalo medio: entre registros del mismo día; excluye las noches.</div><div class="habit-delete-feedback" id="habit-delete-feedback" role="status"></div><div id="habit-list"></div><button class="secondary" id="habit-more">Ver más</button><p class="habit-note">Registro personal, sin valor diagnóstico. La referencia temporal no es una meta ni un mínimo.</p></section>';
 document.body.append(backdrop);let limit=20;
 function paint(){const s=habitSummary();$('#habit-stats').innerHTML='<div class="weekly-values"><div><strong>'+s.today+'</strong><span>hoy</span></div><div><strong>'+(s.average===null?'—':s.average.toLocaleString('es-ES',{maximumFractionDigits:1}))+'</strong><span>por día</span></div><div><strong class="habit-interval">'+(s.interval===null?'—':habitDuration(s.interval))+'</strong><span>intervalo medio</span></div></div>';
 const entries=habitEntries().reverse();let previousDate='';
 $('#habit-list').innerHTML=entries.length?entries.slice(0,limit).map(r=>{const date=habitDate(r.at),heading=date!==previousDate?'<h3 class="habit-date">'+new Date(r.at).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})+'</h3>':'';previousDate=date;return heading+'<div class="habit-row"><time datetime="'+new Date(r.at).toISOString()+'">'+new Date(r.at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})+'</time><button class="textbutton" data-delete-habit="'+encodeURIComponent(r.id)+'" aria-label="Eliminar registro de las '+new Date(r.at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})+'">Eliminar</button></div>';}).join(''):'<p class="muted">Aquí aparecerán tus registros.</p>';
 $('#habit-more').hidden=entries.length<=limit;
 document.querySelectorAll('[data-delete-habit]').forEach(b=>b.onclick=()=>{const removed=habitDelete(decodeURIComponent(b.dataset.deleteHabit));paint();updateHabitCard();$('#habit-delete-feedback').innerHTML='Registro eliminado <button class="textbutton" id="habit-undo-delete">Deshacer</button>';$('#habit-undo-delete').onclick=()=>{habitRestore(removed);paint();updateHabitCard();$('#habit-delete-feedback').textContent='Registro restaurado';};$('#habit-undo-delete').focus();});
 }
 $('#habit-more').onclick=()=>{limit+=20;paint();};$('#habit-close').onclick=()=>{backdrop.remove();habitReturnFocus?.focus();};
 backdrop.onkeydown=e=>{if(e.key==='Escape'){$('#habit-close').click();return;}if(e.key==='Tab'){const buttons=[...backdrop.querySelectorAll('button:not([hidden])')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}};
 paint();$('#habit-close').focus();
}
const habitRender=render;
render=function(){habitRender();if(tab==='hoy'){ $('.right').insertAdjacentHTML('afterbegin',habitCard());$('#habit-add').onclick=()=>{const r=habitRecord();updateHabitCard();habitFeedback(r);};$('#habit-history').onclick=openHabitHistory;}if(tab==='progreso'){$('#main').insertAdjacentHTML('beforeend','<section class="card habit-progress"><span class="eyebrow">HÁBITOS</span><h2>Tu registro personal</h2><button class="secondary" id="habit-open-progress">Ver historial y estadísticas</button></section>');$('#habit-open-progress').onclick=openHabitHistory;}};
setInterval(updateHabitCard,15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateHabitCard();});
window.addEventListener('pageshow',updateHabitCard);
render();
