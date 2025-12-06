"use client";

import React from "react";
import Head from "next/head";

/**
 * Generate JSON-LD structured data for SEO
 */
const StructuredData = ({ data }) => {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data),
        }}
      />
    </Head>
  );
};

/**
 * Organization structured data
 */
export const OrganizationStructuredData = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Flyobo",
    "url": "https://www.flyobo.com",
    "logo": "https://www.flyobo.com/images/logo.png",
    "sameAs": [
      "https://www.facebook.com/flyobo",
      "https://www.twitter.com/flyobo",
      "https://www.instagram.com/flyobo",
      "https://www.linkedin.com/company/flyobo"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "Customer Service"
      }
    ]
  };

  return <StructuredData data={organizationData} />;
};

/**
 * Website structured data
 */
export const WebsiteStructuredData = () => {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Flyobo",
    "url": "https://www.flyobo.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.flyobo.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return <StructuredData data={websiteData} />;
};

/**
 * Breadcrumb structured data
 */
export const BreadcrumbStructuredData = ({ breadcrumbs }) => {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };

  return <StructuredData data={breadcrumbData} />;
};

/**
 * Article structured data
 */
export const ArticleStructuredData = ({ 
  headline, 
  description, 
  author, 
  datePublished, 
  dateModified, 
  image,
  publisher 
}) => {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "datePublished": datePublished,
    "dateModified": dateModified,
    "image": image,
    "publisher": publisher || {
      "@type": "Organization",
      "name": "Flyobo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.flyobo.com/images/logo.png"
      }
    }
  };

  return <StructuredData data={articleData} />;
};

/**
 * Product structured data for travel packages
 */
export const PackageStructuredData = ({ 
  name, 
  description, 
  image, 
  price, 
  currency = "USD",
  rating,
  reviewCount,
  destination
}) => {
  const productData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": image,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": "Flyobo"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.flyobo.com/packages/${name.toLowerCase().replace(/\s+/g, '-')}`,
      "priceCurrency": currency,
      "price": price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Flyobo"
      }
    },
    "destination": destination
  };

  // Add rating if available
  if (rating && reviewCount) {
    productData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "reviewCount": reviewCount
    };
  }

  return <StructuredData data={productData} />;
};

export default StructuredData;