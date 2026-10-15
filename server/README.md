# ASG inquiry backend

**Status:** implemented and tested; not hosted or connected to the public contact form. The GitHub Pages form continues to prepare an email draft. GitHub Pages serves static files and cannot execute this API.

This standalone Node.js service validates incoming contact inquiries before writing to SQLite. It does not send email, book appointments, accept documents, or expose customer records over HTTP. Successful responses mean **stored**, not **emailed**. Only general contact inquiries belong here, as indicated by the existing form.

## Run

Use Node.js 24.19.0 or a newer 24.x version. There are no npm dependencies; the built-in `node:sqlite` module is experimental in Node 24.

Set an absolute database filename **outside this website source folder**. The service refuses to start without it. Keep the database on persistent storage accessible only to the server/operator; do not upload it to GitHub or a public web directory.

For local development, from the repository root in PowerShell:

```powershell
$env:DATABASE_PATH = Join-Path $env:LOCALAPPDATA 'ASG Tax Services/inquiries.sqlite'
$env:ALLOWED_ORIGINS = 'http://127.0.0.1:8000'
$env:HOST = '127.0.0.1'
$env:PORT = '3000'
node server/index.mjs
```

For a Linux server, use a private, persistent data directory owned by the application user:

```sh
DATABASE_PATH=/var/lib/asg/inquiries.sqlite \
ALLOWED_ORIGINS=https://www.asgtaxservice.com \
HOST=127.0.0.1 PORT=3000 node server/index.mjs
```

Serve the API through an HTTPS reverse proxy. Container hosts can explicitly set `HOST=0.0.0.0`; provision a persistent volume for `DATABASE_PATH`. The application serves only its API and health check, never the source or database files. Configure request rate limits at the hosting proxy before connecting the public form; origin checking restricts browser access but is not authentication or protection against automated submissions.

The next deployment step is to choose/provision a Node host with HTTPS and persistent storage, then update the contact form to submit JSON to its API URL and display the server's result. This release deliberately contains no unverified API URL and makes no claim that the live form submits to the server.

## Request contract

`POST /api/inquiries`, `Content-Type: application/json; charset=utf-8`, and an `Origin` matching one of `ALLOWED_ORIGINS`. The default approved origin is `https://www.asgtaxservice.com`. The body is capped at **16,384 bytes**, including chunked requests. Compressed bodies and non-JSON submissions are rejected.

```json
{
  "name": "María Rivera",
  "email": "maria@example.com",
  "phone": "+1 (978) 902-9018",
  "service": "Payroll support",
  "language": "es",
  "message": "I would like to ask about payroll support."
}
```

| Field | Type and limits | Allowed values |
| --- | --- | --- |
| `name` | Required string, 1–100 UTF-16 code units | Unicode letters/marks, spaces, periods, apostrophes and hyphens; starts with a letter/mark |
| `email` | Required string, at most 150 code units | ASCII address; local part at most 64 characters, valid dot-separated domain labels; no header/control characters |
| `phone` | Optional string, at most 30 code units | Empty, or 7–15 digits with spaces, parentheses, periods, hyphens and an optional leading `+` |
| `service` | Optional string, at most 80 code units | Exactly one of the 13 English service values or `General inquiry`; empty/omitted defaults to general inquiry |
| `language` | Optional string | Exactly `en` or `es`; omitted defaults to `en` |
| `message` | Required string, 1–2,000 code units | Nonblank, well-formed Unicode text; line breaks and tabs allowed, other ASCII controls rejected |

Raw lengths are bounded before trimming/Unicode normalization. Strings are never coerced from arrays, objects, numbers, booleans or null. Unknown fields are rejected. Spanish clients use the same English service values as the existing Spanish form; only the visible labels differ. Email syntax validation does not verify address ownership or delivery.

| Status | Meaning |
| --- | --- |
| `201` | Valid inquiry stored; returns `{ "id": "<UUID>", "status": "stored" }` |
| `400` | Malformed JSON/UTF-8, unknown fields, invalid types, formats, lengths or enumeration values |
| `403` | Missing or unapproved Origin |
| `404` | Unknown path or unexpected query string |
| `405` | Unsupported method; only POST and its OPTIONS preflight are accepted |
| `413` | Request body too large |
| `415` | Unsupported content type, charset or compression |
| `500` | Generic processing failure; no SQL or visitor data exposed |

`GET /health` returns `{ "status": "ok" }`. There is no public inquiry-read endpoint. `findById()` is for trusted server/operator use and requires a UUID.

## Database queries

`database.mjs` prepares fixed `INSERT ... VALUES (?, ...)` and `SELECT ... WHERE id = ?` statements, then binds values with `.run()`/`.get()`. No request value is concatenated into SQL. Fixed schema SQL uses `exec`; database constraints also enforce core length/type/language rules. The write boundary revalidates even callers outside the HTTP route.

Message text containing quotes, SQL or HTML remains literal text. Any future UI that displays stored text must use text nodes or context-appropriate escaping.

## Verify

From the repository root:

```sh
node --test server/test/security.test.mjs
```

To include actual HTTP tests in an environment with loopback networking:

```powershell
$env:ASG_HTTP_TESTS = '1'
node --test server/test/security.test.mjs
```

GitHub Actions enables that HTTP test automatically. Tests cover both forms' agreement with the server contract, bypassed browser validation, invalid types/lengths/enums, malformed JSON/UTF-8, content type, origins, byte limits, error responses, database persistence/constraints, and SQL injection strings remaining data. Test databases contain only synthetic data and are removed afterward.

Design references: [GitHub Pages hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Node SQLite](https://nodejs.org/api/sqlite.html), [OWASP input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), and [OWASP parameterized queries](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

