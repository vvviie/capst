"use client";

import { useEffect, useState, useRef } from "react";
import {
  getDocs,
  query,
  where,
  collection,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"; // Import Firestore functions
import { db } from "@/app/firebase";
import Image from "next/image";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth

const CartPage = () => {
  //#region Use State Variables
  const [addedToCart, setAddedToCart] = useState<any[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("table");
  const [selectedServeTime, setSelectedServeTime] = useState<string>("now");
  const [selectedPayment, setSelectedPayment] = useState<string>("cash");
  const [discountPromoForm, openDiscountPromoForm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showError, setShowError] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false); // Track if promo is applied
  const [totalCartPrice, setTotalCartPrice] = useState(0); // Track total price
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discountedPromo,  setDiscountedPromo] = useState(0);

  //#endregion

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  const handleServeTimeChange = (value: string) => {
    setSelectedServeTime(value);
  };

  const handlePaymentChange = (value: string) => {
    setSelectedPayment(value);
  };

  const showErrorPopup = () => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const handlePromoCodeSubmit = async () => {
    if (!userEmail) {
      showErrorPopup("Please log in to apply a promo code.");
      return;
    }

    if (promoApplied) {
      showErrorPopup("A promo code has already been applied. You cannot apply another one.");
      return;
    }

    const promoCode = document.querySelector<HTMLInputElement>('input[type="text"]')?.value.trim();
    if (!promoCode) {
      showErrorPopup("Please enter a promo code.");
      return;
    }

    console.log("Entered promo code:", promoCode);

    try {
      const promoCodesRef = collection(db, "promoCodes");
      const promoQuery = query(promoCodesRef, where("promoCode", "==", promoCode));
      const promoSnapshot = await getDocs(promoQuery);

      if (!promoSnapshot.empty) {
        const promoDoc = promoSnapshot.docs[0];
        const promoDocRef = doc(db, "promoCodes", promoDoc.id);
        const promoData = promoDoc.data();
        const discountPercent = promoData?.discountPercent || 0;
        const available = promoData?.available || false;

        if (available) {
          const discountFraction = discountPercent; // Adjusted to use decimal value directly
          const newTotalCartPrice = subtotal * (1 - discountFraction);
          const discountedPromo = subtotal - subtotal * (1 - discountFraction);
          setTotalCartPrice(newTotalCartPrice);
          setDiscountedPromo(discountedPromo);

          setPromoApplied(true);

          await updateDoc(promoDocRef, {
            timesUsed: (promoData?.timesUsed || 0) + 1,
          });

          showErrorPopup("Promo code successfully redeemed!");
        } else {
          setPromoApplied(false);
          showErrorPopup("Promo code is no longer available!");
        }
      } else {
        setPromoApplied(false);
        showErrorPopup("Promo code is invalid!");
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoApplied(false);
      showErrorPopup("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    console.log("Promo applied:", promoApplied);
  }, [promoApplied]);

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

  useEffect(() => {
    // Listen to authentication state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const loggedIn = !!authUser && authUser.emailVerified;
      setIsLoggedIn(loggedIn);
      setUserEmail(authUser?.email || null); // Sets user email
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userEmail) {
        setShowLoginModal(true); // Show login modal if user is not logged in
        return;
      }

      try {
        const tempOrdersRef = collection(db, "tempOrders");
        const querySnapshot = await getDocs(
          query(tempOrdersRef, where("user", "==", userEmail))
        );

        let cartItems: any[] = [];
        let totalCartPrice = 0; // Initialize total price
        let subtotal = 0; // Initialize subtotal

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          Object.keys(data).forEach((key) => {
            if (
              key !== "user" &&
              key !== "totalItems" &&
              key !== "totalCartPrice"
            ) {
              const itemData = data[key];
              const slug = itemData.slug;

              let tags = [];
              if (slug === "drinks") {
                tags = [
                  itemData.selectedDrinkSize,
                  ...(itemData.additionals || []),
                  itemData.milkOption || "Fresh Milk",
                  itemData.note && `"${itemData.note}"`,
                ].filter(Boolean);
              } else if (slug === "maincourse") {
                tags = [
                  itemData.mainCourseOption || "Rice",
                  itemData.note && `"${itemData.note}"`,
                ].filter(Boolean);
              } else if (slug === "pasta") {
                tags = [itemData.note && `"${itemData.note}"`].filter(Boolean);
              } else if (slug === "snacks") {
                tags = [itemData.note && `"${itemData.note}"`].filter(Boolean);
              } else if (slug === "sandwiches") {
                tags = [itemData.note && `"${itemData.note}"`].filter(Boolean);
              }

              cartItems.push({
                id: key,
                title: itemData.productTitle,
                img: itemData.productImg,
                slug: slug,
                tags: tags,
                qtty: itemData.itemQty,
                price: itemData.totalPrice,
              });

              subtotal += itemData.totalPrice; // Update subtotal
            }
          });
          totalCartPrice = data.totalCartPrice; // Get the total price
        });

        setTotalCartPrice(totalCartPrice); // Set total price
        setSubtotal(subtotal); // Set subtotal

        if (cartItems.length > 0) {
          setAddedToCart(cartItems);
          setIsEmpty(false);
        } else {
          setIsEmpty(true);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [userEmail]);

  return (
    <div
      className={`flex flex-col ${
        isEmpty
          ? "min-h-[calc(100vh-280px)]"
          : "min-h-[calc(100vh-280px)] lg:py-2 xl:min-h-[calc(100vh-56px)]"
      } mt-14 bg-white items-center justify-center`}
    >
      {!isLoggedIn && showLoginModal && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <p className="mb-4">Please log in to view your cart.</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => setShowLoginModal(false)} // Hide modal for now
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isEmpty && isLoggedIn ? (
        <div className="font-bold text-gray-200 flex justify-center items-center h-full space-x-4">
          <i className="fas fa-shopping-cart text-3xl"></i>
          <span className="text-4xl">Your cart is empty!</span>
        </div>
      ) : (
        <div className="w-full flex flex-col px-2 sm:px-10 md:px-24 md:pt-4 lg:flex-row lg:gap-6 xl:px-56">
          {/* ITEMS IN CART CONTAINER */}
          <div className="py-4 flex flex-col gap-2 lg:w-1/2">
            <div className="font-bold text-gray-800 lg:space-x-2 lg:mb-6">
              <i className="fas fa-shopping-cart text-lg lg:text-2xl"></i>{" "}
              <span className="text-xl lg:text-3xl">Order Cart</span>
            </div>
            <div className="w-full flex flex-col gap-2 max-h-[550px] overflow-y-scroll pb-2">
              {addedToCart.map((items) => (
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

                  {/* ITEM NAME AND ADDITONALS/OPTIONS CONTAINER */}
                  <div className="col-span-2 px-4">
                    <h1 className="font-bold text-lg">{items.title}</h1>
                    <div>
                      {items.tags.map((tag, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {tag}
                        </p>
                      ))}
                      {items.notes && (
                        <p className="text-sm text-gray-500 italic">
                          Notes: {items.notes}
                        </p>
                      )}
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
                    <div className="font-bold text-lg">
                      P{items.price.toFixed(2)}
                    </div>
                    <div className="flex space-x-1 items-center justify-center">
                      <i className="fas fa-edit text-xs text-gray-700"></i>
                      <span className="text-md underline underline-offset-2 text-gray-600">
                        Edit
                      </span>
                    </div>
                    <button className="flex space-x-1 items-center justify-center px-2 py-2 rounded-md shadow-md bg-red-500 mr-[-8px] mt-2">
                      <i className="fa fa-trash text-white text-xs"></i>
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
                <span className="font-bold text-lg text-gray-600">
                  P{subtotal.toFixed(2)}
                </span>
              </div>
              {/* ONLY SHOW PROMO IF APPLIED */}
              {promoApplied && (
                <div className="flex justify-between items-center px-4">
                  <span>Promo</span>
                  <span className="font-bold text-lg text-gray-600">
                    -P{discountedPromo.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* PROMO CODE BUTTON */}
            <button
              onClick={() => openDiscountPromoForm(true)}
              className="shadow-md bg-white border-gray-50 border-2 space-x-2 text-gray-600
                py-2 rounded-lg mt-3 mb-2"
            >
              <span className="font-bold text-lg">% Enter Promo Code</span>
            </button>

            {/* PROMO CODE FORM */}
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
<<<<<<< HEAD
                        validCode ? "text-green-600" : "text-red-500"
                      } mt-[-10px] mb-2 transition-opacity duration-2000 ease-in-out opacity-100`}
                    >
                      {validCode
                        ? "Code successfully entered!"
                        : "Invalid code entered!"}
=======
                        promoApplied ? "text-green-600" : "text-red-500"
                      } mt-[-10px] mb-2 transition-opacity duration-2000 ease-in-out opacity-100`}
                    >
                      {promoApplied
                        ? "Promo code successfully redeemed!"
                        : "Promo code is invalid!"}
>>>>>>> 493e64e8095ccb7ef3d8effaca90b84bdbf4bf73
                    </p>
                  )}
                  <div className="flex justify-center items-center gap-4">
                    <button
                      type="button"
                      className="bg-orange-950 text-white px-4 py-2 rounded-md font-bold shadow-md border-2 border-orange-950"
<<<<<<< HEAD
                      onClick={showErrorPopup}
=======
                      onClick={handlePromoCodeSubmit}
>>>>>>> 493e64e8095ccb7ef3d8effaca90b84bdbf4bf73
                    >
                      Enter Code
                    </button>
                    <button
<<<<<<< HEAD
                      className="bg-white  text-gray-500 px-4 py-2 rounded-md shadow-md font-bold border-gray-50 border-solid border-2"
=======
                      className="bg-white text-gray-500 px-4 py-2 rounded-md shadow-md font-bold border-gray-50 border-solid border-2"
>>>>>>> 493e64e8095ccb7ef3d8effaca90b84bdbf4bf73
                      onClick={() => openDiscountPromoForm(false)}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                <span className="font-bold text-lg text-gray-800 lg:text-2xl">
                  P
                  {promoApplied
                    ? (totalCartPrice - subtotal * discountPercent).toFixed(2)
                    : totalCartPrice.toFixed(2)}
                </span>
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
