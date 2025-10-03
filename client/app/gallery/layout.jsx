export const metadata = {
  title: "Customer Memories | Flyobo",
  description:
    "Browse customer memories from Flyobo trips: real photos from adventures across beaches, mountains, cities, and more.",
  openGraph: {
    title: "Customer Memories | Flyobo",
    description:
      "Browse customer memories from Flyobo trips: real photos from adventures across beaches, mountains, cities, and more.",
    url: "/gallery",
    type: "website",
    siteName: "Flyobo",
    images: [
      {
        url: "/og/gallery.jpg",
        width: 1200,
        height: 630,
        alt: "Flyobo Customer Memories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Memories | Flyobo",
    description:
      "Browse customer memories from Flyobo trips: real photos from adventures across beaches, mountains, cities, and more.",
    images: ["/og/gallery.jpg"],
  },
  alternates: {
    canonical: "/gallery",
  },
};

export default function GalleryLayout({ children }) {
  return children;
}
