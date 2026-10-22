const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../cues.js','utf8').replace(/render\(\);\s*$/,'');
let tones=[],vibrations=[],stops=0;
class Audio{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}resume(){this.state='running';return Promise.resolve();}createOscillator(){const tone={};tones.push(tone);return {frequency:{setValueAtTime(v){tone.hz=v;},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){tone.started=true;},stop(){stops++;}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(v){assert(v<=.05);},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}}
const ctx={assert,data:{},save(){},window:{AudioContext:Audio},navigator:{vibrate:p=>vibrations.push(p)},document:{hidden:false,addEventListener(){}},render(){},phaseUI(){},startSession(){ctx.active={id:'morning',started:true,paused:false,index:0,phases:[{expand:true,block:'long'}]};ctx.phaseUI();},togglePause(){ctx.active.paused=!ctx.active.paused;if(!ctx.active.paused)ctx.phaseUI();},cleanup(){},$:()=>null};
vm.createContext(ctx);vm.runInContext(source,ctx);
ctx.startSession();assert.equal(tones.length,1);assert.equal(tones[0].hz,523.25);assert.equal(vibrations.at(-1),25);
ctx.active.phases[0]={expand:false,block:'long'};ctx.phaseUI();assert.equal(tones.at(-1).hz,349.23);assert.deepEqual(Array.from(vibrations.at(-1)),[12,35,12]);
ctx.togglePause();assert.equal(vibrations.at(-1),0);const n=tones.length;ctx.phaseUI();assert.equal(tones.length,n);
ctx.togglePause();assert.equal(tones.length,n+1);ctx.document.hidden=true;ctx.phaseUI();assert.equal(tones.length,n+1);
ctx.document.hidden=false;ctx.data.cueSound=false;ctx.phaseUI();assert.equal(tones.length,n+1);
delete ctx.navigator.vibrate;ctx.phaseUI();ctx.cleanup();assert(stops>0);
console.log('PASS: phase synchronization, distinct gentle tones, haptic patterns, pause/cleanup/background suppression, saved settings, unsupported vibration fallback.');
