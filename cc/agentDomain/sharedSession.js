// The one sign-in session for the page, shared by the Agent domain and Visitor sample tabs, so
// the admin token is minted once and held in one place (session.js memory). Module memory only:
// reloading the page forgets it.
import { createSession } from './session.js';

let session = null;
let rerender = () => {};

export function sharedSession(domainKey, onChange) {
  rerender = onChange;
  if (!session) {
    session = createSession({ domainKey });
    session.subscribe(() => rerender());
  }
  return session;
}
