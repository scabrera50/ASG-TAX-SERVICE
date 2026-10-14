import {createServer} from 'node:http';
import {mkdirSync, chmodSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openInquiryStore} from './database.mjs';
import {checkOrigins, createInquiryHandler} from './http.mjs';

const filename = process.env.DATABASE_PATH;
if(!filename || !path.isAbsolute(filename)) throw new Error('Set DATABASE_PATH to an absolute path outside the website source directory');
const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relative = path.relative(websiteRoot,path.resolve(filename));
if(relative === '' || (!relative.startsWith('..'+path.sep) && relative !== '..' && !path.isAbsolute(relative))) {
  throw new Error('DATABASE_PATH must be outside the website source directory');
}
const host = process.env.HOST || '127.0.0.1';
const portText = process.env.PORT || '3000';
if(!/^\d+$/.test(portText) || Number(portText) < 1 || Number(portText) > 65535) throw new Error('PORT must be an integer from 1 to 65535');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://www.asgtaxservice.com').split(',').map(s=>s.trim());
checkOrigins(allowedOrigins);
process.umask(0o077);
mkdirSync(path.dirname(filename),{recursive:true,mode:0o700});
const store = openInquiryStore(filename);
chmodSync(filename,0o600);
const server = createServer({maxHeaderSize:8192},createInquiryHandler({store,allowedOrigins,
  onError:() => console.error('Inquiry request failed')}));
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.maxRequestsPerSocket = 100;
server.on('error',error => { console.error(`Server failed: ${error.code || 'unknown'}`); store.close(); process.exitCode=1; });
server.listen(Number(portText),host,() => console.log(`ASG inquiry API listening on ${host}:${portText}`));
function shutdown() {
  server.close(() => { store.close(); });
  setTimeout(()=>server.closeAllConnections(),5000).unref();
}
process.once('SIGTERM',shutdown);
process.once('SIGINT',shutdown);
