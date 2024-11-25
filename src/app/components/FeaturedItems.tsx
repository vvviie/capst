"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styled, { keyframes } from "styled-components";

interface Item {
  id: string;
  title: string;
  desc: string;
  img: string;
  price: number;
  fromDB: string;
}

// Fade-in animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Styled component for fade animation
const FadeAnimationDiv = styled.div`
  animation: ${fadeIn} 1s ease-in-out;
`;

const FeaturedItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "featuredItems"),
      (snapshot) => {
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[];
        setItems(itemsData);
      },
      (error) => {
        console.error("Error fetching featured items:", error);
      }
    );

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (items.length <= 3) return; // Only cycle if more than 3 items are available

    const cycleItems = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 3) % items.length);
    }, 5000);

    return () => clearInterval(cycleItems); // Clean up interval on unmount
  }, [items]);

  // Calculate items to display based on currentIndex
  const displayedItems =
    items.length <= 3
      ? items
      : [
          items[currentIndex % items.length],
          items[(currentIndex + 1) % items.length],
          items[(currentIndex + 2) % items.length],
        ];

  return (
    <div
      className="relative w-full flex flex-col items-center justify-between py-6 bg-white gap-2 px-10 lg:min-h-[60vh]
      lg:justify-center lg:items-center lg:gap-0 xl:gap-4"
    >
      <div className="w-full flex gap-4 items-center px-10 mt-4">
        <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
        <span className="text-2xl text-center font-bold text-orange-900">
          Featured Items
        </span>
        <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
      </div>

      {/* ITEMS CONTAINER with Fade Animation */}
      <FadeAnimationDiv
        className="w-full flex flex-col items-center justify-between py-10
        xl:flex-row xl:justify-center xl:rounded-2xl gap-4 max-w-[1400px]"
      >
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-1 w-full h-auto bg-white justify-between items-center shadow-xl py-4 min-h-[280px]
            rounded-lg overflow-hidden max-w-[600px] border-2 border-gray-100 px-4"
          >
            <div
              className="flex sm:flex-row sm:items-start flex-col sm:w-full sm:justify-between
            items-center"
            >
              {/* IMAGE CONTAINER */}
              <div className="relative w-44 lg:w-48 aspect-square top-0">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center items-center gap-1 md:gap-0 mt-2 px-4 sm:w-2/3">
                <h1 className="font-bold text-orange-900 md:text-lg lg:text-xl text-center">
                  {item.title}
                </h1>
                <p
                  className="font-bold text-xs text-white bg-orange-300 text-center px-3 py-1
                rounded-full"
                >
                  PHP {item.price.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 text-justify pt-2 xl:text-xs">
                  {item.desc}
                </p>
              </div>
            </div>
            <Link
              href={`/product/${item.fromDB.toLowerCase()}/${item.id}?p=${
                item.price
              }`}
              className="block bg-orange-950 w-2/3 mb-1 h-10 text-white rounded-md hover:bg-orange-900
                lg:hover:scale-[1.01] duration-200 font-bold shadow-md text-center pt-2 mt-2"
            >
              Order Now
            </Link>
          </div>
        ))}
      </FadeAnimationDiv>
      <div className="w-full flex gap-4 items-center px-10 mt-4">
        <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>

        <i
          className="fa fa-leaf text-lg text-center font-bold text-orange-900 scale-x-[-1]"
          aria-hidden="true"
        ></i>
        <i
          className="fa fa-coffee text-lg text-center font-bold text-orange-900 mx-[-10px]"
          aria-hidden="true"
        ></i>
        <i
          className="fa fa-leaf text-lg text-center font-bold text-orange-900"
          aria-hidden="true"
        ></i>
        <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
      </div>
    </div>
  );
};

export default FeaturedItems;