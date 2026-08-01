// Phusion Passenger startup file (Plesk "Application Startup File" = server.js).
// Boots the vet.mypet.az Next.js app in production. Passenger intercepts listen()
// and binds its managed socket; the port below is a fallback for `node server.js`.
const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3001;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`vet.mypet.az ready on ${port}`);
  });
});
