const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function getBackendUrl() {
  const url = process.env.BACKEND_API_URL || process.env.VITE_BACKEND_URL;
  if (!url) {
    throw new Error('BACKEND_API_URL is not configured.');
  }
  return url.replace(/\/$/, '');
}

function getRequestPath(value) {
  if (Array.isArray(value)) return value.map(encodeURIComponent).join('/');
  return value ? encodeURIComponent(value) : '';
}

async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function copyRequestHeaders(req) {
  const headers = new Headers();
  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase()) || value == null) return;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  });
  return headers;
}

function copyResponseHeaders(response, res) {
  response.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    res.setHeader(key, value);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const baseUrl = getBackendUrl();
    const path = getRequestPath(req.query.path);
    const requestUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    requestUrl.searchParams.delete('path');

    const query = requestUrl.searchParams.toString();
    const targetUrl = `${baseUrl}/${path}${query ? `?${query}` : ''}`;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: copyRequestHeaders(req),
      body: await readRequestBody(req),
      redirect: 'manual',
    });

    copyResponseHeaders(response, res);
    res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.status(500).json({
      message: error?.message || 'API proxy failed.',
    });
  }
}
