"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/app/firebase"; // Update the path based on your setup
import { doc, getDoc } from "firebase/firestore";

export const LandingSec = () => {
  // Block of code para sa transition at change ng text every few seconds.
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const [slidesData, setSlidesData] = useState([]);

  // Fetch slides data from Firestore
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const docRef = doc(db, "webContent", "landing_heroSection");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSlidesData(data.slides || []);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching slides data:", error);
      }
    };
    fetchSlides();
  }, []);

  // Handle text and image transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, [slidesData]);

  if (!slidesData.length) return null; // Display nothing until data is loaded

  return (
    <div className="w-full h-[calc(100vh-56px)] mt-14 flex flex-col lg:flex-row xl:px-56">
      {/* TEXT CONTAINER */}
      <div className="px-8 flex flex-col items-center justify-center xl:px-0 lg:items-start gap-4 lg:h-full flex-1">
        <h1
          className={`text-3xl md:text-4xl text-center lg:text-left lg:text-5xl transition-opacity duration-1000 text-orange-950 font-bold ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {slidesData[currentSlide].title}
        </h1>
        <p
          className={`text-sm text-center md:text-md lg:text-left lg:text-lg transition-opacity duration-1000 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {slidesData[currentSlide].desc}
        </p>
        <Link href="/menu"> {/* Wrap button with Link component */}
          <button
            className="bg-amber-950 text-white py-2 px-4 text-xl lg:px-6 lg:py-3 rounded-lg hover:bg-amber-900
            lg:hover:scale-105 duration-[0.3s] font-bold"
          >
            Order Now
          </button>
        </Link>
      </div>
      {/* IMAGE CONTAINER */}
      <div className="w-full relative flex-1 flex justify-center items-center">
        <Image
          src={slidesData[currentSlide].img}
          alt=""
          fill
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
};