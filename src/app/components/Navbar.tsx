"use client";
import { useEffect, useState } from "react"; 
import Link from "next/link";
import Image from "next/image";
import BurgerMenu from "./BurgerMenu";
import { auth, db } from "../firebase"; // Update with the correct path
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation"; // Import from next/navigation

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const router = useRouter(); // Correct useRouter for app directory

  useEffect(() => {
    // Listen for authentication state change
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && authUser.emailVerified) {
        // Fetch the user's details from Firestore using the user's email
        const userDoc = await getDoc(doc(db, "users", authUser.email));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName); // Assuming `firstName` field exists in Firestore
          setUser(authUser); // Set user only if document exists
        } else {
          console.log("No such document!");
          setUser(null);
          setFirstName("");
        }
      } else {
        setUser(null);
        setFirstName(""); // Reset firstName if no user is logged in or email is not verified
      }
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, []);

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // Prevent the default link behavior
    try {
      await signOut(auth);
      router.push("/"); // Navigate after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full text-white flex px-10 py-4 h-14 justify-between md:px-24 md:py-4 xl:px-56 z-50"
      style={{ backgroundColor: "#30261F" }}
    >
      {/* LOGO HERE */}
      <div className="font-bold text-xl hover:text-yellow-100">
        <Link href="/">fikaställe</Link>
      </div>
      {/* BURGER MENU */}
      <div className="md:hidden hover:text-yellow-100">
        <BurgerMenu />
      </div>
      {/* NAV LINK PAGES */}
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

      {/* NAV LINK PERSONAL */}
      {user ? (
        <div className="hidden md:flex md:justify-between font-semibold space-x-6">
          <div>
            <Link href="/foodcart">
            <Image
              src="/shoppingcart.png"
              alt="Cart"
              width={20}
              height={20}
              className="mt-1"
            />
            </Link>
          </div>
          <div>
            <Link href="/">{firstName}</Link> {/* Display the user's first name */}
          </div>
          <div>
            <Link href="/" onClick={handleLogout}>Logout</Link> {/* Logout functionality */}
          </div>
        </div>
      
      ) : (
        <div className="hidden md:block font-semibold">
          <Link href="/login">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;