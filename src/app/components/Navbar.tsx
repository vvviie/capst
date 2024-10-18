"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import BurgerMenu from "./BurgerMenu";
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
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const router = useRouter();

  const unsubscribeAuthRef = useRef(null);
  const unsubscribeCartRef = useRef(null);
  const unsubscribeDocRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && authUser.emailVerified) {
        try {
          const userDoc = await getDoc(doc(db, "users", authUser.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName);
            setUser(authUser);

            // Real-time listener for tempOrder updates
            const tempOrdersRef = collection(db, "tempOrders");
            const q = query(tempOrdersRef, where("user", "==", authUser.email));

            unsubscribeCartRef.current = onSnapshot(q, (querySnapshot) => {
              let tempOrderDocId = null;

              querySnapshot.forEach((doc) => {
                tempOrderDocId = doc.id;
              });

              if (tempOrderDocId) {
                const tempOrderDocRef = doc(db, "tempOrders", tempOrderDocId);
                unsubscribeDocRef.current = onSnapshot(tempOrderDocRef, (doc) => {
                  if (doc.exists()) {
                    const tempOrderData = doc.data();
                    setTotalItems(tempOrderData.totalItems || 0);
                    setTotalCartPrice(tempOrderData.totalCartPrice || 0);
                  } else {
                    setTotalItems(0);
                    setTotalCartPrice(0);
                  }
                });
              } else {
                setTotalItems(0);
                setTotalCartPrice(0);
                if (unsubscribeDocRef.current) {
                  unsubscribeDocRef.current();
                  unsubscribeDocRef.current = null;
                }
              }
            });
          } else {
            setUser(null);
            setFirstName("");
            // Clean up listeners
            if (unsubscribeCartRef.current) {
              unsubscribeCartRef.current();
              unsubscribeCartRef.current = null;
            }
            if (unsubscribeDocRef.current) {
              unsubscribeDocRef.current();
              unsubscribeDocRef.current = null;
            }
          }
        } catch (error) {
          // Handle any errors that occur while fetching user data
        }
      } else {
        setUser(null);
        setFirstName("");
        // Clean up listeners
        if (unsubscribeCartRef.current) {
          unsubscribeCartRef.current();
          unsubscribeCartRef.current = null;
        }
        if (unsubscribeDocRef.current) {
          unsubscribeDocRef.current();
          unsubscribeDocRef.current = null;
        }
      }
    });

    // Check for cookies when the component mounts
    checkCookiesAndLogout();

    // Cleanup
    return () => {
      unsubscribe();
      if (unsubscribeCartRef.current) {
        unsubscribeCartRef.current();
        unsubscribeCartRef.current = null;
      }
      if (unsubscribeDocRef.current) {
        unsubscribeDocRef.current();
        unsubscribeDocRef.current = null;
      }
    };
  }, []);

  const checkCookiesAndLogout = async () => {
    const allCookies = Cookies.get();
    if (Object.keys(allCookies).length === 0) {
      await handleLogout();
    }
  };

  const handleLogout = async (event) => {
    if (event) event.preventDefault();
    try {
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });

      if (unsubscribeCartRef.current) {
        unsubscribeCartRef.current();
        unsubscribeCartRef.current = null;
      }
      if (unsubscribeDocRef.current) {
        unsubscribeDocRef.current();
        unsubscribeDocRef.current = null;
      }

      await signOut(auth);
      router.push("/");
    } catch (error) {
      // Handle any errors during sign-out
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full text-white flex px-10 py-4 h-14 justify-between md:px-24 md:py-4 xl:px-56 z-50" style={{ backgroundColor: "#30261F" }}>
      <div className="font-bold text-xl hover:text-yellow-100">
        <Link href="/">fikaställe</Link>
      </div>
      <div className="flex items-center justify-center gap-6">
        <div className="md:hidden">
          <NotificationBell />
        </div>
        <div className="md:hidden hover:text-yellow-100">
          <BurgerMenu />
        </div>
      </div>
      <div className="hidden md:flex font-semibold">
        <div className="px-4 hover:text-yellow-100">
          <Link href="/">Home</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/menu">Menu</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/book">Book</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/orders">Orders</Link>
        </div>
      </div>
      {user ? (
        <div className="hidden md:flex md:justify-between font-semibold space-x-6">
          <div>
            <Link href="/foodcart" className="relative flex gap-2 group hover:text-yellow-100 items-center">
              <span className="w-6 h-6 text-center rounded-full bg-red-500 text-white text-xs pt-1 mr-[-6px]">{totalItems}</span>
              <i className="fa-solid fa-cart-shopping text-white text-md group-hover:text-yellow-100"></i>
              <span>(P{totalCartPrice.toFixed(2)})</span>
            </Link>
          </div>
          <div><NotificationBell /></div>
          <div>
            <Link href="/profile">
              <i className="fa-solid fa-circle-user text-2xl text-white hover:text-yellow-100"></i>
            </Link>
          </div>
          <div>
            <Link href="/" onClick={handleLogout} className="hover:text-yellow-100">Logout</Link>
          </div>
        </div>
      ) : (
        <div className="hidden md:block font-semibold hover:text-yellow-100">
          <Link href="/login">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
