/* Soft phase cues. Audio is unlocked only by an explicit user gesture. */
if(typeof data.cueSound!=='boolean')data.cueSound=true;
if(typeof data.cueVibration!=='boolean')data.cueVibration=true;
data.sound=false;save();
if('speechSynthesis'in window)speechSynthesis.cancel();
speak=function(){};
let cueAudio=null;const cueNodes=new Set();
const cueCanVibrate=()=>typeof navigator.vibrate==='function';
function cueUnlock(){
 if(!data.cueSound)return;
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!cueAudio||cueAudio.state==='closed')cueAudio=new Audio();if(cueAudio.state!=='running')cueAudio.resume().catch(()=>{});}catch{}
}
function cueStop(){
 for(const node of cueNodes){try{node.stop();}catch{}}
 cueNodes.clear();if(cueCanVibrate())try{navigator.vibrate(0);}catch{}
}
function cuePlay(contract,quick=false){
 if(document.hidden)return;
 if(data.cueVibration&&cueCanVibrate())try{navigator.vibrate(contract?25:[12,35,12]);}catch{}
 if(!data.cueSound||!cueAudio||cueAudio.state==='closed')return;
 try{
 const oscillator=cueAudio.createOscillator(),gain=cueAudio.createGain(),at=cueAudio.currentTime+.015,duration=quick?.11:.20;
 oscillator.type='sine';oscillator.frequency.setValueAtTime(contract?523.25:349.23,at);
 oscillator.frequency.exponentialRampToValueAtTime(contract?493.88:329.63,at+duration);
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.045,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 oscillator.connect(gain);gain.connect(cueAudio.destination);cueNodes.add(oscillator);
 oscillator.onended=()=>{cueNodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(at);oscillator.stop(at+duration+.025);
 }catch{}
}
function cueButton(){
 const b=$('#mute');if(!b)return;
 b.textContent=data.cueSound?'♪':'♩';b.setAttribute('aria-label',data.cueSound?'Silenciar sonidos suaves':'Activar sonidos suaves');b.setAttribute('aria-pressed',String(data.cueSound));
 b.onclick=()=>{data.cueSound=!data.cueSound;save();if(data.cueSound){cueUnlock();if(active&&!active.paused)cuePlay(active.phases[active.index].expand,active.phases[active.index].block==='quick');}else cueStop();cueButton();};
}
const cuePhaseUI=phaseUI;
phaseUI=function(){cuePhaseUI();if(active?.started&&!active.paused){const p=active.phases[active.index];cuePlay(p.expand,p.block==='quick');}};
const cueStartSession=startSession;
startSession=function(){cueStop();cueUnlock();const result=cueStartSession();cueButton();return result;};
const cueTogglePause=togglePause;
togglePause=function(){if(active?.paused)cueUnlock();else cueStop();return cueTogglePause();};
const cueCleanup=cleanup;
cleanup=function(){cueStop();return cueCleanup();};
const cueRender=render;
render=function(){
 cueRender();if(tab!=='guia')return;$('#sound')?.closest('.setting')?.remove();
 $('.guide').insertAdjacentHTML('afterbegin','<section class="card"><h2>Sonidos y vibración</h2><div class="setting"><label for="cue-sound">Timbre suave</label><input type="checkbox" id="cue-sound" '+(data.cueSound?'checked':'')+'></div><p>Un timbre ligero al cambiar de fase, sin voz. Más alto al contraer o inspirar; más bajo al relajar o espirar.</p><div class="setting"><label for="cue-vibration">Vibración breve · Kegel</label><input type="checkbox" id="cue-vibration" '+(data.cueVibration&&cueCanVibrate()?'checked':'')+' '+(cueCanVibrate()?'':'disabled')+'></div><p>'+(cueCanVibrate()?'Un pulso al contraer y dos al relajar, si el dispositivo lo permite.':'No disponible en este navegador. En iPhone, Safari no permite vibración sincronizada con los ejercicios.')+'</p><button class="secondary" id="cue-test">Probar señales</button><p class="muted" id="cue-test-status" role="status"></p></section>');
 $('#cue-sound').onchange=e=>{data.cueSound=e.target.checked;save();if(data.cueSound)cueUnlock();else cueStop();};
 $('#cue-vibration').onchange=e=>{data.cueVibration=e.target.checked;save();if(!data.cueVibration)cueStop();};
 $('#cue-test').onclick=()=>{cueStop();cueUnlock();cuePlay(true);$('#cue-test-status').textContent=data.cueSound?'Timbre suave. Si no se oye, revisa el volumen y el modo silencio del móvil.':data.cueVibration&&cueCanVibrate()?'Señal breve enviada al dispositivo.':'Activa los sonidos o la vibración para probar.';};
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)cueStop();});
render();
