export const metadata = {
    title: "Travel Packages | Flyobo",
    description:
        "Discover a wide range of Flyobo travel packages including international tours, domestic trips, adventure experiences, honeymoon specials, and budget-friendly holiday plans.",
    openGraph: {
        title: "Travel Packages | Flyobo",
        description:
            "Discover a wide range of Flyobo travel packages including international tours, domestic trips, adventure experiences, honeymoon specials, and budget-friendly holiday plans.",
        url: "/packages",
        type: "website",
        siteName: "Flyobo",
        images: [
            {
                url: "/og/packages.jpg",
                width: 1200,
                height: 630,
                alt: "Flyobo Travel Packages",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Travel Packages | Flyobo",
        description:
            "Discover a wide range of Flyobo travel packages including international tours, domestic trips, adventure experiences, honeymoon specials, and budget-friendly holiday plans.",
        images: ["/og/packages.jpg"],
    },
    alternates: {
        canonical: "/packages",
    },
};

export default function PackagesLayout({ children }) {
    return children;
}
