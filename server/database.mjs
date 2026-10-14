import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {validateInquiry} from './validation.mjs';

export function openInquiryStore(filename) {
  const db = new DatabaseSync(filename, {timeout:5000});
  try {
    // Only fixed schema SQL uses exec. Request values never become SQL source.
    db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 100),
        email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 150),
        phone TEXT NOT NULL CHECK(length(phone) <= 30),
        service TEXT NOT NULL CHECK(length(service) BETWEEN 1 AND 80),
        language TEXT NOT NULL CHECK(language IN ('en','es')),
        message TEXT NOT NULL CHECK(length(message) BETWEEN 1 AND 2000)
      ) STRICT;
    `);
    const insert = db.prepare(`
      INSERT INTO inquiries (id, created_at, name, email, phone, service, language, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const find = db.prepare(`
      SELECT id, created_at, name, email, phone, service, language, message
      FROM inquiries WHERE id = ?
    `);
    return Object.freeze({
      save(input) {
        // Revalidate at the write boundary, including calls outside the HTTP handler.
        const data = validateInquiry(input), id = randomUUID();
        insert.run(id, new Date().toISOString(), data.name, data.email, data.phone,
                   data.service, data.language, data.message);
        return id;
      },
      // Operator-side only: never exposed as a public HTTP route.
      findById(id) {
        if(typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
          throw new TypeError('A valid inquiry UUID is required');
        }
        return find.get(id) ?? null;
      },
      close() { db.close(); },
    });
  } catch(error) { db.close(); throw error; }
}
