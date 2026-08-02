// Phusion Passenger startup file (Plesk "Application Startup File" = server.cjs).
// MUST be CommonJS: Passenger loads the startup file with require(), which cannot
// load an ESM file on Node 20 — and these packages are "type": "module", so a
// plain .js file would be treated as ESM. The .cjs extension forces CommonJS.
// Passenger intercepts listen() and binds the socket it manages; the port below
// is only a fallback for running the file directly (`node server.cjs`).
const { createServer } = require('node:http');
const next = require('next');

const port = Number.parseInt(process.env.PORT ?? '', 10) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`mypet.az (web) ready on ${port}`);
  });
});
