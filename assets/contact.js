'use strict';
const form = document.getElementById('inquiry-form');
if(form) {
  form.querySelector('button[type=submit]').disabled = false;
  const service = new URLSearchParams(window.location.search).get('service');
  const serviceField = document.getElementById('service');
  if(Array.from(serviceField.options).some(option => option.value === service)) serviceField.value = service;
  form.addEventListener('submit',event => {
    event.preventDefault();
    if(!form.reportValidity()) return;
    const data = new FormData(form);
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nService: ${data.get('service') || 'General inquiry'}\n\n${data.get('message')}`;
    const url = 'mailto:asgtaxservices@gmail.com?subject=' + encodeURIComponent('ASG Tax Services general inquiry') + '&body=' + encodeURIComponent(body);
    const status = document.getElementById('form-status');
    status.textContent = 'Email draft requested. Your message has not been sent. Review and send it in your email app. If no app opens, call 978-902-9018.';
    const link = document.createElement('a');
    link.href = url;
    link.textContent = ' Open email draft again';
    status.append(link);
    window.location.href = url;
  });
}
