'use strict';
(() => {
  const panel = document.getElementById('irs-news-panel');
  if (!panel) return;
  const es = document.documentElement.lang === 'es';
  const list = panel.querySelector('[data-news-items]');
  const status = panel.querySelector('[data-news-status]');
  const scriptUrl = document.currentScript.src;
  const feedUrl = new URL('irs-news.json', scriptUrl);
  const dateFormat = new Intl.DateTimeFormat(es ? 'es-US' : 'en-US', {dateStyle:'medium', timeZone:'America/New_York'});
  const checkedFormat = new Intl.DateTimeFormat(es ? 'es-US' : 'en-US', {dateStyle:'medium',timeStyle:'short',timeZone:'America/New_York'});
  let loading = false;
  let lastRefresh = 0;
  const refresh = async () => {
    if (loading || document.hidden) return;
    loading = true;
    try {
      const url = new URL(feedUrl);
      url.searchParams.set('check', Math.floor(Date.now() / 60000));
      const response = await fetch(url, {cache:'no-store', signal:AbortSignal.timeout(10000)});
      if (!response.ok) throw Error('Feed unavailable');
      const feed = await response.json();
      const checked = new Date(feed.checkedAt);
      if (!Number.isFinite(checked.getTime()) || !Array.isArray(feed.items) || !feed.items.length) throw Error('Invalid feed');
      const fragment = document.createDocumentFragment();
      for (const item of feed.items.slice(0,6)) {
        const url = new URL(item.url);
        const date = new Date(item.published + 'T12:00:00Z');
        if (url.protocol !== 'https:' || url.host !== 'www.irs.gov' || !url.pathname.startsWith('/newsroom/') || typeof item.title !== 'string' || !Number.isFinite(date.getTime())) throw Error('Invalid IRS item');
        const li = document.createElement('li');
        const time = document.createElement('time');
        time.dateTime = item.published;
        time.textContent = dateFormat.format(date);
        const link = document.createElement('a');
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener';
        link.lang = 'en';
        link.textContent = item.title;
        const arrow = document.createElement('span');
        arrow.textContent = ' ↗';
        arrow.setAttribute('aria-hidden','true');
        link.append(arrow);
        li.append(time,link);
        fragment.append(li);
      }
      list.replaceChildren(fragment);
      const delayed = Date.now() - checked.getTime() > 6 * 60 * 60 * 1000;
      status.textContent = (es ? 'Última revisión: ' : 'Last checked: ') + checkedFormat.format(checked) + ' ET' + (delayed ? (es ? ' · Actualización pendiente' : ' · Refresh delayed') : '');
      lastRefresh = Date.now();
    } catch {
      status.textContent = es ? 'No se pudo comprobar si hay noticias nuevas. Consulta directamente la sala de prensa del IRS.' : 'Could not check for new updates. Visit the IRS newsroom for the latest.';
    } finally { loading = false; }
  };
  refresh();
  window.setInterval(refresh, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (Date.now() - lastRefresh > 10 * 60 * 1000) refresh(); });
})();
