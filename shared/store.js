// vero — bookings store (localStorage-backed, cross-tab + same-tab subscribe)

(function () {
  const KEY = "vero.bookings.v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function write(all) {
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(KEY));
  }

  window.Store = {
    KEY,
    list() {
      return read();
    },
    add(booking) {
      const all = read();
      all.unshift(booking);
      write(all);
    },
    update(id, patch) {
      const all = read().map((b) => (b.id === id ? { ...b, ...patch } : b));
      write(all);
    },
    subscribe(cb) {
      const handler = (e) => {
        if (!e || e.type === KEY || e.key === KEY || e.key === null) cb(read());
      };
      window.addEventListener("storage", handler);
      window.addEventListener(KEY, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(KEY, handler);
      };
    },
  };
})();
