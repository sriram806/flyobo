export const metadata = {
    title: "Contact Us | Flyobo",
    description:
        "Get in touch with Flyobo for trip inquiries, support, partnerships, or customer assistance.",
    openGraph: {
        title: "Contact Us | Flyobo",
        description:
            "Get in touch with Flyobo for trip inquiries, support, partnerships, or customer assistance.",
        url: "/contact",
        type: "website",
        siteName: "Flyobo",
        images: [
            {
                url: "/og/contact.jpg",
                width: 1200,
                height: 630,
                alt: "Flyobo Contact Page",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Us | Flyobo",
        description:
            "Get in touch with Flyobo for trip inquiries, support, partnerships, or customer assistance.",
        images: ["/og/contact.jpg"],
    },
    alternates: {
        canonical: "/contact",
    },
};

export default function ContactLayout({ children }) {
    return children;
}
