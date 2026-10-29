'use strict';
document.body.classList.add('js');
const spanish = document.documentElement.lang === 'es';
document.querySelectorAll('.language-switch').forEach(link => { const target = new URL(link.href); target.search = window.location.search; target.hash = window.location.hash; link.href = target.href; });
const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-navigation');
if (menu && navigation) {
  menu.hidden = false;
  const closeMenu = () => { menu.setAttribute('aria-expanded','false'); navigation.classList.remove('is-open'); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); navigation.classList.toggle('is-open',open); });
  document.addEventListener('keydown',event => { if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click',event => { if(!navigation.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
  window.matchMedia('(min-width: 961px)').addEventListener('change',closeMenu);
}
document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
const filters = document.querySelector('.service-filters');
if(filters) {
  const cards = Array.from(document.querySelectorAll('[data-service-category]'));
  const buttons = Array.from(filters.querySelectorAll('button'));
  const setFilter = category => {
    if(!buttons.some(button => button.dataset.category === category)) category = 'all';
    buttons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.category === category)));
    let count = 0;
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.serviceCategory !== category; if(!card.hidden) count++; });
    document.getElementById('service-count').textContent = spanish ? `${count} servicio${count === 1 ? '' : 's'} para ayudarte a seguir adelante` : `${count} service${count === 1 ? '' : 's'} to help you move forward`;
  };
  filters.hidden = false;
  setFilter(new URLSearchParams(window.location.search).get('category') || 'all');
  buttons.forEach(button => button.addEventListener('click',() => {
    setFilter(button.dataset.category);
    const url = new URL(window.location.href);
    if(button.dataset.category === 'all') url.searchParams.delete('category'); else url.searchParams.set('category',button.dataset.category);
    window.history.replaceState(null,'',url);
    document.querySelectorAll('.language-switch').forEach(link => { const target = new URL(link.href); target.search = url.search; link.href = target.href; });
  }));
}
// Open/closed status in Lawrence (Eastern) time. Keep in sync with the hours tables.
const hoursStatus = document.querySelectorAll('[data-hours-status]');
if(hoursStatus.length) {
  const eastern = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23'});
  const isTaxSeason = date => date.getUTCMonth() < 3 || (date.getUTCMonth() === 3 && date.getUTCDate() <= 15);
  const isHoliday = date => {
    const month = date.getUTCMonth(), day = date.getUTCDate();
    return (month === 11 && day === 25) || (month === 0 && day === 1) || (month === 10 && date.getUTCDay() === 4 && day >= 22 && day <= 28);
  };
  const hoursFor = date => {
    if(isHoliday(date)) return null;
    const weekday = date.getUTCDay();
    if(isTaxSeason(date)) return weekday === 0 || weekday === 6 ? [10,19] : [9,20];
    if(weekday === 0) return null;
    return weekday === 6 ? [10,17] : [9,18];
  };
  const clock = hour => spanish ? `${hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'a. m.' : 'p. m.'}` : `${hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'AM' : 'PM'}`;
  const weekdayName = new Intl.DateTimeFormat(spanish ? 'es-US' : 'en-US',{weekday:'long',timeZone:'UTC'});
  const updateHours = () => {
    const now = Object.fromEntries(eastern.formatToParts(new Date()).map(part => [part.type,part.value]));
    const today = new Date(Date.UTC(+now.year,+now.month - 1,+now.day));
    const hour = +now.hour + +now.minute / 60;
    const todayHours = hoursFor(today);
    const open = Boolean(todayHours && hour >= todayHours[0] && hour < todayHours[1]);
    let text = '';
    if(open) {
      text = spanish ? `Abierto ahora · cierra a las ${clock(todayHours[1])}` : `Open now · closes at ${clock(todayHours[1])}`;
    } else {
      for(let offset = todayHours && hour < todayHours[0] ? 0 : 1; offset < 8; offset++) {
        const day = new Date(today.getTime() + offset * 86400000);
        const hours = hoursFor(day);
        if(!hours) continue;
        const when = offset === 0 ? (spanish ? 'hoy' : 'today') : offset === 1 ? (spanish ? 'mañana' : 'tomorrow') : (spanish ? `el ${weekdayName.format(day)}` : weekdayName.format(day));
        text = spanish ? `Cerrado ahora · abre ${when} a las ${clock(hours[0])}` : `Closed now · opens ${when} at ${clock(hours[0])}`;
        break;
      }
    }
    hoursStatus.forEach(node => { node.textContent = text; node.classList.toggle('is-open',open); node.hidden = !text; });
    const season = isTaxSeason(today) ? 'tax' : 'regular';
    document.querySelectorAll('[data-season]').forEach(label => label.classList.toggle('is-current',label.dataset.season === season));
  };
  updateHours();
  setInterval(updateHours,60000);
}

