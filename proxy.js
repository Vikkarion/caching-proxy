// caching proxy
const { argv } = require('node:process');
const http = require('node:http');
const URL = require('node:url');

//1
const port = argv[2];
URL.port = port;
const url = new URL(argv[4]);
const cache = new Map();
const { hostname, port: destPort } = url;

//2
const proxy = http.createServer((req, res) => {
  const cached = cache.get(req.url);
  if (cached) {
    res.writeHead(200, {
      'Content-Type': 'message/' + cached
    });
    console.log('X-cache: HIT');
    res.end(cached);
    return;
  }

  const options = {
    hostname,
    port: destPort,
    path: req.url,
    method: req.method,
    headers: req.headers
  }
//3
  const proxyReq = http.request(options, (proxyRes) => {
    proxyRes.pipe(res);
    proxyRes.on('data', (chunk) => {
      cache.set(req.url, chunk);
    });
    proxyRes.on('end', () => {
      console.log('X-cache: MISS');
      res.end();
    });
  });

  req.pipe(proxyReq)
});
