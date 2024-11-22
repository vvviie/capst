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
      className="relative w-full flex flex-col items-center justify-between py-6 bg-orange-50 gap-2 px-10 md:px-24 lg:min-h-[calc(100vh-56px)]
      lg:justify-center lg:items-center lg:gap-0 xl:px-56 xl:gap-4 lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      <h1 className="text-center text-2xl md:text-3xl lg:text-4xl font-bold text-orange-950 z-40">
        Featured Items
      </h1>

      {/* ITEMS CONTAINER with Fade Animation */}
      <FadeAnimationDiv
        className="w-full flex flex-col items-center justify-between gap-2
        md:flex-row lg:justify-center lg:rounded-2xl xl:gap-4 max-w-[1400px]"
      >
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-1 w-full h-auto bg-white justify-between items-center shadow-xl py-4
            border-none rounded-lg overflow-hidden max-w-[400px] md:max-w-none"
          >
            {/* IMAGE CONTAINER */}
            <div className="relative w-full aspect-square top-0">
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            {/* TEXT AND BUTTON */}
            <div className="h-1/3 flex flex-col gap-2 justify-between items-center w-full px-4">
              <div className="flex flex-col justify-center items-center gap-1 md:h-[70px] md:gap-0 mt-2">
                <h1 className="font-bold text-orange-950 md:text-lg lg:text-xl xl:text-2xl text-center">
                  {item.title}
                </h1>
                <p className="font-bold text-sm lg:text-lg text-gray-700 text-center">
                  PHP {item.price}
                </p>
              </div>
              <Link
                href={`/product/${item.fromDB.toLowerCase()}/${item.id}?p=${
                  item.price
                }`}
                className="block bg-orange-950 w-full mb-1 h-10 text-white rounded-md hover:bg-orange-900
                lg:hover:scale-[1.01] duration-200 font-bold shadow-md text-center pt-2"
              >
                Order Now
              </Link>
            </div>
          </div>
        ))}
      </FadeAnimationDiv>
    </div>
  );
};

export default FeaturedItems;
