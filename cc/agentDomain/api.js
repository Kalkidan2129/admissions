// Reads the portal's live /api/admin endpoints with the admin token the builder typed in.
//
// The token is a parameter, never a module variable here, never written to storage, never put in
// a URL and never included in an error message or a log line.
//
// Failure modes, each with a stable error_class:
//   TimeoutError       no answer within timeoutMs            retried
//   NetworkError       fetch rejected (offline, CORS, DNS)   retried
//   UpstreamUnavailable HTTP 5xx or 429                       retried
//   AuthError          HTTP 401 or 403                        not retried: the token is wrong or lacks access
//   HttpError          any other non-2xx                      not retried
//   ContractViolation  2xx whose body is not JSON             not retried
// Retry: GET only (idempotent), at most MAX_ATTEMPTS attempts, RETRY_DELAY_MS apart. When every
// attempt fails the panel shows the error class and message; nothing is cached or filled in.

export const ENDPOINT_PATHS = (domainKey) => ({
  mine: '/api/admin/agent-domains-mine',
  domain: `/api/admin/agent-domains/${encodeURIComponent(domainKey)}`,
  coverage: `/api/admin/agent-domains/${encodeURIComponent(domainKey)}/coverage`,
  governance: '/api/admin/agent-domain-change-requests-mine',
});

export const TIMEOUT_MS = 15000;
export const MAX_ATTEMPTS = 2;
export const RETRY_DELAY_MS = 500;

export class ApiError extends Error {
  constructor(errorClass, path, detail, status = null) {
    super(`${errorClass}: GET ${path} ${detail}`);
    this.name = 'ApiError';
    this.error_class = errorClass;
    this.path = path;
    this.status = status;
  }
}

// Accepts an https origin, or http on localhost for a local portal. Returns the normalised base
// (no trailing slash) or throws with a message the form can show.
export function normaliseBaseUrl(raw) {
  let url;
  try { url = new URL(String(raw ?? '').trim()); } catch (err) {
    throw new Error(`"${raw}" is not a web address (${err.message}).`);
  }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
    throw new Error('The portal address must start with https:// (http:// is accepted only for localhost).');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('The portal address must not carry a username, password, query or #fragment.');
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRYABLE = new Set(['TimeoutError', 'NetworkError', 'UpstreamUnavailable']);

async function attempt(fetchImpl, baseUrl, path, token, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(`${baseUrl}${path}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new ApiError('TimeoutError', path, `had no answer after ${timeoutMs} ms`);
    throw new ApiError('NetworkError', path, `could not be reached (${err.message}). If the address is right, the portal may be refusing this page's origin.`);
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('AuthError', path, `was refused with HTTP ${res.status}: the token is missing, expired or lacks access.`, res.status);
  }
  if (res.status >= 500 || res.status === 429) throw new ApiError('UpstreamUnavailable', path, `answered HTTP ${res.status}`, res.status);
  if (!res.ok) throw new ApiError('HttpError', path, `answered HTTP ${res.status}`, res.status);
  try {
    return { status: res.status, body: await res.json() };
  } catch (err) {
    throw new ApiError('ContractViolation', path, `answered HTTP ${res.status} but the body is not JSON (${err.message})`, res.status);
  }
}

export async function getJson({ baseUrl, token, path, fetchImpl = fetch, timeoutMs = TIMEOUT_MS, retryDelayMs = RETRY_DELAY_MS }) {
  for (let n = 1; ; n++) {
    try {
      return await attempt(fetchImpl, baseUrl, path, token, timeoutMs);
    } catch (err) {
      if (!(err instanceof ApiError) || !RETRYABLE.has(err.error_class) || n >= MAX_ATTEMPTS) {
        console.error(JSON.stringify({ level: 'error', service: 'command-center', event: 'agent_domain_read_failed',
          outcome: 'failure', error_class: err.error_class ?? 'UnknownError', context: { path, attempts: n } }));
        throw err;
      }
      await sleep(retryDelayMs);
    }
  }
}
