// caching proxy
const http = require('node:http');

function proxyConnetion(port, cache, client, hostname, destPort, originHost) {
  //2
  const proxy = http.createServer((req, res) => {
    if (req.method === 'DELETE' && req.url === '/__clear-cache') {
      cache.clear();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Cache cleared');
      return;
    }
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
    };
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

module.exports = proxyConnetion;
