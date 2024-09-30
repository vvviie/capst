//foodcart

"use client";

//#region Import statements
import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, usePathname } from "next/navigation";
import {
  getDocs,
  query,
  where,
  collection,
  updateDoc,
  doc,
  deleteDoc,
  deleteField,
  increment,
  addDoc,
  setDoc,
} from "firebase/firestore"; // Import Firestore functions
import { db } from "@/app/firebase";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth
import { auth } from "@/app/firebase";
import RemoveItemNotif from "../components/RemoveItemNotif";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie
//#endregion

const CartPage = () => {
  //#region Use State Variables
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state

  const [addedToCart, setAddedToCart] = useState<any[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("Table");
  const [selectedServeTime, setSelectedServeTime] = useState<string>("Now");
  const [selectedPayment, setSelectedPayment] = useState<string>("Cash");
  const [modeOfPayment, setModeOfPayment] = useState<string>("Cash");
  const [discountPromoForm, openDiscountPromoForm] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showError, setShowError] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false); // Track if promo is applied
  const [totalCartPrice, setTotalCartPrice] = useState(0); // Track total price
  const [subtotal, setSubtotal] = useState(0);
  const [discountedPromo, setDiscountedPromo] = useState(0);
  const [totalWithDiscount, setTotalWithDiscount] = useState(0);
  const [showRemoveItemNotif, setShowRemoveItemNotif] = useState(false);
  const [notificationTimeout, setNotificationTimeout] = useState(null);

  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string | undefined; // Adjust if using searchParams
  const cleanId = searchParams.get("cleanId") as string | undefined;

  const [productId, setProductId] = useState<string | undefined>(undefined);
  const [needsOrder, setNeedsOrder] = useState<boolean>(false); // Flag to indicate if new order needs handling
  const [productIds, setProductIds] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState(0);

  const now = new Date();

  // Format date as MM/DD/YYYY
  const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
    now.getDate()
  ).padStart(2, "0")}/${now.getFullYear()}`;

  // Format time as HH:MM
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  //#endregion

  //#region Handle Processes

  //#region Check if User is Logged in and Cookie Exists
  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (!authToken) {
      // No cookie, set loading to false and show login modal
      setLoading(false);
    } else {
      // Cookie is found, proceed to check Firebase auth state
      const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        if (authUser && authUser.emailVerified) {
          setUser(authUser);
          setIsLoggedIn(true);
        }
        setLoading(false); // Done checking, stop loading
      });

      // Clean up the listener when component unmounts
      return () => unsubscribeAuth();
    }
  }, [router]);

  //#endregion

  //#region Handling of Order Options
  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  const handleServeTimeChange = (value: string) => {
    setSelectedServeTime(value);
  };

  const handlePaymentChange = (value: string) => {
    setSelectedPayment(value);
    setModeOfPayment(value);
  };
  //#endregion

  //#region Handling of Error Notifications
  const showErrorPopup = (message: string) => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };
  //#endregion

  //#region Handling of Processes for Promo Codes
  const handlePromoCodeSubmit = async () => {
    if (!userEmail) {
      showErrorPopup("Please log in to apply a promo code.");
      return;
    }

    if (promoApplied) {
      showErrorPopup(
        "A promo code has already been applied. You cannot apply another one."
      );
      return;
    }

    const promoCode = document
      .querySelector<HTMLInputElement>('input[type="text"]')
      ?.value.trim();
    if (!promoCode) {
      showErrorPopup("Please enter a promo code.");
      return;
    }

    //console.log("Entered promo code:", promoCode);

    try {
      const promoCodesRef = collection(db, "promoCodes");
      const promoQuery = query(
        promoCodesRef,
        where("promoCode", "==", promoCode)
      );
      const promoSnapshot = await getDocs(promoQuery);

      if (!promoSnapshot.empty) {
        const promoDoc = promoSnapshot.docs[0];
        const promoDocRef = doc(db, "promoCodes", promoDoc.id);
        const promoData = promoDoc.data();
        const discount = promoData?.discountPercent || 0; // Updated variable name
        const available = promoData?.available || false;

        if (available) {
          setDiscountPercent(discount); // Set the discountPercent state

          const discountFraction = discount;
          const newTotalCartPrice = subtotal * (1 - discountFraction);
          const discountedPromo = subtotal - newTotalCartPrice;
          const totalWithDiscount = subtotal - newTotalCartPrice;
          setTotalCartPrice(newTotalCartPrice);
          setDiscountedPromo(discountedPromo);
          setTotalWithDiscount(totalWithDiscount);

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
      //console.error("Error validating promo code:", error);
      setPromoApplied(false);
      showErrorPopup("An error occurred. Please try again.");
    }
  };
  //#endregion

  //#region Handling of Removal per Item in Cart
  const handleRemoveItem = async (itemId: string) => {
    try {
      // Show RemoveItemNotif component for 0.5 seconds
      setShowRemoveItemNotif(true);
      clearTimeout(notificationTimeout);
      const newTimeout = setTimeout(() => {
        clearTimeout(newTimeout);
        setShowRemoveItemNotif(false);
      }, 1000); // Adjust timeout duration to 0.5 seconds (500 milliseconds)
      setNotificationTimeout(newTimeout);

      //console.log("Removing item with ID:", itemId);

      // Reference to the tempOrders collection
      const tempOrdersRef = collection(db, "tempOrders");

      // Fetch all documents in the tempOrders collection
      const querySnapshot = await getDocs(tempOrdersRef);

      querySnapshot.forEach(async (doc) => {
        const data = doc.data();

        // Check if the document contains the itemId
        if (data[itemId]) {
          const itemData = data[itemId];
          const itemQty = itemData.itemQty || 0;
          const itemTotalPrice = itemData.totalPrice || 0;

          // Calculate new totals
          const newTotalCartPrice = (data.totalCartPrice || 0) - itemTotalPrice;
          const newTotalItems = (data.totalItems || 0) - itemQty;

          // Remove the item from the document
          await updateDoc(doc.ref, {
            [itemId]: deleteField(),
            totalCartPrice: newTotalCartPrice,
            totalItems: newTotalItems,
          });

          // Check if totals are zero and delete document if true
          if (newTotalCartPrice === 0 && newTotalItems === 0) {
            await deleteDoc(doc.ref);
            //console.log(`Document ${doc.id} deleted as the cart is empty.`);
          }

          // Refresh cart items and totals after deletion
          await fetchCartItems();
          //console.log(`Item with ID ${itemId} deleted from document ${doc.id}`);
        }
      });
    } catch (error) {
      //console.error("Error removing item:", error);
      showErrorPopup("Failed to remove item. Please try again.");
    }
  };
  //#endregion

  //#region Handling of Removal of All Items in Cart
  const handleRemoveAllItems = async () => {
    if (!userEmail) {
      showErrorPopup("User email is not available.");
      return;
    }

    try {
      // Show RemoveItemNotif component for 1 second
      setShowRemoveItemNotif(true);
      clearTimeout(notificationTimeout);
      const newTimeout = setTimeout(() => {
        clearTimeout(newTimeout);
        setShowRemoveItemNotif(false);
      }, 1000); // 1 second (1000 milliseconds)
      setNotificationTimeout(newTimeout);

      //console.log("Removing all items for user email:", userEmail);

      // Reference to the tempOrders collection
      const tempOrdersRef = collection(db, "tempOrders");

      // Query documents where the user field matches the current user's email
      const querySnapshot = await getDocs(
        query(tempOrdersRef, where("user", "==", userEmail))
      );

      if (querySnapshot.empty) {
        //console.log("No documents found for user:", userEmail);
        return;
      }

      // Iterate through each document and delete
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
        //console.log(`Document with ID ${docSnapshot.id} deleted`);
      }

      // Refresh cart items and totals after deletion
      await fetchCartItems();
      //console.log("All items for user email removed");
    } catch (error) {
      //console.error("Error removing all items:", error);
      showErrorPopup("Failed to remove all items. Please try again.");
    }
  };
  //#endregion

  //#region Handling of Fetching of All Items
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
      //console.error("Error fetching cart items:", error);
    }
  };

  //#region Handling of Options to be Passed in Orders
  const handleSubmitOrder = () => {
    const orderData = {
      modeOfPayment: modeOfPayment,
      selectedOption: selectedOption,
      selectedServeTime: selectedServeTime,
      finalSubtotal: promoApplied
        ? subtotal - subtotal * discountPercent // Subtotal after discount
        : subtotal, // Original subtotal without discount
    };

    //console.log("Order submitted:", orderData);

    // Pass the correct subtotal to handleCompleteOrder
    handleCompleteOrder(
      orderData.modeOfPayment,
      orderData.selectedOption,
      orderData.selectedServeTime,
      orderData.finalSubtotal
    );
  };
  //#endregion

  //#region Handling of Completion of Orders
  const handleCompleteOrder = async (
    modeOfPayment: string,
    selectedOption: string,
    serveTime: string,
    finalSubtotal: number
  ) => {
    if (!userEmail) {
      showErrorPopup("User email is not available.");
      return;
    }

    try {
      setShowRemoveItemNotif(true);
      clearTimeout(notificationTimeout);
      const newTimeout = setTimeout(() => {
        clearTimeout(newTimeout);
        setShowRemoveItemNotif(false);
      }, 1000);
      setNotificationTimeout(newTimeout);

      //console.log("Completing order for user email:", userEmail);

      const tempOrdersRef = collection(db, "tempOrders");
      const querySnapshot = await getDocs(
        query(tempOrdersRef, where("user", "==", userEmail))
      );

      if (querySnapshot.empty) {
        //console.log("No documents found in tempOrders.");
        return;
      }

      let completedOrderItems: any[] = [];
      let totalCartPrice = 0;
      let totalItems = 0;
      let customOrderId: string | null = null;
      let originalOrderId: string | null = null;

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        const cleanedDocId = docId.startsWith("cart-")
          ? docId.substring(5)
          : docId;
        const origDocId = docId;

        let foundItem = false;

        Object.keys(data).forEach((key) => {
          if (
            key !== "user" &&
            key !== "totalItems" &&
            key !== "totalCartPrice"
          ) {
            const itemData = data[key];

            completedOrderItems.push({
              productTitle: itemData.productTitle,
              productImg: itemData.productImg,
              slug: itemData.slug,
              itemQty: itemData.itemQty,
              totalPrice: itemData.totalPrice,
              tags: itemData.tags || [],
              note: itemData.note || null,
              mainCourseOption: itemData.mainCourseOption || null,
              selectedDrinkSize: itemData.selectedDrinkSize || null,
              additionals: itemData.additionals || null,
              milkOption: itemData.milkOption || null,
            });

            totalItems += itemData.itemQty;
            totalCartPrice += itemData.totalPrice;
            foundItem = true;
          }
        });

        if (foundItem) {
          const newTotalCartPrice = (data.totalCartPrice || 0) - totalCartPrice;
          const newTotalItems = (data.totalItems || 0) - totalItems;

          await updateDoc(docSnapshot.ref, {
            totalCartPrice: newTotalCartPrice,
            totalItems: newTotalItems,
          });

          if (newTotalCartPrice === 0 && newTotalItems === 0) {
            await deleteDoc(docSnapshot.ref);
            //console.log(`Document ${docId} deleted as the cart is empty.`);
          }

          if (!customOrderId) {
            customOrderId = cleanedDocId;
            originalOrderId = origDocId;
          }
        }
      }

      if (!customOrderId) {
        customOrderId = new Date().getTime().toString();
      }

      const completedOrdersRef = doc(db, "completedOrders", customOrderId);

      await setDoc(completedOrdersRef, {
        user: userEmail,
        items: completedOrderItems,
        totalItems: totalItems,
        subtotal: finalSubtotal || 0, // Add a fallback value like 0
        totalCartPrice: totalCartPrice,
        modeOfPayment: modeOfPayment,
        selectedOption: selectedOption,
        selectedServeTime: serveTime,
        cartId: originalOrderId,
        dateCreated: date,
        timeCreated: time,
        status: "TO PAY",
        promoDiscouted: discountedPromo,
      });

      //console.log("Order successfully added to completedOrders with custom ID:",customOrderId);

      await handleRemoveAllItems();
      await fetchCartItems();
    } catch (error) {
      //console.error("Error completing order:", error);
      showErrorPopup("Failed to complete order. Please try again.");
    }
  };
  //#endregion

  //#endregion

  //#region Use Effects

  //#region Apply Promos
  useEffect(() => {
    //console.log("Promo applied:", promoApplied);
  }, [promoApplied]);
  //#endregion

  //#region Forms that can be Closed when Clicked Outside
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
  //#endregion

  //#region Checks if the user is logged in or not
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
  //#endregion

  //#region Fetching of All Items in Cart
  useEffect(() => {
    fetchCartItems(); // Fetch cart items when userEmail changes
  }, [userEmail]);
  //#endregion

  useEffect(() => {
    const checkExistingOrders = async () => {
      try {
        if (!userEmail) return; // Ensure userEmail is present

        const tempOrdersRef = collection(db, "tempOrders");
        const querySnapshot = await getDocs(
          query(tempOrdersRef, where("user", "==", userEmail))
        );

        if (querySnapshot.empty) {
          //console.log("No existing orders found.");
          setNeedsOrder(true); // No orders found, flag for further action
        } else {
          //console.log("Existing orders found.");
          setNeedsOrder(false); // Orders found, no need to handle new order
        }
      } catch (error) {
        //console.error("Error checking existing orders:", error);
      }
    };

    checkExistingOrders(); // Call the function to check existing orders
  }, [userEmail]);

  useEffect(() => {
    if (needsOrder && userEmail && productId) {
      const handleNewOrder = async () => {
        try {
          const tempOrdersRef = collection(db, "tempOrders");
          const querySnapshot = await getDocs(
            query(tempOrdersRef, where("user", "==", userEmail))
          );

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            //console.log(`Document ID: ${doc.id}`);
            //console.log("Full Document Data:", JSON.stringify(data, null, 2));

            // Check each product in the document data
            for (const key in data) {
              if (
                data.hasOwnProperty(key) &&
                key !== "totalCartPrice" &&
                key !== "totalItems" &&
                key !== "user"
              ) {
                const cartItem = data[key];
                let itemProductIdInCart = cartItem.productId;
                const selectedDrinkSize = cartItem.selectedDrinkSize;

                // Format product ID if needed
                itemProductIdInCart = itemProductIdInCart.split(/-(?!.*-)/)[0]; // Truncate before the number

                //console.log("Formatted Product ID:", itemProductIdInCart);
                //console.log("Comparing Product ID:", itemProductIdInCart);
                //console.log("Comparing Size:", selectedDrinkSize);

                // Check if productId matches and selectedDrinkSize is '8oz'
                if (
                  itemProductIdInCart === productId &&
                  selectedDrinkSize === "8oz"
                ) {
                  //console.log("Found Cart Data:", cartItem);
                  // Handle found cart item
                }
              }
            }
          });
        } catch (error) {
          //console.error("Error handling new order:", error);
        }
      };

      handleNewOrder(); // Call the function to handle new order
    }
  }, [needsOrder, userEmail, productId]);

  if (!isLoggedIn) {
    return (
      <div
        className={`flex flex-col ${
          isEmpty
            ? "min-h-[calc(100vh-280px)]"
            : "min-h-[calc(100vh-280px)] lg:py-2 xl:min-h-[calc(100vh-56px)]"
        } mt-14 bg-white items-center justify-center`}
      >
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
          onClick={() => setShowLoginModal(false)} // Close modal when clicking on the background
        >
          {/* SIGN IN REQUIRED CONTAINER */}
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center border-2 border-gray-50"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
            ref={modalRef}
            style={{ marginTop: "-8%" }}
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
      </div>
    );
  }

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
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
          onClick={() => setShowLoginModal(false)} // Close modal when clicking on the background
        >
          {/* SIGN IN REQUIRED CONTAINER */}
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center border-2 border-gray-50"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
            ref={modalRef}
            style={{ marginTop: "-8%" }}
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
              {addedToCart.map((items) => {

                return (
                  <div
                    key={items.id}
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

                    {/* PRICE AND ACTIONS CONTAINER */}
                    <div className="flex flex-col gap-2 justify-between items-end pr-2">
                      <div className="font-bold text-lg">
                        P{parseFloat(items.price).toFixed(2)}
                      </div>
                      <div className="flex flex-col space-y-1 items-center justify-center">
                        <Link
                        href={`product/${items.slug}/${items.id}?edit=true`}
                        className="flex space-x-1 items-center"
                      >
                        <i className="fas fa-edit text-xs text-gray-700"></i>
                        <span className="text-md underline underline-offset-2 text-gray-600">
                          Edit
                        </span>
                      </Link>
                        <button
                          className="flex space-x-1 items-center justify-center px-2 py-2 rounded-md shadow-md bg-red-500 mt-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent link click from firing
                            handleRemoveItem(items.id);
                          }}
                        >
                          <i className="fa fa-trash text-white text-xs"></i>
                          <span className="text-xs text-white">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* REMOVE ALL ITEMS IN THE FOOD CART */}
            <button
              className="shadow-md bg-red-500 space-x-2 text-gray-100
                py-2 rounded-lg mt-3 mb-2"
              onClick={(e) => {
                e.stopPropagation(); // Prevent link click from firing
                handleRemoveAllItems();
              }}
            >
              <i className="fa-solid fa-circle-xmark text-md"></i>
              <span className="font-bold text-lg">Remove all items</span>
            </button>
          </div>
          {showRemoveItemNotif && <RemoveItemNotif />}
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
                    selectedOption === "Table" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tablePickup"
                    id="table"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedOption === "Table"}
                    onChange={() => handleOptionChange("Table")}
                  />
                  <span className="ml-4 font-semibold">Table</span>
                </div>
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedOption === "Pickup" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tablePickup"
                    id="pickup"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedOption === "Pickup"}
                    onChange={() => handleOptionChange("Pickup")}
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
                    selectedServeTime === "Now" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="serveTime"
                    id="now"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedServeTime === "Now"}
                    onChange={() => handleServeTimeChange("Now")}
                  />
                  <span className="ml-4 font-semibold">Now</span>
                </div>
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedServeTime === "Later"
                      ? "bg-orange-50"
                      : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="serveTime"
                    id="later"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedServeTime === "Later"}
                    onChange={() => handleServeTimeChange("Later")}
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
                        promoApplied ? "text-green-600" : "text-red-500"
                      } mt-[-10px] mb-2 transition-opacity duration-2000 ease-in-out opacity-100`}
                    >
                      {promoApplied
                        ? "Promo code successfully redeemed!"
                        : "Promo code is invalid!"}
                    </p>
                  )}
                  <div className="flex justify-center items-center gap-4">
                    <button
                      type="button"
                      className="bg-orange-950 text-white px-4 py-2 rounded-md font-bold shadow-md border-2 border-orange-950"
                      onClick={handlePromoCodeSubmit}
                    >
                      Enter Code
                    </button>
                    <button
                      className="bg-white text-gray-500 px-4 py-2 rounded-md shadow-md font-bold border-gray-50 border-solid border-2"
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
                    selectedPayment === "Cash" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    id="cash"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedPayment === "Cash"}
                    onChange={() => handlePaymentChange("Cash")}
                  />
                  <span className="ml-4 font-semibold">Cash</span>
                </div>
                <div
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                    selectedPayment === "Card" ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    id="card"
                    className="w-5 h-5 cursor-pointer"
                    checked={selectedPayment === "Card"}
                    onChange={() => handlePaymentChange("Card")}
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
                    ? (subtotal - subtotal * discountPercent).toFixed(2)
                    : totalCartPrice.toFixed(2)}
                </span>
              </div>
              {/* CHECKOUT BUTTON */}
              <button
                className="w-full font-bold text-white text-xl bg-orange-950 py-3 rounded-lg shadow-lg"
                onClick={() => {
                  handleCompleteOrder(
                    modeOfPayment,
                    selectedOption,
                    selectedServeTime
                  );
                  handleSubmitOrder();
                }}
              >
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