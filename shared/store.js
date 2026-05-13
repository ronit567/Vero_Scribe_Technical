// vero — bookings store (localStorage-backed, cross-tab + same-tab subscribe)

const STORE_KEY = "vero.bookings.v1";
localStorage.removeItem(STORE_KEY); // demo mode — reset on every page load

const readStore = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
  catch { return []; }
};
const writeStore = (all) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(STORE_KEY));
};

window.Store = {
  list: readStore,
  add: (b) => writeStore([b, ...readStore()]),
  update: (id, patch) => writeStore(readStore().map((b) => b.id === id ? { ...b, ...patch } : b)),
  subscribe(cb) {
    const handler = (e) => {
      if (e.type === STORE_KEY || e.key === STORE_KEY) cb(readStore());
    };
    window.addEventListener("storage", handler);
    window.addEventListener(STORE_KEY, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(STORE_KEY, handler);
    };
  },
};
