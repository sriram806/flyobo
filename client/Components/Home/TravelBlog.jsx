"use client";

import { FiCalendar, FiUser, FiTag, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "10 Hidden Gems in Southeast Asia You Haven't Heard Of",
    excerpt: "Discover breathtaking destinations off the beaten path that will take your breath away with their untouched beauty and authentic experiences.",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80&auto=format&fit=crop",
    author: "Alex Morgan",
    date: "Oct 15, 2025",
    tags: ["Adventure", "Southeast Asia"],
    readTime: "8 min read"
  },
  {
    id: 2,
    title: "The Ultimate Packing Guide for Digital Nomads",
    excerpt: "Learn how to pack light but smart for your next remote work adventure with our comprehensive guide for digital nomads.",
    image: "https://images.unsplash.com/photo-1496287328265-98c16b511723?w=1200&q=80&auto=format&fit=crop",
    author: "Jamie Smith",
    date: "Oct 10, 2025",
    tags: ["Packing Tips", "Digital Nomad"],
    readTime: "6 min read"
  },
  {
    id: 3,
    title: "Sustainable Travel: How to Reduce Your Carbon Footprint",
    excerpt: "Explore practical ways to travel more sustainably and make a positive impact on the destinations you visit around the world.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
    author: "Taylor Reed",
    date: "Oct 5, 2025",
    tags: ["Sustainability", "Eco Travel"],
    readTime: "10 min read"
  }
];

const BlogCard = ({ post }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              <FiTag className="mr-1" size={12} />
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <FiUser className="mr-1" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            <span>{post.date}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {post.readTime}
          </span>
          <Link
            href={`/blog/${post.id}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Read more
            <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const TravelBlog = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelBlog;