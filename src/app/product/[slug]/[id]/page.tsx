"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DrinksOptions from "@/app/components/DrinksOptions";
import MainCourseOptions from "@/app/components/MainCourseOptions";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CartUpdateNotif from "@/app/components/CartUpdateNotif";

const ProductPage: React.FC = () => {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const slug = parts.length > 1 ? parts[parts.length - 2] : undefined;
  const productId = parts.length > 1 ? parts[parts.length - 1] : undefined;
  const [productData, setProductData] = useState<any>(null);

  const [selectedDrinkSize, setSelectedDrinkSize] = useState<string>("12oz");
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [upsizePrice, setUpsizePrice] = useState<number>(0);
  const [selectedMainCourseOption, setSelectedMainCourseOption] =
    useState<string>("rice");

  // For getting the additionals in the DrinksOptions
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [selectedMilkOption, setSelectedMilkOption] = useState<string | null>(
    null
  );

  const handleOptionsChange = (
    additionals: string[],
    milkOption: string | null
  ) => {
    setSelectedAdditionals(additionals);
    setSelectedMilkOption(milkOption);
  };

  // QUANTITY NUMBER ADJUSTMENT
  const [numberQtty, setNumberQtty] = useState<number>(1);

  function addQtty() {
    // MAG-ADD NG 1 UNTIL 20 LANG KASI PARA REALISTIC ORDER LANG
    setNumberQtty((prevQtty) => (prevQtty < 30 ? prevQtty + 1 : prevQtty));
  }

  function subQtty() {
    // MAG-SUBTRACT NG 1 UNTIL 1 LANG KASI PARA REALISTIC ORDER LANG
    setNumberQtty((prevQtty) => (prevQtty > 1 ? prevQtty - 1 : prevQtty));
  }

  // KAPAG NAMAN GINAMIT NG USER IS 'YUNG TEXTBOX MISMO, INSTEAD OF THE ADD AND SUBTRACT BUTTONS
  function handleQttyChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = parseInt(e.target.value);

    if (value > 30) {
      value = 30;
    } else if (value < 1 || isNaN(value)) {
      value = 1;
    }

    setNumberQtty(value);
  }

  // Automatically uses the following data from the database through the slug
  useEffect(() => {
    const fetchProductData = async () => {
      if (productId && slug) {
        try {
          // if the slug is that certain category, then it would be the collection that would be retrieved from the database.
          const collection =
            slug === "drinks"
              ? "drinks"
              : slug.toLowerCase() === "maincourse"
              ? "mainCourse"
              : slug === "pasta"
              ? "pasta"
              : slug === "pastries"
              ? "pastries"
              : slug === "sandwiches"
              ? "sandwiches"
              : slug === "snacks"
              ? "snacks"
              : null;

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

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showCartUpdateNotif, setShowCartUpdateNotif] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const loggedIn = !!authUser && authUser.emailVerified;
      setIsLoggedIn(loggedIn);
      setUserEmail(authUser?.email || null); // Sets user email
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLoginModal(false);
      }
    };

    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLoginModal]);

  const handleMainCourseOptionChange = (option: string) => {
    setSelectedMainCourseOption(option);
  };

  const handleCartClick = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const orderId = `cart-${Math.floor(
      1000000000 + Math.random() * 9000000000
    )}`;
    const tempOrdersRef = collection(db, "tempOrders");

    const qtyPerItem = numberQtty;
    const pricePerItem = parseFloat((totalPrice / qtyPerItem).toFixed(2)); // Ensure this is a number

    // Eto needs polishing pa ito!!!!
    //
    //

    //
    // Create a unique key for the product based on its configuration
    //let uniqueProductKey = `${productId}-${selectedDrinkSize}-${document.querySelector("textarea")?.value || ""}`;
    // Create a unique key for the product based on its configuration
    let uniqueProductKey =
      slug === "drinks"
        ? `${productId}-${selectedDrinkSize}-${selectedAdditionals.join("-")}-${
            selectedMilkOption || "Fresh Milk"
          }-${document.querySelector("textarea")?.value || "none"}`
        : slug === "maincourse"
        ? `${productId}-${selectedMainCourseOption || "Rice"}-${
            document.querySelector("textarea")?.value || "none"
          }`
        : `${productId}-${document.querySelector("textarea")?.value || "none"}`;

    // Prepare order data for drinks or other products
    let orderData = {
      productImg: productData.img, // prio
      productTitle: productData.title, // prio
      itemQty: qtyPerItem, // prio
      pricePerItem: pricePerItem, // prio
      note: document.querySelector("textarea")?.value || "none", // prio
      totalPrice: parseFloat(totalPrice.toFixed(2)), // Ensure this is a number
    };

    // If the product is a drink, add drink-specific options to the orderData
    if (slug === "drinks") {
      orderData = {
        ...orderData,
        selectedDrinkSize: selectedDrinkSize, // Optional
        additionals: selectedAdditionals, // Contains options like Espresso, Syrup, etc.
        milkOption: selectedMilkOption || "Fresh Milk",
        slug: "drinks",
      };
    } else if (slug === "maincourse") {
      orderData = {
        ...orderData,
        mainCourseOption: selectedMainCourseOption, // Add the selected main course option
        slug: "maincourse",
      };
    } else if (slug === "pasta") {
      orderData = {
        ...orderData,
        slug: "pasta",
      };
    } else if (slug === "snacks") {
      orderData = {
        ...orderData,
        slug: "snacks",
      };
    } else if (slug === "sandwiches") {
      orderData = {
        ...orderData,
        slug: "sandwiches",
      };
    }

    try {
      // Reference to the collection where orders for the user are stored
      const querySnapshot = await getDocs(
        query(tempOrdersRef, where("user", "==", userEmail))
      );

      let existingOrderDocId: string | null = null;
      let existingOrderData: any = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if the document belongs to the user
        if (data.user === userEmail) {
          existingOrderDocId = doc.id; // Store the document ID if an existing cart is found
          existingOrderData = data;
        }
      });

      if (existingOrderDocId) {
        // Check if the product with the specific options already exists in the order
        if (existingOrderData[uniqueProductKey]) {
          // Update the quantity of the existing product
          const existingProductData = existingOrderData[uniqueProductKey];
          const updatedProductData = {
            ...existingProductData,
            itemQty: existingProductData.itemQty + qtyPerItem,
            totalPrice:
              existingProductData.totalPrice +
              parseFloat(totalPrice.toFixed(2)), // Add new price to existing total
          };
          const updatedOrderData = {
            ...existingOrderData,
            [uniqueProductKey]: updatedProductData,
            user: userEmail,
          };

          // Recalculate totalItems and totalCartPrice (renaming fields)
          const totalItems = Object.values(updatedOrderData)
            .filter((item) => typeof item === "object" && item.itemQty)
            .reduce((acc, item) => acc + (item.itemQty || 0), 0);
          const totalCartPrice = Object.values(updatedOrderData)
            .filter((item) => typeof item === "object" && item.totalPrice)
            .reduce((acc, item) => acc + (item.totalPrice || 0), 0);

          updatedOrderData.totalItems = totalItems;
          updatedOrderData.totalCartPrice = totalCartPrice;

          await updateDoc(
            doc(db, "tempOrders", existingOrderDocId),
            updatedOrderData
          );
          console.log("Order updated in tempOrders collection!");
        } else {
          // Add the new product with different options to the existing order
          const updatedOrderData = {
            ...existingOrderData,
            [uniqueProductKey]: orderData,
            user: userEmail,
          };

          // Recalculate totalItems and totalCartPrice (renaming fields)
          const totalItems = Object.values(updatedOrderData)
            .filter((item) => typeof item === "object" && item.itemQty)
            .reduce((acc, item) => acc + (item.itemQty || 0), 0);
          const totalCartPrice = Object.values(updatedOrderData)
            .filter((item) => typeof item === "object" && item.totalPrice)
            .reduce((acc, item) => acc + (item.totalPrice || 0), 0);

          updatedOrderData.totalItems = totalItems;
          updatedOrderData.totalCartPrice = totalCartPrice;

          await updateDoc(
            doc(db, "tempOrders", existingOrderDocId),
            updatedOrderData
          );
          console.log("Order updated in tempOrders collection!");
        }
      } else {
        // Create a new order if no document exists for the user
        const newOrderData = {
          [uniqueProductKey]: orderData,
          user: userEmail,
          totalItems: qtyPerItem, // Renamed field
          totalCartPrice: parseFloat(totalPrice.toFixed(2)), // Renamed field
        };
        await setDoc(doc(db, "tempOrders", orderId), newOrderData);
        console.log("Order added to tempOrders collection!");
      }
    } catch (error) {
      console.error("Error processing order:", error);
    }

    setShowCartUpdateNotif(true);

    // Clear any existing timeout
    clearTimeout(notificationTimeoutRef.current);

    // Set timeout to hide notification after 2 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setShowCartUpdateNotif(false);
    }, 1000); // 2 seconds in milliseconds
  };

  useEffect(() => {
    // Cleanup function to clear timeout if component unmounts
    return () => clearTimeout(notificationTimeoutRef.current);
  }, []);

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
  const totalPrice = (price + upsizePrice + additionalCost) * numberQtty;

  return (
    <div className="min-h-[calc(100vh-56px)] mt-14 flex md:px-24 xl:px-56 xl:bg-orange-50 xl:flex xl:items-center xl:justify-center">
      {/* WHOLE CONTAINER */}
      <div className="flex flex-col gap-4 pb-6 md:pb-10 xl:flex-row w-full xl:bg-white xl:shadow-xl xl:max-w-[1080px] xl:py-0 xl:my-10 xl:rounded-lg xl:max-h-[1280px] xl:overflow-hidden">
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
        <div className="px-10 md:px-24 xl:px-5 xl:py-10 xl:w-2/5 xl:min-h-[500px]">
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
            <p className="text-justify mb-2 xl:max-h-32 xl:overflow-y-scroll">
              {desc}
            </p>
          </div>

          {/* OPTIONS */}
          {productAvailable && (
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
                          selectedDrinkSize === productData.currSize
                            ? "bg-orange-50"
                            : "bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="drinkSize"
                          id={productData.currSize}
                          className="w-5 h-5"
                          checked={selectedDrinkSize === productData.currSize}
                          onChange={() =>
                            handleDrinkSizeChange(productData.currSize)
                          }
                        />
                        <span className="ml-4 font-semibold">
                          {productData.currSize}
                        </span>
                      </div>

                      {/* Conditionally render upsizable option */}
                      {productData.upsizable && (
                        <div
                          className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                            selectedDrinkSize === productData.upsizeSize
                              ? "bg-orange-50"
                              : "bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="drinkSize"
                            id={productData.upsizeSize}
                            className="w-5 h-5"
                            checked={
                              selectedDrinkSize === productData.upsizeSize
                            }
                            onChange={() =>
                              handleDrinkSizeChange(productData.upsizeSize)
                            }
                          />
                          <span className="ml-4 font-semibold">
                            {productData.upsizeSize}
                          </span>
                          <span className="ml-2">
                            {" "}
                            (+{productData.upsizePrice})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* DrinksOptions component with props */}
                  <DrinksOptions
                    addEspresso={productData?.addEspresso || 0}
                    addSyrup={productData?.addSyrup || 0}
                    milkAlmond={productData?.milkAlmond || 0}
                    milkOat={productData?.milkOat || 0}
                    addVanilla={productData?.addVanilla || 0}
                    onAdditionalCostChange={setAdditionalCost}
                    onOptionsChange={handleOptionsChange}
                  />
                </div>
              )}

              {slug === "maincourse" && (
                <div className="flex flex-col gap-2">
                  <hr />
                  <MainCourseOptions
                    onOptionChange={handleMainCourseOptionChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* QUANTITY, NOTE, AND BUTTON */}
          <div className="flex flex-col gap-2 my-2">
            <span className="text-gray-500">Note</span>
            <textarea
              name=""
              id=""
              cols={30}
              rows={3}
              style={{ resize: "none" }}
              className="bg-gray-50 w-full pl-2"
              placeholder="Any requests for this order?"
              disabled={!productAvailable} // Make textarea editable only if the product is available
            ></textarea>
          </div>

          {/* QUANTITY CONTAINER */}
          <div className="flex items-center justify-center gap-4 pt-2 pb-4">
            {/* SUBTRACT BUTTON */}
            <button
              onClick={subQtty}
              className="bg-white text-gray-700 font-bold text-4xl w-14 aspect-square border-2 border-gray-100 pb-1 rounded-lg shadow-md"
            >
              -
            </button>

            {/* QUANTITY INPUT */}
            <input
              type="number"
              value={numberQtty}
              onChange={handleQttyChange}
              className="text-center font-bold text-2xl inline-block w-14 aspect-square border-2 border-gray-50 rounded-lg"
              min={1}
              max={20}
              style={{
                MozAppearance: "textfield",
                boxShadow: "inset 0 2px 4px rgba(100, 100, 100, 0.1)",
              }}
            />
            <style jsx>{`
              input::-webkit-outer-spin-button,
              input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            `}</style>

            {/* ADD BUTTON */}
            <button
              onClick={addQtty}
              className="bg-white text-gray-700 font-bold text-4xl w-14 aspect-square border-2 border-gray-100 pb-1 rounded-lg shadow-md"
            >
              +
            </button>
          </div>

          {/* BUTTON FOR CART UPDATE */}
          <button
            className={`w-full py-4 mt-6 font-bold text-xl space-x-4 rounded-lg cursor-pointer shadow-md ${
              productAvailable
                ? "bg-orange-950 text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            onClick={productAvailable ? handleCartClick : undefined}
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Update Cart (+P{totalPrice.toFixed(2)})</span>
          </button>
        </div>
      </div>
      {showCartUpdateNotif && (
        <CartUpdateNotif onClick={() => setShowCartUpdateNotif(false)} />
      )}
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
            <p className="mb-4">Please sign in to add items to your cart.</p>
            <div className="flex justify-center items-center gap-4">
              <Link
                href="/login"
                className="bg-orange-950 text-white px-4 py-2 rounded-md font-bold shadow-md border-2 border-orange-950"
              >
                Sign in
              </Link>
              <button
                className="bg-white text-gray-500 px-4 py-2 rounded-md shadow-md font-bold border-gray-50 border-solid border-2"
                onClick={() => setShowLoginModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
