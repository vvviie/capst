"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { id: 1, title: "Home", url: "/" },
  { id: 2, title: "Menu", url: "/menu" },
  { id: 3, title: "Book", url: "/book" },
  { id: 4, title: "Orders", url: "/orders" },
];

// TEMPORARY
const user = true;

const BurgerMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="cursor-pointer">
      {!open ? (
        <Image
          src="/burgermenu.png"
          alt=""
          width={20}
          height={20}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Image
          src="/burgermenu-selected.png"
          alt=""
          width={20}
          height={20}
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <div
          className=" text-white absolute left-0 top-14 flex flex-col gap-8 items-center justify-center text-xl h-[calc(100vh-56px)] w-full z-10"
          style={{ backgroundColor: "#30261F" }}
        >
          <Link
            href={"/profile"}
            onClick={() => setOpen(false)}
            className="text-white flex gap-2 items-center"
          >
            <i className="fa-solid fa-circle-user text-xl"></i>
            <span>Juan</span>
          </Link>
          <Link
            href="/foodcart"
            className="relative flex gap-2 group hover:text-yellow-100 items-center"
            onClick={() => setOpen(false)}
          >
            {/* NUMBER OF ITEMS */}
            <span
              key="cart-item-count"
              className="w-6 h-6 text-center rounded-full bg-red-500 text-white text-xs pt-1 mr-[-6px]"
            >
              1
            </span>
            {/* CART ICON */}
            <i
              key="cart-icon"
              className="fa-solid fa-cart-shopping text-white text-md group-hover:text-yellow-100"
            ></i>
            {/* PRICE OF THE ITEMS */}
            <span key="cart-total-price" className="text-sm">
              (P500.00)
            </span>
          </Link>
          <div className="flex gap-2 items-center justify-around text-gray-300 my-4">
            <span className="bg-gray-300 h-0.5 w-20"></span>
            <i
              className="fa fa-coffee text-sm mr-[-4px]"
              aria-hidden="true"
            ></i>
            <span className="bg-gray-300 h-0.5 w-20"></span>
          </div>
          {links.map((item) => (
            <Link href={item.url} key={item.id} onClick={() => setOpen(false)}>
              {item.title}
            </Link>
          ))}
          <Link
            href={"/"}
            onClick={() => setOpen(false)}
            className="text-gray-300"
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;