export const metadata = {
    title: "FAQ | Flyobo",
    description:
        "Find answers to frequently asked questions about Flyobo trips, bookings, payments, cancellations, and travel guidelines.",
    openGraph: {
        title: "FAQ | Flyobo",
        description:
            "Find answers to frequently asked questions about Flyobo trips, bookings, payments, cancellations, and travel guidelines.",
        url: "/faq",
        type: "website",
        siteName: "Flyobo",
        images: [
            {
                url: "/og/faq.jpg",
                width: 1200,
                height: 630,
                alt: "Flyobo FAQ",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "FAQ | Flyobo",
        description:
            "Find answers to frequently asked questions about Flyobo trips, bookings, payments, cancellations, and travel guidelines.",
        images: ["/og/faq.jpg"],
    },
    alternates: {
        canonical: "/faq",
    },
};

export default function FaqLayout({ children }) {
    return children;
}
