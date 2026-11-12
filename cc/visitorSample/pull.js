// One pull of the admissions signals route per page load. `read` is the session's readOnce, so
// the admin token stays inside session.js and the call is made once, with no automatic retry.
//
// After a pull that answered, pull() returns the same result and never calls the route again;
// the sample is fixed. A click while a pull is in flight joins that pull. Only a pull that got
// no usable answer (an error) can be tried again, because nothing was sampled from it.
import { SIGNALS_PATH, evaluate } from './model.js';

export function createPuller({ read, now = () => new Date(), onChange = () => {} }) {
  let state = { status: 'idle' };
  let inFlight = null;
  const set = (next) => { state = next; onChange(); };

  return {
    get state() { return state; },
    pull() {
      if (state.status === 'done') return Promise.resolve(state);
      if (inFlight) return inFlight;
      set({ status: 'loading' });
      inFlight = (async () => {
        try {
          const { status, body } = await read(SIGNALS_PATH);
          set({ status: 'done', pulledAt: now(), httpStatus: status, evaluation: evaluate(body) });
        } catch (err) {
          set({ status: 'error', at: now(), error: err });
        } finally {
          inFlight = null;
        }
        return state;
      })();
      return inFlight;
    },
  };
}
