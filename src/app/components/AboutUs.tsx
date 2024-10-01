"use client";

import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Image from "next/image";

const images = [
  { id: 1, img: "/fikaplace/1.jpg" },
  { id: 2, img: "/fikaplace/2.jpg" },
  { id: 3, img: "/fikaplace/3.jpg" },
  { id: 4, img: "/fikaplace/4.jpg" },
  { id: 5, img: "/fikaplace/5.jpg" },
  { id: 6, img: "/fikaplace/6.jpg" },
];

const about = {
  title: "About Us",
  desc: "Fikastalle by Fika Kafe is a charming café that offers a cozy and inviting atmosphere, perfect for enjoying a relaxing coffee break. The menu boasts a variety of specialty coffees, teas, and delicious pastries, along with a selection of hearty meals and snacks. Whether you're looking for a quiet spot to work, a place to catch up with friends, or simply to savor a quality cup of coffee, Fikastalle by Fika Kafe provides a delightful experience.",
};

const data = [
  {
    id: 1,
    title: "Location",
    desc: "Brgy. Iba, Silang, Cavite, 4118",
  },
  {
    id: 2,
    title: "Operating Days",
    desc: "Tuesday to Sunday",
  },
  {
    id: 3,
    title: "Open Hours",
    desc: "12pm to 10pm",
  },
  {
    id: 4,
    title: "Accessibility",
    desc: "The restaurant is PWD and pet friendly!",
  },
];

const AboutUs = () => {
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
    <div className="relative h-[calc(100vh-56px)] gap-2 flex flex-col-reverse items-center py-4 justify-between xl:flex-row xl:justify-center xl:px-56 xl:gap-4 w-full  xl:bg-[url('/backgrounds/bg2.png')] xl:bg-cover xl:bg-no-repeat xl:bg-center">
      {/* IMAGES CONTAINER */}
      <div className="relative w-[calc(100%-1rem)] h-1/3 p-2 overflow-hidden rounded-md md:h-1/2 xl:h-2/3 xl:flex-1 xl:shadow-xl">
        <Image
          src={images[currentSlide].img}
          alt=""
          fill
          className="object-cover"
        />
      </div>
      {/* DETAIL CONTAINER */}
      <div className="flex flex-col gap-0 lg:px-2 xl:flex-1 2xl:gap-8 md:justify-center md:items-center md:h-1/2 md:px-20">
        {/* ABOUT US TEXT */}
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="text-2xl text-orange-950 font-bold lg:text-3xl">
            {about.title}
          </h1>
          <p className="text-center px-4 lg:px-24 xl:px-4 xl:text-justify">
            {about.desc}
          </p>
        </div>
        {/* OTHER DETAILS TEXT DYNAMIC CONTAINER */}
        {data.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 justify-center items-center"
          >
            <h1 className="text-xl font-bold text-orange-950 lg:text-2xl">
              {item.title}
            </h1>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
