'use strict';
(() => {
  const section = document.getElementById('tax-checklist');
  if (!section) return;
  const es = document.documentElement.lang === 'es';
  const items = Array.from(section.querySelectorAll('[data-prep-item]'));
  const progress = document.getElementById('prep-progress');
  const printButton = document.getElementById('print-checklist');
  const resetButton = document.getElementById('reset-checklist');
  const update = () => {
    const count = items.filter(item => item.checked).length;
    progress.textContent = es ? `${count} de ${items.length} elementos marcados` : `${count} of ${items.length} items checked`;
    resetButton.disabled = count === 0;
  };
  [progress, printButton, resetButton].forEach(element => { element.hidden = false; });
  section.addEventListener('change', update);
  resetButton.addEventListener('click', () => {
    if (!window.confirm(es ? '¿Borrar todas las marcas de la lista?' : 'Clear all checkmarks from the list?')) return;
    items.forEach(item => { item.checked = false; });
    update();
  });
  // Checkmarks are never saved, so warn before leaving the page with some checked.
  window.addEventListener('beforeunload', event => { if (items.some(item => item.checked)) event.preventDefault(); });
  let collapsed = [];
  window.addEventListener('beforeprint', () => {
    collapsed = Array.from(section.querySelectorAll('details:not([open])'));
    collapsed.forEach(group => { group.open = true; });
  });
  window.addEventListener('afterprint', () => { collapsed.forEach(group => { group.open = false; }); });
  printButton.addEventListener('click', () => window.print());
  update();
})();
