/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.flyobo.com',
  generateRobotsTxt: true,
  exclude: [
    '/admin/*',
    '/profile/*',
    '/api/*',
    '/_next/*',
    '/_proxy/*',
    '/_auth/*',
    '/_error',
    '/404',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/admin/', '/profile/'],
      },
    ],
    additionalSitemaps: [
      'https://www.flyobo.com/sitemap.xml',
      'https://www.flyobo.com/sitemap-packages.xml',
      'https://www.flyobo.com/sitemap-gallery.xml',
    ],
  },
  // Generate alternate links for multilingual sites
  alternateRefs: [
    {
      href: 'https://www.flyobo.com/en',
      hreflang: 'en',
    },
  ],
  // Transform each URL to add metadata
  transform: async (config, path) => {
    // For dynamic routes, we might want to fetch data to set priority and changefreq
    // But for now, we'll use default values
    
    // Set priority based on path depth
    let priority = 0.7;
    if (path === '/') {
      priority = 1.0;
    } else if (path.split('/').length === 2) {
      priority = 0.8;
    }
    
    return {
      loc: path,
      changefreq: 'daily',
      priority: priority,
      lastmod: new Date().toISOString(),
    };
  },
  // Add dynamic routes to sitemap
  additionalPaths: async (config) => {
    // Import the utility functions dynamically
    const { getPackageRoutes, getGalleryRoutes } = await import('./app/utils/sitemapUtils.mjs');
    
    // Get dynamic package routes
    const packageRoutes = await getPackageRoutes();
    
    // Get dynamic gallery routes
    const galleryRoutes = await getGalleryRoutes();
    
    // Combine all dynamic routes
    return [...packageRoutes, ...galleryRoutes];
  },
  // Generate multiple sitemaps
  additionalSitemapPaths: [
    { 
      path: 'sitemap-packages.xml',
      filter: (path) => path.startsWith('/packages/'),
      priority: 0.8,
      changefreq: 'weekly'
    },
    { 
      path: 'sitemap-gallery.xml',
      filter: (path) => path.startsWith('/gallery/'),
      priority: 0.6,
      changefreq: 'monthly'
    }
  ]
};