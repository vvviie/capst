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
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import NotificationBell from "./NotificationBell";

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

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState(""); // New state for role
  const [totalItems, setTotalItems] = useState(0);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const [foodCartAvailable, setFoodCartAvailable] = useState(false);
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Vouchers>({});
  const [hasUserCookie, setHasUserCookie] = useState(false);
  
  const unsubscribeAuthRef = useRef(null);
  const unsubscribeCartRef = useRef(null);
  const unsubscribeDocRef = useRef(null);

  useEffect(() => {
    const unsubscribeFoodCart = onSnapshot(
      doc(db, "adminControls", "adminAccess"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFoodCartAvailable(data.foodCartAvailable || false); // Update state
        } else {
          console.warn("Document for foodCartAvailable does not exist!");
          setFoodCartAvailable(false);
        }
      },
      (error) => {
        console.error("Error listening to foodCart availability:", error);
      }
    );

    return () => {
      unsubscribeFoodCart();
    };
  }, []);

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
      router.push("/");
    } catch (error) {
      // Handle any errors during sign-out
    }
  };

  // Fetch voucher configurations from Firestore
  const fetchVoucherConfig = async () => {
    const voucherConfigRef = collection(db, "vouchers");
    const voucherSnapshot = await getDocs(voucherConfigRef);

    const voucherConfig: Vouchers = {}; // Initialize as Vouchers type

    voucherSnapshot.forEach((doc) => {
      const data = doc.data();
      const key = doc.id;

      // Ensure only vouchers from the static voucherConfig are included
      voucherConfig[key] = {
        thresholdCondition: data.thresholdCondition,
        available: data.available,
        deductionType: data.deductionType,
        thresholdUse: data.thresholdUse,
        usageLimitType: data.usageLimitType,
        validityType: data.validityType,
        voucherDeduction: data.voucherDeduction,
        voucherDescription: data.voucherDescription,
        voucherID: data.voucherID,
        voucherName: data.voucherName,
      };
    });

    setVouchers(voucherConfig); // Store the fetched voucher config in state
  };

  const checkAndAssignVouchers = async (userDoc, totalPaid) => {
    const userVouchers = userDoc.data().vouchers || {}; // Fetch existing vouchers or initialize as empty object

    // Define the thresholds and the corresponding voucher keys
    const thresholds = [
      { threshold: 1000, voucherKey: "1000HitVoucher" },
      { threshold: 5000, voucherKey: "5000HitVoucher" },
      { threshold: 10000, voucherKey: "10000HitVoucher" },
      { threshold: 20000, voucherKey: "20000HitVoucher" },
    ];

    // Loop through the thresholds to check if the user qualifies for any of the vouchers
    for (const { threshold, voucherKey } of thresholds) {
      // Check if the totalPaid exceeds the threshold and the voucher has not been assigned yet
      if (totalPaid >= threshold && !userVouchers[voucherKey]) {
        // Fetch voucher details from the database
        const voucherDoc = await getDoc(doc(db, "vouchers", voucherKey)); // Replace "vouchers" with the correct collection name
        const voucherData = voucherDoc.data();

        if (voucherData) {
          const now = new Date();
          const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
            now.getDate()
          ).padStart(2, "0")}/${now.getFullYear()}`;
          const time = `${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")}`;

          // Assign the voucher to the user with all the properties fetched from the database
          userVouchers[voucherKey] = {
            used: false,
            isRead: false,
            isNotifDeleted: false,
            dateCreated: date,
            timeCreated: time,
            available: voucherData.available,
            deductionType: voucherData.deductionType,
            thresholdCondition: voucherData.thresholdCondition,
            thresholdUse: voucherData.thresholdUse,
            usageLimitType: voucherData.usageLimitType,
            validityType: voucherData.validityType,
            voucherDeduction: voucherData.voucherDeduction,
            voucherDescription: voucherData.voucherDescription,
            voucherID: voucherData.voucherID,
            voucherName: voucherData.voucherName,
          };
        }
      }
    }

    // Update Firestore with new voucher data
    await updateDoc(doc(db, "users", userDoc.id), { vouchers: userVouchers });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Fetch the voucher config from Firestore
        const fetchedVoucherConfig = await fetchVoucherConfig();

        // Set the fetched voucher config to state (you may want to store it in state)
        setVouchers(fetchedVoucherConfig);

        const fetchUserData = async () => {
          // Use authUser.email to fetch the user document from Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const totalPaid = userData.totalPaid || 0; // Fetch totalPaid from Firestore

            // Call the function to check and assign vouchers, passing only the required arguments
            await checkAndAssignVouchers(userDoc, totalPaid);
          }
        };
        fetchUserData();
      }
    });

    // Cleanup function to unsubscribe from the auth state listener when the component unmounts or the user changes
    return () => unsubscribe();
  }, [user]); // This will run when the `user` state changes
  
  useEffect(() => {
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split("; ");
      const userCookieExists = cookies.some((cookie) => cookie.startsWith("user="));
      setHasUserCookie(userCookieExists);
    }
  }, []); // This effect runs once when the component mounts

  return (
    <div
      className="fixed top-0 left-0 w-full text-white flex px-10 py-4 h-14 justify-between md:px-24 md:py-4 xl:px-56 z-50"
      style={{ backgroundColor: "#30261F" }}
    >
      <div className="font-bold text-xl hover:text-yellow-100">
        {/* Conditionally render based on role */}
        <Link href={role === "admin" ? "/adminhome" : "/"}>
          {role === "admin"
            ? "fikadmin"
            : role === "bar" || role === "kitchen"
            ? "fikastaff"
            : "fikaställe"}
        </Link>
      </div>
      <div className="flex items-center justify-center gap-6">
      {hasUserCookie && role !== "" && (
      <>
        <div
          className={`${
            ["admin", "bar", "kitchen"].includes(role) ? "hidden" : ""
          } lg:hidden`}
        >
          <NotificationBell foodCartAvailable={foodCartAvailable} />
        </div>
        </>
        )}
        <div className="lg:hidden hover:text-yellow-100">
          <BurgerMenu />
        </div>
      </div>
      <div
        className={`hidden lg:flex w-full justify-center font-semibold
        ${
          role !== "admin" &&
          role !== "bar" &&
          role !== "kitchen" &&
          "max-w-[320px]"
        }`}
      >
        {role === "admin" ? (
          <>
            <div className="px-4 hover:text-yellow-100">
              <Link href="/adminhome">Home</Link>
            </div>
            <div className="px-4 hover:text-yellow-100">
              <Link href="/fkstllproduct">Menu</Link>
            </div>
            <div className="px-4 hover:text-yellow-100">
              <Link href="/fkstllhomemaintenance">Landing</Link>
            </div>
            <div className="px-4 hover:text-yellow-100">
              <Link href="/fkstllvouchers">Incentives</Link>
            </div>
            <div className="px-4 hover:text-yellow-100">
              <Link href="/fkstllbookings">Bookings</Link>
            </div>
            <div className="px-4 hover:text-yellow-100">
              <Link href="/fkstllorders">Orders</Link>
            </div>
            <div className="px-4 hover:text-yellow-100">
              <Link href="/fkstllaccounts">Accounts</Link>
            </div>
          </>
        ) : role === "bar" || role === "kitchen" ? (
          <>
            <div className="flex justify-start">
              <div className="px-4 hover:text-yellow-100">
                <Link href="/fkstllproduct">Menu</Link>
              </div>
              <div className="px-4 hover:text-yellow-100">
                <Link href="/fkstllorders">Orders</Link>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {user ? (
        <div className="hidden lg:flex lg:justify-between font-semibold space-x-6">
          {/* Only show for non-admin, non-kitchen, non-bar users */}
          {foodCartAvailable &&
            role !== "admin" &&
            role !== "kitchen" &&
            role !== "bar" && (
              <div>
                <Link
                  href="/foodcart"
                  className="relative flex gap-2 group hover:text-yellow-100 items-center"
                >
                  <span className="w-6 h-6 text-center rounded-full bg-red-500 text-white text-xs pt-1 mr-[-6px]">
                    {totalItems}
                  </span>
                  <i className="fa-solid fa-cart-shopping text-white text-md group-hover:text-yellow-100"></i>
                  <span>(PHP {totalCartPrice.toFixed(2)})</span>
                </Link>
              </div>
            )}

          {/* Only show NotificationBell for non-admin, non-kitchen, non-bar users */}
          {role !== "admin" && role !== "kitchen" && role !== "bar" && (
            <div>
              <NotificationBell foodCartAvailable={foodCartAvailable} />
            </div>
          )}

          {/* Show profile and logout for regular users */}
          {role === "user" && (
            <>
              <div>
                <Link href="/profile">
                  <i className="fa-solid fa-circle-user text-2xl text-white hover:text-yellow-100"></i>
                </Link>
              </div>
            </>
          )}

          {/* Always show Logout button for logged-in users */}
          <div>
            <Link
              href="/"
              onClick={handleLogout}
              className="hover:text-yellow-100"
            >
              Logout
            </Link>
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
