"use client";

import React from "react";

const Heading = ({
  title,
  description,
  keywords,
  url,
  author = "Flyobo",
  siteUrl,
  siteName = "Flyobo",
  ogImage,
}) => {
  const fallbackIcon = "/images/icon.png";
  const ogImageUrl = ogImage || (siteUrl ? `${siteUrl}${fallbackIcon}` : fallbackIcon);
  const safeTitle = title || siteName;
  const safeDescription = description || "Travel with Flyobo";
  return (
    <>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={ogImageUrl} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      <link rel="icon" href="/images/icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/icon.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/icon.png" />
    </>
  );
};

export default Heading;
