"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Order = {
  date: string;
  time: string;
  price: number;
  status: string;
  where: string;
  payment: string;
  promo?: number;
  items: { title: string; price: number; tags: string[] }[];
  id: string;
};

type Orders = Order[];

const userOrders: Orders = [
  {
    date: "09/13/2024",
    time: "17:21",
    price: 340,
    status: "TO PAY",
    where: "Table",
    payment: "Cash",
    promo: -20,
    items: [
      {
        title: "Espresso Shot",
        price: 80,
        tags: ["8oz", '"None"'],
      },
      {
        title: "Pasta",
        price: 280,
        tags: ['"None"'],
      },
    ],
    id: "542352134124",
  },
  {
    date: "09/13/2024",
    time: "17:21",
    price: 360,
    status: "PAID",
    where: "Table",
    payment: "Card",
    items: [
      {
        title: "Espresso Shot",
        price: 80,
        tags: ["8oz", '"None"'],
      },
      {
        title: "Pasta",
        price: 280,
        tags: ['"None"'],
      },
    ],
    id: "522222134124",
  },
  {
    date: "09/13/2024",
    time: "16:21",
    price: 360,
    status: "PREP",
    where: "Table",
    payment: "Cash",
    items: [
      {
        title: "Espresso Shot",
        price: 80,
        tags: ["8oz", '"None"'],
      },
      {
        title: "Pasta",
        price: 280,
        tags: ['"None"'],
      },
    ],
    id: "553352133124",
  },
  {
    date: "09/13/2024",
    time: "15:21",
    price: 360,
    status: "READY",
    where: "Table",
    payment: "Cash",
    items: [
      {
        title: "Espresso Shot",
        price: 80,
        tags: ["8oz", '"None"'],
      },
      {
        title: "Pasta",
        price: 280,
        tags: ['"None"'],
      },
    ],
    id: "564552133124",
  },
  {
    date: "09/13/2024",
    time: "14:21",
    price: 360,
    status: "DONE",
    where: "Pick-up",
    payment: "Cash",
    items: [
      {
        title: "Espresso Shot",
        price: 80,
        tags: ["8oz", '"None"'],
      },
      {
        title: "Pasta",
        price: 280,
        tags: ['"None"'],
      },
    ],
    id: "575452133124",
  },
];

// KAPAG HINDI PA NAKAKAPAG-RATE ANG CUSTOMER NG ORDER EXPERIENCE NILA AFTER NILA UMORDER
// PERO HINDI SIYA PER ORDER DAPAT MAY RATE. KUNYARI, KAPAG HINDI PA NAKAPAG-RATE PERO UMORDER ULIT,
// COUNTED AS ONE RATE PA RIN, PARANG BOOLEAN LANG. KAPAG UMORDER, NAGIGING FALSE ANG HASRATED TAPOS
// KAPAG NAG-RATE NA, MAGIGING FALSE NA ANG HASRATED
const hasRated = false;

// KUNG NAKAPAG-ORDER NA KAHIT ONCE ANG CUSTOMER
const hasOrder = true;

const OrdersPage = () => {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // FOR OPENING NG POP UP
  const [confirmPopup, setConfirmPopup] = useState(false);

  // FOR CLOSING NG POP UP
  const formRef = useRef<HTMLDivElement | null>(null);

  // LIKE AND DISLIKE BUTTON
  const [selected, setSelected] = useState<"like" | "dislike" | null>(null);

  const handleLikeClick = () => {
    setSelected(selected === "like" ? null : "like");
  };

  const handleDislikeClick = () => {
    setSelected(selected === "dislike" ? null : "dislike");
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

  return (
    <div
      className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8
    lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56"
    >
      {/* RATING CONTAINER */}
      <div className="w-full lg:max-w-[350px]">
        {!hasRated ? (
          // ITO LALABAS KAPAG HINDI PA NAKAKAPAG-RATE ANG CUSTOMER TAPOS MAY ORDERS NA SIYA
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl text-orange-950 flex gap-1 items-center">
              <i className="fa fa-star text-lg mb-[1px]" aria-hidden="true"></i>
              <span>Rate your order</span>
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
                    className={`w-28 bg-white border-gray-50 border-2 shadow-md rounded-md space-x-2 h-10 ${
                      selected === "like" ? "text-orange-700" : "text-gray-500"
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
                    className={`w-28 bg-white border-gray-50 border-2 shadow-md rounded-md space-x-2 h-10 ${
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
                ></textarea>
                <button className="w-full py-2 bg-orange-950 font-bold text-white rounded-md shadow-md">
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
            text-white text-center flex flex-col items-center"
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
                className="w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white cursor-pointer"
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
                    {order.items.map((items) => (
                      <div className="flex flex-col gap-1">
                        <hr />
                        {/* ITEM TITLE AND PRICE CONTAINER */}
                        <div className="font-bold text-sm flex justify-between items-center">
                          <span className="font-semibold">{items.title}</span>
                          <span>{items.price}</span>
                        </div>
                        {items.tags.map((tags) => (
                          <p className="text-xs">-{tags}</p>
                        ))}
                      </div>
                    ))}
                    {/* CANCEL BUTTON */}
                    {(order.status === "TO PAY" || order.status === "PAID") && (
                      <button
                        className="font-bold bg-red-500 rounded-md text-white py-2 shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Cancel button clicked");
                          setConfirmPopup(true);
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

export default OrdersPage;
