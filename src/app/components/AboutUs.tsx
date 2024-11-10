"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/app/firebase"; // Adjust the import to your Firebase config

const AboutUs = () => {
  // Block of code para sa transition at change ng text every few seconds.
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const [aboutUsText, setAboutUsText] = useState("");
  const [location, setLocation] = useState("");
  const [operatingDays, setOperatingDays] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [accessibility, setAccessibility] = useState("");
  const [images, setImages] = useState<string[]>([]); // Ensure this is an array of strings

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "webContent", "landing_infoSection");
      const docSnap = await getDoc(docRef);
      console.log("Document Reference:", docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        setAboutUsText(docSnap.data()["aboutUs"] || ""); // Set initial About Us text
        setLocation(docSnap.data()["location"] || ""); // Set initial Location
        setOperatingDays(docSnap.data()["operatingDays"] || ""); // Set initial Operating Days
        setOpenHours(docSnap.data()["openHours"] || ""); // Set initial Open Hours
        setAccessibility(docSnap.data()["accessibility"] || ""); // Set initial Accessibility
        setImages(docSnap.data()["img"] || []); // Set initial images from Firestore
      } else {
        console.log("No such document!");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      className="relative gap-2 flex flex-col-reverse items-center py-4 justify-between px-10 md:px-24
    lg:flex-row lg:justify-center xl:px-56 lg:gap-4 w-full  lg:bg-[url('/backgrounds/bg2.png')]
    lg:bg-cover lg:bg-no-repeat lg:bg-center lg:min-h-[calc(100vh-56px)]"
    >
      {/* IMAGES CONTAINER */}
      <div
        className="relative w-[calc(100%-1rem)] h-1/3 p-2 overflow-hidden rounded-md aspect-square
      lg:ml-4 lg:flex-1 xl:ml-0 xl:shadow-xl"
      >
        {images.length > 0 && (
          <Image
            src={images[currentSlide]} // Use the image URL directly
            alt={`Slide ${currentSlide + 1}`} // Provide a descriptive alt text
            fill
            className="object-cover"
          />
        )}
      </div>
      {/* DETAIL CONTAINER */}
      <div className="flex flex-col gap-4 py-4 lg:px-2 lg:flex-1 2xl:gap-8 md:justify-center md:items-center md:h-1/2">
        {/* ABOUT US TEXT */}
        <div className="flex flex-col gap-1 justify-center items-center">
          <h1 className="text-2xl text-orange-950 font-bold lg:text-3xl">
            About Us
          </h1>
          <p className="text-justify px-4">{aboutUsText}</p>
        </div>
        {/* OTHER DETAILS TEXT DYNAMIC CONTAINER */}
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="text-xl font-bold text-orange-950 lg:text-2xl">
            Location
          </h1>
          <p>{location}</p>
        </div>
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="text-xl font-bold text-orange-950 lg:text-2xl">
            Operating Days
          </h1>
          <p>{operatingDays}</p>
        </div>
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="text-xl font-bold text-orange-950 lg:text-2xl">
            Open Hours
          </h1>
          <p>{openHours}</p>
        </div>
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="text-xl font-bold text-orange-950 lg:text-2xl">
            Accessibility
          </h1>
          <p>{accessibility}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
