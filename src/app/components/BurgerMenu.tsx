"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { id: 1, title: "Homepage", url: "/" },
  { id: 2, title: "Menu", url: "/menu" },
  { id: 3, title: "Book", url: "/login" },
  { id: 4, title: "Login", url: "/login" },
];

// TEMPORARY
const user = false;

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
          {links.map((item) => (
            <Link href={item.url} key={item.id} onClick={() => setOpen(false)}>
              {item.title}
            </Link>
          ))}
          {!user ? (
            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
          ) : (
            <Link href="/orders" onClick={() => setOpen(false)}>
              Orders
            </Link>
          )}
          <Link href="/book" onClick={() => setOpen(false)}></Link>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;
