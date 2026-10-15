// This is the authoritative server contract; browser validation is only a UX aid.
export const SERVICES = Object.freeze([
  'Income tax return preparation', 'Income tax return filing',
  'Local tax return preparation', 'Business tax services', 'Accounting services',
  'Tax accounting', 'New business tax consulting', 'Payroll support',
  'Tax planning', 'Tax problem consulting', 'IRS audit representation',
  'Translations', 'Immigration form translation & clerical assistance', 'General inquiry',
]);
export const LIMITS = Object.freeze({name:100, email:150, phone:30, service:80, message:2000});
const FIELDS = new Set([...Object.keys(LIMITS), 'language']);
const SINGLE_LINE_CONTROLS = /[\u0000-\u001f\u007f]/u;
const MESSAGE_CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const EMAIL_ATOM = /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

export class InvalidInput extends Error {
  constructor(fields = {request:'invalid'}) {
    super('Invalid inquiry');
    this.fields = fields;
  }
}

export function validateInquiry(input) {
  if(input === null || typeof input !== 'object' || Array.isArray(input)
     || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) {
    throw new InvalidInput({request:'object_required'});
  }
  if(Object.keys(input).some(key => !FIELDS.has(key))) {
    throw new InvalidInput({request:'unknown_field'});
  }
  const errors = {}, data = {};
  for(const field of Object.keys(LIMITS)) {
    const required = ['name','email','message'].includes(field);
    const supplied = Object.hasOwn(input,field) ? input[field] : (required ? undefined : '');
    if(typeof supplied !== 'string') { errors[field] = 'string_required'; continue; }
    // Bound the raw value before trimming/normalizing. No coercion or truncation.
    if(supplied.length > LIMITS[field]) { errors[field] = 'too_long'; continue; }
    if(!supplied.isWellFormed() || (field === 'message' ? MESSAGE_CONTROLS : SINGLE_LINE_CONTROLS).test(supplied)) {
      errors[field] = 'invalid_characters'; continue;
    }
    data[field] = supplied.normalize('NFC').replace(/\r\n?/g,'\n').trim();
    if(required && !data[field]) errors[field] = 'required';
  }
  if(data.name && !/^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u.test(data.name)) errors.name = 'invalid_format';
  if(data.email) {
    const parts = data.email.split('@');
    if(parts.length !== 2 || parts[0].length > 64 || !EMAIL_ATOM.test(parts[0])
       || parts[1].split('.').length < 2 || !parts[1].split('.').every(label => DOMAIN_LABEL.test(label))) {
      errors.email = 'invalid_format';
    }
  }
  if(data.phone) {
    const digits = data.phone.replace(/\D/g,'').length;
    if(!/^\+?[0-9 ().-]+$/.test(data.phone) || digits < 7 || digits > 15) errors.phone = 'invalid_format';
  }
  if(data.service && !SERVICES.includes(data.service)) errors.service = 'not_allowed';
  // Enumerations are exact: whitespace or a different type does not become a valid value.
  if(Object.hasOwn(input,'service') && typeof input.service === 'string'
     && input.service !== '' && !SERVICES.includes(input.service)) errors.service = 'not_allowed';
  data.service ||= 'General inquiry';
  data.language = Object.hasOwn(input,'language') ? input.language : 'en';
  if(!['en','es'].includes(data.language)) errors.language = 'not_allowed';
  if(Object.keys(errors).length) throw new InvalidInput(errors);
  return Object.freeze(data);
}

