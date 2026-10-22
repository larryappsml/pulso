/* Shared, deterministic progress rules. No network or personal data transmission. */
(function(root){
  const BASE={morning:50,evening:50,breath:30,control:100};
  const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const previous=date=>{const [y,m,d]=date.split('-').map(Number);return key(new Date(y,m-1,d-1,12));};
  function migrate(data){
    if(!Array.isArray(data.activities))data.activities=[];
    const ids=new Set(data.activities.map(a=>a.id));
    for(const [date,day] of Object.entries(data.days||{}))for(const type of ['morning','evening','breath']){
      const id=`legacy:${date}:${type}`;
      if(Number.isFinite(day[type])&&!ids.has(id)&&!data.activities.some(a=>a.date===date&&a.type===type)){
        data.activities.push({id,date,type,at:day[type]});ids.add(id);
      }
    }
    return data;
  }
  function summary(activities,today){
    const days={};const seen=new Set();
    for(const a of activities){if(seen.has(a.id)||!BASE[a.type])continue;seen.add(a.id);(days[a.date]??=[]).push(a);}
    let xp=0;const dailyXP={};
    for(const [date,list] of Object.entries(days)){
      const multiplier=(days[previous(date)]?.length||0)>=2?1.2:1;
      dailyXP[date]=list.reduce((n,a)=>n+Math.round(BASE[a.type]*multiplier),0);xp+=dailyXP[date];
    }
    const level=Math.floor(Math.sqrt(xp/100))+1;
    let cursor=(days[today]?.length||0)>=2?today:previous(today),streak=0;
    while((days[cursor]?.length||0)>=2){streak++;cursor=previous(cursor);}
    return {xp,level,streak,days,dailyXP,multiplier:(days[previous(today)]?.length||0)>=2?1.2:1,
      rank:level<5?'Nivel Inicial / Fase de Adaptación':level<10?'Nivel Intermedio / Fase de Consolidación':'Nivel Avanzado / Fase de Optimización',
      next:level*level*100,base:(level-1)*(level-1)*100};
  }
  function valid(v){
    if(!v||typeof v!=='object'||!v.days||Array.isArray(v.days)||!Number.isInteger(v.level)||v.level<0||v.level>(v.kegelTimingVersion===3?5:3)||![2,3].includes(v.goal))return false;
    if(Object.entries(v.days).some(([date,d])=>!/^\d{4}-\d{2}-\d{2}$/.test(date)||!d||typeof d!=='object'||Object.entries(d).some(([k,t])=>!['_goal','morning','evening','breath'].includes(k)||(k==='_goal'?![2,3].includes(t):!Number.isFinite(t)||t<0))))return false;
    if(v.activities!==undefined&&(!Array.isArray(v.activities)||v.activities.some(a=>!a||typeof a.id!=='string'||!BASE[a.type]||!/^\d{4}-\d{2}-\d{2}$/.test(a.date)||!Number.isFinite(a.at)||(a.type==='control'&&(!Number.isInteger(a.quality)||a.quality<1||a.quality>10||!Number.isFinite(a.seconds)||a.seconds<1||!Number.isInteger(a.intervals)||a.intervals<0)))))return false;
    return true;
  }
  class RhythmClock{
    constructor(now=()=>performance.now()){this.now=now;this.mode='ready';this.elapsed=0;this.intervals=0;this.suspended=false;}
    start(){this.mode='running';this.last=this.now();}
    update(){if(this.suspended)return;const n=this.now(),delta=Math.max(0,n-this.last);if(this.mode==='running')this.elapsed+=delta;if(this.mode==='cooldown'){this.left=Math.max(0,this.left-delta);if(this.left===0)this.mode='resume';}this.last=n;}
    alert(){this.update();if(this.mode!=='running'||this.suspended)return false;this.mode='cooldown';this.left=45000;this.intervals++;return true;}
    resume(){if(this.mode!=='resume')return;this.mode='running';this.last=this.now();}
    suspend(){this.update();this.suspended=true;}
    unsuspend(){this.suspended=false;this.last=this.now();}
    stop(){this.update();this.mode='finished';}
  }
  root.PulsoProgress={BASE,key,previous,migrate,summary,valid,RhythmClock};
})(typeof window!=='undefined'?window:globalThis);

