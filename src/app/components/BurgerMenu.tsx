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
  updateDoc,
  getDocs,
} from "firebase/firestore";
import Cookies from "js-cookie";
import NotificationBell from "./NotificationBell";
import { useRouter } from "next/navigation";

interface Voucher {
  thresholdCondition: number;
  available: boolean;
  deductionType: string;
  thresholdUse: number;
  usageLimitType: string;
  validityType: string;
  voucherDeduction: number;
  voucherDescription: string;
  voucherID: string;
  voucherName: string;
}

interface Vouchers {
  [key: string]: Voucher;
}

const links = [
  { id: 1, title: "Home", url: "/" },
  { id: 2, title: "Menu", url: "/menu" },
  { id: 3, title: "Book", url: "/book" },
  { id: 4, title: "Orders", url: "/orders" },
];

const staffLinks = [
  { id: 1, title: "Menu", url: "/fkstllproduct" },
  { id: 2, title: "Orders", url: "/fkstllorders" },
];

// dito magiistart preeeee
const adminLinks = [
  { id: 1, title: "Home", url: "/adminhome" },
  { id: 2, title: "Menu", url: "/fkstllproduct" },
  { id: 3, title: "Landing", url: "/fkstllhomemaintenance" },
  { id: 4, title: "Incentives", url: "/fkstllvouchers" },
  { id: 5, title: "Bookings", url: "/fkstllbookings" },
  { id: 6, title: "Orders", url: "/fkstllorders" },
  { id: 7, title: "Accounts", url: "/fkstllaccounts" },
];

const BurgerMenu = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState(""); // New state for role
  const [totalItems, setTotalItems] = useState(0);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [foodCartAvailable, setFoodCartAvailable] = useState(false);
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Vouchers>({});

  const unsubscribeAuthRef = useRef(null);
  const unsubscribeCartRef = useRef(null);
  const unsubscribeDocRef = useRef(null);

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeCartListener;
    let unsubscribeTempOrderDoc;

    // Real-time listener for foodCartAvailable
    const unsubscribeFoodCart = onSnapshot(
      doc(db, "adminControls", "adminAccess"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFoodCartAvailable(data.foodCartAvailable || false); // Default to false if not found
        } else {
          console.warn("Document for foodCartAvailable does not exist!");
          setFoodCartAvailable(false); // Default to false if document is missing
        }
      },
      (error) => {
        console.error("Error listening to foodCart availability:", error);
      }
    );

    // Authentication state listener
    unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setIsLoggedIn(true); // User is logged in
        // Check if the email belongs to a staff member
        const isStaff = authUser.email.endsWith("@fikastallestaff.com");
        const collectionName = isStaff ? "staff" : "users";
        const roleField = isStaff ? "staffRole" : "role";

        // Real-time listener for user details
        const unsubscribeUser = onSnapshot(
          doc(db, collectionName, authUser.email),
          (userDoc) => {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setFirstName(userData.firstName);
              setRole(userData[roleField]); // Set the role from Firestore based on collection
              setUser(authUser);

              // Real-time listener for tempOrders
              const tempOrdersRef = collection(db, "tempOrders");
              const q = query(
                tempOrdersRef,
                where("user", "==", authUser.email)
              );

              unsubscribeCartListener = onSnapshot(q, (querySnapshot) => {
                let tempOrderDocId = null;

                querySnapshot.forEach((doc) => {
                  tempOrderDocId = doc.id;
                });

                if (tempOrderDocId) {
                  const tempOrderDocRef = doc(db, "tempOrders", tempOrderDocId);

                  // Real-time listener for specific tempOrder document
                  unsubscribeTempOrderDoc = onSnapshot(
                    tempOrderDocRef,
                    (docSnap) => {
                      if (docSnap.exists()) {
                        const tempOrderData = docSnap.data();
                        setTotalItems(tempOrderData.totalItems || 0);
                        setTotalCartPrice(tempOrderData.totalCartPrice || 0);
                      } else {
                        setTotalItems(0);
                        setTotalCartPrice(0);
                      }
                    },
                    (error) => {
                      console.error("Error listening to tempOrder doc:", error);
                    }
                  );
                } else {
                  setTotalItems(0);
                  setTotalCartPrice(0);

                  if (unsubscribeTempOrderDoc) {
                    unsubscribeTempOrderDoc();
                    unsubscribeTempOrderDoc = null;
                  }
                }
              });
            } else {
              // User document does not exist in Firestore
              setUser(null);
              setFirstName("");
              setRole(""); // Clear the role if user does not exist

              // Clean up listeners
              if (unsubscribeCartListener) {
                unsubscribeCartListener();
                unsubscribeCartListener = null;
              }
              if (unsubscribeTempOrderDoc) {
                unsubscribeTempOrderDoc();
                unsubscribeTempOrderDoc = null;
              }
            }
          },
          (error) => {
            console.error("Error listening to user document:", error);
          }
        );
      } else {
        // User is logged out
        setIsLoggedIn(false); // User is logged out
        setUser(null);
        setFirstName("");
        setRole(""); // Clear the role when logged out

        // Clean up listeners
        if (unsubscribeCartListener) {
          unsubscribeCartListener();
          unsubscribeCartListener = null;
        }
        if (unsubscribeTempOrderDoc) {
          unsubscribeTempOrderDoc();
          unsubscribeTempOrderDoc = null;
        }
      }
    });

    // Check for cookies when the component mounts
    checkCookiesAndLogout();

    // Cleanup
    return () => {
      unsubscribeFoodCart();
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeCartListener) unsubscribeCartListener();
      if (unsubscribeTempOrderDoc) unsubscribeTempOrderDoc();
    };
  }, []); // Only run once, when the component mounts

  const cleanUpListeners = () => {
    if (unsubscribeCartRef.current) {
      unsubscribeCartRef.current();
      unsubscribeCartRef.current = null;
    }
    if (unsubscribeDocRef.current) {
      unsubscribeDocRef.current();
      unsubscribeDocRef.current = null;
    }
  };

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
      setIsLoggedIn(false); // Update login state
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="cursor-pointer">
      {!open ? (
        <i
          className="fa-solid fa-bars text-white text-xl pt-0.5 select-none"
          onClick={() => setOpen(true)}
        ></i>
      ) : (
        <i
          className="fa fa-close text-white text-xl pt-0.5 select-none"
          onClick={() => setOpen(false)}
        ></i>
      )}
      {open && (
        <div
          className=" text-white absolute left-0 top-14 flex flex-col gap-8 items-center justify-center text-xl h-[calc(100vh-56px)] w-full z-10"
          style={{ backgroundColor: "#30261F" }}
        >
          {role === "user" && isLoggedIn && (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="text-white flex gap-2 items-center"
              >
                <i className="fa-solid fa-circle-user text-xl"></i>
                <span>{firstName}</span>
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
            </>
          )}
          <div className="flex gap-2 items-center justify-around text-gray-300 my-4">
            <span className="bg-gray-300 h-0.5 w-20"></span>
            <i
              className="fa fa-coffee text-sm mr-[-4px]"
              aria-hidden="true"
            ></i>
            <span className="bg-gray-300 h-0.5 w-20"></span>
          </div>

          {(role === "user" || !isLoggedIn) &&
            links.map((item) => (
              <Link
                href={item.url}
                key={item.id}
                onClick={() => setOpen(false)}
              >
                {item.title}
              </Link>
            ))}

          {(role === "bar" || role === "staff") &&
            staffLinks.map((item) => (
              <Link
                href={item.url}
                key={item.id}
                onClick={() => setOpen(false)}
              >
                {item.title}
              </Link>
            ))}

          {role === "admin" &&
            adminLinks.map((item) => (
              <Link
                href={item.url}
                key={item.id}
                onClick={() => setOpen(false)}
              >
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
