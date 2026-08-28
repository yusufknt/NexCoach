const fs = require('fs');
const file = 'cloudflare/src/index.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const corsMiddleware = cors\(\{\n    origin: c\.env\.CORS_ORIGIN \|\| '\*',\n    allowMethods: \['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'\],\n    allowHeaders: \['Content-Type', 'Authorization', 'X-API-Secret'\],\n    maxAge: 86400,\n  \}\)/, `const origin = c.req.header('origin') || '*';
  const corsMiddleware = cors({
    origin: (originHeader) => originHeader || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Secret'],
    credentials: true,
    maxAge: 86400,
  })`);
fs.writeFileSync(file, code);
