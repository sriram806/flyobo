export const metadata = {
    title: "About Us | Flyobo",
    description:
        "Learn about Flyobo, our mission, values, travel expertise, and commitment to creating unforgettable journeys for every traveler.",
    openGraph: {
        title: "About Us | Flyobo",
        description:
            "Learn about Flyobo, our mission, values, travel expertise, and commitment to creating unforgettable journeys for every traveler.",
        url: "/about",
        type: "website",
        siteName: "Flyobo",
        images: [
            {
                url: "/og/about.jpg",
                width: 1200,
                height: 630,
                alt: "Flyobo About Page",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Us | Flyobo",
        description:
            "Learn about Flyobo, our mission, values, travel expertise, and commitment to creating unforgettable journeys for every traveler.",
        images: ["/og/about.jpg"],
    },
    alternates: {
        canonical: "/about",
    },
};

export default function AboutLayout({ children }) {
    return children;
}
