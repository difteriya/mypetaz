// Phusion Passenger startup file (Plesk "Application Startup File" = server.js).
// Boots Next.js in production from this app's own directory. Passenger intercepts
// the listen() call and binds the socket it manages, so the port below is only a
// fallback for running the file directly (`node server.js`).
const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`mypet.az (web) ready on ${port}`);
  });
});
