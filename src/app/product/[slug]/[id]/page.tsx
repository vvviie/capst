"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DrinksOptions from "@/app/components/DrinksOptions";
import MainCourseOptions from "@/app/components/MainCourseOptions";

const ProductPage: React.FC = () => {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const slug =
    parts.length > 1 ? parts.splice(parts.length - 2, 1)[0] : undefined; // REPLACE THIS WITH SLUG FROM THE PRODUCT RECORD IN THE DATABASE!

  // PAKI-REPLACE WITH BOOLEAN FROM PRODUCT RECORD FROM DATABASE KASI MAY MGA DRINKS NA ISA LANG ANG SIZE
  let drinkSizeAvailable = true;

  // PAKI-REPLACE WITH BOOLEAN FROM PRODUCT RECORD FROM DATABASE KUNG AVAILABLE BA ANG PRODUCT OR NOT
  let productAvailable = true;

  // PAKI-REPLACE WITH CALORIE CONTENT FROM PRODUCT RECORD FROM DATABASE
  let calorieContent = "low";

  // Initialize selectedDrinkSize to "12oz"
  const [selectedDrinkSize, setSelectedDrinkSize] = useState<string>("12oz");

  const handleDrinkSizeChange = (value: string) => {
    setSelectedDrinkSize(value);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] mt-14 flex md:px-24 xl:px-56 xl:bg-orange-50 xl:flex xl:items-center xl:justify-center">
      {/* WHOLE CONTAINER */}
      <div
        className=" flex flex-col gap-4 pb-6 md:pb-10 xl:flex-row w-full 
      xl:bg-white xl:shadow-xl xl:max-w-[1080px] xl:max-h-[860px] xl:py-0 xl:my-10 xl:rounded-lg
      xl:overflow-hidden"
      >
        {/* IMAGE AND BACK BUTTON CONTAINER */}
        <div className="relative w-full aspect-video xl:w-3/5 xl:aspect-auto">
          <Image
            src={"/cwfood.jpg"}
            alt={""}
            fill
            className="object-cover xl:object-cover w-3/5"
          />
          <Link
            href={`/menu/${slug}`}
            className="rounded-full bg-orange-950 text-white font-bold absolute top-4 left-4 w-8 h-8 text-center shadow-lg pt-1"
          >
            X
          </Link>

          {/* CONTAINER NG CALORIE CONTENT AND AVAILABILITY */}
          <div className="flex top-4 left-16 absolute gap-4">
            {/* AVAILABILITY */}
            <div
              className={`flex ${
                productAvailable ? "w-28" : "w-32"
              } gap-2 items-center shadow-lg py-1 px-2 bg-white relative rounded-full`}
            >
              <Image
                src={`${
                  productAvailable
                    ? "/availability/available.webp"
                    : "/availability/unavailable.webp"
                }`}
                alt=""
                width={22}
                height={22}
                className="object-contain"
              />
              <span
                className="font-bold relative text-sm"
                style={{
                  color: `${productAvailable ? "#47bd24" : "#575757"}`,
                }}
              >
                {productAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
            {/* CALORIE CONTENT */}
            <div
              className={`flex ${
                calorieContent === "low"
                  ? "w-32 gap-2"
                  : calorieContent === "med"
                  ? "w-40 gap-2"
                  : "w-36 gap-3"
              } items-center shadow-lg py-1 px-2 bg-white relative rounded-full`}
            >
              <Image
                src={`${
                  calorieContent === "low"
                    ? "/calorie/lowcal.webp"
                    : calorieContent === "med"
                    ? "/calorie/medcal.webp"
                    : "/calorie/highcal.webp"
                }`}
                alt=""
                width={22}
                height={22}
                className="object-contain"
              />
              <span
                className="font-bold relative  text-sm"
                style={{
                  color: `${
                    calorieContent === "low"
                      ? "#bdb724"
                      : calorieContent === "med"
                      ? "#bd6d24"
                      : "#bd2424"
                  }`,
                }}
              >
                {calorieContent === "low"
                  ? "Low Calorie"
                  : calorieContent === "med"
                  ? "Medium Calorie"
                  : "High Calorie"}
              </span>
            </div>
          </div>
        </div>

        {/* TITLE, PRICE, AND OPTIONS */}
        <div className="px-10 md:px-24 xl:px-5 xl:py-10 xl:w-2/5">
          {/* TITLE, PRICE, AND DESCRIPTION */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              {/* NAME OF THE MENU ITEM */}
              <span className="text-2xl font-bold text-left text-orange-900 w-4/6">
                {/* REPLACE THIS WITH TITLE OF THE PRODUCT FROM THE RECORD */}
                Fika Signature Drink
              </span>
              {/* PRICE DIV */}
              <div className="flex flex-col gap-1 w-2/6">
                <span className="text-2xl font-bold text-right text-orange-900">
                  {/* REPLACE THIS WITH PRICE FROM PRODUCT RECORD */}
                  P90
                </span>
                <span className="text-sm font-medium text-right w-full">
                  Base price
                </span>
              </div>
            </div>
            {/* DESCRIPTION OF THE ITEM */}
            <p
              className={`text-justify mb-2 ${
                slug === "maincourse" ? "" : "xl:h-14 xl:overflow-y-scroll"
              }`}
            >
              {/* REPLACE THIS WITH DESCRIPTION FROM PRODUCT RECORD (ex. {product.desc}) */}
              Item description that says the description of the menu item that
              is selected by the user. Item description that says the
              description of the menu item that is selected by the user.
            </p>
          </div>
          {/* OPTIONS */}
          <div className="">
            {slug === "drinks" && (
              <div className="flex flex-col gap-2">
                <hr />
                {/* DRINK SIZE CONTAINER */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-gray-500">Drink size</h1>
                  {/* DRINK SIZE CHOICES */}
                  <div className="flex flex-col">
                    <div
                      className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                        selectedDrinkSize === "12oz"
                          ? "bg-orange-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="drinkSize"
                        id="12oz"
                        className="w-5 h-5"
                        checked={selectedDrinkSize === "12oz"}
                        onChange={() => handleDrinkSizeChange("12oz")}
                      />
                      <span className="ml-4 font-semibold">12oz</span>
                      <span className="ml-2"> (+0)</span>
                    </div>

                    <div
                      className={`${
                        !drinkSizeAvailable && "hidden"
                      } flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                        selectedDrinkSize === "16oz"
                          ? "bg-orange-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="drinkSize"
                        id="16oz"
                        className="w-5 h-5"
                        checked={selectedDrinkSize === "16oz"}
                        onChange={() => handleDrinkSizeChange("16oz")}
                      />
                      <span className="ml-4 font-semibold">16oz</span>
                      <span className="ml-2"> (+20)</span>
                    </div>
                  </div>
                </div>
                {/* REFER TO /components/DrinksOptions.tsx PARA DITO */}
                <DrinksOptions />
                <hr />
              </div>
            )}
            {slug === "maincourse" && (
              <div className="flex flex-col gap-2">
                {/* REFER TO /components/MainCourseOptions.tsx PARA DITO */}
                <MainCourseOptions />
              </div>
            )}
            <div className="flex flex-col gap-2 my-2">
              <span className="text-gray-500">Note</span>
              <textarea
                name=""
                id=""
                cols={30}
                rows={3}
                className="bg-gray-50 w-full pl-2"
                placeholder="Any requests for this order?"
              ></textarea>
            </div>
            {/* KAPAG PININDOT DAPAT MA-REDIRECT SA MENU CATEGORY NA ACCORDING SA SLUG */}
            <button className="w-full bg-orange-950 text-white py-4 mt-6 font-bold text-xl space-x-4 rounded-lg cursor-pointer shadow-md xl:mt-2">
              <i className="fa-solid fa-cart-shopping"></i>
              <span>Update Cart (+P90)</span>{" "}
              {/*PAKI-LAGAY DITO ANG TOTAL PRICE*/}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
