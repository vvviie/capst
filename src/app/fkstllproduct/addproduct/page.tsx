"use client";
import AddAllergens from "@/app/components/AddAllergens";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { mainCourseMenu } from "@/app/data";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useState } from "react";

// MENU CATEGORY
export const menuCategory = [
  {
    id: 1,
    prodCat: "drinks",
    title: "Drinks",
  },
  {
    id: 2,
    prodCat: "mainCourseMenu",
    title: "Main Course",
  },
  {
    id: 3,
    prodCat: "snacksMenu",
    title: "Snacks",
  },
  {
    id: 4,
    prodCat: "pastriesMenu",
    title: "Pastries",
  },
  {
    id: 5,
    prodCat: "sandwichMenu",
    title: "Sandwiches",
  },
  {
    id: 6,
    prodCat: "pastaMenu",
    title: "Pasta",
  },
];

// TYPES PER CATEGORY
let drinkTypes = ["Coffee", "None-Coffee"];
let pastaTypes = ["Pesto", "Non-Pesto"];
let snackTypes = ["Fries", "Nachos", "Seafood", "Chicken"];
let sandwichTypes = ["Sandwich"];
let mainCourseTypes = ["Meat", "Seafood", "Veggie"];
let pastryTypes = ["Cake", "Cookie", "Tart"];

// ALLERGENS GALING SA ALLERGIESFILTER
const allergensByCategory: { [key: string]: string[] } = {
  default: ["Peanut", "Fish", "Chicken", "Almond", "Shrimp"],
  pastries: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
  drinks: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
};

// DAPAT NAKA-SMALL LETTERS TAPOS PLURAL
let selectedCat = "drinks";
// KAPAG SINELECT NI USER ANG YES SA UPSIZE
let upsize = true;
// EXAMPLE LANG SA CHOSEN ALLERGENS
let mayroongNapilingAllergen = true;

const AddProductPage = () => {
  //   PARA LANG SA POP-UP KAPAG NAG-ADD PRODUCT BUTTON
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  //   PARA LANG SA POP-UP KAPAG NAG-ADD PRODUCT BUTTON
  const handleSubmit = () => {
    setIsPopupVisible(true);

    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full flex items-center justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[720px] flex flex-col gap-4">
        {/* HEADER CONTAINER */}
        <div className="flex justify-start items-center gap-2">
          {/* LINK BACK TO PRODUCTS */}
          <Link
            href={"/fkstllproduct"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-2xl text-left hover:text-orange-800 cursor-pointer"
          >
            Product List
          </Link>
          <div className="text-2xl font-bold text-orange-950 space-x-2 flex items-center">
            <i className="fa fa-angle-right" aria-hidden="true"></i>
            <span>Add Product</span>
          </div>
        </div>
        {/* FORM CONTAINER */}
        <div
          className="bg-white border-2 border-gray-100 rounded-md shadow-lg px-4 pt-4
        pb-3 flex flex-col gap-2"
        >
          {/* UPLOAD IMAGE */}
          <div className="flex flex-col justify-between items-center gap-3">
            <div className="w-full flex justify-between gap-2 items-center">
              {/* IMAGE CONTAINER */}
              <div className="w-52 aspect-square rounded-md relative border-2 border-gray-100 text-xs">
                <Image
                  src={""}
                  alt="product img"
                  fill
                  className="object-contain"
                />
              </div>
              {/* MENU CATEGORY AND AVAILABILITY */}
              <div className="w-full flex flex-col justify-between items-center">
                {/* MENU CATEGORY */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemPrice"
                  >
                    <span>Menu Category</span>
                  </label>
                  <select
                    name="menuCategory"
                    id="menuCat"
                    className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-9 w-full"
                  >
                    {menuCategory.map((cats) => (
                      <option
                        value={cats.prodCat}
                        key={cats.id}
                        className="text-center"
                      >
                        {cats.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AVAILABILITY */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemPrice"
                  >
                    <span>Availability</span>
                  </label>
                  <select
                    name="menuAvailability"
                    id="menuCatAvailability"
                    className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-9 w-full text-center"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>
            {/* UPLOAD BUTTON AND PRODUCT ID */}
            <div className="w-full flex flex-col gap-1.5 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="prodID"
              >
                <span>Image</span>
              </label>
              <div className="flex w-full justify-between gap-2">
                <input
                  className="border-2 border-solid border-orange-900 w-1/2 h-10 pl-4 rounded-md bg-orange-50"
                  name="prodImg"
                  id="inputProdImg"
                  type="text"
                  placeholder="File Name"
                />
                {/* UPLOAD BUTTON */}
                <button
                  className="h-10 w-1/2 font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md
                hover:bg-gray-50 hover:scale-[1.02] duration-200"
                >
                  Upload
                </button>
              </div>
            </div>
            {/* ID AND CALORIE */}
            <div className="w-full flex justify-between items-center gap-2">
              {/* PRODUCT ID */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="prodID"
                >
                  <span>ID</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="prodID"
                  id="inputProdID"
                  type="text"
                  placeholder="Item ID"
                  required
                />
              </div>
              {/* CALORIE */}
              <div className="flex flex-col gap-1 items-center justify-center flex-1">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="calorieLevel"
                >
                  <span>Calorie Level</span>
                </label>
                <select
                  name="calorieLevel"
                  id="calorieLevel"
                  className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                >
                  <option value="low">Low</option>
                  <option value="med">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {/* MENU ITEM NAME */}
            <div className="w-full flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="menuItemName"
              >
                <span>Name</span>
              </label>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                name="menuItemName"
                id="inputMenuItemName"
                type="text"
                placeholder="Item Name"
                required
              />
            </div>
            {/* PRICE AND CATEGORY */}
            <div className="w-full flex gap-2 items-center justify-between flex-1">
              {/* MENU ITEM PRICE */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="menuItemPrice"
                >
                  <span>Price</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="menuItemPrice"
                  id="inputMenuItemPrice"
                  type="number"
                  placeholder="Price"
                  required
                />
              </div>
              {/* PRODUCT CATEGORY - KAPAG HINDI DRINK, AUTOMATIC NA KUNG ANO ANG MENU CATEGORY NILA*/}
              {selectedCat === "drinks" && (
                //PRODUCT CATEGORY FOR DRINKS
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="catDrinks"
                  >
                    <span>Item Category</span>
                  </label>
                  <select
                    name="catDrinks"
                    id="catDrinks"
                    className="rounded-md shadow-sm border-2 border-gray-100
                text-lg text-gray-600 font-semibold bg-white cursor-pointer
                py-[5px] w-full text-center"
                  >
                    <option value="hotDrinks">Hot Drink</option>
                    <option value="icedDrinks">Iced Drink</option>
                    <option value="blendedDrinks">Blended Drink</option>
                    <option value="affogatoDrinks">Affogato Drink</option>
                  </select>
                </div>
              )}
            </div>

            {selectedCat === "drinks" && (
              <div className="w-full flex gap-2 justify-between items-center">
                {/* CURRENT SIZE */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="currSize"
                  >
                    <span>Size</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                    name="currSize"
                    id="inputCurrSize"
                    type="number"
                    placeholder="Oz"
                    required
                  />
                </div>
                {/* UPSIZE? */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemType"
                  >
                    <span>Upsize?</span>
                  </label>
                  <select
                    name="menuItemType"
                    id="menuItemType"
                    className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                  >
                    <option value={"true"}>Yes</option>
                    <option value={"false"}>No</option>
                  </select>
                </div>
              </div>
            )}
            {upsize && (
              <div className="w-full flex gap-2 justify-between items-center">
                {/* UPSIZE SIZE */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="upSize"
                  >
                    <span>Upsize Size</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                    name="upSize"
                    id="inputUpSize"
                    type="number"
                    placeholder="Oz"
                    required
                  />
                </div>
                {/* UPSIZE PRICE */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemType"
                  >
                    <span>Additional Price</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                    name="upSizePrice"
                    id="inputUpsizePrice"
                    type="number"
                    placeholder="Additional"
                    required
                  />
                </div>
              </div>
            )}
            {/* PRODUCT TYPE AND ALLERGEN */}
            <div className="w-full flex justify-between items-center gap-2">
              {/* PRODUCT TYPE */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="menuItemType"
                >
                  <span>Type</span>
                </label>
                <select
                  name="menuItemType"
                  id="menuItemType"
                  className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full"
                >
                  {(selectedCat === "drinks"
                    ? drinkTypes
                    : selectedCat === "snacks"
                    ? snackTypes
                    : selectedCat === "sandwiches"
                    ? sandwichTypes
                    : selectedCat === "pasta"
                    ? pastaTypes
                    : selectedCat === "pastries"
                    ? pastryTypes
                    : mainCourseTypes
                  ).map((types) => (
                    <option value={types} className="text-center" key={types}>
                      {types}
                    </option>
                  ))}
                </select>
              </div>
              {/* ADD ALLERGEN BUTTON */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="btnAllergen"
                >
                  <span>Allergen</span>
                </label>
                <AddAllergens selectedCat={selectedCat} />
              </div>
            </div>

            {/* DISPLAY CHOSEN ALLERGENS */}
            {mayroongNapilingAllergen && (
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="menuItemDescription"
                >
                  <span>Contains these allergens:</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {/* EXAMPLE LANG */}
                    {allergensByCategory.drinks.map((allergens) => (
                      <span
                        className="rounded-full bg-orange-400 py-1.5 text-center
                      font-semibold text-orange-50"
                      >
                        {allergens}
                      </span>
                    ))}
                  </div>
                </label>
              </div>
            )}

            {/* MENU ITEM DESCRIPTION */}
            <div className="w-full flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="menuItemDescription"
              >
                <span>Description</span>
              </label>
              <textarea
                className="border-2 border-solid border-orange-900 w-full pl-4 rounded-md 
                bg-orange-50 pt-1.5"
                name="menuItemDescription"
                id="inputMenuItemDescription"
                placeholder="Item Description"
                rows={3}
                style={{ resize: "none" }}
                required
              />
            </div>
          </div>
          <button
            className="w-full bg-orange-950 font-bold text-xl text-white p-2 rounded-md mt-2
          shadow-md hover:scale-[1.02] duration-200 hover:bg-orange-900"
            onClick={() => {
              handleSubmit();
            }}
          >
            Create Item
          </button>
          {/* PRODUCT CREATED POP UP */}
          {isPopupVisible && <CheckoutPopup message="Product Created!" />}
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
