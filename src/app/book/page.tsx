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
    const userCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("user="));

    // If no user cookie is found, show the login modal
    if (!userCookie) {
      setShowLoginModal(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLoginModal(false); // Close the modal if clicked outside
      }
    };

    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLoginModal]);

  return (
    <div
      className="relative h-auto mt-14 flex flex-col items-center bg-white gap-4 py-4
    overflow-hidden justify-center md:py-10 px-10
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center sm:min-h-[69.175vh]
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
            <p className="mb-4">
              Please sign in to book your reservations with us.
            </p>
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

      <div
        className="w-full flex flex-col-reverse items-start gap-1
      xl:max-w-[990px]"
      >
        <div className="w-full flex gap-4 items-center">
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          <span className="text-2xl text-center font-bold text-orange-900">
            Book
          </span>
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
        </div>
        <Link
          href={"book/reservations"}
          className="bg-white border-gray-100 border-2 rounded-md shadow-sm text-gray-600 font-bold
          h-10 w-48 text-center pt-1.5"
        >
          My Reservations
        </Link>
      </div>
      <p className="font-light text-xs text-center text-gray-500 mt-[-12px]">
        Click or tap a category to view.
      </p>
      <div className="max-w-[990px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Reserve.map((category) => (
          <Link
            href={`/book/${category.slug}`}
            key={category.id}
            className="sm:relative h-auto w-full rounded-md overflow-hidden bg-white flex sm:flex-col gap-2 sm:justify-end sm:items-center
            shadow-xl hover:bg-gray-50 xl:max-w-[330px] border-2 border-gray-100 justify-center items-center sm:aspect-square"
          >
            <div className="relative sm:absolute sm:top-0 sm:left-0 w-1/3 sm:w-full aspect-square">
              <Image
                src={category.img}
                alt={category.title}
                fill
                className="object-cover"
              />
            </div>
            <div
              className="w-2/3 flex flex-col px-5 sm:gap-2 z-10 sm:bg-white sm:pt-2 sm:pb-4 sm:w-full sm:bg-opacity-85
            sm:px-10 lg:px-5"
            >
              <h1
                className="text-left text-xl font-bold text-orange-900 sm:text-center opacity-100
              sm:text-orange-950"
              >
                {category.title}
              </h1>
              <span
                className="text-justify text-xs text-gray-500 sm:text-center opacity-100
              sm:text-gray-900 sm:font-semibold"
              >
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
