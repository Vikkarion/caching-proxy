const { argv } = require('node:process');
const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');
const proxyConnection = require('./proxy.js');

const port = argv[argv.indexOf("--port") + 1];

//1
if (argv.includes('--clear-cache')) {

  const clearReq = http.request({
    hostname: 'localhost',
    port,
    path: '/__clear-cache',
    method: 'DELETE'
  }, (res) => console.log(`Cleared cache: ${res.statusCode}`));
  clearReq.on('error', (err) => {
    console.error(`Error clearing cache, please verify if the proxy is running on port ${port}: ${err.message}`)
  });
  clearReq.end();

} else {

  const destURL = argv[argv.indexOf("--origin") + 1];
  const { hostname, port: destPort, protocol, host: originHost } = new URL(destURL);
  const client = protocol === 'https:' ? https : http;
  const cache = new Map();

  proxyConnection(port, cache, client, hostname, destPort, originHost);

}
