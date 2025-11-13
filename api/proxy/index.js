const https = require('https');
const http = require('http');

module.exports = async function (context, req) {
  const targetUrl = 'https://ebillpymetest.facturaenlinea.co';
  const path = context.bindingData.path || '';
  
  // Log para debug
  context.log('Original path:', path);
  context.log('Request method:', req.method);
  context.log('Request headers:', req.headers);
  
  // Construir la URL completa
  const fullUrl = `${targetUrl}/api/${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

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
        'ngrok-skip-browser-warning': 'true',
      },
    };

    // Remove host header to avoid conflicts
    delete options.headers['host'];
    delete options.headers['x-forwarded-host'];
    delete options.headers['x-forwarded-proto'];

    const protocol = urlObj.protocol === 'https:' ? https : http;

    const proxyReq = protocol.request(options, (proxyRes) => {
      const chunks = [];

      proxyRes.on('data', (chunk) => {
        chunks.push(chunk);
      });

      proxyRes.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = proxyRes.headers['content-type'] || '';
        
        // Parse response based on content type
        let responseBody;
        if (contentType.includes('application/json')) {
          responseBody = buffer.toString('utf8');
        } else {
          responseBody = buffer.toString('utf8');
        }

        // Forward response with proper headers
        context.res = {
          status: proxyRes.statusCode,
          headers: {
            'Content-Type': contentType || 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: responseBody,
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
