"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { db } from "../firebase";
import CheckoutPopup from "../components/CheckoutPopup";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// #region Sample Data
type Order = {
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  price: number;
  status: string;
  where: string;
  payment: string;
  promo?: number;
  items: { title: string; price: number; qty: number; tags: string[] }[];
  id: string;
  pwdSenior: boolean;
  idPic?: string;
  pwdSeniorDiscountApplied?: boolean;
  sampleDiscountDeduction?: number;
  slug: string;
  subtotal: number;
  cardIdImg?: string;
};
// #endregion

const AdminAndStaffOrdersPage = () => {
  const [reversePosition, setReversePosition] = useState(false);
  const [orderStatCat, setOrderStatCat] = useState<string>("ALL");
  const [enlargePicture, setEnlargePicture] = useState(false);
  const [hasOrder, setHasOrder] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [applySrPWD, setApplySrPWD] = useState<{ [key: string]: boolean }>({});
  const [expandedOrders, setExpandedOrders] = useState<{
    [key: string]: boolean;
  }>({});
  const [discounts, setDiscounts] = useState<{ [orderId: string]: boolean }>(
    {}
  );
  const [user, setUser] = useState<string>("");

  const [isPaidVisible, setIsPaidVisible] = useState(false);
  const [isMarkAsPrepVisible, setIsMarkAsPrepVisible] = useState(false);
  const [isMarkAsReadyVisible, setIsMarkAsReadyVisible] = useState(false);
  const [isMarkAsDoneVisible, setIsMarkAsDoneVisible] = useState(false);
  const [isRejectedVisible, setIsRejectedVisible] = useState(false);

  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const [email, setEmail] = useState(null); // State to store the email
  const auth = getAuth(); // Get Firebase Auth instance

  const [staffStatus, setStaffStatus] = useState<'activated' | 'deactivated' | null>(null);

  useEffect(() => {
    console.log('useEffect triggered'); // Log when the useEffect runs

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEmail = user.email;
        console.log('User logged in:', userEmail);
        setEmail(email); // Set the email state

        if (userEmail) {
          // Fetch the staff document from Firestore
          const staffDocRef = doc(db, 'staff', userEmail); // Document ID is the email
          const staffDocSnap = await getDoc(staffDocRef);

          if (staffDocSnap.exists()) {
            const data = staffDocSnap.data();
            console.log('Staff document data:', data);

            // Check and update the staffStatus
            if (data.staffStatus === 'activated') {
              setStaffStatus('activated');
              console.log('Staff status set to: activated');
            } else if (data.staffStatus === 'deactivated') {
              setStaffStatus('deactivated');
              console.log('Staff status set to: deactivated');
            }
          } else {
            console.log('No staff document found for this user.');
            setStaffStatus(null); // Reset if no document exists
          }
        }
      } else {
        console.log('No user logged in');
        setEmail(null);
        setStaffStatus(null); // Reset states if user is logged out
      }
    });

    // Clean up the listener on component unmount
    return () => {
      console.log('Cleaning up listener');
      unsubscribe();
    };
  }, [auth, db]); // Dependencies

  // Fetch orders on component mount and when `orderStatCat` changes
  useEffect(() => {
    const unsubscribe = fetchCompletedOrders();

    return () => unsubscribe();
  }, [orderStatCat]);

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSrPWD = (orderId: string) => {
    setApplySrPWD((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleDiscount = (orderId: string) => {
    setDiscounts((prev) => ({
      ...prev,
      [orderId]: !prev[orderId], // Toggle the discount state for this specific order
    }));
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const isPM = hour >= 12;

    // Convert 24-hour time to 12-hour format
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

    // Determine AM or PM
    const period = isPM ? "PM" : "AM";

    // Return formatted time
    return `${formattedHour}:${String(minute).padStart(2, "0")} ${period}`;
  };

  const fetchCompletedOrders = () => {
    const unsubscribe = onSnapshot(
      collection(db, "completedOrders"),
      (querySnapshot) => {
        const orders: Order[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let highestPricedItem = data.items[0]; // Initialize with the first item
          let highestPrice = highestPricedItem.totalPrice;

          // Find the highest-priced item in the current order
          data.items.forEach((item: any) => {
            if (item.totalPrice > highestPrice) {
              highestPricedItem = item;
              highestPrice = item.totalPrice;
            }
          });

          const items = data.items.map((item: any) => {
            let discountedPrice = item.totalPrice;

            // Apply the discount only if this order's Sr/PWD discount is active
            if (applySrPWD[doc.id] && item.id === highestPricedItem.id) {
              discountedPrice = item.totalPrice * 0.8;
            }

            return {
              title: item.productTitle,
              price: discountedPrice,
              qty: item.itemQty,
              tags:
                item.slug === "drinks"
                  ? [item.selectedDrinkSize, item.note]
                  : [item.note],
            };
          });

          // Recalculate the total price
          const totalPrice = items.reduce(
            (total, item) => total + item.price,
            0
          );

          const order: Order = {
            id: doc.id,
            userName: data.userName,
            userEmail: data.user,
            date: data.dateCreated,
            time: formatTime(data.timeCreated),
            price: totalPrice,
            status: data.status,
            where: data.selectedOption,
            payment: data.modeOfPayment,
            items: items,
            pwdSenior: data.pwdSenior,
            idPic: data.idImg,
            pwdSeniorDiscountApplied: applySrPWD[doc.id],
            sampleDiscountDeduction: highestPricedItem.totalPrice * 0.2,
            promo: data.promoDiscounted,
            slug: data.slug,
            subtotal: data.subtotal || totalPrice,
            cardIdImg: data.cardIdImg,
          };

          // Add only if status matches selected category or if "ALL"
          if (orderStatCat === "ALL" || order.status === orderStatCat) {
            orders.push(order);
          }
        });

        const convertTo24HourFormat = (timeStr) => {
          const [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":").map(Number);

          if (modifier === "PM" && hours < 12) hours += 12;
          if (modifier === "AM" && hours === 12) hours = 0;

          return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
        };

        // Sort the orders from latest to oldest by date and time
        orders.sort((a, b) => {
          // Compare dates first
          if (a.date > b.date) return -1;
          if (a.date < b.date) return 1;

          // If dates are the same, compare converted times
          const timeA = convertTo24HourFormat(a.time);
          const timeB = convertTo24HourFormat(b.time);

          return timeA > timeB ? -1 : 1;
        });

        // Update the orders state with the sorted data
        setUserOrders(orders);
        setHasOrder(orders.length > 0);
      }
    );

    return unsubscribe;
  };

  // FOR OPENING NG POP UP
  const [confirmPopup, setConfirmPopup] = useState(false);

  // FOR CLOSING NG POP UP
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value.toLowerCase();
    setOrderStatCat(
      value === "all"
        ? "ALL"
        : value === "topay"
        ? "TO PAY"
        : value === "paid"
        ? "PAID"
        : value === "prep"
        ? "PREP"
        : value === "ready"
        ? "READY"
        : value === "done"
        ? "DONE"
        : value === "cancelled"
        ? "CANCELLED"
        : "REJECTED"
    );
  };

  const handlePaid = async (id: string) => {
    try {
      // Fetch the specific order document from Firestore
      const orderRef = doc(db, "completedOrders", id);
      const orderDoc = await getDoc(orderRef);
      if (!orderDoc.exists()) {
        console.error("Order not found");
        return;
      }

      const orderData = orderDoc.data();
      const userId = orderData.user; // Retrieve the user associated with the order

      if (!userId) {
        console.error("User  ID not found in the order data");
        return;
      }

      // Determine if the Sr/PWD discount should be applied
      const applyDiscount = applySrPWD[id];
      let totalPrice = orderData.subtotal || 0; // Ensure subtotal has a fallback value
      let sampleDiscountDeduction = 0;
      let pwdSeniorStatus = false;

      // Calculate the discount only if applySrPWD is true and items exist
      if (applyDiscount && orderData.items) {
        pwdSeniorStatus = true;

        // Find the highest-priced item for discount calculation
        let highestPrice = 0;
        orderData.items.forEach((item: any) => {
          if (item.totalPrice > highestPrice) {
            highestPrice = item.totalPrice;
          }
        });

        // Calculate the discount
        sampleDiscountDeduction = highestPrice * 0.2;
        totalPrice -= sampleDiscountDeduction;

        console.log("Original Total Price:", orderData.subtotal);
        console.log("Discounted Amount:", sampleDiscountDeduction);
        console.log("New Total Price:", totalPrice);
      }
      //***********************************************************************

      // Count total items in each category
      let totalFoods = 0;
      let totalDrinks = 0;

      orderData.items.forEach((item: any) => {
        // Log the current item for debugging
        console.log("Item:", item);

        // Check which category the item belongs to
        if (
          item.slug === "maincourse" || // Use the correct casing
          item.slug === "pasta" ||
          item.slug === "pastries" ||
          item.slug === "sandwiches" ||
          item.slug === "snacks"
        ) {
          totalFoods += item.itemQty; // Assuming itemQty holds the quantity of the item
        } else if (item.slug === "drinks") {
          totalDrinks += item.itemQty; // Assuming itemQty holds the quantity of the item
        }
      });

      // Log the total counts to the console
      console.log(`Total Foods: ${totalFoods}`);
      console.log(`Total Drinks: ${totalDrinks}`);

      // Update total foods and drinks sold in salesData collection
      const foodDrinkDocumentId = "foodDrinkSold";
      const foodDrinkDataRef = doc(db, "salesData", foodDrinkDocumentId);

      // Prepare the update data
      const now = new Date();
      const formattedDate = `${
        now.getMonth() + 1
      }/${now.getDate()}/${now.getFullYear()}`; // Format date as MM/DD/YYYY

      // Fetch existing food and drink data
      const foodDrinkDoc = await getDoc(foodDrinkDataRef);
      let existingFoodData = {};
      let existingDrinkData = {};

      if (foodDrinkDoc.exists()) {
        const foodDrinkData = foodDrinkDoc.data();
        existingFoodData = foodDrinkData.Foods?.data || {};
        existingDrinkData = foodDrinkData.Drinks?.data || {};
      }

      // Increment food count for today
      existingFoodData[formattedDate] =
        (existingFoodData[formattedDate] || 0) + totalFoods;

      // Increment drink count for today
      existingDrinkData[formattedDate] =
        (existingDrinkData[formattedDate] || 0) + totalDrinks;

      // Prepare the updated food and drink data
      const updatedFoodDrinkData = {
        Foods: {
          data: existingFoodData,
        },
        Drinks: {
          data: existingDrinkData,
        },
      };

      // Merge the new food and drink data with the existing document
      try {
        await setDoc(foodDrinkDataRef, updatedFoodDrinkData, { merge: true }); // Use merge to avoid overwriting other fields
      } catch (error) {
        console.error("Error updating food and drink data: ", error);
      }

      //***********************************************************************      // Update the order document with new status and totals
      await updateDoc(orderRef, {
        status: "PAID",
        subtotal: totalPrice,
        sampleDiscountDeduction,
        pwdSenior: pwdSeniorStatus,
      });

      // Fetch the user's document and update the totalPaid field
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentTotalPaid = userData.totalPaid || 0;
        const newTotalPaid = currentTotalPaid + totalPrice;

        await updateDoc(userRef, {
          totalPaid: newTotalPaid,
        });
      } else {
        console.error("User  document not found");
      }

      // Update Net Sales in salesData collection
      const salesDocumentId = "salesExpensesToday";
      const salesDataRef = doc(db, "salesData", salesDocumentId);

      // Prepare the update data
      //const now = new Date();
      const formattedDates = `${
        now.getMonth() + 1
      }/${now.getDate()}/${now.getFullYear()}`; // Format date as MM/DD/YYYY

      // Fetch existing Net Sales data
      const salesDoc = await getDoc(salesDataRef);
      let existingNetSales = 0;

      if (salesDoc.exists()) {
        const salesData = salesDoc.data();
        existingNetSales = salesData.NetSales?.data[formattedDates] || 0; // Get existing sales or default to 0
      }

      // Calculate the new total sales for today
      const updatedNetSales = existingNetSales + totalPrice;

      // Prepare the updated sales data
      const salesDataUpdate = {
        NetSales: {
          data: {
            [formattedDate]: updatedNetSales, // Set the updated total sales for today
          },
        },
      };

      // Merge the new sales data with the existing document
      try {
        await setDoc(salesDataRef, salesDataUpdate, { merge: true }); // Use merge to avoid overwriting other fields
      } catch (error) {
        console.error("Error updating sales data: ", error);
      }

      // Update dataAverageOrders collection
      const averageOrdersRef = doc(
        db,
        "dataAverageOrders",
        `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`
      ); // Document name as MM-DD-YYYY

      // Fetch existing average orders data
      const averageOrdersDoc = await getDoc(averageOrdersRef);
      let totalOrdersToday = 0;

      if (averageOrdersDoc.exists()) {
        const averageOrdersData = averageOrdersDoc.data();
        totalOrdersToday = averageOrdersData.totalOrders || 0; // Get existing total orders or default to 0
      }

      // Increment the total Orders for today
      totalOrdersToday += 1;

      // Prepare the updated average orders data
      const averageOrdersUpdate = {
        date: `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`, // Format date as MM/DD/YYYY
        totalOrders: totalOrdersToday, // Set the updated total orders for today
      };

      // Merge the new average orders data with the existing document
      try {
        await setDoc(averageOrdersRef, averageOrdersUpdate, { merge: true }); // Use merge to avoid overwriting other fields
      } catch (error) {
        console.error("Error updating average orders data: ", error);
      }

      // Show confirmation of payment
      setIsPaidVisible(true);
      setTimeout(() => {
        setIsPaidVisible(false);
      }, 750);
    } catch (error) {
      console.error(
        "Error updating status to 'PAID' or updating user totalPaid:",
        error
      );
    }
  };

  const handlePrep = async (id: string) => {
    try {
      await updateDoc(doc(db, "completedOrders", id), {
        status: "PREP",
      });

      setIsMarkAsPrepVisible(true);
      setTimeout(() => {
        setIsMarkAsPrepVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'DONE':", error);
    }
  };

  const handleReady = async (id: string) => {
    try {
      await updateDoc(doc(db, "completedOrders", id), {
        status: "READY",
      });

      setIsMarkAsReadyVisible(true);
      setTimeout(() => {
        setIsMarkAsReadyVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'DONE':", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "completedOrders", id), {
        status: "REJECTED",
      });
      setIsRejectedVisible(true);
      setTimeout(() => {
        setIsRejectedVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'REJECTED':", error);
    }
  };

  const handleDone = async (id: string) => {
    try {
      await updateDoc(doc(db, "completedOrders", id), {
        status: "DONE",
        hasRated: false,
      });

      setIsMarkAsDoneVisible(true);
      setTimeout(() => {
        setIsMarkAsDoneVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'DONE':", error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateDoc(doc(db, "completedOrders", id), {
        status: "CANCELLED",
      });

      setIsCancelVisible(true);
      setTimeout(() => {
        setIsCancelVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'CANCELLED':", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete the document that matches the provided ID
      await deleteDoc(doc(db, "completedOrders", id));

      setIsDeleteVisible(true);
      setTimeout(() => {
        setIsDeleteVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handlePrintDetails = async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, "completedOrders", id));

      if (docSnap.exists()) {
        const order = docSnap.data();

        const doc = new jsPDF();

        // Set font for title, address, and details to 16px, bold, centered
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);

        // Title and address - Centered
        doc.text("fikaställe by fika kafé", 105, 20, null, null, "center");
        doc.text(
          "Brgy. Iba, Silang, Cavite, 4118",
          105,
          30,
          null,
          null,
          "center"
        );

        // Add spacing
        doc.text(`ORDER DETAILS - ${id}`, 105, 50, null, null, "center");

        // Set font for content text to 14px and justified
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Thank you message and order summary at the top
        let combinedText = `Thank you, Mr/Mrs. ${order.userName} (${
          order.user
        }) for your purchase amounting to PHP ${order.subtotal.toFixed(
          2
        )}. Below would detail your whole order:\n\n`;
        combinedText += `Date Ordered: ${order.dateCreated} at ${order.timeCreated}\nTo be served for ${order.selectedOption} - ${order.selectedServeTime}\n`;
        combinedText += `Mode of Payment: ${order.modeOfPayment}\n`;

        // Include promo discount and senior discount info
        if (order.promoDiscounted !== 0) {
          combinedText += `Promo Discounted: PHP ${order.promoDiscounted.toFixed(
            2
          )}\n`;
        }

        combinedText += `Senior Citizen/PWD?: ${
          order.pwdSenior ? "Yes" : "No"
        }`;
        if (order.pwdSenior) {
          combinedText += `\nSenior Citizen/PWD Discount: PHP ${order.sampleDiscountDeduction.toFixed(
            2
          )}\n`;
        }

        combinedText += `\nNumber of Items Ordered: ${order.totalItems}`;

        // Render the summary text first
        let yPosition = 75;
        doc.text(combinedText, 20, yPosition, { maxWidth: 170, align: "left" });
        yPosition += doc.getTextDimensions(combinedText).h + 50; // Adjust yPosition after the summary text

        // Check if the discount applies and find the highest priced item
        if (order.pwdSenior) {
          // Find the highest priced item
          const highestPricedItem = order.items.reduce((maxItem, item) =>
            item.totalPrice > maxItem.totalPrice ? item : maxItem
          );

          // Apply the discount to the highest priced item
          const discountedPrice =
            highestPricedItem.totalPrice - order.sampleDiscountDeduction;

          // Update the price of the item in the order
          highestPricedItem.totalPrice = Math.max(discountedPrice, 0); // Ensure price doesn't go negative
          console.log(
            `Discount applied to ${
              highestPricedItem.productTitle
            }, new price: PHP ${highestPricedItem.totalPrice.toFixed(2)}`
          );

          // Optionally, update the total for the order (if you are recalculating it)
          const newSubtotal = order.items.reduce(
            (total, item) => total + item.totalPrice,
            0
          );
          order.subtotal = newSubtotal;
          combinedText = `New Subtotal (after discount): PHP ${newSubtotal.toFixed(
            2
          )}`;
        }

        // Add product details at the bottom
        doc.text(`Products Ordered:`, 20, yPosition);
        yPosition += 10; // Move down to start printing product details

        // Loop through items and print each one
        order.items.forEach((item) => {
          // Product title, quantity
          const productLine = `${item.productTitle} ${
            item.selectedDrinkSize ? `(${item.selectedDrinkSize})` : ""
          } x${item.itemQty}`;

          // Calculate the x position for the price to be right-aligned
          const productWidth = doc.getTextWidth(productLine);
          const priceX =
            170 - doc.getTextWidth(`PHP ${item.totalPrice.toFixed(2)}`) + 15;

          // Print product line
          doc.text(productLine, 20, yPosition);

          // Print price on the right
          doc.text(`PHP ${item.totalPrice.toFixed(2)}`, priceX, yPosition);

          yPosition += 8; // Move the Y position down

          // Add additional options for drinks
          if (item.slug === "drinks" && item.selectedDrinkSize) {
            doc.text(`- Size: ${item.selectedDrinkSize}`, 25, yPosition);
            yPosition += 6;
          }

          if (
            item.slug === "drinks" &&
            item.additionals &&
            item.additionals.length > 0
          ) {
            item.additionals.forEach((additional) => {
              doc.text(`- Additional: ${additional}`, 25, yPosition);
              yPosition += 6;
            });
          }

          // Add main course option for main courses
          if (item.slug === "maincourse" && item.mainCourseOption) {
            doc.text(
              `- Main Course Option: ${item.mainCourseOption}`,
              25,
              yPosition
            );
            yPosition += 6;
          }

          // Add milk option for any item with milkOption
          if (item.milkOption) {
            doc.text(`- Milk Option: ${item.milkOption}`, 25, yPosition);
            yPosition += 6;
          }

          yPosition += 4; // Space after each product for readability
        });

        // Final print actions
        doc.autoPrint();
        doc.output("dataurlnewwindow");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error handling reservation details:", error);
    }
  };

  useEffect(() => {
    const cookies = Cookies.get(); // Retrieve all cookies

    // Check if specific cookies exist and set the user role accordingly
    if (cookies["admin"]) {
      setUser("admin");
    } else if (cookies["kitchen"]) {
      setUser("kitchen");
    } else if (cookies["bar"]) {
      setUser("bar");
    }

    console.log("User role is set to:", user);
  }, [user]); // Add `userRole` as a dependency to log updates if it changes

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
            justify-center items-start
            lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div
        className={`w-full max-w-[${
          user === "admin" ? "600px" : "1200px"
        }] flex flex-col gap-2`}
      >
        {user === "admin" ? (
          <>
            {/* HEADER */}
            <div className="w-full flex items-center gap-2 justify-between">
              <span className="text-xl sm:text-2xl font-bold text-orange-950">
                Orders
              </span>
              <select
                name=""
                id=""
                className="w-1/2 bg-white border-2 border-gray-100 text-gray-500 shadow-md
          rounded-md text-center h-10 font-bold max-w-28"
                onChange={handleCategoryChange}
              >
                <option value="all">All</option>
                <option value="topay">To Pay</option>
                <option value="paid">Paid</option>
                <option value="prep">Prep</option>
                <option value="ready">Ready</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {/* ORDERS LIST CONTAINER */}
            <div className="w-full lg:max-w-[800px] flex flex-col gap-2 max-h-[720px] overflow-auto pb-2">
              {hasOrder ? (
                userOrders.map((order) => (
                  <div
                    className={`w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white cursor-pointer
                ${
                  orderStatCat === "topay" && order.status !== "TO PAY"
                    ? "hidden"
                    : orderStatCat === "paid" && order.status !== "PAID"
                    ? "hidden"
                    : orderStatCat === "prep" && order.status !== "PREP"
                    ? "hidden"
                    : orderStatCat === "ready" && order.status !== "READY"
                    ? "hidden"
                    : orderStatCat === "done" && order.status !== "DONE"
                    ? "hidden"
                    : "visible"
                }`}
                    key={order.id}
                    onClick={() => toggleOrder(order.id)}
                  >
                    {/* UNOPENED CONTAINER */}
                    <div className="flex items-center justify-between">
                      {/* UNEXPANDED ORDER DETAILS CONTAINER */}
                      <div className="flex flex-col gap-1 w-5/6">
                        {/* HEADERS CONTAINER */}
                        <div className="w-full px-4 flex justify-between items-center text-lg font-bold text-gray-800">
                          <span className="">ID: {order.id}</span>
                          <span>
                            PHP{" "}
                            {order.status === "TO PAY"
                              ? applySrPWD[order.id]
                                ? order.price - order.sampleDiscountDeduction
                                : order.price
                              : order.subtotal}.00
                          </span>
                        </div>
                        {/* SUBHEADER CONTAINER */}
                        <div className="w-full px-4 flex justify-between items-center text-sm font-semibold text-gray-500">
                          {/* DATE AND TIME, TABLE OR PICK UP */}
                          <span>
                            {order.date} - {order.time}, {order.where}
                          </span>
                          {/* STATUS OF PAYMENT */}
                          <span
                            className={`${
                              order.status === "TO PAY"
                                ? "text-red-700"
                                : order.status === "PAID"
                                ? "text-orange-500"
                                : order.status === "PREP"
                                ? "text-yellow-500"
                                : order.status === "READY"
                                ? "text-blue-600"
                                : order.status === "DONE"
                                ? "text-green-700"
                                : "text-red-700"
                            } font-bold`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <span className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center mr-4 cursor-pointer">
                        <i
                          className={`fa ${
                            expandedOrders[order.id]
                              ? "fa-caret-down"
                              : "fa-caret-right"
                          } text-gray-300 text-xs`}
                          aria-hidden="true"
                        ></i>
                      </span>
                    </div>
                    {expandedOrders[order.id] && (
                      <div className="mx-4 my-2 px-4 py-2 rounded-md bg-gray-50 text-gray-400 flex flex-col gap-4">
                        {/* EXPANDED CONTENT */}
                        {/* PAYMENT METHOD */}
                        <div className="font-bold text-sm flex justify-between items-center">
                          <span className="font-semibold">Payment method</span>
                          <span>{order.payment}</span>
                        </div>
                        {/* CARD */}
                        {order.payment === "Card" && (
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">Card Payment Receipt</span>
                          </div>
                        )}
                        {order.payment === "Card" && order.cardIdImg && (
                        <>
                          <div className="w-full flex flex-col gap-1 justify-center items-center">
                            <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                              <Image
                                src={order.cardIdImg}
                                alt="idpic"
                                layout="fill"
                                className="object-cover"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEnlargePicture(true);
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400">Click the picture to enlarge.</p>
                          </div>
                          {enlargePicture && (
                            // ENLARGED IMAGE
                            <div
                              className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center z-20"
                              style={{ background: "rgba(0, 0, 0, 0.85)" }}
                            >
                              <div className="w-full max-w-[620px] aspect-square relative">
                                <div
                                  className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                                  absolute top-[8px] right-[8px] flex justify-center items-center z-10
                                  hover:bg-gray-950 hover:scale-[1.02] duration-200 cursor-pointer"
                                  onClick={() => setEnlargePicture(false)}
                                >
                                  <span className="font-bold">X</span>
                                </div>
                                <Image
                                  src={order.cardIdImg}
                                  alt="idpic"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                        {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                        <div className="font-bold text-sm flex justify-between items-center">
                          <span className="font-semibold">
                            {order.status !== "TO PAY"
                              ? "Senior Citizen / PWD Discount Given?"
                              : "Applied for Senior/PWD?"}
                          </span>
                          <span>{order.pwdSenior ? "Yes" : "No"}</span>
                        </div>

                        {/* SENIOR/PWD DISCOUNT VALUE CONTAINER */}
                        {((order.status === "TO PAY" &&
                          order.pwdSenior &&
                          applySrPWD[order.id]) ||
                          (order.status !== "TO PAY" && order.pwdSenior)) && (
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">
                              Senior Citizen/PWD Discount
                            </span>
                            <span>
                              PHP {order.sampleDiscountDeduction?.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {/* PICTURE OF ID CONTAINER */}
                        {order.pwdSenior && (
                          <>
                            <div className="w-full flex flex-col gap-1 justify-center items-center">
                              <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                                <Image
                                  src={order.idPic}
                                  alt="idpic"
                                  layout="fill"
                                  className="object-cover"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEnlargePicture(true);
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-400">
                                Click the picture to enlarge.
                              </p>
                            </div>
                            {enlargePicture && (
                              // ENLARGED IMAGE
                              <div
                                className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center z-20"
                                style={{ background: "rgba(0, 0, 0, 0.85)" }}
                              >
                                <div className="w-full max-w-[620px] aspect-square relative">
                                  <div
                                    className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                      absolute top-[8px] right-[8px] flex justify-center items-center z-10
                      hover:bg-gray-950 hover:scale-[1.02] duration-200 cursor-pointer"
                                    onClick={() => setEnlargePicture(false)}
                                  >
                                    <span className="font-bold">X</span>
                                  </div>
                                  <Image
                                    src={order.idPic}
                                    alt="idpic"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Apply Sr/PWD Discount Button */}
                        {order.status === "TO PAY" && order.pwdSenior === true && (
                          <div className="w-full flex justify-end">
                            <button
                              className={`h-10 ${
                                applySrPWD[order.id]
                                  ? "bg-red-500 hover:bg-red-400 text-white"
                                  : "bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500"
                              } shadow-md hover:scale-[1.02] duration-200 rounded-md font-bold w-full`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSrPWD(order.id); // Toggle the Sr/PWD discount for this order only
                              }}
                            >
                              {applySrPWD[order.id] ? "Cancel" : "Apply"} Senior/PWD
                              Discount
                            </button>
                          </div>
                        )}
                        {/* PROMO, IF THERE IS ONE */}
                        {(order.promo || order.promo === 0) &&
                          order.promo !== null &&
                          order.promo !== undefined &&
                          order.promo !== 0 && (
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">
                                Promo discount
                              </span>
                              <span>{order.promo}</span>
                            </div>
                          )}
                        {order.items.map((item, index) => {
                          // Find the highest price in the order items
                          const maxPrice = Math.max(
                            ...order.items.map((i) => i.price)
                          );

                          // Check if this is the first item with the highest price
                          const isHighestPriced =
                            item.price === maxPrice &&
                            order.items.findIndex(
                              (i) => i.price === maxPrice
                            ) === index;

                          // Apply discount conditionally based on the order's status and senior discount eligibility
                          const discountAmount =
                            isHighestPriced &&
                            ((order.status === "TO PAY" &&
                              applySrPWD[order.id]) || // Discount if 'TO PAY' and SrPWD is applied
                              (order.status !== "TO PAY" && order.pwdSenior)) // Discount if status is not 'TO PAY' and it's a senior order
                              ? item.price * 0.2
                              : 0;

                          // Calculate discounted price if the discount applies
                          const discountedPrice = isHighestPriced
                            ? item.price - discountAmount
                            : item.price;

                          return (
                            <div
                              className="flex flex-col gap-1"
                              key={item.title}
                            >
                              <hr />
                              {/* ITEM TITLE AND PRICE CONTAINER */}
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  {`${item.qty}x - ${item.title}`}
                                  {isHighestPriced && // Only show discounted label for the highest-priced item
                                    ((order.status === "TO PAY" &&
                                      applySrPWD[order.id]) ||
                                      (order.status !== "TO PAY" &&
                                        order.pwdSenior)) && ( // Apply condition to show discount label
                                      <span className="text-green-600 text-xs ml-2">
                                        (discounted: PHP{" "}
                                        {discountAmount.toFixed(2)})
                                      </span>
                                    )}
                                </span>
                                <span
                                  className={
                                    isHighestPriced && // Highlight the discounted price
                                    ((order.status === "TO PAY" &&
                                      applySrPWD[order.id]) ||
                                      (order.status !== "TO PAY" &&
                                        order.pwdSenior))
                                      ? "text-green-600"
                                      : ""
                                  }
                                >
                                  PHP {discountedPrice.toFixed(2)}
                                </span>
                              </div>
                              {item.tags.map((tag, index) => (
                                <p className="text-xs" key={index}>
                                  -{tag}
                                </p>
                              ))}
                            </div>
                          );
                        })}

                        {/* USERNAME */}
                        <span className="w-full flex flex-col gap-0 text-gray-400 text-xs">
                          <hr className="mb-1" />
                          <span>Order by:</span>
                          <span className="mb-[-2px] mt-2">
                            {order.userName}
                          </span>
                          <span className="font-light">{order.userEmail}</span>
                        </span>

                        {/* CANCEL BUTTON */}
                        <div className="w-full flex items-center gap-1">
                          <button
                            className={` font-bold ${
                              order.status === "TO PAY"
                                ? "bg-orange-500 text-white hover:bg-orange-400 w-2/3"
                                : order.status === "PAID"
                                ? "bg-yellow-500 text-white hover:bg-yellow-400 w-full"
                                : order.status === "PREP"
                                ? "bg-blue-500 text-white hover:bg-blue-400 w-full"
                                : order.status === "READY"
                                ? "bg-green-700 text-white hover:bg-green-600 w-full"
                                : "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 w-full hidden"
                            } shadow-md hover:scale-[1.02] duration-200
                      rounded-md h-10`}
                            onClick={() => {
                              if (order.status === "TO PAY") {
                                handlePaid(order.id);
                              } else if (order.status === "PAID") {
                                handlePrep(order.id);
                              } else if (order.status === "PREP") {
                                handleReady(order.id);
                              } else if (order.status === "READY") {
                                handleDone(order.id);
                              }
                            }}
                          >
                            {order.status === "TO PAY"
                              ? "Mark as Paid"
                              : order.status === "PAID"
                              ? "Mark as Prep"
                              : order.status === "PREP"
                              ? "Mark as Ready"
                              : order.status === "READY"
                              ? "Mark as Done"
                              : "Hide"}
                          </button>
                          <button
                            className={`${
                              order.status !== "TO PAY" && "hidden"
                            } w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                            hover:scale-[1.02] duration-200 hover:bg-red-400`}
                            onClick={() => {
                              if (order.payment === "Card") {
                                handleReject(order.id); // Handle rejection for card payment
                              } else {
                                handleCancel(order.id); // Handle cancellation for other payments
                              }
                            }}
                          >
                            {order.payment === "Card" ? "Reject" : "Cancel"}
                          </button>
                            {order.status === "CANCELLED" || order.status === "REJECTED" && (
                            <button
                              className="w-full font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                                      hover:scale-[1.02] duration-200 hover:bg-red-400"
                              onClick={() => {
                                handleDelete(order.id);
                              }}
                            >
                              Delete
                            </button>
                          )}
                          {order.status === "DONE" && (
                            <div className="flex w-full gap-2">
                              {/* Print Details Button */}
                              <button
                                className="w-1/2 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-blue-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handlePrintDetails(order.id)}
                              >
                                Print Details
                              </button>

                              {/* Delete Button */}
                              <button
                                className="w-1/2 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-red-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handleDelete(order.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // IF WALANG MAIPAKITA
                <div
                  className="w-full h-32 bg-white text-gray-400 font-bold text-xl text-center
                flex items-center justify-center border-2 border-gray-100 shadow-md rounded-md"
                >
                  <span>No orders to display yet.</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* HEADER */}
            { staffStatus === "activated" && (
            <div className="w-full flex items-center gap-2 justify-between">
              <span className="text-xl sm:text-2xl font-bold text-orange-950">
                Orders
              </span>
              <button
                name="btnReverse"
                id="btnReverse"
                className="w-1/2 bg-white border-2 border-gray-100 text-gray-500 shadow-md
          rounded-md text-center h-10 font-bold max-w-36"
                onClick={() => {
                  reversePosition
                    ? setReversePosition(false)
                    : setReversePosition(true);
                }}
              >
                Switch Position
              </button>
            </div>
            )};
            {/* ORDERS LIST CONTAINER */}
            <div
              className={`w-full flex ${
                reversePosition
                  ? "flex-col-reverse md:flex-row-reverse"
                  : "flex-col md:flex-row"
              } gap-2 md:items-start`}
            >
              {staffStatus === "deactivated" ? (
              <div className="flex justify-center items-center h-screen w-full">
                <span className="text-4xl font-bold text-center text-gray-500" style={{ top: '-100px', position: 'relative' }}>
                  Your account is deactivated!
                </span>
              </div>         
              ) : (
              <>
              <div className="w-full lg:max-w-[800px] flex flex-col gap-2 max-h-[720px] overflow-auto pb-2">
                <h1
                  className={`uppercase font-bold text-${
                    user === "bar" ? "blue-600" : "yellow-500"
                  }`}
                >
                  {user === "bar" ? "Ready" : "Prep"}
                </h1>
                {hasOrder ? (
                  userOrders.map((order) => (
                    <div
                      className={`w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white cursor-pointer
                ${
                  user === "bar"
                    ? order.status !== "READY" && "hidden"
                    : order.status !== "PREP" && "hidden"
                }`}
                      key={order.id}
                      onClick={() => toggleOrder(order.id)}
                    >
                      {/* UNOPENED CONTAINER */}
                      <div className="flex items-center justify-between">
                        {/* UNEXPANDED ORDER DETAILS CONTAINER */}
                        <div className="flex flex-col gap-1 w-5/6">
                          {/* HEADERS CONTAINER */}
                          <div className="w-full px-4 flex justify-between items-center text-lg font-bold text-gray-800">
                            <span className="">ID: {order.id}</span>
                            <span>
                              PHP{" "}
                              {order.status === "TO PAY"
                                ? applySrPWD[order.id]
                                  ? order.price - order.sampleDiscountDeduction
                                  : order.price
                                : order.subtotal}.00
                            </span>
                          </div>
                          {/* SUBHEADER CONTAINER */}
                          <div className="w-full px-4 flex justify-between items-center text-sm font-semibold text-gray-500">
                            {/* DATE AND TIME, TABLE OR PICK UP */}
                            <span>
                              {order.date} - {order.time}, {order.where}
                            </span>
                            {/* STATUS OF PAYMENT */}
                            <span
                              className={`${
                                order.status === "TO PAY"
                                  ? "text-red-700"
                                  : order.status === "PAID"
                                  ? "text-orange-500"
                                  : order.status === "PREP"
                                  ? "text-yellow-500"
                                  : order.status === "READY"
                                  ? "text-blue-600"
                                  : "text-green-700"
                              } font-bold`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <span className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center mr-4 cursor-pointer">
                          <i
                            className={`fa ${
                              expandedOrders[order.id]
                                ? "fa-caret-down"
                                : "fa-caret-right"
                            } text-gray-300 text-xs`}
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                      {expandedOrders[order.id] && (
                        <div className="mx-4 my-2 px-4 py-2 rounded-md bg-gray-50 text-gray-400 flex flex-col gap-4">
                          {/* EXPANDED CONTENT */}
                          {/* PAYMENT METHOD */}
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">
                              Payment method
                            </span>
                            <span>{order.payment}</span>
                          </div>
                          {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">
                              {order.status !== "TO PAY"
                                ? "Senior Citizen / PWD Discount Given?"
                                : "Applied for Senior/PWD?"}
                            </span>
                            <span>{order.pwdSenior ? "Yes" : "No"}</span>
                          </div>

                          {/* SENIOR/PWD DISCOUNT VALUE CONTAINER */}
                          {((order.status === "TO PAY" &&
                            order.pwdSenior &&
                            applySrPWD[order.id]) ||
                            (order.status !== "TO PAY" && order.pwdSenior)) && (
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">
                                Senior Citizen/PWD Discount
                              </span>
                              <span>{order.sampleDiscountDeduction}</span>
                            </div>
                          )}
                          {/* PICTURE OF ID CONTAINER */}
                          {order.pwdSenior && (
                            <>
                              <div className="w-full flex flex-col gap-1 justify-center items-center">
                                <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                                  <Image
                                    src={order.idPic}
                                    alt="idpic"
                                    fill
                                    className="object-cover"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEnlargePicture(true);
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-400">
                                  Click the picture to enlarge.
                                </p>
                              </div>
                              {enlargePicture && (
                                // ENLARGED IMAGE
                                <div
                                  className="absolute top-0 left-0 w-full h-[100vh] flex justify-center items-center"
                                  style={{ background: "rgba(0, 0, 0, 0.85)" }}
                                >
                                  <div className="w-full max-w-[620px] aspect-square relative">
                                    <div
                                      className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                      absolute top-[8px] right-[8px] flex justify-center items-center z-10
                      hover:bg-gray-950 hover:scale-[1.02] duration-200"
                                      onClick={() => setEnlargePicture(false)}
                                    >
                                      <span className="font-bold">X</span>
                                    </div>
                                    <Image
                                      src={order.idPic}
                                      alt="idpic"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Apply Sr/PWD Discount Button */}
                          {order.status === "TO PAY" && order.pwdSenior === true && (
                            <div className="w-full flex justify-end">
                              <button
                                className={`h-10 ${
                                  applySrPWD[order.id]
                                    ? "bg-red-500 hover:bg-red-400 text-white"
                                    : "bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500"
                                } shadow-md hover:scale-[1.02] duration-200 rounded-md font-bold w-full`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSrPWD(order.id); // Toggle the Sr/PWD discount for this order only
                                }}
                              >
                                {applySrPWD[order.id] ? "Cancel" : "Apply"}{" "}
                                Senior/PWD Discount
                              </button>
                            </div>
                          )}
                          {/* PROMO, IF THERE IS ONE */}
                          {(order.promo || order.promo === 0) &&
                            order.promo !== null &&
                            order.promo !== undefined &&
                            order.promo !== 0 && (
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  Promo discount
                                </span>
                                <span>{order.promo}</span>
                              </div>
                            )}
                          {order.items.map((item, index) => {
                            // Find the highest price in the order items
                            const maxPrice = Math.max(
                              ...order.items.map((i) => i.price)
                            );

                            // Check if this is the first item with the highest price
                            const isHighestPriced =
                              item.price === maxPrice &&
                              order.items.findIndex(
                                (i) => i.price === maxPrice
                              ) === index;

                            // Apply discount conditionally based on the order's status and senior discount eligibility
                            const discountAmount =
                              isHighestPriced &&
                              ((order.status === "TO PAY" &&
                                applySrPWD[order.id]) || // Discount if 'TO PAY' and SrPWD is applied
                                (order.status !== "TO PAY" && order.pwdSenior)) // Discount if status is not 'TO PAY' and it's a senior order
                                ? item.price * 0.2
                                : 0;

                            // Calculate discounted price if the discount applies
                            const discountedPrice = isHighestPriced
                              ? item.price - discountAmount
                              : item.price;

                            return (
                              <div
                                className="flex flex-col gap-1"
                                key={item.title}
                              >
                                <hr />
                                {/* ITEM TITLE AND PRICE CONTAINER */}
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    {`${item.qty}x - ${item.title}`}
                                    {isHighestPriced && // Only show discounted label for the highest-priced item
                                      ((order.status === "TO PAY" &&
                                        applySrPWD[order.id]) ||
                                        (order.status !== "TO PAY" &&
                                          order.pwdSenior)) && ( // Apply condition to show discount label
                                        <span className="text-green-600 text-xs ml-2">
                                          (discounted: PHP{" "}
                                          {discountAmount.toFixed(2)})
                                        </span>
                                      )}
                                  </span>
                                  <span
                                    className={
                                      isHighestPriced && // Highlight the discounted price
                                      ((order.status === "TO PAY" &&
                                        applySrPWD[order.id]) ||
                                        (order.status !== "TO PAY" &&
                                          order.pwdSenior))
                                        ? "text-green-600"
                                        : ""
                                    }
                                  >
                                    PHP {discountedPrice.toFixed(2)}
                                  </span>
                                </div>
                                {item.tags.map((tag, index) => (
                                  <p className="text-xs" key={index}>
                                    -{tag}
                                  </p>
                                ))}
                              </div>
                            );
                          })}

                          {/* USERNAME */}
                          <span className="w-full flex flex-col gap-0 text-gray-400 text-xs">
                            <hr className="mb-1" />
                            <span>Order by:</span>
                            <span className="mb-[-2px] mt-2">
                              {order.userName}
                            </span>
                            <span className="font-light">
                              {order.userEmail}
                            </span>
                          </span>

                          {/* CANCEL BUTTON */}
                          <div className="w-full flex items-center gap-1">
                            <button
                              className={` font-bold ${
                                order.status === "TO PAY"
                                  ? "bg-orange-500 text-white hover:bg-orange-400 w-2/3"
                                  : order.status === "PAID"
                                  ? "bg-yellow-500 text-white hover:bg-yellow-400 w-full"
                                  : order.status === "PREP"
                                  ? "bg-blue-500 text-white hover:bg-blue-400 w-full"
                                  : order.status === "READY"
                                  ? "bg-green-700 text-white hover:bg-green-600 w-full"
                                  : "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 w-full hidden"
                              } shadow-md hover:scale-[1.02] duration-200
                      rounded-md h-10`}
                              onClick={() => {
                                if (order.status === "TO PAY") {
                                  handlePaid(order.id);
                                } else if (order.status === "PAID") {
                                  handlePrep(order.id);
                                } else if (order.status === "PREP") {
                                  handleReady(order.id);
                                } else if (order.status === "READY") {
                                  handleDone(order.id);
                                }
                              }}
                            >
                              {order.status === "TO PAY"
                                ? "Mark as Paid"
                                : order.status === "PAID"
                                ? "Mark as Prep"
                                : order.status === "PREP"
                                ? "Mark as Ready"
                                : order.status === "READY"
                                ? "Mark as Done"
                                : "Hide"}
                            </button>
                            <button
                              className={`${
                                order.status !== "TO PAY" && "hidden"
                              } w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                            hover:scale-[1.02] duration-200 hover:bg-red-400`}
                              onClick={() => {
                                handleCancel(order.id);
                              }}
                            >
                              Cancel
                            </button>
                            {order.status === "CANCELLED" && (
                              <button
                                className="w-full font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                                      hover:scale-[1.02] duration-200 hover:bg-red-400"
                                onClick={() => {
                                  handleDelete(order.id);
                                }}
                              >
                                Delete
                              </button>
                            )}
                            {order.status === "DONE" && (
                              <div className="flex w-full gap-2">
                                {/* Print Details Button */}
                                <button
                                  className="w-1/2 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-blue-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handlePrintDetails(order.id)}
                                >
                                  Print Details
                                </button>

                                {/* Delete Button */}
                                <button
                                  className="w-1/2 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-red-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handleDelete(order.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // IF WALANG MAIPAKITA
                  <div
                    className="w-full h-32 bg-white text-gray-400 font-bold text-xl text-center
                  flex items-center justify-center border-2 border-gray-100 shadow-md rounded-md"
                  >
                    <span>No orders to display yet.</span>
                  </div>
                )}
              
              </div>
              <div className="w-full lg:max-w-[800px] flex flex-col gap-2 max-h-[720px] overflow-auto pb-2">
                <h1
                  className={`uppercase font-bold text-${
                    user === "bar" ? "red-700" : "orange-500"
                  }`}
                >
                  {user === "bar" ? "To Pay" : "Paid"}
                </h1>
                {hasOrder ? (
                  userOrders.map((order) => (
                    <div
                      className={`w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white cursor-pointer
                ${
                  user === "bar"
                    ? order.status !== "TO PAY" && "hidden"
                    : order.status !== "PAID" && "hidden"
                }`}
                      key={order.id}
                      onClick={() => toggleOrder(order.id)}
                    >
                      {/* UNOPENED CONTAINER */}
                      <div className="flex items-center justify-between">
                        {/* UNEXPANDED ORDER DETAILS CONTAINER */}
                        <div className="flex flex-col gap-1 w-5/6">
                          {/* HEADERS CONTAINER */}
                          <div className="w-full px-4 flex justify-between items-center text-lg font-bold text-gray-800">
                            <span className="">ID: {order.id}</span>
                            <span>
                              PHP{" "}
                              {order.status === "TO PAY"
                                ? applySrPWD[order.id]
                                  ? order.price - order.sampleDiscountDeduction
                                  : order.price
                                : order.subtotal}.00
                            </span>
                          </div>
                          {/* SUBHEADER CONTAINER */}
                          <div className="w-full px-4 flex justify-between items-center text-sm font-semibold text-gray-500">
                            {/* DATE AND TIME, TABLE OR PICK UP */}
                            <span>
                              {order.date} - {order.time}, {order.where}
                            </span>
                            {/* STATUS OF PAYMENT */}
                            <span
                              className={`${
                                order.status === "TO PAY"
                                  ? "text-red-700"
                                  : order.status === "PAID"
                                  ? "text-orange-500"
                                  : order.status === "PREP"
                                  ? "text-yellow-500"
                                  : order.status === "READY"
                                  ? "text-blue-600"
                                  : "text-green-700"
                              } font-bold`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <span className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center mr-4 cursor-pointer">
                          <i
                            className={`fa ${
                              expandedOrders[order.id]
                                ? "fa-caret-down"
                                : "fa-caret-right"
                            } text-gray-300 text-xs`}
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                      {expandedOrders[order.id] && (
                        <div className="mx-4 my-2 px-4 py-2 rounded-md bg-gray-50 text-gray-400 flex flex-col gap-4">
                          {/* EXPANDED CONTENT */}
                          {/* PAYMENT METHOD */}
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">
                              Payment method
                            </span>
                            <span>{order.payment}</span>
                          </div>
                          {/* CARD */}
                        {order.payment === "Card" && (
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">Card Payment Receipt</span>
                          </div>
                        )}
                        {order.payment === "Card" && order.cardIdImg && (
                        <>
                          <div className="w-full flex flex-col gap-1 justify-center items-center">
                            <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                              <Image
                                src={order.cardIdImg}
                                alt="idpic"
                                layout="fill"
                                className="object-cover"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEnlargePicture(true);
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400">Click the picture to enlarge.</p>
                          </div>
                          {enlargePicture && (
                            // ENLARGED IMAGE
                            <div
                              className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center z-20"
                              style={{ background: "rgba(0, 0, 0, 0.85)" }}
                            >
                              <div className="w-full max-w-[620px] aspect-square relative">
                                <div
                                  className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                                  absolute top-[8px] right-[8px] flex justify-center items-center z-10
                                  hover:bg-gray-950 hover:scale-[1.02] duration-200 cursor-pointer"
                                  onClick={() => setEnlargePicture(false)}
                                >
                                  <span className="font-bold">X</span>
                                </div>
                                <Image
                                  src={order.cardIdImg}
                                  alt="idpic"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                          {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">
                              {order.status !== "TO PAY"
                                ? "Senior Citizen / PWD Discount Given?"
                                : "Applied for Senior/PWD?"}
                            </span>
                            <span>{order.pwdSenior ? "Yes" : "No"}</span>
                          </div>

                          {/* SENIOR/PWD DISCOUNT VALUE CONTAINER */}
                          {((order.status === "TO PAY" &&
                            order.pwdSenior &&
                            applySrPWD[order.id]) ||
                            (order.status !== "TO PAY" && order.pwdSenior)) && (
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">
                                Senior Citizen/PWD Discount
                              </span>
                              <span>{order.sampleDiscountDeduction}</span>
                            </div>
                          )}
                          {/* PICTURE OF ID CONTAINER */}
                          {order.pwdSenior && (
                            <>
                              <div className="w-full flex flex-col gap-1 justify-center items-center">
                                <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                                  <Image
                                    src={order.idPic}
                                    alt="idpic"
                                    fill
                                    className="object-cover"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEnlargePicture(true);
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-400">
                                  Click the picture to enlarge.
                                </p>
                              </div>
                              {enlargePicture && (
                                // ENLARGED IMAGE
                                <div
                                  className="absolute top-0 left-0 w-full h-[100vh] flex justify-center items-center"
                                  style={{ background: "rgba(0, 0, 0, 0.85)" }}
                                >
                                  <div className="w-full max-w-[620px] aspect-square relative">
                                    <div
                                      className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                      absolute top-[8px] right-[8px] flex justify-center items-center z-10
                      hover:bg-gray-950 hover:scale-[1.02] duration-200"
                                      onClick={() => setEnlargePicture(false)}
                                    >
                                      <span className="font-bold">X</span>
                                    </div>
                                    <Image
                                      src={order.idPic}
                                      alt="idpic"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Apply Sr/PWD Discount Button */}
                          {order.status === "TO PAY" && order.pwdSenior === true && (
                            <div className="w-full flex justify-end">
                              <button
                                className={`h-10 ${
                                  applySrPWD[order.id]
                                    ? "bg-red-500 hover:bg-red-400 text-white"
                                    : "bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500"
                                } shadow-md hover:scale-[1.02] duration-200 rounded-md font-bold w-full`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSrPWD(order.id); // Toggle the Sr/PWD discount for this order only
                                }}
                              >
                                {applySrPWD[order.id] ? "Cancel" : "Apply"}{" "}
                                Senior/PWD Discount
                              </button>
                            </div>
                          )}
                          {/* PROMO, IF THERE IS ONE */}
                          {(order.promo || order.promo === 0) &&
                            order.promo !== null &&
                            order.promo !== undefined &&
                            order.promo !== 0 && (
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  Promo discount
                                </span>
                                <span>{order.promo}</span>
                              </div>
                            )}
                          {order.items.map((item, index) => {
                            // Find the highest price in the order items
                            const maxPrice = Math.max(
                              ...order.items.map((i) => i.price)
                            );

                            // Check if this is the first item with the highest price
                            const isHighestPriced =
                              item.price === maxPrice &&
                              order.items.findIndex(
                                (i) => i.price === maxPrice
                              ) === index;

                            // Apply discount conditionally based on the order's status and senior discount eligibility
                            const discountAmount =
                              isHighestPriced &&
                              ((order.status === "TO PAY" &&
                                applySrPWD[order.id]) || // Discount if 'TO PAY' and SrPWD is applied
                                (order.status !== "TO PAY" && order.pwdSenior)) // Discount if status is not 'TO PAY' and it's a senior order
                                ? item.price * 0.2
                                : 0;

                            // Calculate discounted price if the discount applies
                            const discountedPrice = isHighestPriced
                              ? item.price - discountAmount
                              : item.price;

                            return (
                              <div
                                className="flex flex-col gap-1"
                                key={item.title}
                              >
                                <hr />
                                {/* ITEM TITLE AND PRICE CONTAINER */}
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    {`${item.qty}x - ${item.title}`}
                                    {isHighestPriced && // Only show discounted label for the highest-priced item
                                      ((order.status === "TO PAY" &&
                                        applySrPWD[order.id]) ||
                                        (order.status !== "TO PAY" &&
                                          order.pwdSenior)) && ( // Apply condition to show discount label
                                        <span className="text-green-600 text-xs ml-2">
                                          (discounted: PHP{" "}
                                          {discountAmount.toFixed(2)})
                                        </span>
                                      )}
                                  </span>
                                  <span
                                    className={
                                      isHighestPriced && // Highlight the discounted price
                                      ((order.status === "TO PAY" &&
                                        applySrPWD[order.id]) ||
                                        (order.status !== "TO PAY" &&
                                          order.pwdSenior))
                                        ? "text-green-600"
                                        : ""
                                    }
                                  >
                                    PHP {discountedPrice.toFixed(2)}
                                  </span>
                                </div>
                                {item.tags.map((tag, index) => (
                                  <p className="text-xs" key={index}>
                                    -{tag}
                                  </p>
                                ))}
                              </div>
                            );
                          })}
                          {/* USERNAME */}
                          <span className="w-full flex flex-col gap-0 text-gray-400 text-xs">
                            <hr className="mb-1" />
                            <span>Order by:</span>
                            <span className="mb-[-2px] mt-2">
                              {order.userName}
                            </span>
                            <span className="font-light">
                              {order.userEmail}
                            </span>
                          </span>

                          {/* CANCEL BUTTON */}
                          <div className="w-full flex items-center gap-1">
                            <button
                              className={` font-bold ${
                                order.status === "TO PAY"
                                  ? "bg-orange-500 text-white hover:bg-orange-400 w-2/3"
                                  : order.status === "PAID"
                                  ? "bg-yellow-500 text-white hover:bg-yellow-400 w-full"
                                  : order.status === "PREP"
                                  ? "bg-blue-500 text-white hover:bg-blue-400 w-full"
                                  : order.status === "READY"
                                  ? "bg-green-700 text-white hover:bg-green-600 w-full"
                                  : "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 w-full hidden"
                              } shadow-md hover:scale-[1.02] duration-200
                      rounded-md h-10`}
                              onClick={() => {
                                if (order.status === "TO PAY") {
                                  handlePaid(order.id);
                                } else if (order.status === "PAID") {
                                  handlePrep(order.id);
                                } else if (order.status === "PREP") {
                                  handleReady(order.id);
                                } else if (order.status === "READY") {
                                  handleDone(order.id);
                                }
                              }}
                            >
                              {order.status === "TO PAY"
                                ? "Mark as Paid"
                                : order.status === "PAID"
                                ? "Mark as Prep"
                                : order.status === "PREP"
                                ? "Mark as Ready"
                                : order.status === "READY"
                                ? "Mark as Done"
                                : "Hide"}
                            </button>
                            <button
                              className={`${
                                order.status !== "TO PAY" && "hidden"
                              } w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                            hover:scale-[1.02] duration-200 hover:bg-red-400`}
                              onClick={() => {
                                handleCancel(order.id);
                              }}
                            >
                              Cancel
                            </button>
                            {order.status === "CANCELLED" && (
                              <button
                                className="w-full font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                                      hover:scale-[1.02] duration-200 hover:bg-red-400"
                                onClick={() => {
                                  handleDelete(order.id);
                                }}
                              >
                                Delete
                              </button>
                            )}
                            {order.status === "DONE" && (
                              <div className="flex w-full gap-2">
                                {/* Print Details Button */}
                                <button
                                  className="w-1/2 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-blue-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handlePrintDetails(order.id)}
                                >
                                  Print Details
                                </button>

                                {/* Delete Button */}
                                <button
                                  className="w-1/2 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-red-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handleDelete(order.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // IF WALANG MAIPAKITA
                  <div
                    className="w-full h-32 bg-white text-gray-400 font-bold text-xl text-center
                  flex items-center justify-center border-2 border-gray-100 shadow-md rounded-md"
                  >
                    <span>No orders to display yet.</span>
                  </div>
                )}
              </div>
              </>
              )}
            </div>
          </>
        )}
        {confirmPopup && (
          <div
            className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-center justify-center"
            style={{ background: "rgba(0, 0, 0, 0.1)" }}
          >
            <div
              ref={formRef}
              className="py-4 px-6 w-64 text-center bg-white shadow-md rounded-md"
            >
              <i
                className="fa fa-exclamation-triangle text-5xl text-orange-900 mb-2"
                aria-hidden="true"
              ></i>
              <h1 className="font-bold text-2xl text-orange-950">
                Cancel Order?
              </h1>
              <span className="text-md text-gray-700">
                Are you sure you want to cancel this order?
              </span>
              <div className="flex gap-2 items-center justify-center mt-4">
                <button className="w-24 py-2 rounded-md shadow-md bg-white font-bold border-2 border-gray-50 text-gray-500">
                  Yes
                </button>
                <button
                  onClick={() => setConfirmPopup(false)}
                  className="w-24 py-2 rounded-md shadow-md bg-orange-950 border-2 border-orange-950 font-bold text-white"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MARKED AS DONE POP UP */}
        {isMarkAsDoneVisible && <CheckoutPopup message="Marked as Done!" />}

        {/* PAID POP UP */}
        {isPaidVisible && <CheckoutPopup message="Marked as Paid!" />}

        {/* CANCEL POP UP */}
        {isCancelVisible && <CheckoutPopup message="Order Canceled!" />}

        {/* PREPARING POP UP */}
        {isMarkAsPrepVisible && (
          <CheckoutPopup message="Marked as Preparing!" />
        )}

        {/* READY POP UP */}
        {isMarkAsReadyVisible && <CheckoutPopup message="Marked as Ready!" />}

        {/* DELETE POP UP */}
        {isDeleteVisible && <CheckoutPopup message="Order Deleted!" />}

        {/* REJECT POP UP */}
        {isRejectedVisible && <CheckoutPopup message="Order Rejected!" />}
      </div>
    </div>
  );
};

export default AdminAndStaffOrdersPage;
