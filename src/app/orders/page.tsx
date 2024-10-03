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
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";

type Order = {
  date: string;
  time: string;
  price: number;
  status: string;
  where: string;
  payment: string;
  promo?: number;
  voucher?: number,
  items: { title: string; price: number; tags: string[] }[];
  id: string;
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
  const [confirmPopup, setConfirmPopup] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [hasOrder, setHasOrder] = useState(false);
  const [hasRated, setHasRated] = useState(false);

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
          setUser(authUser);
          setIsLoggedIn(true);
        }
      });

      // Clean up the listener when component unmounts
      return () => unsubscribeAuth();
    }
  }, [router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userEmail) return;

      try {
        const tempOrdersRef = collection(db, "completedOrders");
        const querySnapshot = await getDocs(
          query(tempOrdersRef, where("user", "==", userEmail))
        );

        const orders = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Full Document Data:", JSON.stringify(data, null, 2)); // Log for debugging

          let orderInfo = {
            id: doc.id,
            price: data.subtotal || 0,
            status: data.status || "TO PAY",
            date: data.dateCreated || "",
            time: data.timeCreated || "",
            where: data.selectedOption || "N/A",
            payment: data.modeOfPayment || "N/A",
            promo: (data.promoDiscounted || 0).toFixed(2),
            voucher: (data.voucherDiscounted || 0).toFixed(2),
            items: [],
          };

          // Iterate through the `items` array and apply tag logic
          if (Array.isArray(data.items)) {
            orderInfo.items = data.items.map((item) => {
              let tags = [];

              // Determine tags based on slug
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
                  tags = [
                    item.mainCourseOption || "Rice",
                    item.note && `"${item.note}"`,
                  ].filter(Boolean);
                  break;
                case "pasta":
                case "snacks":
                case "sandwiches":
                  tags = [item.note && `"${item.note}"`].filter(Boolean);
                  break;
                default:
                  tags = item.tags.length > 0 ? item.tags : ["No tags"];
              }

              return {
                productTitle: item.productTitle || "",
                price: item.totalPrice || 0,
                img: item.productImg || "",
                note: item.note || "none",
                qty: item.itemQty || 0,
                size: item.selectedDrinkSize || "N/A",
                milkOption: item.milkOption || "N/A",
                slug: item.slug || "",
                tags: tags.length > 0 ? tags : ["No tags"], // Handle empty tags
              };
            });
          }

          // Add the current order to the orders array
          orders.push(orderInfo);
        });

        // Update the orders state
        setUserOrders(orders);

        // Set hasOrder based on whether there are any orders
        setHasOrder(orders.length > 0);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [userEmail]);

  // Check orders length on state change
  useEffect(() => {
    setHasOrder(userOrders.length > 0); // Update hasOrder based on orders
  }, [userOrders]);

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, "completedOrders", orderId));
      setUserOrders(userOrders.filter((order) => order.id !== orderId));
      setConfirmPopup(false);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleLikeClick = () => {
    setSelected("like");
  };

  const handleDislikeClick = () => {
    setSelected("dislike");
  };

  const submitFeedback = async (positiveFeedback: boolean) => {
    if (!userEmail) return;

    const now = new Date();
    const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
      now.getDate()
    ).padStart(2, "0")}/${now.getFullYear()}`;
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const feedbackType = positiveFeedback ? "like" : "dislike";
    const feedbackId = `${feedbackType}_${comment}_${userEmail.replace(
      /\./g,
      "_"
    )}`; // Replace periods in email to avoid Firestore ID issues

    try {
      // Submit individual feedback document
      await setDoc(doc(db, "customerFeedbacks", feedbackId), {
        positiveFeedback,
        dateAdded: date,
        timeAdded: time,
        comments: comment,
        userEmail,
      });
      console.log("Feedback submitted successfully.");

      // Update or create feedbackRating document in customerFeedbacks
      const feedbackRatingRef = doc(db, "customerFeedbacks", "feedbackRating");

      await runTransaction(db, async (transaction) => {
        const ratingDoc = await transaction.get(feedbackRatingRef);

        let likeTally = positiveFeedback ? 1 : 0;
        let dislikeTally = positiveFeedback ? 0 : 1;

        if (ratingDoc.exists()) {
          // Update tallies if document exists
          const currentData = ratingDoc.data();
          likeTally += currentData.likeTally || 0;
          dislikeTally += currentData.dislikeTally || 0;
        }

        // Calculate the total tallies and the ratio of likes
        const totalTallies = likeTally + dislikeTally;
        const tallyRatio =
          totalTallies > 0 ? (likeTally / totalTallies) * 100 : 0;

        // Update or create the feedbackRating document
        transaction.set(feedbackRatingRef, {
          likeTally,
          dislikeTally,
          totalTallies,
          tallyRatio: `${tallyRatio.toFixed(2)}%`, // Store as a percentage
        });

        console.log("Feedback rating and ratio updated.");
        setHasRated(true);
      });
    } catch (error) {
      console.error("Error submitting feedback or updating tally:", error);
    }
  };

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(event.target.value);
  };

  const handleSubmitRating = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    if (selected === null) {
      alert("Please select a rating before submitting.");
      return;
    }

    await submitFeedback(selected === "like");
  };

  return (
    <div
      className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8
    lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56"
    >
      {/* RATING CONTAINER */}
      <div className="w-full lg:max-w-[350px]">
        {!hasRated && hasOrder ? (
          // ITO LALABAS KAPAG HINDI PA NAKAKAPAG-RATE ANG CUSTOMER TAPOS MAY ORDERS NA SIYA
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl text-orange-950 flex gap-1 items-center">
              <i className="fa fa-star text-lg mb-[1px]" aria-hidden="true"></i>
              <span>Rate your Order</span>
            </h1>
            <form className="bg-white border-2 border-gray-50 shadow-lg rounded-lg px-6 py-4">
              <h1 className="font-bold text-2xl text-center mb-4">
                Tell us about your Fikaställe experience?
              </h1>
              {/* RATING AND COMMENTS */}
              <div
                className="px-4 py-2 bg-gray-50 rounded-md"
                style={{
                  boxShadow: "inset 0 2px 4px rgba(100, 100, 100, 0.1)",
                }}
              >
                {/* LIKE AND DISLIKE BUTTONS CONTAINER */}
                <div className="flex w-full justify-center items-center gap-4">
                  {/* LIKE BUTTON */}
                  <button
                    type="button"
                    onClick={handleLikeClick}
                    className={`w-28 bg-white border-gray-50 border-2 shadow-md rounded-md space-x-2 h-10
                      hover:scale-[1.03] duration-300 hover:bg-gray-50 ${
                        selected === "like"
                          ? "text-orange-700"
                          : "text-gray-500"
                      }`}
                  >
                    <i
                      className="fa fa-thumbs-up text-md"
                      aria-hidden="true"
                    ></i>
                    <span className="font-bold text-lg">Like</span>
                  </button>
                  {/* DISLIKE BUTTON */}
                  <button
                    type="button"
                    onClick={handleDislikeClick}
                    className={`w-28 bg-white border-gray-50 border-2 shadow-md rounded-md space-x-2 h-10
                      hover:scale-[1.03] duration-300 hover:bg-gray-50 ${
                        selected === "dislike"
                          ? "text-orange-700"
                          : "text-gray-500"
                      }`}
                  >
                    <i
                      className="fa fa-thumbs-down text-md"
                      aria-hidden="true"
                    ></i>
                    <span className="font-bold text-lg">Dislike</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-4 mb-1">
                  Notes, comments, or suggestions:
                </p>
                <textarea
                  name="comments"
                  id="commentRows"
                  className="w-full text-sm pl-3 pr-2 rounded-sm py-1 bg-white mb-2"
                  rows={4}
                  style={{
                    resize: "none",
                    MozAppearance: "textfield",
                    boxShadow: "inset 0 2px 4px rgba(100, 100, 100, 0.1)",
                  }}
                  placeholder="Provide a brief description of your experience."
                  value={comment}
                  onChange={handleCommentChange}
                ></textarea>
                <button
                  className="w-full py-2 bg-orange-950 font-bold text-white rounded-md shadow-md
                  hover:scale-[1.03] duration-300 hover:bg-orange-900"
                  onClick={handleSubmitRating}
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
        <h1 className="font-bold text-2xl mb-2 text-orange-950 flex gap-2 items-center">
          <i className="fa-solid fa-newspaper text-xl"></i>
          <span>My Orders</span>
        </h1>
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
                      <span className="">P{order.price}</span>
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
                      <span className="font-semibold">Payment method</span>
                      <span>{order.payment}</span>
                    </div>
                    {/* PROMO, IF THERE IS ONE */}
                    {order.promo && (
                      <div className="font-bold text-sm flex justify-between items-center">
                        <span className="font-semibold">Promo discount</span>
                        <span>{order.promo}</span>
                      </div>
                    )}
                    {order.voucher && (
                      <div className="font-bold text-sm flex justify-between items-center">
                        <span className="font-semibold">Voucher discount</span>
                        <span>{order.voucher}</span>
                      </div>
                    )}
                    {/* Iterate through order items */}
                    {order.items.map((item, itemIndex) => (
                      <div className="flex flex-col gap-1" key={itemIndex}>
                        <hr />
                        {/* ITEM TITLE AND PRICE CONTAINER */}
                        <div className="font-bold text-sm flex justify-between items-center">
                          <span className="font-semibold">
                            {item.productTitle}
                          </span>
                          <span>{item.price}</span>
                        </div>

                        {/* Show item tags if available */}
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((tag, tagIndex) => (
                            <p className="text-xs" key={tagIndex}>
                              - {tag}
                            </p>
                          ))
                        ) : (
                          <p className="text-xs">No tags</p>
                        )}
                      </div>
                    ))}

                    {/* CANCEL BUTTON */}
                    {(order.status === "TO PAY" || order.status === "PAID") && (
                      <button
                        className="font-bold bg-red-500 rounded-md text-white py-2 shadow-md
                        hover:scale-[1.03] duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Cancel button clicked");
                          setOrderToCancel(order.id); // Set the order ID to cancel
                          setConfirmPopup(true); // Show the confirmation popup
                        }}
                      >
                        Cancel Order
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
      </div>
    </div>
  );
};

export default OrdersPage;