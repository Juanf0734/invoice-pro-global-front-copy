const https = require('https');
const http = require('http');

module.exports = async function (context, req) {
  const targetUrl = 'https://ebillpymetest.facturaenlinea.co';
  const path = context.bindingData.path || '';
  const fullUrl = `${targetUrl}/${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

  context.log('Proxying request to:', fullUrl);

  return new Promise((resolve) => {
    const urlObj = new URL(fullUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: urlObj.hostname,
      },
    };

    // Remove host header to avoid conflicts
    delete options.headers['host'];
    delete options.headers['x-forwarded-host'];
    delete options.headers['x-forwarded-proto'];

    const protocol = urlObj.protocol === 'https:' ? https : http;

    const proxyReq = protocol.request(options, (proxyRes) => {
      let body = '';

      proxyRes.on('data', (chunk) => {
        body += chunk;
      });

      proxyRes.on('end', () => {
        context.res = {
          status: proxyRes.statusCode,
          headers: proxyRes.headers,
          body: body,
        };
        resolve();
      });
    });

    proxyReq.on('error', (error) => {
      context.log.error('Proxy error:', error);
      context.res = {
        status: 500,
        body: JSON.stringify({ error: 'Proxy error', message: error.message }),
      };
      resolve();
    });

    // Forward request body if present
    if (req.body) {
      const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      proxyReq.write(bodyString);
    }

    proxyReq.end();
  });
};
