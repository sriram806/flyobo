// Compute backend URL with a runtime safeguard: if the built env points to localhost
// but the app is loaded in a public host (e.g. https://flyobo.com or inside an
// in-app browser), prefer a runtime-derived URL so clients don't call localhost.
export const NEXT_PUBLIC_BACKEND_URL = (() => {
  const built = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api/v1' : 'https://flyobo.com/api/v1');
  if (typeof window !== 'undefined') {
    try {
      const hostname = window.location.hostname || '';
      // If the built URL targets localhost but the current host is not localhost,
      // derive the API from the current origin (assumes API is served under /api/v1 on the same host).
      if (built.includes('localhost') && hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.host}/api/v1`;
      }
    } catch (e) {
      // ignore and fall back to built value
    }
  }
  return built;
})();

// Public site URL used for building canonical links and share URLs.
export const NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://flyobo.com');