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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// #region Sample Data
type Item = {
  productTitle: string;
  price: number;
  itemQty: number;
  note?: string;
  selectedDrinkSize?: string;
  slug: string;
  id: string;
  totalPrice: number;
  additionals?: string[];
  mainCourseOption?: string;
  milkOption?: string;
};

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
  items: {
    isPartiallyServed: boolean;
    title: string;
    price: number;
    qty: number;
    tags: string[];
  }[];
  id: string;
  pwdSenior: boolean;
  idPic?: string;
  pwdSeniorDiscountApplied?: boolean;
  sampleDiscountDeduction?: number;
  slug: string;
  subtotal: number;
  cardIdImg?: string;
};

interface OrderItem {
  productTitle: string;
  totalPrice: number;
  // Add any other properties that an item might have
}
// #endregion

const AdminAndStaffOrdersPage = () => {
  const [reversePosition, setReversePosition] = useState(false);
  const [orderStatCat, setOrderStatCat] = useState<string>("ALL");
  const [enlargePicture, setEnlargePicture] = useState(false);
  const [cardIdImageEnlarge, setCardIdImageEnlarge] = useState(false);
  const [idPicEnlarge, setIdPicEnlarge] = useState(false);
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

  const router = useRouter(); // Initialize useRouter
  const [staffStatus, setStaffStatus] = useState<
    "activated" | "deactivated" | null
  >(null);

  const [selectedDate, setSelectedDate] = useState<string>(""); // State to store the selected date
  const [filterOption, setFilterOption] = useState<string>("today"); // State for filter option
  const [searchId, setSearchId] = useState<string>(""); // State to store the search ID

  const [isReady, setIsReady] = useState<{ [key: string]: boolean }>({}); // State to track if the item is ready
  const [isPartiallyServed, setIsPartiallyServed] = useState<{
    [key: string]: boolean;
  }>({});

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
        : value === "served"
        ? "SERVED"
        : value === "refund"
        ? "REFUNDED"
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
      let existingFoodData: { [key: string]: number } = {};
      let existingDrinkData: { [key: string]: number } = {};

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
      console.error("Error updating status to 'SERVED':", error);
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
      console.error("Error updating status to 'SERVED':", error);
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
        status: "SERVED",
        hasRated: false,
      });

      setIsMarkAsDoneVisible(true);
      setTimeout(() => {
        setIsMarkAsDoneVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'SERVED':", error);
    }
  };

  const onReserveClick = (id: string, orderDate: string, price: number) => {
    handleRefund(id, orderDate, price);
  };

  const handleRefund = async (id: string, orderDate: string, price: number) => {
    try {
      // Fetch the order document to get orderData
      const orderRef = doc(db, "completedOrders", id);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        console.error("Order not found");
        return;
      }

      const orderData = orderDoc.data(); // Get the order data from the document
      const userId = orderData.user; // Retrieve the user associated with the order

      // Deduct from the user's totalPaid field
      const userRef = doc(db, "users", userId); // Reference to the user's document
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentTotalPaid = userData.totalPaid || 0;
        const newTotalPaid = Math.max(currentTotalPaid - price, 0); // Ensure totalPaid doesn't go negative

        await updateDoc(userRef, {
          totalPaid: newTotalPaid,
        });
      } else {
        console.error("User  document not found");
      }

      // Log the order date and price for debugging
      console.log("Order Date:", orderDate);
      console.log("Price:", price);

      // Fetch existing Net Sales data
      const salesDocumentId = "salesExpensesToday";
      const salesDataRef = doc(db, "salesData", salesDocumentId);

      const salesDoc = await getDoc(salesDataRef);

      if (!salesDoc.exists()) {
        console.error("Sales data not found");
        return;
      }

      const salesData = salesDoc.data();
      const netSalesData = salesData.NetSales.data; // Access the NetSales data map

      // Normalize the orderDate to ensure it matches the sales date format
      const normalizedOrderDate = new Date(orderDate).toLocaleDateString(
        "en-US"
      ); // Adjust as necessary

      console.log("Available Sales Dates:", Object.keys(netSalesData)); // Log available dates in sales data

      // Check if the normalized order date exists in the sales data
      if (netSalesData[normalizedOrderDate]) {
        const existingNetSales = netSalesData[normalizedOrderDate]; // Get existing sales for that date
        const updatedNetSales = existingNetSales - price; // Subtract the refund amount

        // Prepare the updated sales data
        const updatedSalesData = {
          ...salesData.NetSales,
          data: {
            ...netSalesData,
            [normalizedOrderDate]: updatedNetSales, // Update the specific date
          },
        };

        // Update the sales data in Firestore
        try {
          await setDoc(
            salesDataRef,
            {
              ...salesData,
              NetSales: updatedSalesData, // Update NetSales with the modified data
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Error updating sales data: ", error);
        }

        // Update the order status to 'REFUNDED'
        await updateDoc(doc(db, "completedOrders", id), {
          status: "REFUNDED",
          hasRated: false,
        });
        ///////////////
        // Count total items in each category for subtraction
        let totalFoods = 0;
        let totalDrinks = 0;

        orderData.items.forEach((item: any) => {
          // Log the current item for debugging
          console.log("Item:", item);

          // Check which category the item belongs to
          if (
            item.slug === "maincourse" ||
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
        console.log(`Total Foods to subtract: ${totalFoods}`);
        console.log(`Total Drinks to subtract: ${totalDrinks}`);

        // Update total foods and drinks sold in salesData collection
        const foodDrinkDocumentId = "foodDrinkSold";
        const foodDrinkDataRef = doc(db, "salesData", foodDrinkDocumentId);

        // Prepare the update data using the provided orderDate
        const formattedDate = `${new Date(orderDate).getMonth() + 1}/${new Date(
          orderDate
        ).getDate()}/${new Date(orderDate).getFullYear()}`; // Format date as MM/DD/YYYY

        // Fetch existing food and drink data
        const foodDrinkDoc = await getDoc(foodDrinkDataRef);
        let existingFoodData: { [key: string]: number } = {};
        let existingDrinkData: { [key: string]: number } = {};

        if (foodDrinkDoc.exists()) {
          const foodDrinkData = foodDrinkDoc.data();
          existingFoodData = foodDrinkData.Foods?.data || {};
          existingDrinkData = foodDrinkData.Drinks?.data || {};
        }

        // Decrement food count for the specified date
        existingFoodData[formattedDate] =
          (existingFoodData[formattedDate] || 0) - totalFoods;

        // Decrement drink count for the specified date
        existingDrinkData[formattedDate] =
          (existingDrinkData[formattedDate] || 0) - totalDrinks;

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

        //....
        // Update dataAverageOrders collection using the provided orderDate
        const averageOrdersRef = doc(
          db,
          "dataAverageOrders",
          `${new Date(orderDate).getMonth() + 1}-${new Date(
            orderDate
          ).getDate()}-${new Date(orderDate).getFullYear()}`
        ); // Document name as MM-DD-YYYY

        // Fetch existing average orders data
        const averageOrdersDoc = await getDoc(averageOrdersRef);

        // Check if the document exists
        if (averageOrdersDoc.exists()) {
          const averageOrdersData = averageOrdersDoc.data();
          let totalOrdersToday = averageOrdersData.totalOrders || 0; // Get existing total orders or default to 0

          // Subtract 1 from the total Orders for the specific date since this is a refund
          totalOrdersToday = Math.max(totalOrdersToday - 1, 0); // Ensure it does not go below 0

          // Prepare the updated average orders data
          const averageOrdersUpdate = {
            date: `${new Date(orderDate).getMonth() + 1}/${new Date(
              orderDate
            ).getDate()}/${new Date(orderDate).getFullYear()}`, // Format date as MM/DD/YYYY
            totalOrders: totalOrdersToday, // Set the updated total orders for the specific date
          };

          // Merge the new average orders data with the existing document
          try {
            await setDoc(averageOrdersRef, averageOrdersUpdate, {
              merge: true,
            }); // Use merge to avoid overwriting other fields
          } catch (error) {
            console.error("Error updating average orders data: ", error);
          }
        } else {
          console.error(
            "Average orders document not found for the specified date."
          );
        }
        // Show confirmation of refund
        console.log("Refund processed successfully.");
      } else {
        console.error("Order date not found in sales data");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
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
        doc.text("fikaställe by fika kafé", 105, 20, { align: "center" });
        doc.text("Brgy. Iba, Silang, Cavite, 4118", 105, 30, {
          align: "center",
        });

        // Add spacing
        doc.text("ORDER DETAILS", 105, 50, { align: "center" });

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
          const highestPricedItem = order.items.reduce(
            (maxItem: OrderItem, item: OrderItem) =>
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
            (total: number, item: OrderItem) => total + item.totalPrice,
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
        order.items.forEach((item: Item) => {
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
    // Get all cookies as an array
    const cookies = document.cookie
      ? document.cookie.split(";").map((cookie) => cookie.trim())
      : [];

    // Check if no cookies exist
    if (cookies.length === 0) {
      // Redirect if no cookies exist
      router.push("/");
      return;
    }

    // Check if the 'user' cookie exists
    const userCookie = cookies.find((cookie) => cookie.startsWith("user="));

    if (userCookie) {
      // Redirect if the 'user' cookie exists
      router.push("/");
    }
  }, [router]);

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

  useEffect(() => {
    console.log("useEffect triggered"); // Log when the useEffect runs

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEmail = user.email;
        console.log("User logged in:", userEmail);
        setEmail(email); // Set the email state

        if (userEmail) {
          // Fetch the staff document from Firestore
          const staffDocRef = doc(db, "staff", userEmail); // Document ID is the email
          const staffDocSnap = await getDoc(staffDocRef);

          if (staffDocSnap.exists()) {
            const data = staffDocSnap.data();
            console.log("Staff document data:", data);

            // Check and update the staffStatus
            if (data.staffStatus === "activated") {
              setStaffStatus("activated");
              console.log("Staff status set to: activated");
            } else if (data.staffStatus === "deactivated") {
              setStaffStatus("deactivated");
              console.log("Staff status set to: deactivated");
            }
          } else {
            console.log("No staff document found for this user.");
            setStaffStatus(null); // Reset if no document exists
          }
        }
      } else {
        console.log("No user logged in");
        setEmail(null);
        setStaffStatus(null); // Reset states if user is logged out
      }
    });

    // Clean up the listener on component unmount
    return () => {
      console.log("Cleaning up listener");
      unsubscribe();
    };
  }, [auth, email]); // Dependencies

  // Fetch orders on component mount and when `orderStatCat` changes
  useEffect(() => {
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

            const items = data.items.map((item: Item) => {
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
              (total: number, item: { price: number }) => total + item.price,
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

          const convertTo24HourFormat = (timeStr: string) => {
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

    fetchCompletedOrders();
  }, [orderStatCat, applySrPWD]);

  // Set the default date to today when the component mounts
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format to YYYY-MM-DD
    setSelectedDate(formattedDate); // Set the selected date to today
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to show all records
  const showAllRecords = () => {
    setSearchId(""); // Reset search ID
    setSelectedDate(""); // Reset selected date (or set to today's date if preferred)
  };

  // Function to handle filter option change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterOption(value);

    if (value === "today") {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // Format to YYYY-MM-DD
      setSelectedDate(formattedDate); // Set the selected date to today
    } else {
      setSelectedDate(""); // Reset date if "Show All Records" is selected
    }
  };

  //#region PAGES CODE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = 5;
  const pagesToShow = 5;

  const filteredOrders = userOrders.filter((order) => {
    const matchesId = order.id.toLowerCase().includes(searchId.toLowerCase());

    // Create date objects for comparison
    const orderDate = new Date(order.date);
    const selectedDateObj = new Date(selectedDate);

    // Compare only the date parts (year, month, day)
    const matchesDate = selectedDate
      ? orderDate.getFullYear() === selectedDateObj.getFullYear() &&
        orderDate.getMonth() === selectedDateObj.getMonth() &&
        orderDate.getDate() === selectedDateObj.getDate()
      : true; // If no date is selected, include all orders

    return matchesId && matchesDate; // Combine both filters
  });

  // Calculate total pages based on filtered orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Get current page orders
  const currentOrders = userOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const visiblePages = Array.from(
    { length: Math.min(pagesToShow, totalPages - pageWindowStart + 1) },
    (_, index) => pageWindowStart + index
  );

  // Handle page change
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);

    // Adjust the visible page numbers if necessary
    if (pageNumber >= pageWindowStart + pagesToShow) {
      setPageWindowStart(pageWindowStart + 1);
    } else if (pageNumber < pageWindowStart) {
      setPageWindowStart(pageWindowStart - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);

      // Adjust page window start for "Next"
      if (currentPage + 1 >= pageWindowStart + pagesToShow) {
        setPageWindowStart(pageWindowStart + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);

      // Adjust page window start for "Previous"
      if (currentPage - 1 < pageWindowStart) {
        setPageWindowStart(pageWindowStart - 1);
      }
    }
  };
  const updateIsReadyField = async (
    docID: string,
    itemIndex: number,
    isReady: boolean
  ) => {
    const orderRef = doc(db, "completedOrders", docID);

    try {
      // Get the current document data
      const docSnap = await getDoc(orderRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update the isReady field for the specific item
        data.items[itemIndex].isReady = isReady;
        // Update the document with the new data
        await setDoc(orderRef, data, { merge: true });
      } else {
        console.log("Document not found");
      }
    } catch (error) {
      console.error("Error updating isReady field: ", error);
    }
  };

  const updateIsPartiallyServedField = async (
    docID: string,
    itemIndex: number,
    isPartiallyServed: boolean
  ) => {
    const orderRef = doc(db, "completedOrders", docID);

    try {
      // Get the current document data
      const docSnap = await getDoc(orderRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update the isPartiallyServed field for the specific item
        data.items[itemIndex].isPartiallyServed = isPartiallyServed;
        // Update the document with the new data
        await setDoc(orderRef, data, { merge: true });
      } else {
        console.log("Document not found");
      }
    } catch (error) {
      console.error("Error updating isPartiallyServed field: ", error);
    }
  };

  //#endregion

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
            <div className="w-full flex flex-col items-end mb-4">
              <div className="w-full flex gap-4 items-center">
                <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                <span className="text-2xl text-center font-bold text-orange-900">
                  Orders
                </span>
                <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
              </div>

              <div className="flex flex-col md:flex-row items-center w-full justify-between gap-2">
                {/* Search ID Input */}
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Enter ID"
                    className="bg-white border-2 border-gray-100 text-gray-500 shadow-md rounded-md h-10 font-bold px-2 w-full md:w-32" // Responsive width
                    onChange={(e) => setSearchId(e.target.value)} // Update state on input change
                  />
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="date"
                    className="bg-white border-2 border-gray-100 text-gray-500 shadow-md rounded-md h-10 font-bold px-2 w-full md:w-32" // Responsive width
                    onChange={(e) => setSelectedDate(e.target.value)} // Update state on date change
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2 flex-1">
                  <select
                    className="bg-white border-2 border-gray-100 text-gray-500 shadow-md rounded-md h-10 font-bold px-2 w-full md:w-48" // Responsive width
                    value={filterOption}
                    onChange={handleFilterChange} // Handle filter option change
                  >
                    <option value="all">Show All Records</option>
                    <option value="today">Today</option>
                  </select>
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2 flex-1">
                  <select
                    name=""
                    id=""
                    className="bg-white border-2 border-gray-100 text-gray-500 shadow-md rounded-md h-10 font-bold px-2 w-full md:w-32" // Responsive width
                    onChange={handleCategoryChange}
                  >
                    <option value="all">All</option>
                    <option value="topay">To Pay</option>
                    <option value="paid">Paid</option>
                    <option value="prep">Prep</option>
                    <option value="ready">Ready</option>
                    <option value="served">Served</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                    <option value="refund">Refunded</option>
                  </select>
                </div>
              </div>
            </div>
            {/* ORDERS LIST CONTAINER */}
            <div className="w-full lg:max-w-[800px] flex flex-col gap-2 max-h-[720px] overflow-auto pb-2">
              {filterOption === "today" && filteredOrders.length === 0 ? (
                // Display message when "today" is selected and there are no orders
                <div
                  className="w-full h-32 bg-white text-gray-400 font-bold text-xl text-center
      flex items-center justify-center border-2 border-gray-100 shadow-md rounded-md"
                >
                  <span>No orders placed yet.</span>
                </div>
              ) : hasOrder ? (
                <>
                  {filteredOrders.map((order) => (
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
                      : orderStatCat === "served" && order.status !== "SERVED"
                      ? "hidden"
                      : orderStatCat === "refund" && order.status !== "REFUNDED"
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
                          <div className="w-full px-4 flex justify-between items-center">
                            <span className="font-bold text-orange-900">
                              ID: {order.id}
                            </span>
                            <span className="bg-orange-300 text-white px-3 py-0.5 rounded-full text-xs sm:text-sm">
                              PHP{" "}
                              {
                                order.status === "TO PAY" // If order is "TO PAY"
                                  ? applySrPWD[order.id] // If PWD is applied for this order
                                    ? // Apply PWD after promo has been subtracted
                                      Number(
                                        order.price -
                                          (order.sampleDiscountDeduction || 0) // Apply PWD discount (20%)
                                      ).toFixed(2)
                                    : // If PWD is not applied, subtract promo if available
                                    order.promo && order.promo > 0
                                    ? // If promo exists, subtract promo from subtotal (but do it once, no double subtraction)
                                      (
                                        order.subtotal -
                                        (order.promo - order.promo)
                                      ).toFixed(2) // Subtract promo from subtotal
                                    : order.subtotal.toFixed(2) // If no promo, show original subtotal
                                  : (order.subtotal ?? 0).toFixed(2) // If not "TO PAY", show the subtotal or 0 if undefined
                              }
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
                                  : order.status === "SERVED"
                                  ? "text-green-700"
                                  : order.status === "REFUNDED"
                                  ? "text-black-700"
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
                          {/* PAYMENT METHOD - Only show if status is not "PAID" or "PREP" */}
                          {order.status !== "PAID" &&
                            order.status !== "PREP" && (
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  Payment method
                                </span>
                                <span>{order.payment}</span>
                              </div>
                            )}

                          {/* CARD - Only show if status is not "PAID" or "PREP" */}
                          {order.status !== "PAID" &&
                            order.status !== "PREP" &&
                            order.payment === "Card" && (
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  Card Payment Receipt
                                </span>
                              </div>
                            )}

                          {order.status !== "PAID" &&
                            order.status !== "PREP" &&
                            order.payment === "Card" &&
                            order.cardIdImg && (
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
                                        setCardIdImageEnlarge(true);
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    Click the picture to enlarge.
                                  </p>
                                </div>
                                {cardIdImageEnlarge && (
                                  // ENLARGED IMAGE
                                  <div
                                    className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center z-20"
                                    style={{
                                      background: "rgba(0, 0, 0, 0.85)",
                                    }}
                                  >
                                    <div className="w-full max-w-[620px] aspect-square relative">
                                      <div
                                        className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                absolute top-[8px] right-[8px] flex justify-center items-center z-10
                hover:bg-gray-950 hover:scale-[1.02] duration-200 cursor-pointer"
                                        onClick={() =>
                                          setCardIdImageEnlarge(false)
                                        }
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

                          {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER - Only show if status is not "PAID" or "PREP" */}
                          {order.status !== "PAID" &&
                            order.status !== "PREP" && (
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  {order.status !== "TO PAY"
                                    ? "Senior Citizen / PWD Discount Given?"
                                    : "Applied for Senior/PWD?"}
                                </span>
                                <span>{order.pwdSenior ? "Yes" : "No"}</span>
                              </div>
                            )}

                          {/* SENIOR/PWD DISCOUNT VALUE CONTAINER - Only show if status is not "PAID" or "PREP" */}
                          {order.status !== "PAID" &&
                            order.status !== "PREP" &&
                            ((order.status === "TO PAY" &&
                              order.pwdSenior &&
                              applySrPWD[order.id]) ||
                              (order.status !== "TO PAY" &&
                                order.pwdSenior)) && (
                              <div className="font-bold text-sm flex justify between items-center">
                                <span className="font-semibold">
                                  Senior Citizen/PWD Discount
                                </span>
                                <span>
                                  PHP{" "}
                                  {order.sampleDiscountDeduction?.toFixed(2)}
                                </span>
                              </div>
                            )}

                          {/* PICTURE OF ID CONTAINER - Only show if status is not "PAID" or "PREP" */}
                          {order.status !== "PAID" &&
                            order.status !== "PREP" &&
                            order.pwdSenior && (
                              <>
                                <div className="w-full flex flex-col gap-1 justify-center items-center">
                                  <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                                    <Image
                                      src={
                                        order.idPic ??
                                        "https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/placeholder-photo.webp?alt=media&token=82bd0fae-bcdc-4acc-a831-54b38beeaf52"
                                      }
                                      alt="idpic"
                                      layout="fill"
                                      className="object-cover"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIdPicEnlarge(true);
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    Click the picture to enlarge.
                                  </p>
                                </div>
                                {idPicEnlarge && (
                                  // ENLARGED IMAGE
                                  <div
                                    className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center z-20"
                                    style={{
                                      background: "rgba(0, 0, 0, 0.85)",
                                    }}
                                  >
                                    <div className="w-full max-w-[620px] aspect-square relative">
                                      <div
                                        className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                absolute top-[8px] right-[8px] flex justify-center items-center z-10
                hover:bg-gray-950 hover:scale-[1.02] duration-200 cursor-pointer"
                                        onClick={() => setIdPicEnlarge(false)}
                                      >
                                        <span className="font-bold">X</span>
                                      </div>
                                      <Image
                                        src={
                                          order.idPic ??
                                          "https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/placeholder-photo.webp?alt=media&token=82bd0fae-bcdc-4acc-a831-54b38beeaf52"
                                        }
                                        alt="idpic"
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                          {/* Apply Sr/PWD Discount Button - Only show if status is "TO PAY" */}
                          {order.status === "TO PAY" &&
                            order.pwdSenior === true && (
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

                          {/* PROMO, IF THERE IS ONE - Only show if status is not "PAID" or "PREP" */}
                          {order.status !== "PAID" &&
                            order.status !== "PREP" &&
                            (order.promo || order.promo === 0) &&
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
                            const uniqueId = `${order.id}-${index}`; // Use a unique identifier that includes the order ID and item index

                            return (
                              <div
                                className="flex flex-col gap-1"
                                key={uniqueId}
                                onClick={(e) => {
                                  // Toggle expanded state only if the click is on the card itself (not a button)
                                  if (e.target === e.currentTarget) {
                                    toggleOrder(order.id); // Use the toggleOrder function
                                  }
                                }}
                              >
                                <hr />
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    {`${item.qty}x - ${item.title}`}
                                  </span>
                                  <div className="flex justify-end items-center mt-2 mr-2">
                                    {order.status === "PREP" ? (
                                      <button
                                        className={`h-8 px-3 text-sm font-semibold rounded-md ${
                                          isReady[uniqueId]
                                            ? "bg-gray-300 hover:bg-gray-400 text-gray-700"
                                            : "bg-orange-400 hover:bg-orange-300 text-white"
                                        } transition-all duration-200`}
                                        onClick={(e) => {
                                          e.stopPropagation(); // Stop event propagation
                                          const newIsReadyState =
                                            !isReady[uniqueId];
                                          setIsReady((prev) => ({
                                            ...prev,
                                            [uniqueId]: newIsReadyState, // Toggle readiness for this specific item
                                          }));
                                          updateIsReadyField(
                                            order.id,
                                            index,
                                            newIsReadyState
                                          ); // Update Firebase
                                        }}
                                      >
                                        {isReady[uniqueId]
                                          ? "Undo"
                                          : "Set to Ready"}
                                      </button>
                                    ) : order.status === "READY" ? (
                                      isReady[uniqueId] ? (
                                        <button
                                          className={`h-8 px-3 text-sm font-semibold rounded-md ${
                                            isPartiallyServed[uniqueId]
                                              ? "bg-gray-300 hover:bg-gray-400 text-gray-700"
                                              : "bg-green-700 hover:bg-green-600 text-white"
                                          } transition-all duration-200`}
                                          onClick={(e) => {
                                            e.stopPropagation(); // Stop event propagation
                                            setIsPartiallyServed((prev) => ({
                                              ...prev,
                                              [uniqueId]: !prev[uniqueId], // Toggle partially served state
                                            }));
                                            updateIsPartiallyServedField(
                                              order.id,
                                              index,
                                              !isPartiallyServed[uniqueId]
                                            ); // Update Firebase
                                          }}
                                        >
                                          {isPartiallyServed[uniqueId]
                                            ? "Undo"
                                            : "Set to Partially Served"}
                                        </button>
                                      ) : (
                                        <button
                                          className="h-8 px-3 text-sm font-semibold rounded-md bg-gray-300 text-gray-700 cursor-not-allowed"
                                          disabled={true}
                                        >
                                          Pending
                                        </button>
                                      )
                                    ) : (
                                      order.status !== "PAID" && (
                                        <span>PHP {item.price.toFixed(2)}</span>
                                      )
                                    )}
                                  </div>
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
                              className={`font-bold ${
                                order.status === "TO PAY"
                                  ? "bg-orange-500 text-white hover:bg-orange-400 w-2/3"
                                  : order.status === "PAID"
                                  ? "bg-yellow-500 text-white hover:bg-yellow-400 w-full"
                                  : order.status === "PREP"
                                  ? order.items.some(
                                      (item, index) =>
                                        isReady[`${order.id}-${index}`]
                                    )
                                    ? "bg-blue-500 text-white hover:bg-blue-400 w-full"
                                    : "bg-blue-300 text-white cursor-not-allowed w-full"
                                  : order.status === "READY"
                                  ? "hidden" // Hide the button for "READY" status
                                  : "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 w-full hidden"
                              } shadow-md hover:scale-[1.02] duration-200 rounded-md h-10`}
                              onClick={() => {
                                if (order.status === "TO PAY") {
                                  handlePaid(order.id);
                                } else if (order.status === "PAID") {
                                  handlePrep(order.id);
                                } else if (
                                  order.status === "PREP" &&
                                  order.items.some(
                                    (item, index) =>
                                      isReady[`${order.id}-${index}`]
                                  )
                                ) {
                                  handleReady(order.id);
                                }
                              }}
                            >
                              {order.status === "TO PAY"
                                ? "Mark as Paid"
                                : order.status === "PAID"
                                ? "Mark as Prep"
                                : order.status === "PREP"
                                ? "Mark as Ready"
                                : "Hide"}
                            </button>

                            {order.status === "PAID" && (
                              <button
                                className="w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md hover:scale-[1.02] duration-200 hover:bg-red-400"
                                onClick={() =>
                                  handleRefund(
                                    order.id,
                                    order.date,
                                    order.price
                                  )
                                }
                              >
                                Refund
                              </button>
                            )}

                            <button
                              className={`${
                                order.status !== "TO PAY" && "hidden"
                              } w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md hover:scale-[1.02] duration-200 hover:bg-red-400`}
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

                            {order.status === "CANCELLED" ||
                              (order.status === "REJECTED" && (
                                <button
                                  className="w-full font-bold bg-red-500 rounded-md text-white h-10 shadow-md hover:scale-[1.02] duration-200 hover:bg-red-400"
                                  onClick={() => {
                                    handleDelete(order.id);
                                  }}
                                >
                                  Delete
                                </button>
                              ))}

                            {order.status === "READY" && (
                              <div className="flex w-full gap-2">
                                {/* Back to PREP Button */}
                                <button
                                  className="w-1/2 h-10 bg-orange-500 font-bold shadow-md rounded-md text-white hover:bg-orange-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handlePrep(order.id)} // Call handlePrep to go back to "PREP" stage
                                >
                                  Back to PREP
                                </button>

                                {/* Mark as Served Button */}
                                <button
                                  className={`w-1/2 h-10 font-bold shadow-md rounded-md flex items-center justify-center ${
                                    order.items.every(
                                      (item, index) =>
                                        isPartiallyServed[
                                          `${order.id}-${index}`
                                        ]
                                    )
                                      ? "bg-green-700 text-white hover:bg-green-600 hover:scale-[1.02] duration-200" // Enabled state
                                      : "bg-green-300 text-white cursor-not-allowed" // Disabled state
                                  }`}
                                  onClick={() => handleDone(order.id)} // Call handleDone to mark as served
                                  disabled={
                                    !order.items.every(
                                      (item, index) =>
                                        isPartiallyServed[
                                          `${order.id}-${index}`
                                        ]
                                    )
                                  } // Disable if not all items are partially served
                                >
                                  Mark as Served
                                </button>
                              </div>
                            )}

                            {order.status === "SERVED" && (
                              <div className="flex w-full gap-2">
                                {/* Print Details Button */}
                                <button
                                  className="w-1/2 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white hover:bg-blue-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handlePrintDetails(order.id)}
                                >
                                  Print Details
                                </button>

                                {/* Delete Button */}
                                <button
                                  className="w-1/2 h-10 bg-red-500 font-bold shadow-md rounded-md text-white hover:bg-red-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
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
                  ))}

                  {/* PAGINATION CONTROLS */}
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      className="font-semibold cursor-pointer w-24 border-2 shadow-md h-9 border-gray-100 bg-white rounded-md text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === 1}
                      onClick={handlePrevious}
                    >
                      Prev
                    </button>
                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        className={`cursor-pointer h-9 aspect-square font-semibold rounded-md ${
                          currentPage === page
                            ? "bg-orange-300 text-white border-orange-300 border-2"
                            : "bg-white text-gray-500 hover:bg-orange-50 border-2 border-gray-100 hover:border-orange-50 hover:text-orange-500"
                        } shadow-md`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="cursor-pointer font-semibold w-24 border-2 shadow-md h-9 border-gray-100 bg-white rounded-md text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === totalPages}
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  </div>
                </>
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
            {staffStatus === "activated" && (
              <div className="w-full flex flex-col items-end gap-2">
                <div className="w-full flex gap-4 items-center">
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                  <span className="text-2xl text-center font-bold text-orange-900">
                    Orders
                  </span>
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
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
            )}
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
                  <span
                    className="text-4xl font-bold text-center text-gray-500"
                    style={{ top: "-100px", position: "relative" }}
                  >
                    Your account is deactivated!
                  </span>
                </div>
              ) : (
                //#region Staff Orders
                <>
                  <div className="w-full lg:max-w-[800px] flex flex-col gap-2 max-h-[720px] overflow-auto pb-2">
                    <span
                      className={`uppercase font-bold text-white px-4 py-1 rounded-full w-fit bg-${
                        user === "bar" ? "blue-500" : "yellow-500"
                      }`}
                    >
                      {user === "bar" ? "Ready" : "Prep"}
                    </span>
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
                                <span className="font-bold text-orange-900">
                                  ID: {order.id}
                                </span>
                                <span className="bg-orange-300 text-white px-3 py-0.5 rounded-full text-xs sm:text-sm">
                                  PHP{" "}
                                  {
                                    order.status === "TO PAY" // If order is "TO PAY"
                                      ? applySrPWD[order.id] // If PWD is applied for this order
                                        ? // Apply PWD after promo has been subtracted
                                          Number(
                                            order.price -
                                              (order.sampleDiscountDeduction ||
                                                0) // Apply PWD discount (20%)
                                          ).toFixed(2)
                                        : // If PWD is not applied, subtract promo if available
                                        order.promo && order.promo > 0
                                        ? // If promo exists, subtract promo from subtotal (but do it once, no double subtraction)
                                          (
                                            order.subtotal -
                                            (order.promo - order.promo)
                                          ).toFixed(2) // Subtract promo from subtotal
                                        : order.subtotal.toFixed(2) // If no promo, show original subtotal
                                      : (order.subtotal ?? 0).toFixed(2) // If not "TO PAY", show the subtotal or 0 if undefined
                                  }
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
                              {user === "bar" && (
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    Payment method
                                  </span>
                                  <span>{order.payment}</span>
                                </div>
                              )}
                              {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                              {user === "bar" && (
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    {order.status !== "TO PAY"
                                      ? "Senior Citizen / PWD Discount Given?"
                                      : "Applied for Senior/PWD?"}
                                  </span>
                                  <span>{order.pwdSenior ? "Yes" : "No"}</span>
                                </div>
                              )}

                              {/* SENIOR/PWD DISCOUNT VALUE CONTAINER */}

                              {user === "bar" &&
                                ((order.status === "TO PAY" &&
                                  order.pwdSenior &&
                                  applySrPWD[order.id]) ||
                                  (order.status !== "TO PAY" &&
                                    order.pwdSenior)) && (
                                  <div className="font-bold text-sm flex justify-between items-center">
                                    <span className="font-semibold">
                                      Senior Citizen/PWD Discount
                                    </span>
                                    <span>{order.sampleDiscountDeduction}</span>
                                  </div>
                                )}

                              {/* PICTURE OF ID CONTAINER */}
                              {user === "bar" && order.pwdSenior && (
                                <>
                                  <div className="w-full flex flex-col gap-1 justify-center items-center">
                                    <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                                      <Image
                                        src={
                                          order.idPic ||
                                          "https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/placeholder-photo.webp?alt=media&token=82bd0fae-bcdc-4acc-a831-54b38beeaf52"
                                        }
                                        alt="idpic"
                                        fill
                                        className="object-cover"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIdPicEnlarge(true);
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      Click the picture to enlarge.
                                    </p>
                                  </div>
                                  {idPicEnlarge && (
                                    // ENLARGED IMAGE
                                    <div
                                      className="absolute top-0 left-0 w-full h-[100vh] flex justify-center items-center"
                                      style={{
                                        background: "rgba(0, 0, 0, 0.85)",
                                      }}
                                    >
                                      <div className="w-full max-w-[620px] aspect-square relative">
                                        <div
                                          className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                      absolute top-[8px] right-[8px] flex justify-center items-center z-10
                      hover:bg-gray-950 hover:scale-[1.02] duration-200"
                                          onClick={() => setIdPicEnlarge(false)}
                                        >
                                          <span className="font-bold">X</span>
                                        </div>
                                        <Image
                                          src={
                                            order.idPic ||
                                            "https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/placeholder-photo.webp?alt=media&token=82bd0fae-bcdc-4acc-a831-54b38beeaf52"
                                          }
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
                              {user === "bar" &&
                                order.status === "TO PAY" &&
                                order.pwdSenior === true && (
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
                                      {applySrPWD[order.id]
                                        ? "Cancel"
                                        : "Apply"}{" "}
                                      Senior/PWD Discount
                                    </button>
                                  </div>
                                )}
                              {/* PROMO, IF THERE IS ONE */}
                              {user === "bar" &&
                                (order.promo || order.promo === 0) &&
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
                                    applySrPWD[order.id]) ||
                                    (order.status !== "TO PAY" &&
                                      order.pwdSenior))
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
                                    {/* ITEM TITLE AND PRICE CONTAINER */}
                                    <div className="font-bold text-sm flex justify-between items-center">
                                      <span className="font-semibold">
                                        {`${item.qty}x - ${item.title}`}
                                        {isHighestPriced &&
                                          ((order.status === "TO PAY" &&
                                            applySrPWD[order.id]) ||
                                            (order.status !== "TO PAY" &&
                                              order.pwdSenior &&
                                              user === "bar")) && (
                                            <span className="text-green-600 text-xs ml-2">
                                              (discounted: PHP{" "}
                                              {discountAmount.toFixed(2)})
                                            </span>
                                          )}
                                      </span>
                                      {/* Only show the price if the role is "bar" */}
                                      {user === "bar" && (
                                        <span
                                          className={
                                            isHighestPriced &&
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
                                      )}
                                    </div>
                                    {item.tags.map((tag, index) => (
                                      <p className="text-xs" key={index}>
                                        -{tag}
                                      </p>
                                    ))}
                                    <hr />
                                  </div>
                                );
                              })}

                              {/* USERNAME */}
                              <span className="w-full flex flex-col gap-0 text-gray-400 text-xs">
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
                                    ? "Mark as Served"
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
                                {order.status === "SERVED" && (
                                  <div className="flex w-full gap-2">
                                    {/* Print Details Button */}
                                    <button
                                      className="w-1/2 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-blue-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                      onClick={() =>
                                        handlePrintDetails(order.id)
                                      }
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
                      className={`uppercase font-bold text-white px-4 py-1 rounded-full w-fit bg-${
                        user === "bar" ? "red-500" : "orange-500"
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
                                <span className="font-bold text-orange-900">
                                  ID: {order.id}
                                </span>
                                <span className="bg-orange-300 text-white px-3 py-0.5 rounded-full text-xs sm:text-sm">
                                  PHP{" "}
                                  {
                                    order.status === "TO PAY" // If order is "TO PAY"
                                      ? applySrPWD[order.id] // If PWD is applied for this order
                                        ? // Apply PWD after promo has been subtracted
                                          Number(
                                            order.price -
                                              (order.sampleDiscountDeduction ||
                                                0) // Apply PWD discount (20%)
                                          ).toFixed(2)
                                        : // If PWD is not applied, subtract promo if available
                                        order.promo && order.promo > 0
                                        ? // If promo exists, subtract promo from subtotal (but do it once, no double subtraction)
                                          (
                                            order.subtotal -
                                            (order.promo - order.promo)
                                          ).toFixed(2) // Subtract promo from subtotal
                                        : order.subtotal.toFixed(2) // If no promo, show original subtotal
                                      : (order.subtotal ?? 0).toFixed(2) // If not "TO PAY", show the subtotal or 0 if undefined
                                  }
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
                              {user === "bar" && (
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    Payment method
                                  </span>
                                  <span>{order.payment}</span>
                                </div>
                              )}
                              {/* CARD */}

                              {order.payment === "Card" && (
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    Card Payment Receipt
                                  </span>
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
                                          setCardIdImageEnlarge(true);
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      Click the picture to enlarge.
                                    </p>
                                  </div>
                                  {cardIdImageEnlarge && (
                                    // ENLARGED IMAGE
                                    <div
                                      className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center z-20"
                                      style={{
                                        background: "rgba(0, 0, 0, 0.85)",
                                      }}
                                    >
                                      <div className="w-full max-w-[620px] aspect-square relative">
                                        <div
                                          className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                                  absolute top-[8px] right-[8px] flex justify-center items-center z-10
                                  hover:bg-gray-950 hover:scale-[1.02] duration-200 cursor-pointer"
                                          onClick={() =>
                                            setCardIdImageEnlarge(false)
                                          }
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
                              {user === "bar" && (
                                <div className="font-bold text-sm flex justify-between items-center">
                                  <span className="font-semibold">
                                    {order.status !== "TO PAY"
                                      ? "Senior Citizen / PWD Discount Given?"
                                      : "Applied for Senior/PWD?"}
                                  </span>
                                  <span>{order.pwdSenior ? "Yes" : "No"}</span>
                                </div>
                              )}

                              {/* SENIOR/PWD DISCOUNT VALUE CONTAINER */}
                              {user === "bar" &&
                                ((order.status === "TO PAY" &&
                                  order.pwdSenior &&
                                  applySrPWD[order.id]) ||
                                  (order.status !== "TO PAY" &&
                                    order.pwdSenior)) && (
                                  <div className="font-bold text-sm flex justify-between items-center">
                                    <span className="font-semibold">
                                      Senior Citizen/PWD Discount
                                    </span>
                                    <span>{order.sampleDiscountDeduction}</span>
                                  </div>
                                )}
                              {/* PICTURE OF ID CONTAINER */}
                              {user === "bar" && order.pwdSenior && (
                                <>
                                  <div className="w-full flex flex-col gap-1 justify-center items-center">
                                    <div className="w-full max-w-72 aspect-square relative hover:scale-[0.98] duration-200">
                                      <Image
                                        src={
                                          order.idPic ||
                                          "https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/placeholder-photo.webp?alt=media&token=82bd0fae-bcdc-4acc-a831-54b38beeaf52"
                                        }
                                        alt="idpic"
                                        fill
                                        className="object-cover"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIdPicEnlarge(true);
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      Click the picture to enlarge.
                                    </p>
                                  </div>
                                  {idPicEnlarge && (
                                    // ENLARGED IMAGE
                                    <div
                                      className="absolute top-0 left-0 w-full h-[100vh] flex justify-center items-center"
                                      style={{
                                        background: "rgba(0, 0, 0, 0.85)",
                                      }}
                                    >
                                      <div className="w-full max-w-[620px] aspect-square relative">
                                        <div
                                          className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                      absolute top-[8px] right-[8px] flex justify-center items-center z-10
                      hover:bg-gray-950 hover:scale-[1.02] duration-200"
                                          onClick={() => setIdPicEnlarge(false)}
                                        >
                                          <span className="font-bold">X</span>
                                        </div>
                                        <Image
                                          src={
                                            order.idPic ||
                                            "https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/placeholder-photo.webp?alt=media&token=82bd0fae-bcdc-4acc-a831-54b38beeaf52"
                                          }
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
                              {user === "bar" &&
                                order.status === "TO PAY" &&
                                order.pwdSenior === true && (
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
                                      {applySrPWD[order.id]
                                        ? "Cancel"
                                        : "Apply"}{" "}
                                      Senior/PWD Discount
                                    </button>
                                  </div>
                                )}
                              {/* PROMO, IF THERE IS ONE */}
                              {user === "bar" &&
                                (order.promo || order.promo === 0) &&
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
                                    applySrPWD[order.id]) ||
                                    (order.status !== "TO PAY" &&
                                      order.pwdSenior))
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
                                    {/* ITEM TITLE AND PRICE CONTAINER */}
                                    <div className="font-bold text-sm flex justify-between items-center">
                                      <span className="font-semibold">
                                        {`${item.qty}x - ${item.title}`}
                                        {isHighestPriced &&
                                          ((order.status === "TO PAY" &&
                                            applySrPWD[order.id]) ||
                                            (order.status !== "TO PAY" &&
                                              order.pwdSenior &&
                                              user === "bar")) && (
                                            <span className="text-green-600 text-xs ml-2">
                                              (discounted: PHP{" "}
                                              {discountAmount.toFixed(2)})
                                            </span>
                                          )}
                                      </span>
                                      {/* Only show the price if the role is "bar" */}
                                      {user === "bar" && (
                                        <span
                                          className={
                                            isHighestPriced &&
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
                                      )}
                                    </div>
                                    {item.tags.map((tag, index) => (
                                      <p className="text-xs" key={index}>
                                        -{tag}
                                      </p>
                                    ))}
                                    <hr />
                                  </div>
                                );
                              })}
                              {/* USERNAME */}
                              <span className="w-full flex flex-col gap-0 text-gray-400 text-xs">
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
                                    ? "Mark as Served"
                                    : "Hide"}
                                </button>

                                {/* {order.status === "PAID" && (
                            <button
                              className="w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md
          hover:scale-[1.02] duration-200 hover:bg-red-400"
                              onClick={() => handleRefund(order.id)} // Call handleRefund here
                            >
                              Refund
                            </button>
                          )}
                           */}
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
                                {order.status === "SERVED" && (
                                  <div className="flex w-full gap-2">
                                    {/* Print Details Button */}
                                    <button
                                      className="w-1/2 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white
                                        hover:bg-blue-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                      onClick={() =>
                                        handlePrintDetails(order.id)
                                      }
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

        {/* MARKED AS SERVED(DONE) POP UP */}
        {isMarkAsDoneVisible && <CheckoutPopup message="Marked as Served!" />}

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
