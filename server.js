// Minimal zero-dependency static server.
// Serves the Cognitive Model worksheet (index.html) for every request.
const http = require('http');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'));
const port = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(html);
  })
  .listen(port, () => {
    console.log(`Worksheet served on port ${port}`);
  });
