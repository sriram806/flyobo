"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FuturisticHero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Hero entrance animation
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.out" } });
    
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5 }
    )
    .fromTo(titleRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1 }, 
      "-=0.8"
    )
    .fromTo(subtitleRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1 }, 
      "-=0.7"
    )
    .fromTo(ctaRef.current, 
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8 }, 
      "-=0.5"
    );

    // Floating animation for the background elements
    gsap.to(".floating-element", {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Parallax effect for background
    gsap.to(".parallax-bg", {
      y: -50,
      scrollTrigger: {
        trigger: heroRef.current,
        scrub: 0.5,
      }
    });

  }, []);

  const handleExplore = () => {
    router.push("/packages");
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-blue-500/5 to-transparent parallax-bg"></div>
      </div>

      {/* Grid overlay for futuristic look */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Discover
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-teal-400">
            Infinite
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
            Horizons
          </span>
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-300 font-light"
        >
          Experience travel reimagined with cutting-edge technology and personalized journeys that adapt to your unique style.
        </p>

        <div 
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={handleExplore}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 backdrop-blur-sm border border-cyan-500/30"
          >
            <span className="flex items-center">
              Explore Journeys
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
          
          <button className="px-8 py-4 bg-transparent hover:bg-white/10 text-white font-medium rounded-full transition-all duration-300 border border-white/30 backdrop-blur-sm">
            <span className="flex items-center">
              Watch Demo
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-cyan-400">
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FuturisticHero;