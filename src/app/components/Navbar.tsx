"use client";
import React, { useEffect, useState } from "react";
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

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && authUser.emailVerified) {
        console.log("Authenticated user:", authUser.email);

        try {
          const userDoc = await getDoc(doc(db, "users", authUser.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName);
            setUser(authUser);

            // Real-time listener for tempOrder updates
            const tempOrdersRef = collection(db, "tempOrders");
            const q = query(tempOrdersRef, where("user", "==", authUser.email));

            const unsubscribeCart = onSnapshot(q, (querySnapshot) => {
              let tempOrderDocId = null;

              querySnapshot.forEach((doc) => {
                tempOrderDocId = doc.id;
              });

              if (tempOrderDocId) {
                const tempOrderDocRef = doc(db, "tempOrders", tempOrderDocId);
                const unsubscribeDoc = onSnapshot(tempOrderDocRef, (doc) => {
                  if (doc.exists()) {
                    const tempOrderData = doc.data();
                    console.log("Fetched tempOrder data:", tempOrderData);
                    setTotalItems(tempOrderData.totalItems || 0);
                    setTotalCartPrice(tempOrderData.totalCartPrice || 0);
                  } else {
                    console.log("No tempOrder document found!");
                    setTotalItems(0);
                    setTotalCartPrice(0);
                  }
                });

                // Clean up the snapshot listener
                return () => unsubscribeDoc();
              } else {
                console.log("No tempOrder document found!");
                setTotalItems(0);
                setTotalCartPrice(0);
              }
            });

            // Clean up the snapshot listener
            return () => unsubscribeCart();
          } else {
            console.log("No user document found!");
            setUser(null);
            setFirstName("");
          }
        } catch (error) {
          console.error("Error fetching user or tempOrder data:", error);
        }
      } else {
        setUser(null);
        setFirstName("");
      }
    });

    // Clean up the authentication listener
    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full text-white flex px-10 py-4 h-14 justify-between md:px-24 md:py-4 xl:px-56 z-50"
      style={{ backgroundColor: "#30261F" }}
    >
      <div className="font-bold text-xl hover:text-yellow-100">
        <Link href="/">fikaställe</Link>
      </div>
      <div className="md:hidden hover:text-yellow-100">
        <BurgerMenu />
      </div>
      <div className="hidden md:flex font-semibold">
        <div className="px-4 hover:text-yellow-100">
          <Link href="/">Home</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/menu">Menu</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/">Book</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/">Orders</Link>
        </div>
      </div>

      {user ? (
        <div className="hidden md:flex md:justify-between font-semibold space-x-6">
          <div className="">
            <Link
              href="/foodcart"
              className="relative flex gap-2 group hover:text-yellow-100 items-center"
            >
              <span
                key="cart-item-count"
                className="w-6 h-6 text-center rounded-full bg-red-500 text-white text-xs pt-1 mr-[-6px]"
              >
                {totalItems}
              </span>
              <i
                key="cart-icon"
                className="fa-solid fa-cart-shopping text-white text-lg mt-1 group-hover:text-yellow-100"
              ></i>
              <span key="cart-total-price" className="">
                (P{totalCartPrice.toFixed(2)})
              </span>
            </Link>
          </div>
          <div key="user-firstname">
            <Link href="/">{firstName}</Link>
          </div>
          <div key="logout">
            <Link href="/" onClick={handleLogout}>
              Logout
            </Link>
          </div>
        </div>
      ) : (
        <div className="hidden md:block font-semibold" key="login">
          <Link href="/login">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
