'use strict';
document.body.classList.add('js');
const spanish = document.documentElement.lang === 'es';
document.querySelectorAll('.language-switch').forEach(link => { const target = new URL(link.href); target.search = window.location.search; link.href = target.href; });
const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-navigation');
if (menu && navigation) {
  menu.hidden = false;
  const closeMenu = () => { menu.setAttribute('aria-expanded','false'); navigation.classList.remove('is-open'); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); navigation.classList.toggle('is-open',open); });
  document.addEventListener('keydown',event => { if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click',event => { if(!navigation.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change',closeMenu);
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
