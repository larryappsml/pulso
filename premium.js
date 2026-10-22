/* Presentation layer: training and progress rules remain in their existing modules. */
const premiumIcons={
  pulse:'<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  home:'<path d="m4 10 8-7 8 7v10h-6v-6h-4v6H4Z"/>',
  plan:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9h8M8 13h5M8 17h3"/>',
  chart:'<path d="M4 19V5m0 14h16M8 14l4-5 4 3 4-7"/>',
  guide:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  strength:'<path d="M4 9v6m3-8v10m10-10v10m3-8v6M7 12h10"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".7"/>',
  breath:'<path d="M3 8h11c5 0 5-6 1-5m-12 9h15c5 0 4 7 0 6M3 16h6c4 0 4 5 1 5"/>',
  rhythm:'<path d="M3 13c3-12 6-12 9 0s6 12 9 0"/>',
  flame:'<path d="M13 3c1 5 6 6 6 11a7 7 0 0 1-14 0c0-3 2-5 4-7 0 4 2 5 3 5 2-3 1-6 1-9Z"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  check:'<path d="m5 12 4 4 10-10"/>'
};
function premiumIcon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${premiumIcons[name]||premiumIcons.pulse}</svg>`;}
const beforePremiumRender=render;
render=function(){
  beforePremiumRender();
  document.querySelectorAll('nav [data-tab]').forEach(b=>{const names={hoy:['home','Hoy'],plan:['plan','Recorrido'],progreso:['chart','Progreso'],guia:['guide','Guía']};const [icon,label]=names[b.dataset.tab];b.innerHTML=`${premiumIcon(icon)}<span>${label}</span>`;});
  document.querySelectorAll('.brandicon').forEach(e=>e.innerHTML=premiumIcon('pulse'));
  const top=$('.top');if(top){top.insertAdjacentHTML('afterbegin','<span class="mobile-wordmark">pulso<span>®</span></span>');const pill=top.querySelector('.pill');pill.innerHTML=`<span class="presence-dot"></span> Tu espacio personal`;}
  if(tab==='hoy'){
    const s=stats(),activities=s.days[dayKey()]?.length||0;
    $('#main>h1').textContent='Hoy';
    $('#main>.eyebrow')?.remove();$('#main>.sub')?.remove();
    const hero=$('.hero');hero.querySelector('.eyebrow').textContent='TU OBJETIVO';
    hero.querySelector('h2').textContent=activities>=2?'Día completado':'Dos momentos para ti';
    hero.querySelector('p').remove();hero.querySelector('.pill').remove();
    const next=['morning','evening','breath'].find(id=>!today()[id])||'control';
    hero.querySelector('div').insertAdjacentHTML('beforeend',`<button class="premium-start" id="premium-start">${activities>=2?'Continuar':'Empezar'} ${premiumIcon('arrow')}</button>`);
    $('#premium-start').onclick=()=>prepare(next);
    const head=$('.section-head');head.querySelector('h2').textContent='Sesiones';head.querySelector('small').remove();
    const grid=document.createElement('div');grid.className='routine-grid';head.after(grid);
    const cards=[...document.querySelectorAll('.workout')];
    const art=['strength','target','breath','rhythm'];
    cards.forEach((card,i)=>{
      grid.append(card);card.classList.add(`routine-${i}`);
      card.querySelector('.workout-icon').innerHTML=premiumIcon(art[i]);
      card.querySelector('.tag').remove();
      card.querySelector('h3').textContent=['Kegel · 1','Kegel · 2','Respiración','Control de ritmo'][i];
      card.querySelector('p').textContent=i<3?(today()[['morning','evening','breath'][i]]?'Completada':i===2?'2 min':fmt(duration())+' min'):'Libre';
      const button=card.querySelector('button');button.innerHTML=premiumIcon(button.disabled?'check':'arrow');
    });
    const streakIcon=$('.streak-head>span:last-child');if(streakIcon)streakIcon.innerHTML=premiumIcon('flame');
    $('.quote')?.remove();$('.footer-note')?.remove();
    const streak=$('.streak-head')?.parentElement;
    if(streak){streak.querySelector('.muted')?.remove();streak.querySelector('.divider')?.remove();streak.querySelector('.next')?.remove();streak.querySelector('.eyebrow').textContent='RACHA';}
    $('.xp-card>.muted')?.remove();$('.xp-card .eyebrow').textContent='PROGRESO';
    $('.xp-card .xp-bottom')?.remove();
  }
  document.querySelectorAll('.level').forEach((e,i)=>{const eyebrow=e.querySelector('.eyebrow');if(eyebrow)eyebrow.insertAdjacentHTML('beforebegin',`<div class="stage-number">${String(i+1).padStart(2,'0')}</div>`);});
};
render();

