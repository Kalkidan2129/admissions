// Filing a change request: the rules, decided without touching the DOM so they are testable.
//
// The body is always { kind: 'change', domain_key: 'admissions', title, description } and nothing
// else, checked against FileChangeRequestSchema (agentChangeRequestSchema.ts:22-60 at platform
// commit 087c2b7): title trimmed, 1 to 140 characters, at least one letter; description trimmed,
// at most 4000. A request cannot be edited or withdrawn once filed (no route for either at 087c2b7),
// so sending takes two deliberate steps: Review freezes the exact body, and File it sends that body.
//
// Failure modes, and what the page does:
//   not valid             Review refuses; nothing can be sent
//   edited after Review   the frozen body is dropped; File it is off until Review again
//   NotSignedIn           thrown before any request is made; nothing was sent, so File it may be tried again
//   HTTP answer (any)     shown as returned; File it stays off for good
//   no answer (network    unknown whether it was filed; the governance list is re-read first, then
//   error or timeout)     the page says so; File it stays off for good
// No retry anywhere: one press of File it is at most one POST.

export const TITLE_MAX = 140;
export const DESCRIPTION_MAX = 4000;
export const KIND = 'change';
export const DOMAIN_KEY = 'admissions';
export const FINAL_NOTE = "Once filed, this can't be edited or withdrawn.";
export const UNKNOWN_NOTE = 'Unknown whether it was filed: check the governance panel';
export const NOT_SIGNED_IN = 'NotSignedIn';
const HAS_A_LETTER = /\p{L}/u;
const NO_ANSWER = new Set(['NetworkError', 'TimeoutError']);

const clean = (v) => String(v ?? '').trim();

// Counts are of the trimmed text, because that is what the portal measures.
export function checkFields(title, description) {
  const t = clean(title);
  const d = clean(description);
  let titleError = null;
  if (!t) titleError = 'A title is required.';
  else if (t.length > TITLE_MAX) titleError = `A title can be at most ${TITLE_MAX} characters.`;
  else if (!HAS_A_LETTER.test(t)) titleError = 'A title needs at least one letter.';
  const descriptionError = d.length > DESCRIPTION_MAX ? `A description can be at most ${DESCRIPTION_MAX} characters.` : null;
  return {
    title: { count: t.length, max: TITLE_MAX, error: titleError },
    description: { count: d.length, max: DESCRIPTION_MAX, error: descriptionError },
    ok: !titleError && !descriptionError,
  };
}

export const buildBody = (title, description) => ({ kind: KIND, domain_key: DOMAIN_KEY, title: clean(title), description: clean(description) });

// `file(body)` makes the POST and resolves to { status, body } or throws an ApiError;
// `reread()` re-reads GET change-requests-mine. `onChange` fires on Review and on every step of
// filing, not on typing, so the page can redraw without taking focus out of a field.
export function createFiling({ file, reread, onChange = () => {} }) {
  let title = '';
  let description = '';
  let reviewed = null;
  let sent = false;
  let phase = 'editing'; // editing | sending | checking | done
  let outcome = null;

  const edit = (next, current, assign) => {
    if (sent || next === current) return;
    assign(next);
    reviewed = null;
  };
  async function rereadLogged() {
    try { await reread(); } catch (err) {
      console.error(JSON.stringify({ level: 'error', service: 'command-center', event: 'governance_reread_failed',
        outcome: 'failure', error_class: err?.error_class ?? 'UnknownError', context: { message: err?.message ?? null } }));
    }
  }

  return {
    get title() { return title; },
    get description() { return description; },
    get reviewed() { return reviewed; },
    get sent() { return sent; },
    get phase() { return phase; },
    get outcome() { return outcome; },
    get check() { return checkFields(title, description); },
    get canReview() { return !sent && checkFields(title, description).ok; },
    get canFile() { return !sent && reviewed !== null; },

    setTitle(v) { edit(String(v ?? ''), title, (x) => { title = x; }); },
    setDescription(v) { edit(String(v ?? ''), description, (x) => { description = x; }); },

    review() {
      if (sent) return false;
      reviewed = checkFields(title, description).ok ? buildBody(title, description) : null;
      onChange();
      return reviewed !== null;
    },

    // Returns { called } so a caller (and the tests) can tell a refused press from a sent one.
    async fileIt() {
      if (!this.canFile) return { called: false };
      const body = reviewed;
      sent = true;
      phase = 'sending';
      onChange();
      try {
        const res = await file(body);
        outcome = { kind: 'filed', httpStatus: res.status, id: res.body?.id ?? null, status: res.body?.status ?? null };
        phase = 'checking';
        onChange();
        await rereadLogged();
      } catch (err) {
        if (err?.error_class === NOT_SIGNED_IN) {
          // Thrown before any request was made, so nothing reached the portal.
          sent = false;
          outcome = { kind: 'not-sent', words: err.message };
        } else if (NO_ANSWER.has(err?.error_class)) {
          phase = 'checking';
          onChange();
          await rereadLogged();
          outcome = { kind: 'unknown', words: UNKNOWN_NOTE, detail: err.message };
        } else if (typeof err?.status === 'number' && err.body !== null && err.body !== undefined) {
          outcome = { kind: 'refused', httpStatus: err.status, words: err.body };
        } else if (typeof err?.status === 'number') {
          // The portal answered, but the body could not be read as JSON. A 2xx may mean it was filed.
          outcome = { kind: 'unreadable', httpStatus: err.status, words: err.message };
          await rereadLogged();
        } else {
          outcome = { kind: 'unknown', words: UNKNOWN_NOTE, detail: err?.message ?? 'No error was given.' };
          await rereadLogged();
        }
      }
      phase = 'done';
      onChange();
      return { called: true };
    },
  };
}
