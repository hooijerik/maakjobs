// Startup file for running Next.js under Plesk's Node.js extension (Phusion Passenger).
// Local dev/prod still use `next dev` / `next start`; this file is ONLY used by Passenger,
// which patches the .listen() call to bind to its own socket (the PORT is mostly ignored).
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`> Maakjobs ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
