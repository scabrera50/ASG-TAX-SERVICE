import {TextDecoder} from 'node:util';
import {InvalidInput, validateInquiry} from './validation.mjs';

export const MAX_BODY_BYTES = 16 * 1024;
class BadRequest extends Error {
  constructor(status, code) { super(code); this.status=status; this.code=code; }
}

export function checkOrigins(origins) {
  if(!Array.isArray(origins) || !origins.length) throw new TypeError('At least one exact origin is required');
  for(const origin of origins) {
    const url = new URL(origin);
    const local = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    if(url.origin !== origin || url.username || url.password
       || !(url.protocol === 'https:' || (local && url.protocol === 'http:'))) {
      throw new TypeError('Origins must be exact HTTPS origins, or HTTP loopback origins for development');
    }
  }
  return new Set(origins);
}

async function readBody(req) {
  const length = req.headers['content-length'];
  if(length !== undefined) {
    if(!/^\d+$/.test(length)) throw new BadRequest(400,'invalid_content_length');
    if(Number(length) > MAX_BODY_BYTES) throw new BadRequest(413,'body_too_large');
  }
  let total = 0;
  const chunks = [];
  // Avoid destroying the socket on an early rejection so a 413 response can be sent.
  for await(const chunk of req.iterator({destroyOnReturn:false})) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.length;
    if(total > MAX_BODY_BYTES) throw new BadRequest(413,'body_too_large');
    chunks.push(bytes);
  }
  try {
    const json = new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));
    return JSON.parse(json);
  } catch { throw new BadRequest(400,'invalid_json'); }
}

export function createInquiryHandler({store, allowedOrigins, onError = () => {}}) {
  const origins = checkOrigins(allowedOrigins);
  return async function handle(req,res) {
    const headers = {'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Vary':'Origin'};
    const reply = (status,body,extra={}) => {
      // Invalid bodies are not drained indefinitely; close the connection after replying.
      if(status >= 400) extra = {...extra, 'Connection':'close'};
      res.writeHead(status,{...headers,...extra});
      res.end(status === 204 ? undefined : JSON.stringify(body));
    };
    try {
      if(req.url === '/health' && req.method === 'GET') return reply(200,{status:'ok'});
      // Exact path only. No public read, upload, or arbitrary file-serving endpoint.
      if(req.url !== '/api/inquiries') return reply(404,{error:'not_found'});
      if(!['POST','OPTIONS'].includes(req.method)) return reply(405,{error:'method_not_allowed'},{Allow:'POST, OPTIONS'});
      if(typeof req.headers.origin !== 'string' || !origins.has(req.headers.origin)) return reply(403,{error:'origin_not_allowed'});
      headers['Access-Control-Allow-Origin'] = req.headers.origin;
      if(req.method === 'OPTIONS') {
        if(req.headers['access-control-request-method'] !== 'POST') return reply(405,{error:'method_not_allowed'},{Allow:'POST, OPTIONS'});
        const requested = req.headers['access-control-request-headers'] || '';
        if(typeof requested !== 'string' || requested.split(',').some(h => h.trim() && h.trim().toLowerCase() !== 'content-type')) {
          return reply(400,{error:'headers_not_allowed'});
        }
        return reply(204,null,{'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type'});
      }
      const contentType = req.headers['content-type'];
      if(typeof contentType !== 'string' || !/^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?\s*$/i.test(contentType)) {
        return reply(415,{error:'json_required'});
      }
      const encoding = req.headers['content-encoding'];
      if(encoding !== undefined && encoding !== 'identity') return reply(415,{error:'encoding_not_allowed'});
      const data = validateInquiry(await readBody(req));
      const id = store.save(data);
      return reply(201,{id,status:'stored'});
    } catch(error) {
      if(error instanceof InvalidInput) return reply(400,{error:'invalid_input',fields:error.fields});
      if(error instanceof BadRequest) return reply(error.status,{error:error.code});
      // Do not expose SQL errors or echo visitor data in responses/logs.
      try { onError(); } catch {}
      return reply(500,{error:'request_failed'});
    }
  };
}
