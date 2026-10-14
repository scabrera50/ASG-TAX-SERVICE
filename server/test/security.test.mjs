import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createServer, request as httpRequest} from 'node:http';
import {readFileSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {validateInquiry, InvalidInput, LIMITS, SERVICES} from '../validation.mjs';
import {openInquiryStore} from '../database.mjs';
import {createInquiryHandler, checkOrigins, MAX_BODY_BYTES} from '../http.mjs';

const origin = 'https://www.asgtaxservice.com';
const valid = {name:"José O’Neill", email:'jose+office@example.com', phone:'+1 (978) 902-9018',
  service:'Payroll support', language:'es', message:'A general question.\nThank you.'};
const siteRoot = fileURLToPath(new URL('../../',import.meta.url));

function removeTestDirectory(directory) {
  const absolute = path.resolve(directory);
  const relative = path.relative(path.resolve(tmpdir()),absolute);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
  assert.ok(path.basename(absolute).startsWith('asg-security-test-'));
  rmSync(absolute,{recursive:true,force:true});
}

test('startup rejects missing/public database paths, invalid ports and unsafe origin configuration',()=>{
  const privatePath = path.join(tmpdir(),'asg-unused-config-test.sqlite');
  for(const overrides of [
    {DATABASE_PATH:''},
    {DATABASE_PATH:path.join(siteRoot,'inquiries.sqlite')},
    {DATABASE_PATH:privatePath,PORT:'0'},
    {DATABASE_PATH:privatePath,PORT:'NaN'},
    {DATABASE_PATH:privatePath,ALLOWED_ORIGINS:'*'},
  ]) {
    const result = spawnSync(process.execPath,[path.join(siteRoot,'server','index.mjs')],{
      env:{...process.env,PORT:'3000',ALLOWED_ORIGINS:origin,...overrides},encoding:'utf8',timeout:5000,
    });
    assert.equal(result.status,1);
    assert.match(result.stderr,/DATABASE_PATH|PORT|Invalid URL|Origins must/);
  }
});

test('English and Spanish forms use exactly the server service allowlist and length limits',()=>{
  for(const file of ['contact.html','es/contact.html']) {
    const html = readFileSync(path.join(siteRoot,file),'utf8');
    const select = html.match(/<select[^>]*id="service"[^>]*>([\s\S]*?)<\/select>/)[1];
    const options = Array.from(select.matchAll(/<option value="([^"]*)"/g),m=>m[1]).filter(Boolean);
    assert.deepEqual(options,SERVICES);
    for(const field of ['name','email','phone','message']) {
      const element = html.match(new RegExp('<(?:input|textarea)[^>]*id="'+field+'"[^>]*>'))[0];
      assert.ok(element.includes(`maxlength="${LIMITS[field]}"`));
    }
  }
});
test('valid Unicode names, phone formatting, and a Spanish inquiry are accepted',()=>{
  assert.deepEqual(validateInquiry(valid),valid);
  assert.equal(validateInquiry({...valid,name:'李 明'}).name,'李 明');
  assert.equal(validateInquiry({...valid,name:"Anne-Marie O'Connor"}).name,"Anne-Marie O'Connor");
});
test('optional fields have explicit defaults; required text is trimmed and normalized',()=>{
  const result = validateInquiry({name:'  Jose\u0301  ',email:' person@example.com ',message:' hello\r\nthere '});
  assert.deepEqual(result,{name:'José',email:'person@example.com',message:'hello\nthere',phone:'',service:'General inquiry',language:'en'});
});
test('each maximum is accepted, and one extra raw character is rejected',()=>{
  const boundary = {...valid,name:'A'.repeat(100),email:'a'.repeat(64)+'@'+'b'.repeat(61)+'.'+'c'.repeat(23),
    phone:'1234567'+' '.repeat(23),message:'m'.repeat(2000)};
  assert.equal(boundary.email.length,150);
  assert.equal(boundary.phone.length,30);
  validateInquiry(boundary);
  for(const field of ['name','email','phone','message']) {
    assert.throws(()=>validateInquiry({...boundary,[field]:boundary[field]+'x'}),InvalidInput);
  }
  assert.throws(()=>validateInquiry({...valid,service:'x'.repeat(81)}),InvalidInput);
  assert.throws(()=>validateInquiry({...valid,name:' '.repeat(100)+'A'}),InvalidInput);
});
for(const value of [null,[],true,42,'text',undefined]) {
  test(`a ${String(value)} request body cannot become an inquiry`,()=>assert.throws(()=>validateInquiry(value),InvalidInput));
}
for(const field of ['name','email','phone','service','message','language']) {
  test(`${field}: reject null, numbers, booleans, arrays and objects without coercion`,()=>{
    for(const value of [null,123,true,[],{}]) assert.throws(()=>validateInquiry({...valid,[field]:value}),InvalidInput);
  });
}
for(const field of ['name','email','message']) {
  test(`${field}: missing, empty and whitespace-only values are rejected`,()=>{
    const missing = {...valid}; delete missing[field];
    assert.throws(()=>validateInquiry(missing),InvalidInput);
    for(const value of ['', '   ']) assert.throws(()=>validateInquiry({...valid,[field]:value}),InvalidInput);
  });
}
test('unknown fields, prototype keys and a non-plain object are rejected',()=>{
  assert.throws(()=>validateInquiry({...valid,admin:true}),InvalidInput);
  assert.throws(()=>validateInquiry(JSON.parse(JSON.stringify(valid).replace(/}$/,',"__proto__":{}}'))),InvalidInput);
  assert.throws(()=>validateInquiry({...valid,constructor:'bad'}),InvalidInput);
  assert.throws(()=>validateInquiry(new Date()),InvalidInput);
});
test('service and language are exact allowed values',()=>{
  for(const service of SERVICES) validateInquiry({...valid,service});
  for(const service of ['Tax fraud','Payroll Support',' Payroll support ',"'; DROP TABLE inquiries;--"]) {
    assert.throws(()=>validateInquiry({...valid,service}),InvalidInput);
  }
  for(const language of ['ES','fr','es ','']) assert.throws(()=>validateInquiry({...valid,language}),InvalidInput);
});
test('invalid email and phone formats are rejected',()=>{
  for(const email of ['invalid','a@@example.com','a..b@example.com','a@example','a@-example.com','a@example..com','a@example.com\r\nBcc:attacker@example.com','a'.repeat(65)+'@example.com']) {
    assert.throws(()=>validateInquiry({...valid,email}),InvalidInput);
  }
  for(const phone of ['123','1234567890123456','++19789029018','9789029018 ext 2','555<script>1234','978\n9029018']) {
    assert.throws(()=>validateInquiry({...valid,phone}),InvalidInput);
  }
});
test('controls and unpaired Unicode surrogates are rejected',()=>{
  for(const field of ['name','email','phone','message']) {
    for(const bad of ['\u0000','\u000b','\u007f','\ud800']) {
      assert.throws(()=>validateInquiry({...valid,[field]:valid[field]+bad}),InvalidInput);
    }
  }
  validateInquiry({...valid,message:'Emoji: 😊\nUnicode: español\tOK'});
});
test('prepared inserts and reads preserve SQL and HTML as literal text; the table survives',()=>{
  const store = openInquiryStore(':memory:');
  try {
    const message = "'); DROP TABLE inquiries; -- <script>alert('x')</script>";
    const id = store.save({...valid,message});
    assert.equal(store.findById(id).message,message);
    const second = store.save(valid);
    assert.equal(store.findById(second).email,valid.email);
    assert.equal(store.findById('00000000-0000-4000-8000-000000000000'),null);
    assert.throws(()=>store.findById("' OR 1=1 --"),TypeError);
    assert.throws(()=>store.findById(1),TypeError);
    assert.throws(()=>store.save({...valid,email:['bad']}),InvalidInput);
  } finally { store.close(); }
});
test('inquiries persist on disk and database constraints independently reject oversized data',()=>{
  const temp = mkdtempSync(path.join(tmpdir(),'asg-security-test-'));
  const filename = path.join(temp,'inquiries.sqlite');
  let store;
  try {
    store = openInquiryStore(filename);
    const id = store.save(valid);
    store.close(); store = openInquiryStore(filename);
    assert.equal(store.findById(id).message,valid.message);
    store.close(); store = null;
    const db = new DatabaseSync(filename);
    try {
      assert.throws(()=>db.prepare('UPDATE inquiries SET message = ? WHERE id = ?').run('x'.repeat(2001),id),/CHECK constraint failed/);
      assert.throws(()=>db.prepare('UPDATE inquiries SET language = ? WHERE id = ?').run('fr',id),/CHECK constraint failed/);
    } finally { db.close(); }
  } finally { store?.close(); removeTestDirectory(temp); }
});

async function dispatch(handler,{url='/api/inquiries',method='POST',headers={},body=JSON.stringify(valid),chunks}={}) {
  const req = Readable.from(chunks || [Buffer.isBuffer(body) ? body : Buffer.from(body)]);
  Object.assign(req,{url,method,headers:{origin,'content-type':'application/json',...headers}});
  let result;
  const res = {writeHead(status,headers){result={status,headers};},end(body){result.body=body ? JSON.parse(body) : null;}};
  await handler(req,res);
  req.destroy();
  return result;
}
async function rejected(options,expected) {
  let writes=0;
  const handler = createInquiryHandler({store:{save(){writes++;}},allowedOrigins:[origin]});
  const result = await dispatch(handler,options);
  assert.equal(result.status,expected);
  assert.equal(writes,0,'Invalid requests must never reach the database');
  assert.equal(result.headers['Cache-Control'],'no-store');
  assert.equal(result.headers['Connection'],'close');
  return result;
}
test('POST validates and saves; the response exposes only a reference and status',async()=>{
  const store = openInquiryStore(':memory:');
  try {
    const result = await dispatch(createInquiryHandler({store,allowedOrigins:[origin]}));
    assert.equal(result.status,201);
    assert.equal(result.headers['Access-Control-Allow-Origin'],origin);
    assert.deepEqual(Object.keys(result.body).sort(),['id','status']);
    assert.equal(result.body.status,'stored');
    assert.equal(store.findById(result.body.id).name,valid.name);
  } finally { store.close(); }
});
test('POST rejects primitive, malformed, empty and invalid UTF-8 bodies',async()=>{
  for(const body of ['null','[]','true','123','"text"','{','',Buffer.from([0xc3,0x28])]) await rejected({body},400);
});
test('POST rejects invalid field values and includes only fixed field error codes',async()=>{
  for(const input of [{...valid,name:''},{...valid,email:null},{...valid,service:'Unknown'},{...valid,message:'x'.repeat(2001)},{...valid,language:'fr'},{...valid,unknown:'sensitive-value'}]) {
    const result = await rejected({body:JSON.stringify(input)},400);
    assert.equal(result.body.error,'invalid_input');
    assert.ok(!JSON.stringify(result.body).includes('sensitive-value'));
  }
});
test('byte limit covers content-length and chunked bodies, including multibyte Unicode',async()=>{
  await rejected({headers:{'content-length':String(MAX_BODY_BYTES+1)}},413);
  await rejected({headers:{'content-length':'wrong'}},400);
  await rejected({chunks:[Buffer.alloc(MAX_BODY_BYTES,'a'),Buffer.from('b')]},413);
  await rejected({body:JSON.stringify({...valid,message:'😊'.repeat(5000)})},413);
});
test('JSON-only UTF-8 requests; compressed and form submissions are rejected',async()=>{
  for(const contentType of ['text/plain','application/x-www-form-urlencoded','application/json; charset=utf-16','application/json; unknown=x',undefined]) {
    await rejected({headers:{'content-type':contentType}},415);
  }
  await rejected({headers:{'content-encoding':'gzip'}},415);
  const result = await dispatch(createInquiryHandler({store:{save(){return 'test-id';}},allowedOrigins:[origin]}),{headers:{'content-type':'application/json; charset=UTF-8'}});
  assert.equal(result.status,201);
});
test('missing, null, lookalike, trailing slash and unapproved origins are rejected',async()=>{
  for(const bad of [undefined,'null','https://evil.example','https://www.asgtaxservice.com.evil.example',origin+'/']) {
    const result = await rejected({headers:{origin:bad}},403);
    assert.equal(result.headers['Access-Control-Allow-Origin'],undefined);
  }
  for(const bad of [[],['*'],[origin+'/'],['http://public.example']]) assert.throws(()=>checkOrigins(bad));
  checkOrigins([origin,'http://127.0.0.1:8000']);
});
test('only the allowed preflight method and headers are accepted',async()=>{
  const handler = createInquiryHandler({store:{save(){assert.fail('No preflight write');}},allowedOrigins:[origin]});
  const good = await dispatch(handler,{method:'OPTIONS',body:'',headers:{'access-control-request-method':'POST','access-control-request-headers':'content-type'}});
  assert.equal(good.status,204);
  assert.equal(good.headers['Access-Control-Allow-Methods'],'POST');
  await rejected({method:'OPTIONS',headers:{'access-control-request-method':'DELETE'}},405);
  await rejected({method:'OPTIONS',headers:{'access-control-request-method':'POST','access-control-request-headers':'content-type,authorization'}},400);
});
test('unsupported methods, query strings and arbitrary paths do not write or reveal records',async()=>{
  for(const method of ['GET','PUT','DELETE','PATCH','HEAD']) await rejected({method},405);
  for(const url of ['/api/inquiries?admin=true','/api/inquiries/123','/server/data/inquiries.sqlite','/../README.md']) await rejected({url},404);
  const handler = createInquiryHandler({store:{save(){assert.fail('No health write');}},allowedOrigins:[origin]});
  const health = await dispatch(handler,{url:'/health',method:'GET'});
  assert.deepEqual(health.body,{status:'ok'});
});
test('database errors return a generic response without SQL, paths or visitor details',async()=>{
  let logged=0;
  const handler = createInquiryHandler({store:{save(){throw new Error('SQL secret /private/database '+valid.email);}},allowedOrigins:[origin],onError(){logged++;}});
  const result = await dispatch(handler);
  assert.equal(result.status,500);
  assert.deepEqual(result.body,{error:'request_failed'});
  assert.equal(logged,1);
});

// Real HTTP coverage runs in GitHub Actions, where loopback networking is available.
test('real HTTP: reject bypassed browser validation and SQL stays data', {skip:process.env.ASG_HTTP_TESTS !== '1'}, async()=>{
  const store = openInquiryStore(':memory:');
  const server = createServer(createInquiryHandler({store,allowedOrigins:[origin]}));
  try {
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const port = server.address().port;
    async function send(body,headers={}) {
      return await new Promise((resolve,reject)=>{
        const req = httpRequest({hostname:'127.0.0.1',port,path:'/api/inquiries',method:'POST',headers:{origin,'content-type':'application/json',...headers}},res=>{
          const chunks=[];
          res.on('data',chunk=>chunks.push(chunk));
          res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(Buffer.concat(chunks).toString())}));
        });
        req.on('error',reject); req.end(body);
      });
    }
    for(const invalid of [{...valid,email:17},{...valid,name:''},{...valid,message:'x'.repeat(2001)},{...valid,service:'Not a service'}]) {
      assert.equal((await send(JSON.stringify(invalid))).status,400);
    }
    assert.equal((await send('{')).status,400);
    assert.equal((await send('x'.repeat(MAX_BODY_BYTES+1))).status,413);
    assert.equal((await send(JSON.stringify(valid),{origin:'https://evil.example'})).status,403);
    const message = "Robert'); DROP TABLE inquiries;--";
    const good = await send(JSON.stringify({...valid,message}));
    assert.equal(good.status,201);
    assert.equal(store.findById(good.body.id).message,message);
    assert.equal((await send(JSON.stringify(valid))).status,201);
  } finally {
    await new Promise(resolve=>server.close(resolve));
    store.close();
  }
});
