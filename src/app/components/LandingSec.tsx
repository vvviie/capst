"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

// Data for the changing text for the landing page, as well as 'yung picture link.
const data = [
  {
    id: 1,
    title: "Enjoy gourmet meals and coffee at our cozy café and restaurant.",
    desc: "Enjoy gourmet meals and coffee at our cozy café and restaurant.",
    img: "/coffee.png",
  },
  {
    id: 2,
    title:
      "Experience culinary delights and warm ambiance at our charming eatery.",
    desc: "Experience culinary delights and warm ambiance at our charming eatery.",
    img: "/cwfood.jpg",
  },
];

export const LandingSec = () => {
  // Block of code para sa transition at change ng text every few seconds.
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-56px)] mt-14 flex flex-col lg:flex-row xl:px-56">
      {/* TEXT CONTAINER */}
      <div className="px-8 flex flex-col items-center justify-center xl:px-0 lg:items-start gap-4 lg:h-full flex-1">
        <h1
          className={`text-3xl md:text-4xl text-center lg:text-left lg:text-5xl transition-opacity duration-1000 text-orange-950 font-bold ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {data[currentSlide].title}
        </h1>
        <p
          className={`text-sm text-center md:text-md lg:text-left lg:text-lg transition-opacity duration-1000 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {data[currentSlide].desc}
        </p>
        <button
          className="bg-amber-950 text-white py-2 px-4 text-xl lg:px-6 lg:py-3 rounded-lg hover:bg-amber-900
        lg:hover:scale-105 duration-[0.3s] font-bold"
        >
          Order Now
        </button>
      </div>
      {/* IMAGE CONTAINER */}
      <div className="w-full relative flex-1 flex justify-center items-center">
        <Image
          src={data[0].img}
          alt=""
          fill
          className={`object-contain
            }`}
        />
      </div>
    </div>
  );
};
