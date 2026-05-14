import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function base64urlDecode(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString();
}

export function signToken(payload, expiresInSec = 60 * 60 * 24 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSec };
  const hb = base64url(JSON.stringify(header));
  const bb = base64url(JSON.stringify(body));
  const data = `${hb}.${bb}`;
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [hb, bb, sig] = parts;
  const data = `${hb}.${bb}`;
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(base64urlDecode(bb));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function requireAuth(request) {
  const token = getTokenFromRequest(request);
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload;
}
