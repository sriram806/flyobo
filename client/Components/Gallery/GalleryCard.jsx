import { Download, Heart, Share2 } from "lucide-react";
import { useState } from "react";

const GalleryCard = ({ item, index, onOpen }) => {
    const [loaded, setLoaded] = useState(false);

    const downloadImage = (e) => {
        e.stopPropagation();
        const link = document.createElement("a");
        link.href = item.image;
        link.download = item.title || "photo.jpg";
        link.click();
    };

    const shareImage = async (e) => {
        e.stopPropagation();
        if (navigator.share) {
            await navigator.share({ title: item.title, url: item.image });
        } else {
            await navigator.clipboard.writeText(item.image);
        }
    };

    return (
        <div className="group mb-4 break-inside-avoid cursor-pointer" onClick={onOpen}>
            <div className="relative overflow-hidden bg-white dark:bg-gray-900">

                {/* Loader */}
                {!loaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                )}

                {/* Image */}
                <img
                    src={item.image}
                    alt={item.title}
                    onLoad={() => setLoaded(true)}
                    className="w-full h-auto group-hover:scale-105 transition duration-500"
                />

                {/* Hover Overlay */}
                <div className="
          absolute inset-0 
          bg-black/40 
          opacity-0 
          group-hover:opacity-100 
          transition 
        "></div>

                {/* Hover Buttons */}
                <div className="
          absolute inset-0 
          opacity-0 group-hover:opacity-100 
          transition 
          flex justify-center items-center gap-4
        ">
                    <button
                        onClick={downloadImage}
                        className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition"
                    >
                        <Download className="w-5 h-5 text-black" />
                    </button>

                    <button
                        onClick={shareImage}
                        className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition"
                    >
                        <Share2 className="w-5 h-5 text-black" />
                    </button>
                </div>
                <div
                    className="
            absolute bottom-0 left-0 right-0 
            px-4 py-3 
            bg-gradient-to-t from-black/60 to-transparent
            opacity-0 group-hover:opacity-100 
            translate-y-3 group-hover:translate-y-0
            transition-all duration-300
          "
                >
                    <h3 className="text-white text-sm font-semibold line-clamp-1">
                        {item.title || "Untitled"}
                    </h3>
                </div>

            </div>
        </div>
    );
};

export default GalleryCard;