"use client";

//#region Import statements
import { useEffect, useState, useRef } from "react";
import {
  getDocs,
  query,
  where,
  collection,
  updateDoc,
  doc,
  deleteDoc,
  deleteField,
  setDoc,
  getDoc
} from "firebase/firestore"; 
import { db } from "@/app/firebase";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { auth } from "@/app/firebase";
import RemoveItemNotif from "../components/RemoveItemNotif";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; 
import CheckoutPopup from "../components/CheckoutPopup";
//#endregion

//#region Voucher data form
type Vouch = {
  id: string;
  title: string;
  desc: string;
  deduction: number;
  type: string;
};
//#endregion

const CartPage = () => {
  //#region Use State Variables
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state
  const [vouchers, setVouchers] = useState<Vouch[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Vouch | null>(null);
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
  const [voucherForm, openVoucherForm] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState(''); 
  const [promoApplied, setPromoApplied] = useState(false); 
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDeduction, setVoucherDeduction] = useState(0);
  const [voucherType, setVoucherType] = useState(""); 
  const [discountedVoucher, setDiscountedVoucher] = useState<number>(0);
  const [totalCartPrice, setTotalCartPrice] = useState(0); 
  const [subtotal, setSubtotal] = useState(0);
  const [discountedPromo, setDiscountedPromo] = useState(0);
  const [showRemoveItemNotif, setShowRemoveItemNotif] = useState(false);
  const [notificationTimeout, setNotificationTimeout] = useState(null);
  const [productId] = useState<string | undefined>(undefined);
  const [needsOrder, setNeedsOrder] = useState<boolean>(false); // Flag to indicate if new order needs handling
  const closeVoucherForm = () => {
    if (!voucherApplied) {
      setSelectedVoucher(null); // Clear the selected voucher if no voucher is applied
    }
    openVoucherForm(false);   // Close the voucher form
  };
  
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

  //#region Handling of All Methods

  //#region Handle Processes
  
  // Handle form submission
  const handleSubmit = () => {
    setIsPopupVisible(true);

    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };
  //#endregion

  //#region Check if User is Logged in and Cookie Exists
  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (!authToken) {
      setLoading(false);
    } else {
      const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        if (authUser && authUser.emailVerified) {
          setUser(authUser);
          setIsLoggedIn(true);
        }
        setLoading(false); 
      });

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
  console.log("Current promoApplied state:", promoApplied); 

  if (!userEmail) {
    showErrorPopup("Please log in to apply a promo code.");
    return;
  }

  // Check if promo code has already been applied
  if (promoApplied) {
    setShowError(true);
    setErrorMessage("A promo code has already been applied. You cannot apply another one.");
    setPromoCodeInput(''); 
    setTimeout(() => {
      setShowError(false); 
    }, 3000);
    return;
  }

  const promoCode = promoCodeInput.trim();

  setShowError(false);
  setErrorMessage("");

  if (!promoCode) {
    setShowError(true);
    setErrorMessage("Please enter a promo code.");
    setPromoCodeInput(''); 
    setTimeout(() => {
      setShowError(false); 
    }, 3000);
    return;
  }

  console.log("Entered promo code:", promoCode);

  try {
    const promoCodesRef = collection(db, "promoCodes");
    const promoQuery = query(promoCodesRef, where("promoCode", "==", promoCode));
    const promoSnapshot = await getDocs(promoQuery);

    console.log("Promo snapshot:", promoSnapshot); 

    if (!promoSnapshot.empty) {
      const promoDoc = promoSnapshot.docs[0];
      const promoDocRef = doc(db, "promoCodes", promoDoc.id);
      const promoData = promoDoc.data();
      const discount = promoData?.discountPercent || 0;
      const available = promoData?.available || false;

      console.log("Promo data:", promoData);

      if (available) {
        const promoDiscount = subtotal * discount; 
        const newTotalCartPrice = subtotal - promoDiscount; 

        setVoucherApplied(false); 
        setVoucherDeduction(0); 
        setVoucherType('');
        setDiscountedVoucher(0);

        setDiscountPercent(discount);
        setDiscountedPromo(promoDiscount.toFixed(2)); 
        setTotalCartPrice(newTotalCartPrice); 
        setPromoApplied(true); 

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);

        await updateDoc(promoDocRef, {
            timesUsed: (promoData?.timesUsed || 0) + 1,
        });

        openDiscountPromoForm(false);

        setPromoCodeInput(''); 
      } else {
        setShowError(true);
        setErrorMessage("Promo code is no longer available!");
        setPromoCodeInput(''); 
        setTimeout(() => {
          setShowError(false); 
        }, 3000);
      }
    } else {
      setShowError(true);
      setErrorMessage("Promo code is invalid!");
      setPromoCodeInput(''); 
      setTimeout(() => {
        setShowError(false); 
      }, 3000);
    }
  } catch (error) {
    console.error("Error validating promo code:", error);
    showErrorPopup("An error occurred. Please try again.");
    setPromoCodeInput(''); 
  }
};
//#endregion

  //#region Handling of Processes for Vouchers
const handleVoucherSubmit = async () => {
  if (!userEmail) {
    showErrorPopup("Please log in to apply a voucher.");
    console.log("No user email found.");
    return;
  }

  if (!selectedVoucher) {
    showErrorPopup("Please select a voucher.");
    console.log("No voucher selected.");
    return;
  }

  try {
    console.log("Selected Voucher:", selectedVoucher);

    const deduction = selectedVoucher.voucherDeduction ?? selectedVoucher.deduction ?? 0;
    const voucherType = selectedVoucher.type; 

    const isVoucherValid = vouchers.some(v => v.id === selectedVoucher.id);
    
    if (!isVoucherValid) {
      showErrorPopup("Selected voucher is invalid.");
      console.log("Invalid voucher selected.");
      return;
    }

    console.log(`Voucher type: ${voucherType}, Deduction: ${deduction}`);

    setPromoApplied(false);
    setDiscountPercent(0);
    setDiscountedPromo(0);

    let newTotalCartPrice = totalCartPrice;
    let calculatedDiscount = 0;

    if (voucherType === "percent") {
      calculatedDiscount = totalCartPrice * (deduction); 
      newTotalCartPrice -= calculatedDiscount; 
      setDiscountedVoucher(calculatedDiscount.toFixed(2)); 
      console.log(`Discount applied (percent): ${calculatedDiscount}`);
    } else if (voucherType === "minus") {
      newTotalCartPrice -= deduction; 
      setDiscountedVoucher(deduction.toFixed(2)); 
      console.log(`Discount applied (minus): ${deduction}`);
    }

    setTotalCartPrice(newTotalCartPrice);
    setVoucherApplied(true);

    showErrorPopup("Voucher successfully applied!");
    console.log("Voucher successfully applied.");

    setVoucherType(voucherType);
    setVoucherDeduction(deduction);

    openVoucherForm(false);

  } catch (error) {
    console.error("Error applying voucher:", error);
    setVoucherApplied(false);
    showErrorPopup("An error occurred. Please try again.");
  }
};
//#endregion

  //#region Handling of Removal per Item in Cart
  const handleRemoveItem = async (itemId: string) => {
    try {
      setShowRemoveItemNotif(true);
      clearTimeout(notificationTimeout);
      const newTimeout = setTimeout(() => {
        clearTimeout(newTimeout);
        setShowRemoveItemNotif(false);
      }, 1000); 
      setNotificationTimeout(newTimeout);

      console.log("Removing item with ID:", itemId);

      const tempOrdersRef = collection(db, "tempOrders");

      const querySnapshot = await getDocs(tempOrdersRef);

      querySnapshot.forEach(async (doc) => {
        const data = doc.data();

        if (data[itemId]) {
          const itemData = data[itemId];
          const itemQty = itemData.itemQty || 0;
          const itemTotalPrice = itemData.totalPrice || 0;

          const newTotalCartPrice = (data.totalCartPrice || 0) - itemTotalPrice;
          const newTotalItems = (data.totalItems || 0) - itemQty;

          await updateDoc(doc.ref, {
            [itemId]: deleteField(),
            totalCartPrice: newTotalCartPrice,
            totalItems: newTotalItems,
          });

          if (newTotalCartPrice === 0 && newTotalItems === 0) {
            await deleteDoc(doc.ref);
            console.log(`Document ${doc.id} deleted as the cart is empty.`);
          }

          await fetchCartItems();
          console.log(`Item with ID ${itemId} deleted from document ${doc.id}`);
        }
      });
    } catch (error) {
      console.error("Error removing item:", error);
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
      setShowRemoveItemNotif(true);
      clearTimeout(notificationTimeout);
      const newTimeout = setTimeout(() => {
        clearTimeout(newTimeout);
        setShowRemoveItemNotif(false);
      }, 1000);
      setNotificationTimeout(newTimeout);

      console.log("Removing all items for user email:", userEmail);

      const tempOrdersRef = collection(db, "tempOrders");

      const querySnapshot = await getDocs(
        query(tempOrdersRef, where("user", "==", userEmail))
      );

      if (querySnapshot.empty) {
        console.log("No documents found for user:", userEmail);
        return;
      }

      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
        console.log(`Document with ID ${docSnapshot.id} deleted`);
      }

      await fetchCartItems();
      console.log("All items for user email removed");
    } catch (error) {
      console.error("Error removing all items:", error);
      showErrorPopup("Failed to remove all items. Please try again.");
    }
  };
  //#endregion

  //#region Handling of Fetching of All Items
  const fetchCartItems = async () => {
    if (!userEmail) {
      setShowLoginModal(true); 
      return;
    }

    try {
      const tempOrdersRef = collection(db, "tempOrders");
      const querySnapshot = await getDocs(
        query(tempOrdersRef, where("user", "==", userEmail))
      );

      let cartItems: any[] = [];
      let totalCartPrice = 0; 
      let subtotal = 0; 

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

            subtotal += itemData.totalPrice; 
          }
        });
        totalCartPrice = data.totalCartPrice; 
      });

      setTotalCartPrice(totalCartPrice);
      setSubtotal(subtotal); 

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
  //#endregion

  //#region Fetching of All Vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        if (!userEmail) {
          console.error('User email is missing.');
          return;
        }
  
        const userDocRef = doc(db, 'users', userEmail);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userVouchers = userData.vouchers;
  
          const formattedVouchers: Vouch[] = Object.entries(userVouchers)
            .filter(([key, value]: any) => value.used === false) // Filter out the used vouchers
            .map(([key, value]: any) => ({
              id: value.voucherID,
              title: value.voucherID,
              desc: value.voucherDescription,
              deduction: value.voucherDeduction,
              type: value.voucherType
            }));
  
          setVouchers(formattedVouchers);
        }
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      }
    };
  
    if (voucherForm) {
      fetchVouchers();
    }
  }, [voucherForm, userEmail]);
  //#endregion

  //#region Handling of Options to be Passed in Orders
  const handleSubmitOrder = () => {
    let finalTotal = subtotal; 

    console.log("Initial subtotal:", subtotal);
    console.log("Promo applied:", promoApplied);
    console.log("Discount percent:", discountPercent);
    console.log("Voucher applied:", voucherApplied);
    console.log("Voucher type:", voucherType);
    console.log("Voucher deduction:", voucherDeduction);

    if (promoApplied) {
        const promoDiscount = subtotal * discountPercent; 
        finalTotal -= promoDiscount; 
        console.log("Applied promo discount:", promoDiscount);
    }

    if (voucherApplied) {
        if (voucherType === "percent") {
            const voucherDiscount = finalTotal * voucherDeduction; 
            finalTotal -= voucherDiscount; 
            console.log("Applied voucher discount (percent):", voucherDiscount);
        } else if (voucherType === "minus") {
            finalTotal -= voucherDeduction;
            console.log("Applied voucher discount (minus):", voucherDeduction);
        }
    }

    finalTotal = Math.max(finalTotal, 0);

    const orderData = {
        modeOfPayment: modeOfPayment,
        selectedOption: selectedOption,
        selectedServeTime: selectedServeTime,
        finalSubtotal: finalTotal,
    };

    console.log("Final subtotal before completing order:", finalTotal);
    console.log("Order submitted:", orderData);

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
    console.log("Completing order for user email:", userEmail);

    const tempOrdersRef = collection(db, "tempOrders");
    const querySnapshot = await getDocs(
      query(tempOrdersRef, where("user", "==", userEmail))
    );

    if (querySnapshot.empty) {
      console.log("No documents found in tempOrders.");
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
          console.log(`Document ${docId} deleted as the cart is empty.`);
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
      subtotal: finalSubtotal || 0,
      totalCartPrice: totalCartPrice,
      modeOfPayment: modeOfPayment,
      selectedOption: selectedOption,
      selectedServeTime: serveTime,
      cartId: originalOrderId,
      dateCreated: date,
      timeCreated: time,
      status: "TO PAY",
      promoDiscounted: Math.round(discountedPromo * 100) / 100,
      voucherDiscounted: discountedVoucher ? Math.round(discountedVoucher * 100) / 100 : 0,
    });

    console.log(
      "Order successfully added to completedOrders with custom ID:",
      customOrderId
    );

    await handleRemoveAllItems();
    await fetchCartItems();

    // Check if a voucher was applied, and mark it as "used" if true
    if (voucherApplied && selectedVoucher) {
      const userDocRef = doc(db, "users", userEmail);

  // Use a nested field update to only update the 'used' field of the specific voucher
    await updateDoc(userDocRef, {
      [`vouchers.${selectedVoucher.voucherAlias}.used`]: true, // Update the specific voucher's 'used' field
    });

      console.log(`Voucher ${selectedVoucher.title} marked as used.`);
    }
  } catch (error) {
    console.error("Error completing order:", error);
    showErrorPopup("Failed to complete order. Please try again.");
  }
};
//#endregion

  //#endregion

  //#region Use Effects
  
  //#region Apply Promos
  useEffect(() => {
    console.log("Promo applied:", promoApplied);
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
        openVoucherForm(false);
      }
    };

    if (voucherForm) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [voucherForm]);

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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const loggedIn = !!authUser && authUser.emailVerified;
      setIsLoggedIn(loggedIn);
      setUserEmail(authUser?.email || null); 
    });

    return () => unsubscribe();
  }, []);
  //#endregion

  //#region Fetching of All Items in Cart
  useEffect(() => {
    fetchCartItems(); 
  }, [userEmail]);
  //#endregion

  //#region Check All Existing Orders for Display
  useEffect(() => {
    const checkExistingOrders = async () => {
      try {
        if (!userEmail) return; // Ensure userEmail is present

        const tempOrdersRef = collection(db, "tempOrders");
        const querySnapshot = await getDocs(
          query(tempOrdersRef, where("user", "==", userEmail))
        );

        if (querySnapshot.empty) {
          console.log("No existing orders found.");
          setNeedsOrder(true); 
        } else {
          console.log("Existing orders found.");
          setNeedsOrder(false); 
        }
      } catch (error) {
        console.error("Error checking existing orders:", error);
      }
    };

    checkExistingOrders(); 
  }, [userEmail]);
  //#endregion

  //#region Receive All New Orders
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
            console.log(`Document ID: ${doc.id}`);
            console.log("Full Document Data:", JSON.stringify(data, null, 2));

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

                itemProductIdInCart = itemProductIdInCart.split(/-(?!.*-)/)[0];

                console.log("Formatted Product ID:", itemProductIdInCart);
                console.log("Comparing Product ID:", itemProductIdInCart);
                console.log("Comparing Size:", selectedDrinkSize);

                if (
                  itemProductIdInCart === productId &&
                  selectedDrinkSize === "8oz"
                ) {
                  console.log("Found Cart Data:", cartItem);
                }
              }
            }
          });
        } catch (error) {
          console.error("Error handling new order:", error);
        }
      };

      handleNewOrder(); 
    }
  }, [needsOrder, userEmail, productId]);
  //#endregion

  //#region Mark Voucher as Used

  //#endregion

  if (!isLoggedIn) {
    return (
      <div
        className={`flex flex-col ${isEmpty
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
      className={`flex flex-col ${isEmpty
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
                          className="flex space-x-1 items-center justify-center px-2 py-2 rounded-md shadow-md bg-red-500 mt-2
                          hover:scale-[1.02] duration-300"
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
                py-2 rounded-lg mt-3 mb-2 hover:scale-[1.03] duration-300"
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
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${selectedOption === "Table" ? "bg-orange-50" : "bg-gray-50"
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
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${selectedOption === "Pickup" ? "bg-orange-50" : "bg-gray-50"
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
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${selectedServeTime === "Now" ? "bg-orange-50" : "bg-gray-50"
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
                  className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${selectedServeTime === "Later"
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
                    -P{Number(discountedPromo).toFixed(2)} {/* Ensure discountedPromo is treated as a number */}
                  </span>
                </div>
              )}

              {/* ONLY SHOW VOUCHER IF APPLIED */}
              {voucherApplied && (
                <div className="flex justify-between items-center px-4">
                  <span>Voucher</span>
                  <span className="font-bold text-lg text-gray-600">
                    -P{discountedVoucher}
                  </span>
                </div>
              )}
            </div>

            {/* CODE AND VOUCHER BUTTON CONTAINER */}
            <div className="w-full flex gap-2 items-center">
              {/* VOUCHER BUTTON */}
              <button
                onClick={() => openVoucherForm(true)}
                className="shadow-md bg-white border-gray-50 border-2 space-x-2 text-gray-600
                py-2 rounded-lg mt-3 mb-2 flex-1 flex items-center justify-center
                hover:scale-[1.03] duration-300 hover:bg-gray-50"
              >
                <i className="fa-solid fa-ticket text-gray-600 text-xl"></i>
                <span className="font-bold text-lg"> Use Voucher</span>
              </button>
              {/* PROMO CODE BUTTON */}
              <button
                onClick={() => openDiscountPromoForm(true)}
                className="shadow-md bg-white border-gray-50 border-2 space-x-2 text-gray-600
                py-2 rounded-lg mt-3 mb-2 flex-1 hover:scale-[1.03] duration-300 hover:bg-gray-50"
              >
                <span className="font-bold text-lg">!% Use Promo Code</span>
              </button>
            </div>

            {/* PROMO CODE FORM */}
            {discountPromoForm && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
                onClick={() => openDiscountPromoForm(false)} // Close modal when clicking on the background
              >
                <form
                  className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center border-2 border-gray-50"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
                  ref={modalRef}
                >
                  <h2 className="text-xl font-bold mb-4">% Promo Code</h2>
                  <p className="mb-4">Please enter a valid promo code:</p>
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="text-center font-bold text-2xl inline-block w-64 border-2 border-gray-100 rounded-sm mb-4"
                    style={{
                      MozAppearance: "textfield",
                      boxShadow: "inset 0 2px 4px rgba(100, 100, 100, 0.1)",
                    }}
                  />
                  {showSuccess && ( // Change from promoApplied to showSuccess
                    <p className="text-green-600 mt-[-10px] mb-2 transition-opacity duration-2000 ease-in-out opacity-100">
                      Promo code successfully redeemed!
                    </p>
                  )}
                  {showError && (
                    <p className="text-red-500 mt-[-10px] mb-2 transition-opacity duration-2000 ease-in-out opacity-100">
                      {errorMessage}
                    </p>
                  )}
                  <div className="flex justify-center items-center gap-4">
                    <button
                      type="button"
                      className="bg-orange-950 text-white px-4 py-2 rounded-md font-bold shadow-md border-2 border-orange-950
          hover:border-orange-900 hover:bg-orange-900 hover:scale-[1.1] duration-300"
                      onClick={handlePromoCodeSubmit}
                    >
                      Enter Code
                    </button>
                    <button
                      className="bg-white text-gray-500 px-4 py-2 rounded-md shadow-md font-bold border-gray-50 border-solid border-2
          hover:bg-gray-50 hover:scale-[1.1] duration-300"
                      onClick={() => openDiscountPromoForm(false)}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* VOUCHER FORM */}
              {voucherForm && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
                  onClick={() => openVoucherForm(false)} // Close modal when clicking on the background
                >
                  {/* PROMO CONTAINER */}
                  <form
                    className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center border-2 border-gray-50"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
                    ref={modalRef}
                  >
                    <div className="flex flex-col mb-6">
                      {/* ICON - Keep this always visible */}
                      <div className="flex flex-col items-center">
                        <i className="fa-solid fa-ticket text-orange-950 text-7xl"></i>
                      </div>

                      {/* Conditionally render the "Selected Voucher" section if a voucher has been selected */}
                      {selectedVoucher && (
                        <>
                          {/* VOUCHER INFO DISPLAY HEADER */}
                          <h1 className="text-lg font-bold text-orange-900 text-center">
                            Selected Voucher
                          </h1>
                          {/* VOUCHER INFO DISPLAY CONTAINER */}
                          <div className="flex flex-col items-center">
                            {/* VOUCHER TITLE */}
                            <h1 className="font-bold text-orange-950 text-xl">
                              {selectedVoucher?.title}
                            </h1>
                            {/* VOUCHER DESCRIPTION */}
                            <p className="text-sm">{selectedVoucher?.desc}</p>
                          </div>
                          <hr className="my-4" />
                        </>
                      )}

                      {/* Conditionally render the "Select a voucher" or "No vouchers available" based on voucher count */}
                      <div className="flex items-center justify-center h-12"> {/* Set a fixed height */}
                        <h1 className="text-lg font-bold text-orange-900 text-center">
                          {vouchers.length > 0 ? "Select a voucher" : "No vouchers available"}
                        </h1>
                      </div>

                      {/* VOUCHERS CONTAINER */}
                      {vouchers.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-auto">
                          {vouchers.map((vouch) => (
                            // VOUCHERS
                            <span
                              key={vouch.id}
                              onClick={() => setSelectedVoucher(vouch)}
                              className={`${
                                selectedVoucher?.id === vouch.id
                                  ? "bg-orange-100 text-orange-900 hover:bg-gray-200" // color
                                  : "bg-white text-gray-700 hover:bg-gray-50"
                              } font-bold text-center text-xs
                              rounded-md shadow-sm border-gray-50 border-2 py-2 cursor-pointer`}
                            >
                              {vouch.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <hr className="mb-6" />
                    <div className="flex justify-center items-center gap-4">
                      {/* Apply Voucher button should only be shown if there are vouchers available */}
                      {vouchers.length > 0 && (
                        <button
                          type="button"
                          className="bg-orange-950 text-white px-4 py-2 rounded-md font-bold shadow-md border-2 border-orange-950
                          hover:border-orange-900 hover:bg-orange-900 hover:scale-[1.1] duration-300"
                          onClick={handleVoucherSubmit}
                        >
                          Apply Voucher
                        </button>
                      )}
                      <button
                        className="bg-white text-gray-500 px-4 py-2 rounded-md shadow-md font-bold border-gray-50 border-solid border-2
                        hover:bg-gray-50 hover:scale-[1.1] duration-300"
                        onClick={closeVoucherForm}
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
                                className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${selectedPayment === "Cash" ? "bg-orange-50" : "bg-gray-50"
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
                                className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${selectedPayment === "Card" ? "bg-orange-50" : "bg-gray-50"
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
                    {(() => {
                      let finalTotal = subtotal; // Start with the subtotal

                      // Apply promo discount if applicable
                      if (promoApplied) {
                          const promoDiscount = subtotal * discountPercent; // Calculate based on subtotal
                          finalTotal -= promoDiscount; // Deduct promo discount from subtotal
                          console.log("Applied promo discount:", promoDiscount);
                      }

                      // Apply voucher discount if applicable
                      if (voucherApplied) {
                          if (voucherType === "percent") {
                              const voucherDiscount = finalTotal * voucherDeduction; // Calculate voucher discount based on finalTotal after promo
                              finalTotal -= voucherDiscount; // Deduct the calculated voucher discount
                              console.log("Applied voucher discount (percent):", voucherDiscount);
                          } else if (voucherType === "minus") {
                              finalTotal -= voucherDeduction; // Deduct the fixed amount
                              console.log("Applied voucher discount (minus):", voucherDeduction);
                          }
                      }

                      finalTotal = Math.max(finalTotal, 0); // Ensure final total doesn't go negative

                      return finalTotal.toFixed(2); // Return formatted total with two decimal places
                    })()}
                  </span>
              </div>
              {/* CHECKOUT BUTTON */}
              <button
                className="w-full font-bold text-white text-xl bg-orange-950 py-3 rounded-lg shadow-lg
                hover:border-orange-900 hover:bg-orange-900 hover:scale-[1.03] duration-300"
                onClick={() => {
                  handleCompleteOrder(
                    modeOfPayment,
                    selectedOption,
                    selectedServeTime
                  );
                  handleSubmitOrder();
                  handleSubmit();
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CHANGES MADE POP UP */}
      {isPopupVisible && <CheckoutPopup />}
    </div>
  );
};

export default CartPage;