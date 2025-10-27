# SEO Configuration and Sitemap Generation

This document explains the SEO configuration and sitemap generation setup for the Flyobo website.

## Overview

The SEO implementation includes:
1. Dynamic sitemap generation using `next-sitemap`
2. Structured data (JSON-LD) for rich search results
3. Meta tags for social media sharing
4. Robots.txt configuration
5. Canonical URLs

## Sitemap Generation

### How it works

The sitemap is automatically generated during the build process using the `next-sitemap` package. The configuration is in `next-sitemap.config.js`.

### Configuration Details

- **Static Pages**: Automatically detected from the Next.js pages structure
- **Dynamic Pages**: Fetched from the API using utility functions in `app/utils/sitemapUtils.mjs`
- **Excluded Paths**: Admin, profile, and API routes are excluded from the sitemap
- **Multiple Sitemaps**: The configuration generates multiple sitemaps for better organization:
  - Main sitemap (`sitemap.xml`)
  - Packages sitemap (`sitemap-packages.xml`)
  - Gallery sitemap (`sitemap-gallery.xml`)

### Adding New Dynamic Routes

1. Update `app/utils/sitemapUtils.mjs` to include functions for fetching new data
2. Add the new routes to the `additionalPaths` function in `next-sitemap.config.js`
3. If needed, create a new sitemap configuration in `additionalSitemapPaths`

## SEO Components

### SEO Component

The `SEO` component in `app/components/MetaData/SEO.jsx` provides a reusable way to add meta tags to any page:

```jsx
<SEO 
  title="Page Title"
  description="Page description"
  keywords="keyword1, keyword2"
  url="https://www.flyobo.com/page"
/>
```

### Structured Data Components

Several structured data components are available in `app/components/MetaData/StructuredData.jsx`:

1. **OrganizationStructuredData**: Company information
2. **WebsiteStructuredData**: Website information and search functionality
3. **BreadcrumbStructuredData**: Breadcrumb navigation
4. **ArticleStructuredData**: Blog articles
5. **PackageStructuredData**: Travel packages (product schema)

## Implementation Examples

### Basic Page SEO

```jsx
import SEO from '../components/MetaData/SEO';
import { WebsiteStructuredData, OrganizationStructuredData } from '../components/MetaData/StructuredData';

export default function Page() {
  return (
    <>
      <SEO 
        title="Page Title"
        description="Page description"
        keywords="keyword1, keyword2"
        url="https://www.flyobo.com/page"
      />
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      {/* Page content */}
    </>
  );
}
```

### Package Page SEO

```jsx
import SEO from '../components/MetaData/SEO';
import { PackageStructuredData } from '../components/MetaData/StructuredData';

export default function PackagePage({ packageData }) {
  return (
    <>
      <SEO 
        title={`${packageData.name} - Luxury Travel Package`}
        description={packageData.description}
        keywords={`travel package, ${packageData.destination}`}
        url={`https://www.flyobo.com/packages/${packageData.id}`}
        ogType="product"
      />
      <PackageStructuredData 
        name={packageData.name}
        description={packageData.description}
        image={packageData.image}
        price={packageData.price}
        currency={packageData.currency}
        rating={packageData.rating}
        reviewCount={packageData.reviewCount}
        destination={packageData.destination}
      />
      {/* Page content */}
    </>
  );
}
```

## Maintenance

### Updating the Sitemap

The sitemap is automatically regenerated on each build. To manually regenerate:

```bash
npm run build
```

### Adding New Excluded Paths

Add new paths to the `exclude` array in `next-sitemap.config.js`:

```js
exclude: [
  '/admin/*',
  '/profile/*',
  '/api/*',
  '/new-private-path/*',
],
```

### Customizing Robots.txt

The `robots.txt` file is automatically generated based on the configuration in `next-sitemap.config.js`. To customize it further, modify the `robotsTxtOptions` section.

## Testing

### Sitemap Validation

After building, check the sitemap at:
- https://www.flyobo.com/sitemap.xml
- https://www.flyobo.com/sitemap-packages.xml
- https://www.flyobo.com/sitemap-gallery.xml

### SEO Testing Tools

Use these tools to validate your SEO implementation:
1. Google Search Console
2. Bing Webmaster Tools
3. Screaming Frog SEO Spider
4. Ahrefs Site Audit

## Troubleshooting

### Sitemap Not Updating

1. Ensure the build process completes successfully
2. Check that the `postbuild` script runs in `package.json`
3. Verify that the API endpoints for dynamic data are accessible

### Missing Structured Data

1. Check that the JSON-LD script is included in the page
2. Validate the structured data using Google's Rich Results Test
3. Ensure all required properties are provided

### Meta Tags Not Appearing

1. Verify that the `SEO` component is included in the page
2. Check that there are no conflicting meta tags
3. Use browser developer tools to inspect the rendered HTML