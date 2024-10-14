"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EditProfile from "../components/EditProfile";
import ViewVouchers from "../components/ViewVouchers";
import ChangePassword from "../components/ChangePassword";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type NavItem = {
  title: string;
  link: string;
};

const navi: NavItem[] = [
  {
    title: "View vouchers",
    link: "",
  },
  {
    title: "Personal Details",
    link: "",
  },
  {
    title: "Change password",
    link: "",
  },
];

const ProfilePage = () => {
  // State for active tab and user information
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [firstName, setFirstName] = useState<string>("Guest");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && authUser.emailVerified) {
        if (authUser.email) {
          try {
            const userDocRef = doc(db, "users", authUser.email);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setFirstName(userData.firstName || "Guest");
              setLastName(userData.lastName || "");
            }
          } catch (error) {
            //console.error("Error fetching user data:", error);
          }
        } else {
          // Handle the case where authUser .email is null
          //console.error("authUser .email is null");
        }
      } else {
        // Default to Guest if no authenticated user
        setFirstName("Guest");
        setLastName("");
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  // Function to handle profile updates
  const handleProfileUpdate = (updatedFirstName: string, updatedLastName: string) => {
    setFirstName(updatedFirstName);
    setLastName(updatedLastName);
  };

  const handleNavClick = (index: number) => {
    setActiveIndex(index); // Set the active nav item
  };

  return (
    <div
      className="min-h-[68.155vh] mt-14 bg-white px-10 py-8 md:px-24 xl:px-56 lg:bg-[url('/backgrounds/bg3-2.png')]
      lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-center">
        {/* HEADER CONTAINER */}
        <div
          className="bg-white rounded-md shadow-md border-t-2 border-gray-50 flex flex-col gap-2 pt-2
        overflow-clip lg:self-start"
        >
          {/* PROFILE CONTAINER */}
          <div className="flex justify-start items-center gap-4 px-4 py-2">
            <i className="fa-solid fa-circle-user text-5xl text-orange-950"></i>
            <h1 className="font-bold text-2xl text-orange-950 w-56 text-center">
              {firstName} {lastName}
            </h1>
          </div>
          {/* NAV CONTAINER */}
          <div className="flex items-center lg:flex-col h-14 sm:h-auto">
            {/* NAV ITEMS */}
            {navi.map((nav, index) => (
              <Link
                key={index}
                href={nav.link}
                className={`py-2 h-full text-sm flex-1 flex items-center justify-center text-center px-2 lg:w-full ${
                  activeIndex === index
                    ? "bg-orange-950 font-bold text-white"
                    : "bg-white font-semibold text-gray-800 hover:bg-gray-50 border-t-gray-50 border-t-2"
                }`}
                onClick={() => handleNavClick(index)}
              >
                <span>{nav.title}</span>
              </Link>
            ))}
          </div>
        </div>
        {/* FORM CONTAINER */}
        <div
          className="p-4 bg-white rounded-md shadow-md border-gray-100 border-2 flex-1
        lg:max-w-[600px]"
        >
          {/* Conditionally render based on activeIndex */}
          {activeIndex === 0 && <ViewVouchers />}
          {activeIndex === 1 && <EditProfile onProfileUpdate={handleProfileUpdate} />}
          {activeIndex === 2 && <ChangePassword />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;