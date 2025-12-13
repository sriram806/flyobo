import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";

export default function FeaturedPackagesCard({ pkg }) {
  const href = `/packages/${pkg?.slug || pkg?._id || pkg?.id}`;
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [destDetailsState, setDestDetailsState] = useState(null);
  
  // Resolve image URL properly
  const resolveImageUrl = (img) => {
    if (!img) return null;
    if (Array.isArray(img)) img = img[0];
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img?.url) return img.url;
    return null;
  };
  
  const imgSrc = resolveImageUrl(pkg?.images) || "/images/placeholder.jpg";

  // Destination details
  const destDetails = destDetailsState || pkg?.destinationDetails || (typeof pkg?.destination === 'object' ? pkg.destination : null);
  const destText = destDetails
    ? [destDetails.place, destDetails.state, destDetails.country].filter(Boolean).join(", ")
    : (typeof pkg?.destination === 'string' ? pkg.destination : "");

  // Fetch destination details by ID if missing
  useEffect(() => {
    let cancelled = false;
    const fetchDestination = async () => {
      try {
        const destIdCandidate = pkg?.destination || pkg?.destinationId;
        const hasDetails = !!(pkg?.destinationDetails || (typeof pkg?.destination === 'object'));
        if (!API_URL || hasDetails || !destIdCandidate || typeof destIdCandidate !== 'string') return;
        const { data } = await axios.get(`${API_URL}/destinations/${destIdCandidate}`, { params: { fields: 'place,state,country' } });
        const destItem = data?.data || data?.destination || data;
        if (!cancelled && destItem && (destItem.place || destItem.state || destItem.country)) {
          setDestDetailsState({ place: destItem.place, state: destItem.state, country: destItem.country });
        }
      } catch {
        // silently ignore
      }
    };
    fetchDestination();
    return () => { cancelled = true; };
  }, [API_URL, pkg?.destination, pkg?.destinationDetails]);

  return (
    <Link
      href={href}
      className="group block rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm hover:scale-[1.01] transition-transform"
      aria-label={`View package ${pkg?.title}`}
    >
      <div className="relative h-64 w-full">
        <img
          src={imgSrc}
          alt={pkg?.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
          <h3 className="text-white font-semibold text-lg line-clamp-1">{pkg?.title}</h3>
          <p className="text-sm text-sky-200 mt-1 line-clamp-1">{destText || "Amazing Destination"}</p>
        </div>

        {pkg?.days && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full bg-sky-500 text-white">
            {pkg.days} Days
          </span>
        )}
      </div>
    </Link>
  );
}
