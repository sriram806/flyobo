"use client";

import React from "react";
import Head from "next/head";

const SEO = ({
  title,
  description,
  keywords,
  url,
  author = "Flyobo",
  siteName = "Flyobo",
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}) => {
  // Default values
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.flyobo.com";
  const fallbackImage = `${siteUrl}/images/og-image.jpg`;
  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER || "@flyobo";
  const locale = process.env.NEXT_PUBLIC_LOCALE || "en_US";
  const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR || "#0ea5e9";
  const ogImageUrl = ogImage || fallbackImage;
  
  // Ensure title includes site name for better SEO
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  
  // Combine keywords with tags
  const allKeywords = [...(keywords ? keywords.split(",") : []), ...tags].join(",");

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {allKeywords && <meta name="keywords" content={allKeywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content={themeColor} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:locale" content={locale} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImageUrl} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:site" content={twitterHandle} />
      
      {/* Canonical URL */}
      {/* Always include canonical (prefer provided url, fall back to siteUrl) */}
      <link rel="canonical" href={url || siteUrl} />
      
      {/* Favicon */}
      <link rel="icon" href="/images/icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/icon.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/icon.png" />
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
    </Head>
  );
};

export default SEO;