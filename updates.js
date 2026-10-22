/* Refresh presentation releases without touching local exercise history. */
(() => {
  const current = document.querySelector('meta[name="pulso-release"]')?.content;
  let checking = false;
  async function check(manual = false) {
    if (checking || document.hidden) return;
    if (!document.querySelector('#session')?.hidden) {
      if (manual) alert('Termina o cierra la sesión antes de actualizar.');
      return;
    }
    checking = true;
    try {
      const response = await fetch(new URL('release.json?t=' + Date.now(), location.href), {cache:'no-store'});
      if (!response.ok) throw new Error('release unavailable');
      const {version} = await response.json();
      if (typeof version !== 'string' || !/^[a-z0-9-]+$/.test(version)) throw new Error('invalid release');
      if (version !== current || manual) {
        const last = JSON.parse(sessionStorage.getItem('pulso-update-attempt') || 'null');
        if (!manual && last?.version === version && Date.now() - last.at < 120000) return;
        sessionStorage.setItem('pulso-update-attempt', JSON.stringify({version,at:Date.now()}));
        const url = new URL(location.href);
        url.searchParams.set('v',version);
        if (manual) url.searchParams.set('refresh',String(Date.now()));
        location.replace(url.href);
      }
    } catch {
      if (manual) alert('No se pudo comprobar la actualización. Revisa la conexión y vuelve a intentarlo.');
    } finally { checking = false; }
  }
  function addRefresh() {
    const guide = document.querySelector('.guide');
    if (!guide || guide.querySelector('#refresh-pulso')) return;
    const card = document.createElement('section');
    card.className = 'card';
    const title = document.createElement('h2');title.textContent = 'Versión de la app';
    const note = document.createElement('p');note.className = 'muted';note.textContent = 'Diseño oscuro · ' + current + '. Actualizar conserva tu progreso en este dispositivo.';
    const button = document.createElement('button');button.id = 'refresh-pulso';button.className = 'secondary';button.textContent = 'Buscar actualizaciones';button.onclick = () => check(true);
    card.append(title,note,button);guide.append(card);
  }
  new MutationObserver(addRefresh).observe(document.querySelector('#main'),{childList:true,subtree:true});
  addRefresh();
  window.addEventListener('pageshow',() => check());
  document.addEventListener('visibilitychange',() => {if (!document.hidden) check();});
  setInterval(() => check(),90000);
})();

