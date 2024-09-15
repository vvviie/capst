"use client";
import React, { useState } from "react";

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

  return (
    <div
      className="min-h-[calc(100vh-56px)] mt-14 px-10 py-8 md:px-24 xl:px-56
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      <h1 className="font-bold text-2xl mb-2 text-orange-950">My Orders</h1>
      {/* ORDERS CONTAINER */}
      <div className="flex flex-col gap-2 items-center justify-center w-full">
        {/* ORDERS */}
        {userOrders.map((order) => (
          <div
            className="w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white"
            key={order.id}
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
              <span
                className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center mr-4 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
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
                  <button className="font-bold bg-red-500 rounded-md text-white py-2 shadow-md">
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
