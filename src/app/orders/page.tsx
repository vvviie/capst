"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  Timestamp,
  setDoc,
  runTransaction,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import CheckoutPopup from "../components/CheckoutPopup";

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
  items: { title: string; price: number; tags: string[] }[]; 
  id: string;
  pwdSenior: boolean;
  idPic?: string;
  pwdSeniorDiscountApplied?: boolean;
  sampleDiscountDeduction?: number;
  slug: string;
  subtotal: number;
};

type Orders = Order[];

const OrdersPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [selected, setSelected] = useState<"like" | "dislike" | null>(null);
  const [userOrders, setUserOrders] = useState<Orders>([]);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [applySrPWD, setApplySrPWD] = useState<{ [key: string]: boolean }>({});
  const [confirmPopup, setConfirmPopup] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [hasOrder, setHasOrder] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // CLOSE FORM WHEN CLICK OUTSIDE
  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setConfirmPopup(false);
    }
  };

  useEffect(() => {
    if (confirmPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [confirmPopup]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const loggedIn = !!authUser && authUser.emailVerified;
      setIsLoggedIn(loggedIn);
      setUserEmail(authUser?.email || null);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (!authToken) {
    } else {
      // Cookie is found, proceed to check Firebase auth state
      const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        if (authUser && authUser.emailVerified) {
          setIsLoggedIn(true);
        }
      });

      // Clean up the listener when component unmounts
      return () => unsubscribeAuth();
    }
  }, [router]);

  useEffect(() => {
    if (!userEmail) return;
  
    const unsubscribe = onSnapshot(
      query(collection(db, "completedOrders"), where("user", "==", userEmail)),
      (querySnapshot) => {
        const orders = [];
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
  
          // Initialize with the first item to determine the highest-priced item
          let highestPricedItem = data.items[0];
          let highestPrice = highestPricedItem?.totalPrice || 0;
  
          // Find the highest-priced item in the current order
          data.items.forEach((item) => {
            if (item.totalPrice > highestPrice) {
              highestPricedItem = item;
              highestPrice = item.totalPrice;
            }
          });
  
          const items = (data.items || []).map((item) => {
            let discountedPrice = item.totalPrice;
  
            // Apply Sr/PWD discount if active for the order and it's the highest-priced item
            if (applySrPWD[doc.id] && item.id === highestPricedItem.id) {
              discountedPrice = item.totalPrice * 0.8;
            }
  
            let tags = [];
            switch (item.slug) {
              case "drinks":
                tags = [
                  item.selectedDrinkSize,
                  ...(item.additionals || []),
                  item.milkOption || "Fresh Milk",
                  item.note && `"${item.note}"`,
                ].filter(Boolean);
                break;
              case "maincourse":
                tags = [item.mainCourseOption || "Rice", item.note && `"${item.note}"`].filter(Boolean);
                break;
              case "pasta":
              case "pastries":
              case "snacks":
              case "sandwiches":
                tags = [item.note && `"${item.note}"`].filter(Boolean);
                break;
              default:
                tags = item.tags?.length > 0 ? item.tags : ["No tags"];
            }
  
            return {
              title: item.productTitle || "",
              price: discountedPrice,
              img: item.productImg || "",
              note: item.note || "none",
              qty: item.itemQty || 0,
              size: item.selectedDrinkSize || "N/A",
              milkOption: item.milkOption || "N/A",
              slug: item.slug || "",
              tags: tags.length > 0 ? tags : ["No tags"], // Handle empty tags
            };
          });
  
          // Recalculate the total price after applying any discounts
          const totalPrice = items.reduce((total, item) => total + item.price, 0);
  
          const orderInfo = {
            id: doc.id,
            price: totalPrice,
            status: data.status || "TO PAY",
            date: data.dateCreated || "",
            time: formatTime(data.timeCreated),
            where: data.selectedOption || "N/A",
            payment: data.modeOfPayment || "N/A",
            promo: (data.promoDiscounted || 0).toFixed(2),
            voucher: (data.voucherDiscounted || 0).toFixed(2),
            items: items,
            pwdSeniorDiscountApplied: applySrPWD[doc.id],
            sampleDiscountDeduction: highestPricedItem.totalPrice * 0.2,
            pwdSenior: data.pwdSenior,
            subtotal: data.subtotal || totalPrice,
          };
  
          // Add the current order to the orders array
          orders.push(orderInfo);
        });
  
        // Helper function to convert 12-hour time with AM/PM to 24-hour format for sorting
        const convertTo24HourFormat = (timeStr) => {
          const [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":").map(Number);
  
          if (modifier === "PM" && hours < 12) hours += 12;
          if (modifier === "AM" && hours === 12) hours = 0;
  
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
  
        // Update the orders state
        setUserOrders(orders);
        setHasOrder(orders.length > 0);
      },
      (error) => {
        console.error("Error fetching orders:", error);
      }
    );
  
    // Cleanup function to unsubscribe from onSnapshot when component unmounts or userEmail changes
    return () => unsubscribe();
  }, [userEmail]);
  
  // Check orders length on state change
  useEffect(() => {
    setHasOrder(userOrders.length > 0); // Update hasOrder based on orders
  }, [userOrders]);

  useEffect(() => {
    const checkCompletedOrders = async () => {
      if (!userEmail) return;
  
      try {
        const ordersSnapshot = await getDocs(
          query(
            collection(db, "completedOrders"),
            where("user", "==", userEmail),
            where("status", "==", "DONE") // Adding condition for 'DONE' status
          )
        );
  
        let allRated = true;
        let firstUnratedOrder = null;
  
        ordersSnapshot.forEach((doc) => {
          const order = doc.data();
          // Check if the order has not been rated and status is "DONE"
          if (!order.hasRated && order.status === "DONE") {
            allRated = false;
            if (!firstUnratedOrder) {
              firstUnratedOrder = doc.id; // First unrated order with "DONE" status
            }
          }
        });
  
        setHasRated(allRated);
        setCurrentOrderId(firstUnratedOrder);
      } catch (error) {
        console.error("Error checking completed orders:", error);
      }
    };
  
    checkCompletedOrders();
  }, [userEmail]); 
  
  useEffect(() => {
    const userCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='));
    
    // If no user cookie is found, show the login modal
    if (!userCookie) {
      setShowLoginModal(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLoginModal(false);  // Close the modal if clicked outside
      }
    };

    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLoginModal]);

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, "completedOrders", orderId));
      setUserOrders(userOrders.filter((order) => order.id !== orderId));
      setConfirmPopup(false);
    } catch (error) {
      //console.error("Error deleting order:", error);
    }
  };

  const handleLikeClick = () => {
    setSelected("like");
    submitFeedback(true);
  };

  const handleDislikeClick = () => {
    setSelected("dislike");
    submitFeedback(false);
  };

  // Submit Feedback Function
  const submitFeedback = async (positiveFeedback: boolean) => {
    if (!userEmail || !currentOrderId || !comment) return;

    //console.log("Submitting feedback with the following details:");
    //console.log("Comment:", comment); // Log the comment
    //console.log("Order ID:", currentOrderId);
    //console.log("Positive Feedback:", positiveFeedback);

    const now = new Date();
    const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const feedbackType = positiveFeedback ? "like" : "dislike";
    const feedbackId = `${feedbackType}_${comment}_${userEmail.replace(/\./g, "_")}`;

    try {
      // Submit individual feedback document
      await setDoc(doc(db, "customerFeedbacks", feedbackId), {
        positiveFeedback,
        dateAdded: date,
        timeAdded: time,
        comments: comment,
        userEmail,
        orderId: currentOrderId,
      });

      // Update hasRated field in the completedOrder document
      await updateDoc(doc(db, "completedOrders", currentOrderId), {
        hasRated: true,
      });

      // Fetch the current feedbackRating document to update the tally counts
      const feedbackRatingDocRef = doc(db, "customerFeedbacks", "feedbackRating");
      const feedbackRatingDoc = await getDoc(feedbackRatingDocRef);

      if (feedbackRatingDoc.exists()) {
        const feedbackData = feedbackRatingDoc.data();

        let updatedLikeTally = feedbackData.likeTally || 0;
        let updatedDislikeTally = feedbackData.dislikeTally || 0;
        let updatedTotalTallies = feedbackData.totalTallies || 0;

        // Increment like or dislike tally
        if (positiveFeedback) {
          updatedLikeTally += 1;
        } else {
          updatedDislikeTally += 1;
        }

        // Calculate the tally ratio
        const totalVotes = updatedLikeTally + updatedDislikeTally;
        const tallyRatio = totalVotes > 0 ? ((updatedLikeTally / totalVotes) * 100).toFixed(2) : "0";

        // Increment totalTallies count
        updatedTotalTallies += 1;

        // Update the feedbackRating document with the new tallies and ratio
        await updateDoc(feedbackRatingDocRef, {
          likeTally: updatedLikeTally,
          dislikeTally: updatedDislikeTally,
          tallyRatio: `${tallyRatio}%`,
          totalTallies: updatedTotalTallies,
        });
      } else {
        console.log("Feedback rating document not found.");
      }

      // Check if all orders are now rated
      const ordersSnapshot = await getDocs(
        query(
          collection(db, "completedOrders"),
          where("user", "==", userEmail)
        )
      );

      let allRated = true;
      let nextUnratedOrder = null;

      ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        if (!order.hasRated) {
          allRated = false;
          if (!nextUnratedOrder) {
            nextUnratedOrder = doc.id; // Next unrated order
          }
        }
      });

      setHasRated(allRated);
      setCurrentOrderId(nextUnratedOrder);
    } catch (error) {
      console.error("Error submitting feedback or updating orders:", error);
    }
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
    //console.log(event.target.value);  // Log the comment to verify it's being set
  };

  const handleSubmitRating = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    if (selected === null) {
      alert("Please select a rating before submitting.");
      return;
    }

    await submitFeedback(selected === "like");
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
        let combinedText = `Thank you, Mr/Mrs. ${order.userName} (${order.user}) for your purchase amounting to PHP ${(order.subtotal).toFixed(2)}. Below would detail your whole order:\n\n`;
        combinedText += `Date Ordered: ${order.dateCreated} at ${order.timeCreated}\nTo be served for ${order.selectedOption} - ${order.selectedServeTime}\n`;
        combinedText += `Mode of Payment: ${order.modeOfPayment}\n`
  
        // Include promo discount and senior discount info
        if (order.promoDiscounted !== 0) {
          combinedText += `Promo Discounted: PHP ${(order.promoDiscounted).toFixed(2)}\n`;
        }
  
        combinedText += `Senior Citizen/PWD?: ${order.pwdSenior ? "Yes" : "No"}`;
        if (order.pwdSenior) {
          combinedText += `\nSenior Citizen/PWD Discount: PHP ${(order.sampleDiscountDeduction).toFixed(2)}\n`;
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
          const discountedPrice = highestPricedItem.totalPrice - order.sampleDiscountDeduction;
  
          // Update the price of the item in the order
          highestPricedItem.totalPrice = Math.max(discountedPrice, 0); // Ensure price doesn't go negative
          console.log(`Discount applied to ${highestPricedItem.productTitle}, new price: PHP ${highestPricedItem.totalPrice.toFixed(2)}`);
  
          // Optionally, update the total for the order (if you are recalculating it)
          const newSubtotal = order.items.reduce((total, item) => total + item.totalPrice, 0);
          order.subtotal = newSubtotal;
          combinedText = `New Subtotal (after discount): PHP ${(newSubtotal).toFixed(2)}`;
        }
  
        // Add product details at the bottom
        doc.text(`Products Ordered:`, 20, yPosition);
        yPosition += 10; // Move down to start printing product details
  
        // Loop through items and print each one
        order.items.forEach((item) => {
          // Product title, quantity
          const productLine = `${item.productTitle} ${item.selectedDrinkSize ? `(${item.selectedDrinkSize})` : ""} x${item.itemQty}`;
  
          // Calculate the x position for the price to be right-aligned
          const productWidth = doc.getTextWidth(productLine);
          const priceX = 170 - doc.getTextWidth(`PHP ${item.totalPrice.toFixed(2)}`) + 15;
  
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
  
          if (item.slug === "drinks" && item.additionals && item.additionals.length > 0) {
            item.additionals.forEach((additional) => {
              doc.text(`- Additional: ${additional}`, 25, yPosition);
              yPosition += 6;
            });
          }
  
          // Add main course option for main courses
          if (item.slug === "maincourse" && item.mainCourseOption) {
            doc.text(`- Main Course Option: ${item.mainCourseOption}`, 25, yPosition);
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

        return (
          <div
            className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8
          lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56"
          >
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
            <p className="mb-4">Please sign in to place your orders with us.</p>
            <div className="flex justify-center items-center gap-4">
              <Link
                href="/login"
                className="bg-orange-950 text-white w-full py-2 rounded-md font-bold shadow-md border-2 border-orange-950"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}

            {/* RATING CONTAINER */}
            <div className="w-full lg:max-w-[350px]">
            {!hasRated && currentOrderId ? (
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-2xl text-orange-950 flex gap-1 items-center">
            <i className="fa fa-star text-lg mb-[1px]" aria-hidden="true"></i>
            <span>Rate your Order</span>
          </h1>
          <form className="bg-white border-2 border-gray-50 shadow-lg rounded-lg px-6 py-4">
          <h1 className="font-bold text-2xl text-center mb-2">
            Tell us about your Fikaställe experience?
          </h1>
          <p className="text-1xl text-center text-orange-950 mb-4 ">Order ID: {currentOrderId}</p>

          {/* RATING AND COMMENTS */}
          <div className="px-4 py-2 bg-gray-50 rounded-md" style={{ boxShadow: "inset 0 2px 4px rgba(100, 100, 100, 0.1)" }}>
            {/* LIKE AND DISLIKE BUTTONS CONTAINER */}
            <div className="flex w-full justify-center items-center gap-4">
              <button
                type="button"
                onClick={handleLikeClick}  // Directly use the function
                className={`w-28 bg-white border-gray-50 border-2 shadow-md rounded-md space-x-2 h-10 hover:scale-[1.03] duration-300 hover:bg-gray-50 ${selected === "like" ? "text-orange-700" : "text-gray-500"}`}
              >
                <i className="fa fa-thumbs-up text-md" aria-hidden="true"></i>
                <span className="font-bold text-lg">Like</span>
              </button>
              <button
                type="button"
                onClick={handleDislikeClick}  // Directly use the function
                className={`w-28 bg-white border-gray-50 border-2 shadow-md rounded-md space-x-2 h-10 hover:scale-[1.03] duration-300 hover:bg-gray-50 ${selected === "dislike" ? "text-orange-700" : "text-gray-500"}`}
              >
                <i className="fa fa-thumbs-down text-md" aria-hidden="true"></i>
                <span className="font-bold text-lg">Dislike</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-4 mb-1">Notes, comments, or suggestions:</p>
            <textarea
              name="comments"
              className="w-full text-sm pl-3 pr-2 rounded-sm py-1 bg-white mb-2"
              rows={4}
              style={{
                resize: "none",
                MozAppearance: "textfield",
                boxShadow: "inset 0 2px 4px rgba(100, 100, 100, 0.1)"
              }}
              placeholder="Provide a brief description of your experience."
              value={comment}
              onChange={handleCommentChange}  // Update comment state
            ></textarea>

            <button
              type="button"  // Ensure button doesn't trigger form submission
              className="w-full py-2 bg-orange-950 font-bold text-white rounded-md shadow-md hover:scale-[1.03] duration-300 hover:bg-orange-900"
              onClick={() => submitFeedback(selected === "like")}  // Submit feedback with the selected feedback type
            >
              Submit Rating
            </button>
          </div>
        </form>
        </div>
      ) : (
          // ITO NAMAN ANG LALABAS KAPAG WALA PA SIYANG ORDERS OR NAKAPAG-RATE NA SIYA

          <div className="flex flex-col gap-2">
            <div className="">
              <h1 className="font-bold text-2xl text-orange-950 mb-2 flex gap-2 items-center">
                <i className="fa-solid fa-cart-shopping text-xl"></i>
                <span>Order {hasOrder ? "Again" : "Now"}</span>
              </h1>
              <Link
                href={"/menu"}
                className="bg-orange-950 border-2 border-orange-950 shadow-lg rounded-lg px-6 py-4
            text-white text-center flex flex-col items-center hover:bg-orange-900 duration-500"
              >
                <h1 className="font-bold text-2xl mb-4">
                  Craving some {hasOrder && "more"} of our offerings?
                </h1>
                {/* IMAGE CONTAINER */}
                <div className="relative w-48 aspect-square">
                  <Image
                    src={"/coffee.png"}
                    alt="foodimage"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-light text-orange-200">
                  Click this to order.
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>

      {/* HEADER AND ORDERS CONTAINER */}
      <div className="w-full  lg:max-w-[800px]">
        <h1 className="font-bold text-2xl text-orange-950 flex gap-2 items-center">
          <i className="fa-solid fa-newspaper text-xl"></i>
          <span>My Orders</span>
        </h1>
        <div className="w-auto flex items-center gap-2">
          <div className="h-4 w-4 rounded-full text-center inline-block bg-gray-500 text-xs text-white">
            <span>i</span>
          </div>
          <span className="text-sm text-gray-500">
            Your order cannot be cancelled if it is already being prepared in
            the kitchen.
          </span>
        </div>
        {/* ORDERS CONTAINER */}
        <div className="space-y-2 w-full max-h-[680px] pb-4 overflow-y-auto">
          {/* ORDERS LIST */}
          {hasOrder ? (
            userOrders.map((order) => (
              <div
                className="w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white cursor-pointer
                hover:scale-[0.98] duration-300"
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
                            PHP {order.status !== "TO PAY" 
                              ? (order.pwdSenior ? (order.price - order.sampleDiscountDeduction) : order.price)
                              : order.subtotal}
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
                          order.status === "TO PAY" || order.status === "REJECTED" || order.status === "CANCELLED"
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
                      <span className="font-semibold">Payment method</span>
                      <span>{order.payment}</span>
                    </div>
                    {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                    <div className="font-bold text-sm flex justify-between items-center">
                          <span className="font-semibold">
                            {order.status !== "TO PAY" ? "Senior Citizen / PWD Discount Given?" : "Applied for Senior/PWD?"}
                          </span>
                          <span>{order.pwdSenior ? "Yes" : "No"}</span>
                        </div>

                        {/* SENIOR/PWD DISCOUNT VALUE CONTAINER */}
                        {((order.status === "TO PAY" && order.pwdSenior && applySrPWD[order.id]) || (order.status !== "TO PAY" && order.pwdSenior)) && (
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">Senior Citizen/PWD Discount</span>
                            <span>PHP {order.sampleDiscountDeduction?.toFixed(2)}</span>
                          </div>
                        )}
                        {/* PROMO, IF THERE IS ONE */}
                        {(order.promo || order.promo === 0) && order.promo !== null && order.promo !== undefined && order.promo !== 0 && (
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  Promo discount
                                </span>
                                <span>PHP {order.promo}</span>
                              </div>
                            )}
                    {/* Iterate through order items */}
                    {order.items.map((item, index) => {
                        // Find the highest price in the order items
                        const maxPrice = Math.max(...order.items.map((i) => i.price));

                        // Check if this is the first item with the highest price
                        const isHighestPriced = item.price === maxPrice && order.items.findIndex(i => i.price === maxPrice) === index;

                        // Apply discount conditionally based on the order's status and senior discount eligibility
                        const discountAmount = (isHighestPriced && 
                          ((order.status !== "TO PAY" && order.pwdSenior) || // Discount if 'TO PAY' and SrPWD is applied
                          (order.status !== "TO PAY" && order.pwdSenior))) // Discount if status is not 'TO PAY' and it's a senior order
                          ? item.price * 0.2
                          : 0;

                        // Calculate discounted price if the discount applies
                        const discountedPrice = isHighestPriced ? item.price - discountAmount : item.price;

                        return (
                          <div className="flex flex-col gap-1" key={item.title}>
                            <hr />
                            {/* ITEM TITLE AND PRICE CONTAINER */}
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">
                                {item.title}
                                {isHighestPriced && ( // Only show discounted label for the highest-priced item
                                  ((order.status === "TO PAY" && applySrPWD[order.id]) || 
                                  (order.status !== "TO PAY" && order.pwdSenior)) && ( // Apply condition to show discount label
                                    <span className="text-green-600 text-xs ml-2">
                                      (discounted: PHP {discountAmount.toFixed(2)})
                                    </span>
                                  )
                                )}
                              </span>
                              <span
                                className={isHighestPriced && ( // Highlight the discounted price
                                  ((order.status === "TO PAY" && applySrPWD[order.id]) || 
                                  (order.status !== "TO PAY" && order.pwdSenior))
                                ) ? "text-green-600" : ""}
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

                    {/* CANCEL BUTTON */}
                    {order.status === "TO PAY" && (
                      <div className="w-full flex items-center gap-1">
                        <button
                          className={`${
                            order.payment === "Card" ? "w-full" : "w-full"
                          } font-bold bg-red-500 rounded-md text-white py-2 shadow-md
                        hover:scale-[1.03] duration-300 border-2 border-red-500`}
                          onClick={(e) => {
                            e.stopPropagation();
                            //console.log("Cancel button clicked");
                            setOrderToCancel(order.id); // Set the order ID to cancel
                            setConfirmPopup(true); // Show the confirmation popup
                          }}
                        >
                          Cancel{order.payment !== "Card Payment" && " Order"}
                        </button>
                      </div>
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
                  </div>
                )}
              </div>
            ))
          ) : (
            //KAPAG HINDI PA NAKAKA-ORDER KAHIT ONCE, ITO ANG LALABAS
            <div
              className="space-x-2 text-gray-400 text-2xl font-bold bg-white py-8 rounded-md
            shadow-lg w-full text-center border-2 border-gray-50"
            >
              <i className="fa-solid fa-newspaper"></i>
              <span>No order or transaction yet.</span>
            </div>
          )}
        </div>
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
                <button
                  className="w-24 py-2 rounded-md shadow-md bg-white font-bold border-2 border-gray-50 text-gray-500
                  hover:scale-[1.05] duration-300 hover:bg-gray-50"
                  onClick={() => handleDeleteOrder(orderToCancel)}
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmPopup(false)}
                  className="w-24 py-2 rounded-md shadow-md bg-orange-950 border-2 border-orange-950 font-bold text-white
                  hover:scale-[1.05] duration-300 hover:bg-orange-900"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE POP UP */}
        {isDeleteVisible && <CheckoutPopup message="Order Deleted!" />}
      </div>
    </div>
  );
};

export default OrdersPage;
