"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

type ItemInCart = {
  title: string;
  img?: string;
  slug: string;
  tags?: string[];
  qtty: number;
  price: number;
};

type Items = ItemInCart[];

// KAPAG NOTE NG CUSTOMER ANG ISA SA MGA TAG, DAPAT MAY QUOTATIONS SIYA GAYA NG SA ITEM NUMBER 2
let addedToCart = [
  {
    id: "adn1",
    title: "A Drink Name",
    img: "/menugroups/drink.webp",
    slug: "drinks",
    tags: ["16oz", "Extra Syrup", "Oat Milk"],
    qtty: 2,
    price: 330,
  },
  {
    id: "afn1",
    title: "A Food Name",
    img: "/menugroups/meal.webp",
    slug: "maincourse",
    tags: ["Mashed Potato", '"Huwag lagyan ng corn."'],
    qtty: 1,
    price: 165,
  },
];

// BOOLEANS
// EMPTY FOODCART?
const isEmpty = false;
// PROMO CODE IS VALID?
const validCode = false;

const CartPage = () => {
  const [selectedOption, setSelectedOption] = useState<string>("table");

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  const [selectedServeTime, setSelectedServeTime] = useState<string>("now");

  const handleServeTimeChange = (value: string) => {
    setSelectedServeTime(value);
  };

  const [selectedPayment, setSelectedPayment] = useState<string>("cash");

  const handlePaymentChange = (value: string) => {
    setSelectedPayment(value);
  };

  // TO OPEN DISCOUNT FORM
  const [discountPromoForm, openDiscountPromoForm] = useState(false);

  // FOR CLOSING OF POP-UP WHEN CLICKED OUTSIDE
  const modalRef = useRef<HTMLDivElement>(null);

  // ERROR POP-UP
  const [showError, setShowError] = useState(false);

  const showErrorPopup = () => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  // CLOSE THE FORM WHEN CLICKED OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        openDiscountPromoForm(false);
      }
    };

    if (discountPromoForm) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [discountPromoForm]);

  return (
    <div
      className={`flex flex-col ${
        isEmpty
          ? "min-h-[calc(100vh-280px)]"
          : "min-h-[calc(100vh-280px)] lg:py-2 xl:min-h-[calc(100vh-56px)]"
      } mt-14 bg-white items-center justify-center`}
    >
      {isEmpty ? (
        //SHOW THIS IF CART IS EMPTY
        <div className="font-bold text-gray-200 flex justify-center items-center h-full space-x-4">
          <i className="fas fa-shopping-cart text-3xl"></i>{" "}
          <span className="text-4xl">Your cart is empty!</span>
        </div>
      ) : (
        // SHOW FOOD CART WHEN CART IS NOT EMPTY
        <div className="w-full flex flex-col px-2 sm:px-10 md:px-24 md:pt-4 lg:flex-row lg:gap-6 xl:px-56">
          {/* ITEMS IN CART CONTAINER */}
          <div className="py-4 flex flex-col gap-2 lg:w-1/2">
            <div className="font-bold text-gray-800 lg:space-x-2 lg:mb-6">
              <i className="fas fa-shopping-cart text-lg lg:text-2xl"></i>{" "}
              <span className="text-xl lg:text-3xl">Order Cart</span>
            </div>
            <div className="w-full flex flex-col gap-2 max-h-[550px] overflow-y-scroll pb-2">
              {addedToCart.map((items) => (
                /* KAPAG PININDOT ANG ITEM, DAPAT MAPUPUNTA DOON
                 SA PAGE NG product/slug/id or product/id IF NABAGO NA, 
                TAPOS DOON PWEDE MA-EDIT KUNG MAY PAPALITAN SILA */

                /* NOTE: KAPAG NAG-ADD TO CART ANG CUSTOMER NG SAME ITEM 
                TAPOS PAREHAS DIN LAHAT NG TAGS, DAPAT MADADAGDAGAN LANG 
                NG QUANTITY, HINDI MAGKAKAROON NG PANIBAGONG ITEM SA CART */

                <Link
                  key={items.id}
                  href={`product/${items.slug}/${items.id}`}
                  className="p-2 shadow-md rounded-md bg-white grid grid-cols-5 border-2 border-gray-50"
                >
                  {/* IMAGE CONTAINER */}
                  <div className="relative w-20 aspect-square rounded-md overflow-hidden">
                    <Image
                      src={items.img}
                      alt={items.title}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* ITEM NAME AND ADDITONALS/OPTIONS CONTAINER*/}
                  <div className="col-span-2 px-4">
                    <h1 className="font-bold text-lg">{items.title}</h1>
                    {/* ADDITIONALS/OPTIONS */}
                    <div>
                      {items.tags.map((tag) => (
                        <p className="text-sm text-gray-600">{tag}</p>
                      ))}
                    </div>
                  </div>

                  {/* QUANTITY */}
                  <div className="h-20 flex items-center">
                    <span className="text-center w-full text-sm font-semibold lg:text-lg">
                      {items.qtty}x
                    </span>
                  </div>

                  {/* PRICE AND EDIT CONTAINER */}
                  <div className="flex flex-col gap-2 justify-between items-end pr-2">
                    {/* PRICE */}
                    <div className="font-bold text-lg">P{items.price}</div>
                    {/* EDIT CONTAINER */}
                    <div className="flex space-x-1 items-center justify-center">
                      <i className="fas fa-edit text-xs text-gray-700"></i>
                      <span className="text-md underline underline-offset-2 text-gray-600">
                        Edit
                      </span>
                    </div>
                    {/* REMOVE CONTAINER */}
                    <button className="flex space-x-1 items-center justify-center px-2 py-2 rounded-md shadow-md bg-red-500 mr-[-8px] mt-2">
                      <i
                        className="fa fa-trash text-white text-xs"
                        aria-hidden="true"
                      ></i>
                      <span className="text-xs text-white">Remove</span>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* COMPUTATIONS CONTAINER */}
          <div className="pt-4 pb-10 flex flex-col gap-2 lg:w-1/2">
            <div className="font-bold text-gray-800 lg:space-x-2 lg:mb-6">
              <i className="fas fa-shopping-cart text-md lg:text-2xl"></i>{" "}
              <span className="text-lg lg:text-3xl">Payment Details</span>
            </div>

            {/* OPTIONS */}
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-500">Dining Options</h1>
              {/* TABLE OR PICKUP */}
              <div className="flex flex-col">
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedOption === "table" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tablePickup"
                    id="table"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedOption === "table"}
                    onChange={() => handleOptionChange("table")}
                  />
                  <span className="ml-4 font-semibold">Table</span>
                </div>
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedOption === "pickup" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tablePickup"
                    id="pickup"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedOption === "pickup"}
                    onChange={() => handleOptionChange("pickup")}
                  />
                  <span className="ml-4 font-semibold">Pickup</span>
                </div>
              </div>
            </div>

            {/* SERVING TIME */}
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-500">Serving Time</h1>
              {/* NOW OR LATER */}
              <div className="flex flex-col">
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedServeTime === "now" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="serveTime"
                    id="now"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedServeTime === "now"}
                    onChange={() => handleServeTimeChange("now")}
                  />
                  <span className="ml-4 font-semibold">Now</span>
                </div>
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedServeTime === "later"
                      ? "bg-orange-50"
                      : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="serveTime"
                    id="later"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedServeTime === "later"}
                    onChange={() => handleServeTimeChange("later")}
                  />
                  <span className="ml-4 font-semibold">Later</span>
                </div>
              </div>
            </div>

            <hr />

            {/* SUBTOTAL AND PROMO DEDUCTION DETAILS */}
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-500">Price Details</h1>
              {/* SUBTOTAL */}
              <div className="flex justify-between items-center px-4">
                <span>Subtotal</span>
                <span className="font-bold text-lg text-gray-600">P495.00</span>
              </div>
              {/* IF MAY PROMO */}
              <div className="flex justify-between items-center px-4">
                <span>Promo</span>
                <span className="font-bold text-lg text-gray-600">-P50.00</span>
              </div>
            </div>

            <button
              onClick={() => openDiscountPromoForm(true)}
              className="shadow-md bg-white border-gray-50 border-2 space-x-2 text-gray-600
              py-2 rounded-lg mt-3 mb-2"
            >
              <span className="font-bold text-lg">% Enter Promo Code</span>
            </button>

            {discountPromoForm && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
                onClick={() => openDiscountPromoForm(false)} // Close modal when clicking on the background
              >
                {/* PROMO CONTAINER */}
                <form
                  className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center border-2 border-gray-50"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
                  ref={modalRef}
                >
                  <h2 className="text-xl font-bold mb-4">% Promo Code</h2>
                  <p className="mb-4">Please enter a valid promo code:</p>
                  <input
                    type="text"
                    className="text-center font-bold text-2xl inline-block w-64 border-2 border-gray-100 rounded-sm mb-4"
                    style={{
                      MozAppearance: "textfield",
                      boxShadow: "inset 0 2px 4px rgba(100, 100, 100, 0.1)",
                    }}
                  />
                  {showError && (
                    <p
                      className={`${
                        validCode ? "text-green-600" : "text-red-500"
                      } mt-[-10px] mb-2 transition-opacity duration-2000 ease-in-out opacity-100`}
                    >
                      {validCode
                        ? "Code successfully entered!"
                        : "Invalid code entered!"}
                    </p>
                  )}
                  <div className="flex justify-center items-center gap-4">
                    <button
                      type="button"
                      className="bg-orange-950 text-white px-4 py-2 rounded-md font-bold shadow-md border-2 border-orange-950"
                      onClick={showErrorPopup}
                    >
                      Enter Code
                    </button>
                    <button
                      className="bg-white  text-gray-500 px-4 py-2 rounded-md shadow-md font-bold border-gray-50 border-solid border-2"
                      onClick={() => openDiscountPromoForm(false)}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            )}

            <hr />

            {/* PAYMENT OPTIONS CONTAINER */}
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-500">Payment Options</h1>
              {/* CASH OR CARD */}
              <div className="flex flex-col">
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedPayment === "cash" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    id="cash"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedPayment === "cash"}
                    onChange={() => handlePaymentChange("cash")}
                  />
                  <span className="ml-4 font-semibold">Cash</span>
                </div>
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedPayment === "card" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    id="card"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedPayment === "card"}
                    onChange={() => handlePaymentChange("card")}
                  />
                  <span className="ml-4 font-semibold">Card</span>
                </div>
              </div>
            </div>

            <hr />

            {/* TOTAL AND CHECKOUT BUTTON */}
            <div>
              {/* TOTAL AMOUNT */}
              <div className="flex justify-between items-center px-4 py-4">
                <span className="font-semibold text-lg">Total (VAT Inc.)</span>
                <span className="font-bold text-xl">P445.00</span>
              </div>
              {/* CHECKOUT BUTTON */}
              <button className="w-full font-bold text-white text-xl bg-orange-950 py-3 rounded-lg shadow-lg">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
