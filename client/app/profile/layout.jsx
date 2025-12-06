export const metadata = {
    title: "My Profile | Flyobo",
    description:
        "View and manage your Flyobo profile, personal details, bookings, saved trips, and account preferences.",
    openGraph: {
        title: "My Profile | Flyobo",
        description:
            "View and manage your Flyobo profile, personal details, bookings, saved trips, and account preferences.",
        url: "/profile",
        type: "website",
        siteName: "Flyobo",
        images: [
            {
                url: "/og/profile.jpg",
                width: 1200,
                height: 630,
                alt: "Flyobo User Profile",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "My Profile | Flyobo",
        description:
            "View and manage your Flyobo profile, personal details, bookings, saved trips, and account preferences.",
        images: ["/og/profile.jpg"],
    },
    alternates: {
        canonical: "/profile",
    },
};

export default function ProfileLayout({ children }) {
    return children;
}
