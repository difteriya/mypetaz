// Phusion Passenger startup file (Plesk "Application Startup File" = server.js).
// ESM syntax — this package is "type": "module", so require() is unavailable.
// Passenger intercepts listen() and binds its managed socket; the port below is
// a fallback for running the file directly (`node server.js`).
import { createServer } from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import next from 'next';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number.parseInt(process.env.PORT ?? '', 10) || 3001;

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

await app.prepare();
createServer((req, res) => handle(req, res)).listen(port, () => {
  console.log(`vet.mypet.az ready on ${port}`);
});
