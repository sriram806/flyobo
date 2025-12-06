// Utility functions for generating dynamic sitemap entries

/**
 * Fetch all packages from the API
 * @returns {Promise<Array>} Array of package objects
 */
export async function fetchPackages() {
  // Always return an array (possibly empty). This prevents consumers like
  // `getPackageRoutes` from throwing when calling `.map` on undefined.
  try {
    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api/v1"
        : "https://flyobo.com/api/v1");

    const endpoints = [`${base}/packages`, `${base}/package`, `${base}/packages/get-packages`];
    let data = null;

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { method: "GET" });
        if (!res || !res.ok) continue;
        data = await res.json();
        break;
      } catch (e) {
        console.warn(`sitemapUtils: failed to fetch packages from ${ep}:`, e?.message || e);
        continue;
      }
    }

    if (data) {
      const list = data.packages || data.data?.packages || data.data || (Array.isArray(data) ? data : null);
      if (Array.isArray(list)) {
        return list.map((p) => ({
          id:
            p.slug || p._id || p.id || (p._doc && p._doc.slug) ||
            String(p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          title: p.title || p.name || "",
          updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
          destination: p.destination || p.location || "",
        }));
      }
      console.warn("sitemapUtils: packages fetch returned an unexpected shape; falling through to empty list", data);
    }

    // If we reach here, return an empty array so callers can safely iterate.
    return [];
  } catch (error) {
    console.error("Error fetching packages for sitemap:", error);
    return [];
  }
}

/**
 * Generate dynamic routes for packages
 * @returns {Promise<Array>} Array of dynamic route objects
 */
export async function getPackageRoutes() {
  const packages = await fetchPackages();
  
  return packages.map(pkg => ({
    loc: `/packages/${pkg.id}`,
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: pkg.updatedAt || new Date().toISOString(),
  }));
}

/**
 * Fetch all gallery items from the API
 * @returns {Promise<Array>} Array of gallery objects
 */
export async function fetchGalleryItems() {
  try {
    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api/v1"
        : "https://flyobo.com/api/v1");

    const endpoints = [`${base}/gallery`, `${base}/galleries`, `${base}/gallery-items`, `${base}/galleryitems`, `${base}/gallery/get-gallery`];
    let data = null;

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { method: "GET" });
        if (!res || !res.ok) continue;
        data = await res.json();
        break;
      } catch (e) {
        console.warn(`sitemapUtils: failed to fetch gallery from ${ep}:`, e?.message || e);
        continue;
      }
    }

    if (data) {
      const list = data.items || data.galleries || data.data?.items || data.data || (Array.isArray(data) ? data : null);
      if (Array.isArray(list)) {
        return list.map((p) => ({
          id: p.slug || p._id || p.id || String(p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          title: p.title || p.name || "",
          updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
        }));
      }
      console.warn("sitemapUtils: gallery fetch returned unexpected shape; returning empty list", data);
    }

    return [];
  } catch (error) {
    console.error('Error fetching gallery items for sitemap:', error);
    return [];
  }
}

/**
 * Generate dynamic routes for gallery items
 * @returns {Promise<Array>} Array of dynamic route objects
 */
export async function getGalleryRoutes() {
  const galleryItems = await fetchGalleryItems();
  
  return galleryItems.map(item => ({
    loc: `/gallery/${item.id}`,
    changefreq: 'monthly',
    priority: 0.6,
    lastmod: item.updatedAt || new Date().toISOString(),
  }));
}

/**
 * Get all dynamic routes for the main sitemap
 * @returns {Promise<Array>} Array of all dynamic route objects
 */
export async function getAllDynamicRoutes() {
  const packageRoutes = await getPackageRoutes();
  const galleryRoutes = await getGalleryRoutes();
  
  return [...packageRoutes, ...galleryRoutes];
}