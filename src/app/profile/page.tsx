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
  { title: "View vouchers", link: "" },
  { title: "Personal Details", link: "" },
  { title: "Change password", link: "" },
];

const goals = [1000, 5000, 10000, 20000];

function calculatePercentage(current: number, goal: number) {
  const thresholds = [1000, 5000, 10000, 20000];
  let adjustedCurrent = current;
  let adjustedGoal = goal;

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (current >= thresholds[i]) {
      adjustedCurrent = current - thresholds[i];
      adjustedGoal = goal - thresholds[i];
      break;
    }
  }

  return (adjustedCurrent / adjustedGoal) * 100;
}

const ProfilePage = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [firstName, setFirstName] = useState<string>("Guest");
  const [lastName, setLastName] = useState<string>("");
  const [totalPaid, setTotalPaid] = useState<number>(0); // Dynamic data from the database

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && authUser.emailVerified) {
        try {
          const userDocRef = doc(db, "users", authUser.email);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName || "Guest");
            setLastName(userData.lastName || "");
            setTotalPaid(userData.totalPaid || 0); // Fetch totalPaid from Firestore
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setFirstName("Guest");
        setLastName("");
      }
    });

    return () => unsubscribe();
  }, []);

  // Dynamic badge and progress calculations
  const current = totalPaid;
  let i = 0;
  let goal = goals[i];
  while (goal <= current && i < goals.length) {
    i++;
    goal = goals[i];
  }
  const percentage = goal === undefined ? 100 : calculatePercentage(current, goal);

  const handleProfileUpdate = (updatedFirstName: string, updatedLastName: string) => {
    setFirstName(updatedFirstName);
    setLastName(updatedLastName);
  };

  const handleNavClick = (index: number) => setActiveIndex(index);

  return (
    <div className="min-h-[68.155vh] mt-14 bg-white px-10 py-8 md:px-24 xl:px-56 lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-center">
        <div className="bg-white rounded-md shadow-md border-t-2 border-gray-50 flex flex-col gap-2 pt-2 overflow-clip lg:self-start">
          <div className="flex justify-start items-center gap-4 px-4 py-2">
            <i className="fa-solid fa-circle-user text-5xl text-orange-950"></i>
            <h1 className="font-bold text-2xl text-orange-950 w-56 text-center">
              {firstName} {lastName}
            </h1>
          </div>

          <hr className="mb-2" />

          <div className="w-full h-auto px-4 mb-2 flex gap-2 items-center justify-between">
            <div
              className={`relative w-14 h-14 rounded-full overflow-clip border-2 ${
                totalPaid < 1000
                  ? "border-neutral-500"
                  : totalPaid < 5000
                  ? "border-orange-800"
                  : totalPaid < 10000
                  ? "border-gray-300"
                  : totalPaid < 20000
                  ? "border-yellow-500"
                  : "border-emerald-400"
              }`}
            >
              <Image
                src={
                  totalPaid < 1000
                    ? "/badges/reg.webp"
                    : totalPaid < 5000
                    ? "/badges/bronze.webp"
                    : totalPaid < 10000
                    ? "/badges/silver.webp"
                    : totalPaid < 20000
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
                  totalPaid < 1000
                    ? "border-neutral-400 bg-neutral-200"
                    : totalPaid < 5000
                    ? "border-orange-900 bg-orange-300"
                    : totalPaid < 10000
                    ? "border-gray-300 bg-neutral-100"
                    : totalPaid < 20000
                    ? "border-yellow-500 bg-yellow-200"
                    : "border-emerald-500 bg-emerald-200"
                } h-6 rounded-sm overflow-clip`}
              >
                <span className="w-full absolute text-center left-0 top-0.5 text-xs font-bold">
                  {goal === undefined
                    ? "REACHED MAX LOYALTY LEVEL"
                    : `${current.toFixed(2)} / ${goal.toFixed(2)}`}
                </span>
                <div
                  className={`h-full rounded-r-sm ${
                    totalPaid < 1000
                      ? "bg-neutral-400"
                      : totalPaid < 5000
                      ? "bg-orange-900"
                      : totalPaid < 10000
                      ? "bg-gray-300"
                      : totalPaid < 20000
                      ? "bg-yellow-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-center font-semibold text-xs uppercase mt-[-4px]">
                {totalPaid < 1000
                  ? "Regular"
                  : totalPaid < 5000
                  ? "Bronze"
                  : totalPaid < 10000
                  ? "Silver"
                  : totalPaid < 20000
                  ? "Gold"
                  : "Diamond"}{" "}
                Member
              </p>
            </div>
          </div>

          <div className="flex items-center lg:flex-col h-14 sm:h-auto">
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

        <div className="p-4 bg-white rounded-md shadow-md border-gray-100 border-2 flex-1 lg:max-w-[600px]">
          {activeIndex === 0 && <ViewVouchers />}
          {activeIndex === 1 && <EditProfile onProfileUpdate={handleProfileUpdate} />}
          {activeIndex === 2 && <ChangePassword />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
