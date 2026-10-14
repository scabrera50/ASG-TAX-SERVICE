'use strict';
const form = document.getElementById('inquiry-form');
const inquirySpanish = document.documentElement.lang === 'es';
if(form) {
  form.querySelector('button[type=submit]').disabled = false;
  const service = new URLSearchParams(window.location.search).get('service');
  const serviceField = document.getElementById('service');
  if(Array.from(serviceField.options).some(option => option.value === service)) serviceField.value = service;
  form.addEventListener('submit',event => {
    event.preventDefault();
    if(!form.reportValidity()) return;
    const data = new FormData(form);
    const topic = data.get('service') ? serviceField.selectedOptions?.[0]?.textContent || data.get('service') : (inquirySpanish ? 'Consulta general' : 'General inquiry');
    const body = inquirySpanish ? `Nombre: ${data.get('name')}\nCorreo: ${data.get('email')}\nTeléfono: ${data.get('phone') || 'No indicado'}\nServicio: ${topic}\n\n${data.get('message')}` : `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nService: ${topic}\n\n${data.get('message')}`;
    const url = 'mailto:asgtaxservices@gmail.com?subject=' + encodeURIComponent(inquirySpanish ? 'Consulta general a ASG Tax Services' : 'ASG Tax Services general inquiry') + '&body=' + encodeURIComponent(body);
    const status = document.getElementById('form-status');
    status.textContent = inquirySpanish ? 'Se solicitó un borrador de correo. Tu mensaje no se ha enviado. Revísalo y envíalo desde tu aplicación de correo. Si no se abre, llama al 978-902-9018.' : 'Email draft requested. Your message has not been sent. Review and send it in your email app. If no app opens, call 978-902-9018.';
    const link = document.createElement('a');
    link.href = url;
    link.textContent = inquirySpanish ? ' Abrir el borrador de nuevo' : ' Open email draft again';
    status.append(link);
    window.location.href = url;
  });
}
