# Caching Proxy 

This project is based on https://roadmap.sh/projects/caching-server, the purpose of this project is to simulate a forwarding caching proxy using Node.js, by forwarding requests to an origin server and caching the responses.

## Requirements 

- [Node.js](https://nodejs.org/)

## Installation

Clone the repository:

```bash
git clone https://github.com/Vikkarion/caching-proxy.git
```

## Usage

### Running the Server

Run the server with the intended port and origin server address:

```bash
node index.js --port <port-number> --origin <origin-address>
```

The proxy will be available at `http://localhost:<port-number>`, forwarding requests to `http://<origin-address>`.

### Checking cache responses

Every response includes a `X-Cache` header indicating whether the response was served from the cache or fetched from the origin server.

- `HIT`: The response was served from the cache.
- `MISS`: The response was fetched from the origin server.

```bash
curl -i http://localhost:<port-number>/<path>
```

### Clearing the cache

To clear the cache at a specified proxy instance, run the following command in a separate terminal with the same port number:

```bash
node index.js --port <port-number> --clear-cache
```
