"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DrinksOptions from "@/app/components/DrinksOptions";
import MainCourseOptions from "@/app/components/MainCourseOptions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase"; // Import Firestore instance

const ProductPage: React.FC = () => {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const productId = parts.length > 1 ? parts[parts.length - 1] : undefined; // Extract the product ID from the URL
  const [productData, setProductData] = useState<any>(null);
  const [selectedDrinkSize, setSelectedDrinkSize] = useState<string>("12oz");

  useEffect(() => {
    const fetchProductData = async () => {
      if (productId) {
        try {
          const productRef = doc(db, "drinks", productId);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            setProductData(productSnap.data());
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };

    fetchProductData();
  }, [productId]);

  if (!productData) {
    return <div>Loading...</div>;
  }

  // Replace placeholders with fetched data
  let drinkSizeAvailable = productData.addEspresso && productData.addSyrup;
  let productAvailable = productData.availability === "available";
  let calorieContent = productData.calorie;

  const handleDrinkSizeChange = (value: string) => {
    setSelectedDrinkSize(value);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] mt-14 flex md:px-24 xl:px-56 xl:bg-orange-50 xl:flex xl:items-center xl:justify-center">
      <div className="flex flex-col gap-4 pb-6 md:pb-10 xl:flex-row w-full xl:bg-white xl:shadow-xl xl:max-w-[1080px] xl:max-h-[860px] xl:py-0 xl:my-10 xl:rounded-lg xl:overflow-hidden">
        <div className="relative w-full aspect-video xl:w-3/5 xl:aspect-auto">
          <Image
            src={productData.img}
            alt={productData.title}
            fill
            className="object-cover xl:object-cover w-3/5"
          />
          <Link
            href={`/menu/${productData.prodCategory}`}
            className="rounded-full bg-orange-950 text-white font-bold absolute top-4 left-4 w-8 h-8 text-center shadow-lg pt-1"
          >
            X
          </Link>

          <div className="flex top-4 left-16 absolute gap-4">
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

        <div className="px-10 md:px-24 xl:px-5 xl:py-10 xl:w-2/5">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <span className="text-2xl font-bold text-left text-orange-900 w-4/6">
                {productData.title}
              </span>
              <div className="flex flex-col gap-1 w-2/6">
                <span className="text-2xl font-bold text-right text-orange-900">
                  P{productData.price}
                </span>
                <span className="text-sm font-medium text-right w-full">
                  Base price
                </span>
              </div>
            </div>
            <p
              className={`text-justify mb-2 ${
                productData.prodCategory === "maincourse" ? "" : "xl:h-14 xl:overflow-y-scroll"
              }`}
            >
              {productData.desc}
            </p>
          </div>

          <div className="">
            {productData.prodCategory === "drinks" && (
              <div className="flex flex-col gap-2">
                <hr />
                <div className="flex flex-col gap-2">
                  <h1 className="text-gray-500">Drink size</h1>
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
                <DrinksOptions />
                <hr />
              </div>
            )}
            {productData.prodCategory === "maincourse" && (
              <div className="flex flex-col gap-2">
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
            <button className="w-full bg-orange-950 text-white py-4 mt-6 font-bold text-xl space-x-4 rounded-lg cursor-pointer shadow-md xl:mt-2">
              <i className="fa-solid fa-cart-shopping"></i>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
