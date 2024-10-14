"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "../firebase"; // Update with the correct path
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  query,
  where,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import Cookies from "js-cookie";

const links = [
  { id: 1, title: "Home", url: "/" },
  { id: 2, title: "Menu", url: "/menu" },
  { id: 3, title: "Book", url: "/book" },
  { id: 4, title: "Orders", url: "/orders" },
];

const BurgerMenu = () => {
  const [firstName, setFirstName] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const unsubscribeCartRef = useRef(null);
  const unsubscribeDocRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && authUser.emailVerified) {
        setIsLoggedIn(true); // User is logged in
        try {
          const userDoc = await getDoc(doc(db, "users", authUser.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName);

            const tempOrdersRef = collection(db, "tempOrders");
            const q = query(tempOrdersRef, where("user", "==", authUser.email));

            unsubscribeCartRef.current = onSnapshot(q, (querySnapshot) => {
              let tempOrderDocId = null;

              querySnapshot.forEach((doc) => {
                tempOrderDocId = doc.id;
              });

              if (tempOrderDocId) {
                const tempOrderDocRef = doc(db, "tempOrders", tempOrderDocId);
                unsubscribeDocRef.current = onSnapshot(
                  tempOrderDocRef,
                  (doc) => {
                    if (doc.exists()) {
                      const tempOrderData = doc.data();
                      setTotalItems(tempOrderData.totalItems || 0);
                      setTotalCartPrice(tempOrderData.totalCartPrice || 0);
                    } else {
                      setTotalItems(0);
                      setTotalCartPrice(0);
                    }
                  }
                );
              } else {
                setTotalItems(0);
                setTotalCartPrice(0);
                if (unsubscribeDocRef.current) {
                  unsubscribeDocRef.current();
                  unsubscribeDocRef.current = null;
                }
              }
            });
          }
        } catch (error) {
          console.error("Error fetching user or cart data:", error);
        }
      } else {
        setIsLoggedIn(false); // User is logged out
        setFirstName("");
        setTotalItems(0);
        setTotalCartPrice(0);
        cleanupListeners();
      }
    });

    return () => {
      unsubscribeAuth();
      cleanupListeners();
    };
  }, []);

  const cleanupListeners = () => {
    if (unsubscribeCartRef.current) {
      unsubscribeCartRef.current();
      unsubscribeCartRef.current = null;
    }
    if (unsubscribeDocRef.current) {
      unsubscribeDocRef.current();
      unsubscribeDocRef.current = null;
    }
  };

  const handleLogout = async () => {
    cleanupListeners(); // Ensure listeners are cleaned up before logout
    setFirstName("");
    setTotalItems(0);
    setTotalCartPrice(0);

    // Remove all cookies
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });

    // Sign out from Firebase
    await signOut(auth);
  };

  return (
    <div className="cursor-pointer">
      {!open ? (
        <Image
          src="/burgermenu.png"
          alt="Menu"
          width={20}
          height={20}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Image
          src="/burgermenu-selected.png"
          alt="Close Menu"
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
          {isLoggedIn && (
            <Link
              href={"/profile"}
              onClick={() => setOpen(false)}
              className="text-white flex gap-2 items-center"
            >
              <i className="fa-solid fa-circle-user text-xl"></i>
              <span>{firstName}</span>
            </Link>
          )}
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
              {totalItems}
            </span>
            {/* CART ICON */}
            <i
              key="cart-icon"
              className="fa-solid fa-cart-shopping text-white text-md group-hover:text-yellow-100"
            ></i>
            {/* PRICE OF THE ITEMS */}
            <span key="cart-total-price" className="text-sm">
              (P{totalCartPrice.toFixed(2)})
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
          {isLoggedIn ? (
            <Link
              href={"/"}
              onClick={() => {
                handleLogout(); // Call handleLogout when logging out
                setOpen(false); // Close the menu
              }}
              className="text-white"
            >
              Logout
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)} // Close the menu on clicking Login
              className="text-white"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;
