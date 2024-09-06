"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DrinksOptions from "@/app/components/DrinksOptions";
import MainCourseOptions from "@/app/components/MainCourseOptions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

const ProductPage: React.FC = () => {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const slug = parts.length > 1 ? parts[parts.length - 2] : undefined;
  const productId = parts.length > 1 ? parts[parts.length - 1] : undefined;
  const [productData, setProductData] = useState<any>(null);

  const [selectedDrinkSize, setSelectedDrinkSize] = useState<string>("12oz");
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [upsizePrice, setUpsizePrice] = useState<number>(0);

  // Automatically uses the following data from the database through the slug
  useEffect(() => {
    const fetchProductData = async () => {
      if (productId && slug) {
        try { 

          // if the slug is that certain category, then it would be the collection that would be retrieved from the database.
          const collection = 
          slug === "drinks" ? "drinks" :
          slug.toLowerCase() === "maincourse" ? "mainCourse" :
          slug === "pasta" ? "pasta" :
          slug === "pastries" ? "pastries" :
          slug === "sandwiches" ? "sandwiches" :
          slug === "snacks" ? "snacks" : null;
        
          // Fetch from different collections based on the slug (category)

          //debug
          console.log("SLUG: " + slug);
          console.log("Product Data:", productData);
          console.log("Product ID:", productId);
          console.log("Pathname:", pathname);
          console.log("Collection:", collection);

          if (!collection || !productId) {
            console.error("Invalid collection or product ID");
            return;
          }

          const productRef = doc(db, collection, productId);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const data = productSnap.data();
            setProductData(data);
            setSelectedDrinkSize(data.currSize || "12oz"); // Set default size if it exists
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };

    fetchProductData();
  }, [productId, slug]);

  if (!productData) {
    return <div>Loading...</div>;
  }

  const {
    img,
    title,
    price,
    desc,
    availability,
    calorie,
    prodCategory,
    addEspresso = 0,
    addSyrup = 0,
    milkAlmond = 0,
    milkOat = 0,
    addVanilla = 0,
  } = productData;
  


  let productAvailable = availability === "available";
  let calorieContent = calorie;

  const handleDrinkSizeChange = (size: string) => {
    setSelectedDrinkSize(size);

    if (size === productData.upsizeSize) {
      setUpsizePrice(productData.upsizePrice); // Correctly set the upsize price
    } else {
      setUpsizePrice(0); // Reset if the default size is selected
    }
  };

  const handleAdditionalCostChange = (cost: number) => {
    setAdditionalCost(cost);
  };

   // Compute the total price including additional costs
  const totalPrice = price + upsizePrice + additionalCost;

  return (
    <div className="min-h-[calc(100vh-56px)] mt-14 flex md:px-24 xl:px-56 xl:bg-orange-50 xl:flex xl:items-center xl:justify-center">
      {/* WHOLE CONTAINER */}
      <div className="flex flex-col gap-4 pb-6 md:pb-10 xl:flex-row w-full xl:bg-white xl:shadow-xl xl:max-w-[1080px] xl:max-h-[860px] xl:py-0 xl:my-10 xl:rounded-lg xl:overflow-hidden">
        {/* IMAGE AND BACK BUTTON CONTAINER */}
        <div className="relative w-full aspect-video xl:w-3/5 xl:aspect-auto">
          <Image
            src={img}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="object-cover xl:object-cover w-3/5"
          />
          <Link
            href={`/menu/${slug}`}
            className="rounded-full bg-orange-950 text-white font-bold absolute top-4 left-4 w-8 h-8 text-center shadow-lg pt-1"
          >
            X
          </Link>

          {/* CONTAINER FOR CALORIE CONTENT AND AVAILABILITY */}
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
                className="font-bold relative text-sm"
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
        <div className="px-10 md:px-24 xl:px-5 xl:py-10 xl:w-2/5 xl:min-h-[770px] xl:max-h-[450px]">
          {/* TITLE, PRICE, AND DESCRIPTION */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              {/* NAME OF THE MENU ITEM */}
              <span className="text-2xl font-bold text-left text-orange-900 w-4/6">
                {title}
              </span>
              {/* PRICE DIV */}
              <div className="flex flex-col gap-1 w-2/6">
                <span className="text-2xl font-bold text-right text-orange-900">
                  P{price}
                </span>
                <span className="text-sm font-medium text-right w-full">
                  Base price
                </span>
              </div>
            </div>
            {/* DESCRIPTION OF THE ITEM */}
            <p className="text-justify mb-2 xl:h-14 xl:overflow-y-scroll">
            {desc}
            </p>
          </div>
          {/* OPTIONS */}
          <div>
            {slug === "drinks" && (
              <div className="flex flex-col gap-2">
                <hr />
                {/* DRINK SIZE CONTAINER */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-gray-500">Drink size</h1>
                  {/* DRINK SIZE CHOICES */}
                  <div className="flex flex-col">
                    {/* Always render the default size */}
                    <div
                      className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                        selectedDrinkSize === productData.currSize ? "bg-orange-50" : "bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="drinkSize"
                        id={productData.currSize}
                        className="w-5 h-5"
                        checked={selectedDrinkSize === productData.currSize}
                        onChange={() => handleDrinkSizeChange(productData.currSize)}
                      />
                      <span className="ml-4 font-semibold">{productData.currSize}</span>
                      <span className="ml-2"> (+0)</span>
                    </div>

                    {/* Conditionally render upsizable option */}
                    {productData.upsizable && (
                      <div
                        className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                          selectedDrinkSize === productData.upsizeSize ? "bg-orange-50" : "bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="drinkSize"
                          id={productData.upsizeSize}
                          className="w-5 h-5"
                          checked={selectedDrinkSize === productData.upsizeSize}
                          onChange={() => handleDrinkSizeChange(productData.upsizeSize)}
                        />
                        <span className="ml-4 font-semibold">{productData.upsizeSize}</span>
                        <span className="ml-2"> (+{productData.upsizePrice})</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* DrinksOptions component with props */}
                <DrinksOptions
                  addEspresso={addEspresso}
                  addSyrup={addSyrup}
                  milkAlmond={milkAlmond}
                  milkOat={milkOat}
                  addVanilla={addVanilla}
                  onAdditionalCostChange={handleAdditionalCostChange}
                />
              </div>
            )}

            {slug === "maincourse" && (
              <div className="flex flex-col gap-2">
                <hr />
                <MainCourseOptions />
              </div>
            )}

            
          {slug === "pasta" && (
              <div className="flex flex-col gap-2">
                <hr />
                {/* Add Pasta-specific options component */}
                <div>Render pasta-specific options here</div>
              </div>
            )}
          </div>
          {/* NOTE AND BUTTON */}
          <div className="flex flex-col gap-2 my-2">
            <span className="text-gray-500">Note</span>
            <textarea
              name=""
              id=""
              cols={30}
              rows={3}
              style={{resize: "none"}}
              className="bg-gray-50 w-full pl-2"
              placeholder="Any requests for this order?"
            ></textarea>
          </div>
          {/* KAPAG PININDOT DAPAT MA-REDIRECT SA MENU CATEGORY NA ACCORDING SA SLUG */}
          <button className="w-full bg-orange-950 text-white py-4 mt-6 font-bold text-xl space-x-4 rounded-lg cursor-pointer shadow-md xl:mt-2">
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Update Cart (+P{totalPrice.toFixed(2)})</span>
            {/*PAKI-LAGAY DITO ANG TOTAL PRICE*/}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
