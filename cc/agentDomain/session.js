// The Agent domain tab's connection and endpoint state, held in this module's memory only.
// The token lives in a closure variable: it is never written to localStorage, sessionStorage,
// a cookie, a file or a URL, and reloading the page forgets it. Nothing here exports it.
import { ENDPOINT_PATHS, getJson } from './api.js';

export const NOT_LOADED = 'not_loaded';
export const LOADING = 'loading';
export const OK = 'ok';
export const ERROR = 'error';

export function createSession({ domainKey, fetchImpl = (...a) => fetch(...a), now = () => new Date() } = {}) {
  let token = null;
  let baseUrl = null;
  let generation = 0;
  const listeners = new Set();
  const paths = ENDPOINT_PATHS(domainKey);
  const blank = () => Object.fromEntries(Object.entries(paths).map(([k, path]) => [k, { status: NOT_LOADED, path }]));
  let endpoints = blank();

  const notify = () => listeners.forEach((fn) => fn());
  const set = (key, value) => { endpoints = { ...endpoints, [key]: { path: paths[key], ...value } }; notify(); };

  return {
    paths,
    get baseUrl() { return baseUrl; },
    get hasToken() { return token !== null; },
    get endpoints() { return endpoints; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    // Stores both in memory and reads all four endpoints. A later connect() or forget()
    // supersedes an earlier one: responses from an older generation are dropped.
    async connect(newBaseUrl, newToken) {
      if (!newToken) throw new Error('Enter your admin token.');
      baseUrl = newBaseUrl;
      token = newToken;
      const mine = ++generation;
      await Promise.all(Object.keys(paths).map(async (key) => {
        set(key, { status: LOADING });
        try {
          const { status, body } = await getJson({ baseUrl, token, path: paths[key], fetchImpl });
          if (mine === generation) set(key, { status: OK, httpStatus: status, data: body, loadedAt: now() });
        } catch (err) {
          if (mine === generation) set(key, { status: ERROR, error: err, loadedAt: now() });
        }
      }));
    },

    forget() {
      token = null;
      generation++;
      endpoints = blank();
      notify();
    },
  };
}
