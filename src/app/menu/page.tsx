import React from "react";
import Link from "next/link";
import { menuGroup } from "../data";
import Image from "next/image";

const MenuPage = () => {
  return (
    <div
      className="relative h-auto mt-14 flex flex-col items-center bg-white gap-4 py-4
    overflow-hidden justify-center md:py-10
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      <div className="w-full flex gap-4 items-center px-10 md:px-24 xl:px-56 mt-4">
        <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
        <span className="text-2xl text-center font-bold text-orange-900">
          Menu Categories
        </span>
        <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
      </div>
      <p className="font-light text-xs text-center text-gray-500 mt-[-12px]">
        Click or tap a category to view.
      </p>
      <div
        className="flex flex-col justify-center items-center gap-4 px-10 md:px-24
      sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:px-56 2xl:grid-cols-4 w-full"
      >
        {menuGroup.map((category) => (
          <Link
            href={`/menu/${category.slug}`}
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
              className="w-2/3 flex flex-col pr-5 sm:gap-2 z-10 sm:bg-white sm:pt-2 sm:pb-4 sm:w-full sm:bg-opacity-85
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

export default MenuPage;