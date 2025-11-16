// Utility functions for generating dynamic sitemap entries

/**
 * Fetch all packages from the API
 * @returns {Promise<Array>} Array of package objects
 */
export async function fetchPackages() {
  try {
    // Try to fetch packages from the configured backend API.
    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api/v1"
        : "https://flyobo.com/api/v1");

    // Try common collection endpoints. Some backends expose `/packages`, others `/package`.
    const endpoints = [`${base}/packages`, `${base}/package`];
    let response = null;
    let data = null;

    for (const ep of endpoints) {
      try {
        response = await fetch(ep, { method: "GET" });
        if (!response.ok) continue;
        data = await response.json();
        break;
      } catch (e) {
        // try next endpoint
        console.warn(`sitemapUtils: failed to fetch from ${ep}:`, e.message || e);
        continue;
      }
    }

    if (data) {
      // Normalize shapes: backends may return { packages: [...] } or { data: [...] } or direct array
      const list = data.packages || data.data?.packages || data.data || (Array.isArray(data) ? data : null);
      if (Array.isArray(list)) {
        return list.map((p) => ({
          id: p.slug || p._id || p.id || (p._doc && p._doc.slug) || String(p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          title: p.title || p.name || "",
          updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
          destination: p.destination || p.location || "",
        }));
      }
    }

    // If API fetch failed or returned unexpected data, fall back to a small mock set
    console.warn("sitemapUtils: falling back to mock package list");
    return [
      {
        id: "beach-paradise-resort",
        title: "Beach Paradise Resort",
        updatedAt: new Date().toISOString(),
        destination: "Maldives",
      },
      {
        id: "mountain-adventure-trek",
        title: "Mountain Adventure Trek",
        updatedAt: new Date().toISOString(),
        destination: "Himalayas",
      },
      {
        id: "city-explorer-tour",
        title: "City Explorer Tour",
        updatedAt: new Date().toISOString(),
        destination: "Paris",
      },
    ];
  } catch (error) {
    console.error("Error fetching packages for sitemap:", error);
    // Return mock data on unexpected error so sitemap generation can continue.
    return [
      {
        id: "beach-paradise-resort",
        title: "Beach Paradise Resort",
        updatedAt: new Date().toISOString(),
        destination: "Maldives",
      },
      {
        id: "mountain-adventure-trek",
        title: "Mountain Adventure Trek",
        updatedAt: new Date().toISOString(),
        destination: "Himalayas",
      },
      {
        id: "city-explorer-tour",
        title: "City Explorer Tour",
        updatedAt: new Date().toISOString(),
        destination: "Paris",
      },
    ];
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
    // In a real implementation, you would fetch from your API
    // const res = await fetch('http://localhost:5000/api/gallery');
    // const data = await res.json();
    // return data.items || [];
    
    // Mock data for demonstration
    return [
      { id: 'beach-photos', title: 'Beach Photos Collection', updatedAt: new Date().toISOString() },
      { id: 'mountain-views', title: 'Mountain Panoramic Views', updatedAt: new Date().toISOString() },
    ];
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