// caching proxy
const { argv } = require('node:process');
const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');

//1
if (argv.includes('--clear cache')) {
  const clearReq = http.request({
    hostname: 'localhost',
    port,
    path: '/__clear_cache',
    method: 'DELETE'
  }, (res) => {
    console.log(`Cleared cache: ${res.statusCode}`);
  });
  clearReq.on('error', (err) => {
    console.error(`Error clearing cache, please verify if the proxy is running on port ${port}: ${err.message}`)
  });
  clearReq.end();
} else {

  const port = argv[argv.indexOf("--port") + 1];
  const destURL = argv[argv.indexOf("--origin") + 1];
  const { hostname, port: destPort, protocol, host: originHost } = new URL(destURL);
  const client = protocol === 'https:' ? https : http;
  const cache = new Map();

  //2
  const proxy = http.createServer((req, res) => {
    const cached = cache.get(req.url);
    if (cached) {
      console.log('X-Cache: HIT');
      res.writeHead(cached.statusCode, {
        ...cached.headers,
        'X-Cache': 'HIT'
      });
      res.end(cached.body);
      return;
    }

    const options = {
      hostname,
      port: destPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: originHost
      }
    }
    //3
    const proxyReq = client.request(options, (proxyRes) => {
      const chunks = [];
      proxyRes.on('data', (chunk) => {
        chunks.push(chunk);
      });
      proxyRes.on('end', () => {
        const body = Buffer.concat(chunks);
        cache.set(req.url, {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers,
          body
        });
        console.log('X-Cache: MISS');
        res.writeHead(proxyRes.statusCode, {
          ...proxyRes.headers,
          'X-Cache': 'MISS'
        });
        res.end(body);
      });
    });
    req.pipe(proxyReq)
  });

  proxy.listen(port, () => {
    console.log(`Caching proxy listening on port ${port}`);
  });

  proxy.on('error', (err) => {
    console.error(err);
  });
}
