import Image from "next/image";
import Link from "next/link";

export default function FeaturedPackagesCard({ pkg }) {
  const href = `/packages/${pkg?.slug || pkg?._id || pkg?.id}`;
  const imgSrc = Array.isArray(pkg?.images) ? pkg.images[0] : pkg?.images || "/images/placeholder.jpg";

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
          <p className="text-sm text-sky-200 mt-1 line-clamp-1">{pkg?.destination || "Amazing Destination"}</p>
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
