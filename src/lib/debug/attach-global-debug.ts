// src/lib/debug/attach-global-debug.ts
let attached = false;

export function attachGlobalDebug() {
  if (attached || typeof window === "undefined") return;
  attached = true;

  // Global runtime errors
  window.addEventListener("error", (e) => {
    // eslint-disable-next-line no-console
    console.error("[GLOBAL ERROR]", e.message, e.error);
  });

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (e) => {
    // eslint-disable-next-line no-console
    console.error("[UNHANDLED REJECTION]", e.reason);
  });

  // Fetch logger
  const origFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const url =
      typeof args[0] === "string"
        ? args[0]
        : (args[0] as Request)?.url ?? "<unknown>";
    const t0 = performance.now();
    // eslint-disable-next-line no-console
    console.log("[FETCH→]", url, args[1]?.method || "GET");

    try {
      const res = await origFetch(...args);
      const dt = Math.round(performance.now() - t0);
      // eslint-disable-next-line no-console
      console.log("[FETCH←]", res.status, res.statusText, url, `${dt}ms`);
      return res;
    } catch (err) {
      const dt = Math.round(performance.now() - t0);
      // eslint-disable-next-line no-console
      console.error("[FETCH×]", url, `${dt}ms`, err);
      throw err;
    }
  };

  // eslint-disable-next-line no-console
  console.log("[DEBUG] Global debug attached (errors + fetch).");
}
