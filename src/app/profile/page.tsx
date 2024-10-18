"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EditProfile from "../components/EditProfile";
import ViewVouchers from "../components/ViewVouchers";
import ChangePassword from "../components/ChangePassword";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

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

const goals = [1000, 5000, 10000, 20000];

let current = 20000;
let i = 0;
let goal = goals[i];

while (goal <= current) {
  i++;
  goal = goals[i];
}

let percentage = goal === undefined ? 100 : calculatePercentage(current, goal);

function calculatePercentage(current: number, goal: number) {
  let percent = 0;
  if (goal === 5000) {
    current = current - 1000;
    goal = goal - 1000;
    percent = (current / goal) * 100;
  } else if (goal === 10000) {
    current = current - 5000;
    goal = goal - 5000;
    percent = (current / goal) * 100;
  } else if (goal === 20000) {
    current = current - 10000;
    goal = goal - 10000;
    percent = (current / goal) * 100;
  } else {
    percent = (current / goal) * 100;
  }
  return percent;
}

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
            console.error("Error fetching user data:", error);
          }
        } else {
          // Handle the case where authUser .email is null
          console.error("authUser .email is null");
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
  const handleProfileUpdate = (
    updatedFirstName: string,
    updatedLastName: string
  ) => {
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

          <hr className="mb-2" />

          {/* PROGRESS BAR AND BADGE */}
          <div className="w-full h-auto px-4 mb-2 flex gap-2 items-center justify-between">
            <div
              className={`relative w-14 h-14 rounded-full overflow-clip border-2
                ${
                  current < 1000
                    ? "border-neutral-500"
                    : current < 5000
                    ? "border-orange-800"
                    : current < 10000
                    ? "border-gray-300"
                    : current < 20000
                    ? "border-yellow-500"
                    : "border-emerald-400"
                }`}
            >
              <Image
                src={
                  current < 1000
                    ? "/badges/reg.webp"
                    : current < 5000
                    ? "/badges/bronze.webp"
                    : current < 10000
                    ? "/badges/silver.webp"
                    : current < 20000
                    ? "/badges/gold.webp"
                    : "/badges/dia.webp"
                }
                fill
                className="object-contain"
                alt="Membership Badge"
              />
            </div>
            <div className="flex flex-col gap-1 justify-center items-center w-[calc(100%-60px)] mt-1">
              <div
                className={`relative w-full border-2 ${
                  current < 1000
                    ? "border-neutral-400 bg-neutral-200"
                    : current < 5000
                    ? "border-orange-900 bg-orange-300"
                    : current < 10000
                    ? "border-gray-300 bg-neutral-100"
                    : current < 20000
                    ? "border-yellow-500 bg-yellow-200"
                    : "border-emerald-500 bg-emerald-200"
                } h-6 rounded-sm bg-orange-300
            overflow-clip`}
              >
                <span
                  className={`w-full absolute text-center left-0 top-0.5 text-xs font-bold
                  ${
                    current < 1000
                      ? "text-orange-50"
                      : current < 5000
                      ? "text-orange-50"
                      : current < 10000
                      ? "text-gray-600"
                      : current < 20000
                      ? "text-orange-800"
                      : "text-gray-600"
                  }`}
                >
                  {goal === undefined
                    ? "REACHED MAX LOYALTY LEVEL"
                    : current.toFixed(2) + " / " + goal.toFixed(2)}
                </span>
                <div
                  className={`${
                    current < 1000
                      ? "bg-neutral-400"
                      : current < 5000
                      ? "bg-orange-900"
                      : current < 10000
                      ? "bg-gray-300"
                      : current < 20000
                      ? "bg-yellow-500"
                      : "bg-emerald-500"
                  } h-full rounded-r-sm`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <p
                className={`text-center font-semibold text-xs mt-[-4px] ${
                  current < 1000
                    ? "text-neutral-400"
                    : current < 5000
                    ? "text-orange-900"
                    : current < 10000
                    ? "text-gray-400"
                    : current < 20000
                    ? "text-yellow-500"
                    : "text-emerald-600"
                } uppercase`}
              >
                {current < 1000
                  ? "Regular"
                  : current < 5000
                  ? "Bronze"
                  : current < 10000
                  ? "Silver"
                  : current < 20000
                  ? "Gold"
                  : "Diamond"}{" "}
                Member
              </p>
            </div>
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
          {activeIndex === 1 && (
            <EditProfile onProfileUpdate={handleProfileUpdate} />
          )}
          {activeIndex === 2 && <ChangePassword />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
