// Utility functions for generating dynamic sitemap entries

/**
 * Fetch all packages from the API
 * @returns {Promise<Array>} Array of package objects
 */
export async function fetchPackages() {
  try {
    // In a real implementation, you would fetch from your API
    // const res = await fetch('http://localhost:5000/api/packages/get-packages');
    // const data = await res.json();
    // return data.packages || [];
    
    // For now, returning mock data based on your package model
    return [
      { 
        id: 'beach-paradise-resort', 
        title: 'Beach Paradise Resort', 
        updatedAt: new Date().toISOString(),
        destination: 'Maldives'
      },
      { 
        id: 'mountain-adventure-trek', 
        title: 'Mountain Adventure Trek', 
        updatedAt: new Date().toISOString(),
        destination: 'Himalayas'
      },
      { 
        id: 'city-explorer-tour', 
        title: 'City Explorer Tour', 
        updatedAt: new Date().toISOString(),
        destination: 'Paris'
      },
    ];
  } catch (error) {
    console.error('Error fetching packages for sitemap:', error);
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