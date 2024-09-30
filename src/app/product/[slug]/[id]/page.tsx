"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
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
  deleteField,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CartUpdateNotif from "@/app/components/CartUpdateNotif";

const ProductPage: React.FC = () => {
<<<<<<< HEAD

=======
  
>>>>>>> 30bd19175445487e515afaf7fdb7898aa908237c
  //#region Const Variables
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isComingFromCartPage = searchParams.get("edit") === "true";
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
<<<<<<< HEAD
  const [selectedMilkOption, setSelectedMilkOption] = useState<string | null>(
    null
  );
  //#endregion
=======
  const [selectedMilkOption, setSelectedMilkOption] =
    useState("Fresh Milk");

  // QUANTITY NUMBER ADJUSTMENT
  const [numberQtty, setNumberQtty] = useState<number>(1);
>>>>>>> 30bd19175445487e515afaf7fdb7898aa908237c

  const handleOptionsChange = (
    additionals: string[],
    milkOption: string | null
  ) => {
    setSelectedAdditionals(additionals);
    if (milkOption !== null) {
      setSelectedMilkOption(milkOption);
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showCartUpdateNotif, setShowCartUpdateNotif] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  //#endregion

  //#region functions
  function addQtty() {
    // MAG-ADD NG 1 UNTIL 20 LANG KASI PARA REALISTIC ORDER LANG
    setNumberQtty((prevQtty) => (prevQtty < 30 ? prevQtty + 1 : prevQtty));
  }

  function subQtty() {
    // MAG-SUBTRACT NG 1 UNTIL 1 LANG KASI PARA REALISTIC ORDER LANG
    setNumberQtty((prevQtty) => (prevQtty > 1 ? prevQtty - 1 : prevQtty));
  }

  // useEffect to update the numberQtty when productData changes
  useEffect(() => {
    if (productData?.itemQty) {
      setNumberQtty(productData.itemQty);
    }
  }, [productData]);

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

  //for displaying the price on the edit
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    console.log(selectedMilkOption);
  }, [selectedMilkOption]);

  useEffect(() => {
    let totalPrice = productData?.pricePerItem || productData?.price || 0;
    if (slug === "drinks") {
      totalPrice += upsizePrice;
      totalPrice += additionalCost;
    }
    totalPrice *= numberQtty;
    setTotalPrice(totalPrice);
  }, [productData, upsizePrice, additionalCost, numberQtty, slug]);
  //#endregion

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
    if (productData) {
      setSelectedAdditionals(productData.additionals || []);
      setSelectedMilkOption(productData.milkOption || null);
    }
  }, [productData]);

  useEffect(() => {
    if (productData) {
      const previouslySelectedSize = productData.selectedDrinkSize;
      if (previouslySelectedSize) {
        setSelectedDrinkSize(previouslySelectedSize);
        handleDrinkSizeChange(previouslySelectedSize);
      }
    }
  }, [productData]);
  // Fetches existing products
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

          /*debug
            console.log("SLUG: " + slug);
            console.log("Product Data:", productData);
            console.log("Product ID:", productId);
            console.log("Pathname:", pathname);
            console.log("Collection:", collection);
            */

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
            //console.log("Updated Product Data:", data);
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

  // Fetching CartItems
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const tempOrdersRef = collection(db, "tempOrders");
        const querySnapshot = await getDocs(
          query(tempOrdersRef, where("user", "==", userEmail))
        );

        let specificProduct: { [key: string]: any } | null = null;

        // Iterate through each document in the "tempOrders" collection
        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Loop through each key in the document to find a product matching the productId (slug)
          for (const key in data) {
            // Check if the current key corresponds to the productId
            if (key === productId) {
              specificProduct = data[key]; // Store the product data
              console.log("Specific Product Data:", specificProduct);
              console.log(`Document ID: ${doc.id}`);
              console.log(`Field Name: ${key}`);
              console.log(
                `Specific Product Data:`,
                JSON.stringify(specificProduct, null, 2)
              );
              break; // Exit the loop once the product is found
            }
          }
        });

        // If we find the product, set the state to update the UI
        if (specificProduct) {
          setProductData(
            specificProduct as {
              selectedDrinkSize: string;
              additionalCost: number;
            }
          );
          setSelectedDrinkSize(
            (specificProduct as { selectedDrinkSize: string }).selectedDrinkSize
          );
          setAdditionalCost(
            (specificProduct as { additionalCost: number }).additionalCost
          );
          setSelectedMilkOption(specificProduct.milkOption); // Update milk option
          setSelectedAdditionals(specificProduct.additionals); // Update additionals
        } else {
          //console.error("No matching product found");
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    // Trigger the fetch only when userEmail and productId are available
    if (userEmail && productId) {
      fetchCartItems();
    }
  }, [userEmail, productId]);

  //
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

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // Adding product to cart
    const orderId = `cart-${Math.floor(
      1000000000 + Math.random() * 9000000000
    )}`;
    const tempOrdersRef = collection(db, "tempOrders");

    const qtyPerItem = numberQtty;
    const pricePerItem = parseFloat((totalPrice / qtyPerItem).toFixed(2)); // Ensure this is a number

<<<<<<< HEAD
    const now = new Date();

    // Format date as MM/DD/YYYY
    const date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;

    // Format time as HH:MM
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Create a unique key for the product based on its configuration
=======
>>>>>>> 30bd19175445487e515afaf7fdb7898aa908237c
    let uniqueProductKey =
      slug === "drinks"
        ? `${encodeURIComponent(productId || "")}-${encodeURIComponent(
            selectedDrinkSize || ""
          )}-${selectedAdditionals
            .map((item) => encodeURIComponent(item))
            .join("-")}-${encodeURIComponent(
            selectedMilkOption || ""
          )}-${encodeURIComponent(
            document.querySelector("textarea")?.value || "none"
          )}`
        : slug === "maincourse"
        ? `${encodeURIComponent(productId || "")}-${encodeURIComponent(
            selectedMainCourseOption || "Rice"
          )}-${encodeURIComponent(
            document.querySelector("textarea")?.value || "none"
          )}`
        : `${encodeURIComponent(productId || "")}-${encodeURIComponent(
            document.querySelector("textarea")?.value || "none"
          )}`;

    // Prepare order data for drinks or other products
    let orderData = {
<<<<<<< HEAD
      productImg: productData.img, // prio
      productTitle: productData.title, // prio
      itemQty: qtyPerItem, // prio
      pricePerItem: pricePerItem, // prio
      note: document.querySelector("textarea")?.value || "none", // prio
      totalPrice: parseFloat(totalPrice.toFixed(2)), // Ensure this is a number
      dateCreated: date,
      timeCreated: time
=======
      slug: productData.slug || "", // needed
      productImg: productData.productImg || productData.img || "", // needed
      productTitle: productData.productTitle || title, // needed
      description: productData.description || desc, // needed
      note: document.querySelector("textarea")?.value || "none", // needed
      itemQty: qtyPerItem, // needed
      pricePerItem: productData.pricePerItem || price, // needed
      totalPrice: parseFloat(totalPrice.toFixed(2)), // needed
      calorie: productData.calorie || 0, // needed
      availability: productData.availability || "", // needed
      ...(slug === "drinks" && {
        currSize: productData.currSize || "",
        upsizable: productData.upsizable,
        upsizeSize: productData.upsizeSize || "12oz",
        upsizePrice: productData.upsizePrice || 20,
        selectedDrinkSize: selectedDrinkSize,
        additionalCost: additionalCost,
      }),
      options: {
        addEspresso: 30,
        addSyrup: 30,
        milkAlmond: 30,
        milkOat: 40,
        addVanilla: 25,
      },
>>>>>>> 30bd19175445487e515afaf7fdb7898aa908237c
    };

    if (slug === "drinks") {
      orderData = {
        ...orderData,
        selectedDrinkSize: selectedDrinkSize, // Optional
        additionals: selectedAdditionals, // Contains options like Espresso, Syrup, etc.
        milkOption: selectedMilkOption,
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
      const querySnapshot = await getDocs(
        query(tempOrdersRef, where("user", "==", userEmail))
      );

      let existingOrderDocId: string | null = null;
      let existingOrderData: any = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.user === userEmail) {
          existingOrderDocId = doc.id; // Store the document ID if an existing cart is found
          existingOrderData = data;
        }
      });

      if (existingOrderDocId) {
        // Add new product to the cart
        const updatedOrderData = {
          ...existingOrderData,
          [uniqueProductKey]: orderData,
          user: userEmail,
        };

        // Recalculate totalItems and totalCartPrice
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
        // Create new order if no existing document is found
        const newOrderData = {
          [uniqueProductKey]: orderData,
          user: userEmail,
          totalItems: qtyPerItem,
          totalCartPrice: parseFloat(totalPrice.toFixed(2)),
        };
        await setDoc(doc(db, "tempOrders", orderId), newOrderData);
        console.log("Order added to tempOrders collection!");
      }
    } catch (error) {
      console.error("Error processing order:", error);
    }

    setShowCartUpdateNotif(true);

    clearTimeout(notificationTimeoutRef.current);

    notificationTimeoutRef.current = setTimeout(() => {
      setShowCartUpdateNotif(false);
    }, 1000); // 2 seconds
  };

  const handleUpdateCart = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // Adding product to cart
    const tempOrdersRef = collection(db, "tempOrders");

    const qtyPerItem = numberQtty;
    const pricePerItem = parseFloat((totalPrice / qtyPerItem).toFixed(2)); // Ensure this is a number

    let uniqueProductKey =
      slug === "drinks"
        ? `${encodeURIComponent(productId || "")}-${encodeURIComponent(
            selectedDrinkSize || ""
          )}-${selectedAdditionals
            .map((item) => encodeURIComponent(item))
            .join("-")}-${encodeURIComponent(
            selectedMilkOption || ""
          )}-${encodeURIComponent(
            document.querySelector("textarea")?.value || "none"
          )}`
        : slug === "maincourse"
        ? `${encodeURIComponent(productId || "")}-${encodeURIComponent(
            selectedMainCourseOption || "Rice"
          )}-${encodeURIComponent(
            document.querySelector("textarea")?.value || "none"
          )}`
        : `${encodeURIComponent(productId || "")}-${encodeURIComponent(
            document.querySelector("textarea")?.value || "none"
          )}`;

    // Prepare order data for drinks or other products
    let orderData = {
      slug: productData.slug || "", // needed
      productImg: productData.productImg || productData.img || "", // needed
      productTitle: productData.productTitle || title, // needed
      description: productData.description || desc, // needed
      note: document.querySelector("textarea")?.value || "none", // needed
      itemQty: qtyPerItem, // needed
      pricePerItem: productData.pricePerItem || price, // needed
      totalPrice: parseFloat(totalPrice.toFixed(2)), // needed
      calorie: productData.calorie || 0, // needed
      availability: productData.availability || "", // needed
      ...(slug === "drinks" && {
        currSize: productData.currSize || "",
        upsizable: productData.upsizable,
        upsizeSize: productData.upsizeSize || "12oz",
        upsizePrice: productData.upsizePrice || 20,
        selectedDrinkSize: selectedDrinkSize,
        additionalCost: additionalCost,
      }),
      options: {
        addEspresso: 30,
        addSyrup: 30,
        milkAlmond: 30,
        milkOat: 40,
        addVanilla: 25,
      },
    };

    if (slug === "drinks") {
      orderData = {
        ...orderData,
        selectedDrinkSize: selectedDrinkSize, // Optional
        additionals: selectedAdditionals, // Contains options like Espresso, Syrup, etc.
        milkOption: selectedMilkOption,
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
      const querySnapshot = await getDocs(
        query(tempOrdersRef, where("user", "==", userEmail))
      );

      let existingOrderDocId: string | null = null;
      let existingOrderData: any = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.user === userEmail) {
          existingOrderDocId = doc.id; // Store the document ID if an existing cart is found
          existingOrderData = data;
        }
      });

      if (existingOrderDocId) {
        // Check if the product already exists in the cart
        let existingProductKey: string | null = null;
        for (const key in existingOrderData) {
          if (key.startsWith(productId)) {
            existingProductKey = key;
            break;
          }
        }

        if (existingProductKey) {
          // Delete the old product and add the new product to the cart
          await updateDoc(doc(db, "tempOrders", existingOrderDocId), {
            [existingProductKey]: deleteField(),
            [uniqueProductKey]: orderData,
          });
          console.log(
            "Existing product deleted from cart and new product added!"
          );

          // Recalculate totalItems and totalCartPrice
          const updatedOrderData = await getDoc(
            doc(db, "tempOrders", existingOrderDocId)
          );
          const updatedOrderDataValues = updatedOrderData.data();

          const totalItems = Object.values(updatedOrderDataValues)
            .filter((item) => typeof item === "object" && item.itemQty)
            .reduce((acc, item) => acc + (item.itemQty || 0), 0);
          const totalCartPrice = Object.values(updatedOrderDataValues)
            .filter((item) => typeof item === "object" && item.totalPrice)
            .reduce((acc, item) => acc + (item.totalPrice || 0), 0);

          await updateDoc(doc(db, "tempOrders", existingOrderDocId), {
            totalItems,
            totalCartPrice,
          });
          console.log("Order updated in tempOrders collection!");
        } else {
          // Add new product to the cart
          const updatedOrderData = {
            ...existingOrderData,
            [uniqueProductKey]: orderData,
            user: userEmail,
          };

          // Recalculate totalItems and totalCartPrice
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
        // Create new order if no existing document is found
        const newOrderData = {
          [uniqueProductKey]: orderData,
          user: userEmail,
          totalItems: qtyPerItem,
          totalCartPrice: parseFloat(totalPrice.toFixed(2)),
        };
        await setDoc(doc(db, "tempOrders", existingOrderDocId), newOrderData);
        console.log("Order added to tempOrders collection!");
      }
    } catch (error) {
      console.error("Error processing order:", error);
    }

    setShowCartUpdateNotif(true);

    clearTimeout(notificationTimeoutRef.current);

    notificationTimeoutRef.current = setTimeout(() => {
      setShowCartUpdateNotif(false);
    }, 1000); // 2 seconds
  };

<<<<<<< HEAD
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const tempOrdersRef = collection(db, "tempOrders");
        const querySnapshot = await getDocs(
          query(tempOrdersRef, where("user", "==", userEmail))
        );
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
  
          // Log the entire document including the document ID
          console.log(`Document ID: ${doc.id}`);
          console.log("Full Document Data:", JSON.stringify(data, null, 2));
        });
        
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };
  
    fetchCartItems();
  }, [userEmail]);
  
  

=======
  const handleCartClick = async () => {
    if (isComingFromCartPage) {
      await handleUpdateCart();
    } else {
      await handleAddToCart();
    }
  };
>>>>>>> 30bd19175445487e515afaf7fdb7898aa908237c
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

  let productAvailable = productData.availability === "available";
  let calorieContent = calorie;

  const handleDrinkSizeChange = (size: string) => {
    setSelectedDrinkSize(size);

    if (size === productData.upsizeSize) {
      setUpsizePrice(productData.upsizePrice); // Correctly set the upsize price
    } else {
      setUpsizePrice(0); // Reset if the default size is selected
    }

    // If the product is not upsizable, only allow "8oz" or "16oz" sizes
    if (!productData.upsizable && size !== productData.currSize) {
      setSelectedDrinkSize(productData.currSize);
    }
  };

  const handleAdditionalCostChange = (cost: number) => {
    setAdditionalCost(cost);
  };

  // Compute the total price including additional costs
  //const totalPrice = (price + upsizePrice + additionalCost) * numberQtty;

  return (
    <div className="min-h-[calc(100vh-56px)] mt-14 flex md:px-24 xl:px-56 xl:bg-orange-50 xl:flex xl:items-center xl:justify-center">
      {/* WHOLE CONTAINER */}
      <div className="flex flex-col gap-4 pb-6 md:pb-10 xl:flex-row w-full xl:bg-white xl:shadow-xl xl:max-w-[1080px] xl:py-0 xl:my-10 xl:rounded-lg xl:max-h-[1280px] xl:overflow-hidden">
        {/* IMAGE AND BACK BUTTON CONTAINER */}
        <div className="relative w-full aspect-video xl:w-3/5 xl:aspect-auto">
          <Image
            src={productData?.productImg || img} //src={productData.productImg} // Use productData for image source
            alt={productData.productTitle || title} // alt={productData.productTitle} // Use productData for title
            layout="fill"
            objectFit="cover"
            className="object-cover xl:object-cover w-3/5"
          />
          <Link
            //href={`/menu/${slug}`}
            href={isComingFromCartPage ? "/foodcart" : `/menu/${slug}`}
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
                {productData.productTitle || title}
              </span>
              {/* PRICE DIV */}
              <div className="flex flex-col gap-1 w-2/6">
                <span className="text-2xl font-bold text-right text-orange-900">
                  P{productData.pricePerItem || price}
                </span>
                <span className="text-sm font-medium text-right w-full">
                  Base price
                </span>
              </div>
            </div>
            {/* DESCRIPTION OF THE ITEM */}
            <p className="text-justify mb-2 xl:max-h-32 xl:overflow-y-auto">
<<<<<<< HEAD
              {desc}
=======
              {productData.description || desc || "No description available"}
>>>>>>> 30bd19175445487e515afaf7fdb7898aa908237c
            </p>
          </div>

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
                            disabled={!productData.upsizable} // Only allow upsize when the product is upsizable
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
                    addEspresso={
                      productData?.options?.addEspresso ||
                      productData?.addEspresso ||
                      0
                    }
                    addSyrup={
                      productData?.options?.addSyrup ||
                      productData?.addSyrup ||
                      0
                    }
                    milkAlmond={
                      productData?.options?.milkAlmond ||
                      productData?.milkAlmond ||
                      0
                    }
                    milkOat={
                      productData?.options?.milkOat || productData?.milkOat || 0
                    }
                    addVanilla={
                      productData?.options?.addVanilla ||
                      productData?.addVanilla ||
                      0
                    }
                    onAdditionalCostChange={setAdditionalCost}
                    onOptionsChange={handleOptionsChange}
                    selectedMilkOption={selectedMilkOption} // Pass selected milk option
                    selectedAdditionals={selectedAdditionals} // Pass selected additionals
                  />
                </div>
              )}

              {slug === "maincourse" && (
                <div className="flex flex-col gap-2">
                  <hr />
                  <MainCourseOptions
                    initialOption={productData.mainCourseOption || "Rice"} // Pass the initial selected option
                    onOptionChange={(option) => {
                      setSelectedMainCourseOption(option);
                    }}
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
              defaultValue={productData.note || ""}
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
            {isComingFromCartPage ? (
              <span>Update Item (+P{totalPrice.toFixed(2)})</span>
            ) : (
              <span>Add to my Order (+P{totalPrice.toFixed(2)})</span>
            )}
          </button>
        </div>
      </div>
      {showCartUpdateNotif && (
        <CartUpdateNotif isUpdate={isComingFromCartPage} />
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