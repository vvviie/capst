"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { db } from "../firebase";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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
  items: { title: string; price: number; tags: string[] }[]; 
  id: string;
  pwdSenior: boolean;
  idPic?: string;
  pwdSeniorDiscountApplied?: boolean;
  sampleDiscountDeduction?: number;
  slug: string;
};
// #endregion

const AdminAndStaffOrdersPage = () => {
  const [reversePosition, setReversePosition] = useState(false);
  const [orderStatCat, setOrderStatCat] = useState("all");
  const [enlargePicture, setEnlargePicture] = useState(false);
  const [hasOrder, setHasOrder] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [applySrPWD, setApplySrPWD] = useState<{ [key: string]: boolean }>({});
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});
  const [discounts, setDiscounts] = useState<{ [orderId: string]: boolean }>({});
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    const loadOrders = async () => {
      const orders = await fetchCompletedOrders();
      setUserOrders(orders);
      setHasOrder(orders.length > 0);
    };
    loadOrders();
  }, []);

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

  const fetchCompletedOrders = async (): Promise<Order[]> => {
    const orders: Order[] = [];
    const querySnapshot = await getDocs(collection(db, "completedOrders"));
    
    for (const doc of querySnapshot.docs) {
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
          tags: item.slug === 'drinks' ? [item.selectedDrinkSize, item.note] : [item.note],
        };
      });
  
      // Recalculate the total price
      const totalPrice = items.reduce((total, item) => total + item.price, 0);
  
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
        pwdSeniorDiscountApplied: applySrPWD[doc.id], // Track if the discount was applied
        sampleDiscountDeduction: highestPricedItem.totalPrice * 0.2,
        promo: data.promoDiscounted,
        slug: data.slug,
      };
  
      orders.push(order);
    }
  
    return orders;
  };

  // FOR OPENING NG POP UP
  const [confirmPopup, setConfirmPopup] = useState(false);

  // FOR CLOSING NG POP UP
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setOrderStatCat(
      event.target.value === "all"
        ? "all"
        : event.target.value === "topay"
        ? "topay"
        : event.target.value === "paid"
        ? "paid"
        : event.target.value === "prep"
        ? "prep"
        : event.target.value === "ready"
        ? "ready"
        : "done"
    );
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
                          <span className="">PHP {applySrPWD[order.id] ? (order.price - order.sampleDiscountDeduction) : order.price}</span>
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
                        {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                        <div className="font-bold text-sm flex justify-between items-center">
                          <span className="font-semibold">
                            Applied for Senior/PWD?
                          </span>
                          <span>{order.pwdSenior ? "Yes" : "No"}</span>
                        </div>
                        {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                        {applySrPWD[order.id] && (
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">Senior Citizen/PWD Discount</span>
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
                        {order.status === "TO PAY" && (
                          <div className="w-full flex justify-end">
                            <button
                              className={`h-10 ${applySrPWD[order.id] ? "bg-red-500 hover:bg-red-400 text-white" : "bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500"} shadow-md hover:scale-[1.02] duration-200 rounded-md font-bold w-full`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSrPWD(order.id); // Toggle the Sr/PWD discount for this order only
                              }}
                            >
                              {applySrPWD[order.id] ? "Cancel" : "Apply"} Sr/PWD Discount
                            </button>
                          </div>
                        )}
                        {/* PROMO, IF THERE IS ONE */}
                        {(order.promo || order.promo === 0) && order.promo !== null && order.promo !== undefined && (
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">
                              Promo discount
                            </span>
                            <span>{order.promo}</span>
                          </div>
                        )}
                        {order.items.map((items) => (
                          <div className="flex flex-col gap-1">
                            <hr />
                            {/* ITEM TITLE AND PRICE CONTAINER */}
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">
                                {items.title}
                              </span>
                              <span>{items.price}</span>
                            </div>
                            {items.tags.map((tags) => (
                              <p className="text-xs">-{tags}</p>
                            ))}
                          </div>
                        ))}

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
                                ? "bg-yellow-500 text-white hover:bg-yellow-400 w-2/3"
                                : order.status === "PREP"
                                ? "bg-blue-500 text-white hover:bg-blue-400 w-2/3"
                                : order.status === "READY"
                                ? "bg-green-700 text-white hover:bg-green-600 w-2/3"
                                : "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 w-full hidden"
                            } shadow-md hover:scale-[1.02] duration-200
                      rounded-md h-10`}
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
                              order.status === "DONE" && "hidden"
                            } w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                      hover:scale-[1.02] duration-200 hover:bg-red-400 `}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Cancel button clicked");
                              setConfirmPopup(true);
                            }}
                          >
                            Cancel
                          </button>
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
            {/* ORDERS LIST CONTAINER */}
            <div
              className={`w-full flex ${
                reversePosition
                  ? "flex-col-reverse md:flex-row-reverse"
                  : "flex-col md:flex-row"
              } gap-2 md:items-start`}
            >
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
                            <span className="">PHP {order.price}</span>
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
                              Applied for Senior/PWD?
                            </span>
                            <span>{order.pwdSenior ? "Yes" : "No"}</span>
                          </div>
                          {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                          {applySrPWD[order.id] && (
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">Senior Citizen/PWD Discount</span>
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

                          {/* APPLY SENIOR / PWD DISCOUNT */}
                          {order.status === "TO PAY" && (
                            <div className="w-full flex justify-end">
                              <button
                                className={`h-10 ${
                                  applySrPWD
                                    ? "bg-red-500 hover:bg-red-400 text-white"
                                    : "bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500"
                                } shadow-md hover:scale-[1.02] duration-200
                    rounded-md font-bold w-full`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applySrPWD
                                    ? setApplySrPWD(false)
                                    : setApplySrPWD(true);
                                }}
                              >
                                {applySrPWD ? "Cancel" : "Apply"} Sr/PWD
                                Discount
                              </button>
                            </div>
                          )}
                          {/* PROMO, IF THERE IS ONE */}
                          {(order.promo || order.promo === 0) && order.promo !== null && order.promo !== undefined && (
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">
                                Promo discount
                              </span>
                              <span>{order.promo}</span>
                            </div>
                          )}
                          {order.items.map((items) => (
                            <div className="flex flex-col gap-1">
                              <hr />
                              {/* ITEM TITLE AND PRICE CONTAINER */}
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  {items.title}
                                </span>
                                <span>{items.price}</span>
                              </div>
                              {items.tags.map((tags) => (
                                <p className="text-xs">-{tags}</p>
                              ))}
                            </div>
                          ))}

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
                                  ? "bg-yellow-500 text-white hover:bg-yellow-400 w-2/3"
                                  : order.status === "PREP"
                                  ? "bg-blue-500 text-white hover:bg-blue-400 w-2/3"
                                  : order.status === "READY"
                                  ? "bg-green-700 text-white hover:bg-green-600 w-2/3"
                                  : "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 w-full"
                              } shadow-md hover:scale-[1.02] duration-200
                      rounded-md h-10`}
                            >
                              {order.status === "TO PAY"
                                ? "Mark as Paid"
                                : order.status === "PAID"
                                ? "Mark as Prep"
                                : order.status === "PREP"
                                ? "Mark as Ready"
                                : "Mark as Done"}
                            </button>
                            <button
                              className={`w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                      hover:scale-[1.02] duration-200 hover:bg-red-400 `}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Cancel button clicked");
                                setConfirmPopup(true);
                              }}
                            >
                              Cancel
                            </button>
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
                            <span className="">PHP {order.price}</span>
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
                              Applied for Senior/PWD?
                            </span>
                            <span>{order.pwdSenior ? "Yes" : "No"}</span>
                          </div>
                          {/* SENIOR/PWD DISCOUNT APPLICATION CONTAINER */}
                          {applySrPWD[order.id] && (
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">Senior Citizen/PWD Discount</span>
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

                          {/* APPLY SENIOR / PWD DISCOUNT */}
                          {order.status === "TO PAY" && (
                            <div className="w-full flex justify-end">
                              <button
                                className={`h-10 ${
                                  applySrPWD
                                    ? "bg-red-500 hover:bg-red-400 text-white"
                                    : "bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500"
                                } shadow-md hover:scale-[1.02] duration-200
                    rounded-md font-bold w-full`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applySrPWD
                                    ? setApplySrPWD(false)
                                    : setApplySrPWD(true);
                                }}
                              >
                                {applySrPWD ? "Cancel" : "Apply"} Sr/PWD
                                Discount
                              </button>
                            </div>
                          )}
                          {/* PROMO, IF THERE IS ONE */}
                          {(order.promo || order.promo === 0) && order.promo !== null && order.promo !== undefined && (
                            <div className="font-bold text-sm flex justify-between items-center">
                              <span className="font-semibold">
                                Promo discount
                              </span>
                              <span>{order.promo}</span>
                            </div>
                          )}
                          {order.items.map((items) => (
                            <div className="flex flex-col gap-1">
                              <hr />
                              {/* ITEM TITLE AND PRICE CONTAINER */}
                              <div className="font-bold text-sm flex justify-between items-center">
                                <span className="font-semibold">
                                  {items.title}
                                </span>
                                <span>{items.price}</span>
                              </div>
                              {items.tags.map((tags) => (
                                <p className="text-xs">-{tags}</p>
                              ))}
                            </div>
                          ))}

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
                                  ? "bg-yellow-500 text-white hover:bg-yellow-400 w-2/3"
                                  : order.status === "PREP"
                                  ? "bg-blue-500 text-white hover:bg-blue-400 w-2/3"
                                  : order.status === "READY"
                                  ? "bg-green-700 text-white hover:bg-green-600 w-2/3"
                                  : "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 w-full"
                              } shadow-md hover:scale-[1.02] duration-200
                      rounded-md h-10`}
                            >
                              {order.status === "TO PAY"
                                ? "Mark as Paid"
                                : order.status === "PAID"
                                ? "Mark as Prep"
                                : order.status === "PREP"
                                ? "Mark as Ready"
                                : "Mark as Done"}
                            </button>
                            <button
                              className={`w-1/3 font-bold bg-red-500 rounded-md text-white h-10 shadow-md
                      hover:scale-[1.02] duration-200 hover:bg-red-400 `}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Cancel button clicked");
                                setConfirmPopup(true);
                              }}
                            >
                              Cancel
                            </button>
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
      </div>
    </div>
  );
};

export default AdminAndStaffOrdersPage;
