"use client";
import Image from "next/image";

const destinations = [
  {
    name: "Jaipur, Rajasthan",
    img: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Manali, Himachal Pradesh",
    img: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Andaman Beaches",
    img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Munnar, Kerala",
    img: "https://images.unsplash.com/photo-1637066742971-726bee8d9f56?q=80&w=2149&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
];

export default function IndianDestinations() {
  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 space-y-8">

        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 text-center">
          Popular Indian Destinations
        </h2>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group shadow-md"
            >
              <Image
                src={dest.img}
                alt={dest.name}
                width={600}
                height={400}
                className="object-cover w-full h-64 md:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
                <h3 className="text-lg md:text-xl font-semibold text-white drop-shadow-lg">
                  {dest.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
