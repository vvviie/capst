"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Reserve } from "../data";
import Image from "next/image";

const BookPage = () => {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Check for the "user" cookie when the component mounts
  useEffect(() => {
    const userCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='));
    
    // If no user cookie is found, show the login modal
    if (!userCookie) {
      setShowLoginModal(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLoginModal(false);  // Close the modal if clicked outside
      }
    };

    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLoginModal]);

  return (
    <div
      className="relative h-auto mt-14 flex flex-col items-center bg-white gap-4 py-4
    overflow-hidden justify-center md:py-10 px-10
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center lg:h-[69.175vh]
    lg:px-24"
    >
      {/* Show login modal if no user cookie is found */}
      {showLoginModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
          onClick={() => setShowLoginModal(false)} // Close modal when clicking on the background
        >
          {/* SIGN IN REQUIRED CONTAINER */}
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center border-2 border-gray-50"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
            ref={modalRef}
          >
            <h2 className="text-xl font-bold mb-4">Sign in required!</h2>
            <p className="mb-4">Please sign in to book your reservations with us.</p>
            <div className="flex justify-center items-center gap-4">
              <Link
                href="/login"
                className="bg-orange-950 text-white w-full py-2 rounded-md font-bold shadow-md border-2 border-orange-950"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center xl:max-w-[960px]">
        <h1 className="font-bold text-orange-950 text-2xl flex items-center space-x-2">
          <i className="fa fa-book text-lg" aria-hidden="true"></i>
          <span>Booking</span>
        </h1>
        <Link
          href={"book/reservations"}
          className="bg-white border-gray-100 border-2 rounded-md shadow-md text-gray-600 font-bold
          px-4 py-2"
        >
          My Reservations
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center gap-6 md:flex-row">
        {Reserve.map((category) => (
          <Link
            href={`/book/${category.slug}`}
            key={category.id}
            className=" h-[400px] w-full rounded-xl overflow-hidden bg-white flex flex-col gap-2 justify-start items-center
            pb-4 shadow-xl hover:bg-gray-50 lg:h-[430px] xl:max-w-[330px] border-2 border-gray-100"
          >
            <div className="relative w-full aspect-square">
              <Image
                src={category.img}
                alt={category.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="w-full flex flex-col h-[80px]">
              <h1 className="text-center text-xl font-bold text-orange-900 px-2">
                {category.title}
              </h1>
              <span className="px-10 text-center text-sm md:text-md">
                {category.desc}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BookPage;