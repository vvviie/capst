"use client";

import React, { useState, useEffect } from "react";
import NetSalesExpensesGraph from "../components/NetSalesExpensesGraph";
import FoodDrinksGraph from "../components/FoodDrinksGraph";
import AverageOrdersGraph from "../components/AverageOrdersGraph";
import LikesDislikesChart from "../components/LikesDislikesChart";
import Link from "next/link";
import InputExpenses from "../components/InputExpenses";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

type User = {
  uid: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  role: string;
  totalPaid: number;
};

type TopSpendingCustomer = {
  username: string;
  firstName: string;
  lastName: string;
  membership: string;
  amount: number;
};

type Review = {
  name: string;
  dateAdded: string;
  timeAdded: string;
  userEmail: string;
  [key: string]: any; // Allow for other properties that may exist in review data
};

const AdminHomePage = () => {
  const [timeFrame, setTimeFrame] = useState("today");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]); 

  const [topSpendingCustomers, setTopSpendingCustomers] = useState<
    TopSpendingCustomer[]
  >([]);
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(true);

  // Fetch the current foodCartAvailable value when component mounts
  useEffect(() => {
    const fetchFoodCartAvailability = async () => {
      try {
        const docRef = doc(db, "adminControls", "adminAccess");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsOrderingEnabled(data.foodCartAvailable);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchFoodCartAvailability();
  }, []);

  // Handle button toggle click
  const handleToggle = async () => {
    try {
      const docRef = doc(db, "adminControls", "adminAccess");
      // Toggle the foodCartAvailable state
      const newFoodCartAvailable = !isOrderingEnabled;

      // Update Firestore with the new value
      await setDoc(
        docRef,
        { foodCartAvailable: newFoodCartAvailable },
        { merge: true }
      );

      // Update local state based on the new value
      setIsOrderingEnabled(newFoodCartAvailable);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const fetchTopSpendingCustomers = async () => {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);

    const customers: TopSpendingCustomer[] = querySnapshot.docs
      .map((doc) => {
        const data = doc.data() as User;

        // Filter out users whose role is not "user"
        if (data.role !== "user") {
          return null; // Skip users who do not have the "user" role
        }

        // Determine membership tier based on totalPaid
        const membership =
          data.totalPaid < 1000
            ? "REGULAR"
            : data.totalPaid < 5000
            ? "BRONZE"
            : data.totalPaid < 10000
            ? "SILVER"
            : data.totalPaid < 20000
            ? "GOLD"
            : "DIAMOND";

        return {
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          membership,
          amount: data.totalPaid,
        };
      })
      .filter((cus) => cus !== null); // Remove null values from the array

    // Sort customers by amount in descending order
    customers.sort((a, b) => b.amount - a.amount);

    setTopSpendingCustomers(customers);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTopSpendingCustomers();
  }, []);

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
  };

  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFrame(e.target.value);
  };

  // GETS THE FIVE LATEST REVIEWS TO DISPLAY
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Step 1: Fetch reviews from customerFeedbacks collection
        const reviewsSnapshot = await getDocs(collection(db, "customerFeedbacks"));

        const reviewsData: Review[] = [];

        // Step 2: Fetch user info for each review
        for (const reviewDoc of reviewsSnapshot.docs) {
          const review = reviewDoc.data() as Review;
          const userEmail = review.userEmail;

          // Ensure the userEmail exists and is valid
          if (userEmail) {
            try {
              // Fetch user details from the 'users' collection using userEmail as the doc ID
              const userDocRef = doc(db, "users", userEmail);
              const userDoc = await getDoc(userDocRef);
              const user = userDoc.exists()
                ? userDoc.data()
                : { firstName: "Unknown", lastName: "User" };

              // Combine review data with user info
              const combinedReview = {
                ...review,
                name: `${user.firstName} ${user.lastName}`, // Combine first and last name
              };

              reviewsData.push(combinedReview);
            } catch (userError) {
              console.error(
                `Error fetching user info for ${userEmail}:`,
                userError
              );
              reviewsData.push({
                ...review,
                name: "Unknown User", // Fallback in case of error fetching user data
              });
            }
          } else {
            console.warn("Missing or invalid userEmail in review:", review);
          }
        }

        // Step 3: Sort reviews by date and time in descending order
        const sortedReviews = reviewsData.sort((a, b) => {
          const dateA = new Date(`${a.dateAdded} ${a.timeAdded}`);
          const dateB = new Date(`${b.dateAdded} ${b.timeAdded}`);
          return dateB.getTime() - dateA.getTime(); // Sort in descending order
        });

        // Step 4: Get the latest 5 reviews
        setLatestReviews(sortedReviews.slice(0, 5));
      } catch (error) {
        console.error("Error fetching reviews or user info:", error);
      }
    };

    fetchReviews();
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div className="mt-14 min-h-[calc(100vh-56px)] w-full px-10 md:px-24 2xl:px-56">
      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>
      <div className="w-full max-w-[1400px] py-4">
      <div className="flex w-full items-center gap-2 justify-between mb-4">
          <div className="w-full flex gap-4 items-center">
            <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
            <span className="text-2xl text-center font-bold text-orange-900">
              Dashboard
            </span>
            <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          </div>
          <Link
            href={`/adminhome/announcement`}
            className="h-10 bg-orange-950 shadow-md rounded-md pt-2.5 w-full max-w-[170px] sm:pt-2 text-sm sm:text-base
                font-bold text-white hover:scale-[1.02] hover:bg-orange-900 duration-200 text-center
                sm:max-w-[200px]"
          >
            Make Announcement
          </Link>
        </div>
        <div className="flex flex-row-reverse w-full items-center justify-between mb-4">
          <button
            className="font-bold h-10 bg-[#F0565F] max-w-[170px] w-full text-white duration-200
          rounded-md shadow-md text-sm sm:text-base sm:max-w-[200px] hover:bg-red-400 hover:scale-[1.02]"
            onClick={(e) => {
              e.stopPropagation();
              setIsFormOpen((prev) => !prev); // Toggle state directly
            }}
          >
            Input Expenses
          </button>
          <select
            name="timeframe"
            id="timeframe"
            className="bg-white border-2 border-gray-100 shadow-md rounded-md h-10 font-bold
            text-gray-500 w-full max-w-[120px] text-center text-sm sm:text-base cursor-pointer"
            onChange={handleTimeFrameChange}
          >
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* NET SALES AND EXPENSES SECTION */}
          <div
            className="aspect-video rounded-md shadow-md border-2 border-gray-100 md:col-span-2 flex flex-col justify-start items-center p-2 md:p-4
          bg-white"
          >
            <h1 className="font-bold text-gray-700 text-center">
              Net Sales and Expenses -{" "}
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
            </h1>
            <NetSalesExpensesGraph timeFrame={timeFrame} />
          </div>

          {/* FOODS AND DRINKS SOLD SECTION */}
          <div
            className="aspect-video rounded-md shadow-md border-2 border-gray-100 md:col-span-2 flex flex-col justify-start items-center p-2 md:p-4
          bg-white"
          >
            <h1 className="font-bold text-gray-700">
              Foods and Drinks Sold -{" "}
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
            </h1>
            <FoodDrinksGraph timeFrame={timeFrame} />
          </div>

          {/* AVERAGE ORDERS SECTION */}
          <div
            className="aspect-video rounded-md shadow-md border-2 border-gray-100 md:col-span-2 flex flex-col justify-start items-center p-2 md:p-4
          bg-white"
          >
            <h1 className="font-bold text-gray-700">Avg. Orders Per Day</h1>
            <AverageOrdersGraph />
          </div>

          {/* TOP SPENDERS SECTION */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-lg font-bold text-orange-950">
                Top Spenders
              </h1>
              <Link
                href={`/fkstllaccounts`}
                className="h-10 bg-white border-2 border-gray-100 shadow-md rounded-md pt-2 px-1 text-sm
                font-bold text-gray-500 hover:scale-[1.02] hover:bg-gray-50 duration-200 w-[160px] text-center"
              >
                All Customers
              </Link>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              {topSpendingCustomers
                .sort((a, b) => b.amount - a.amount) // Sort in descending order
                .slice(0, 10) // Limit to top 10
                .map((cus, index) => (
                  <div
                    key={cus.username} // Add a unique key for each item
                    className="w-full border-gray-100 border-2 shadow-md rounded-md pt-2 pb-4 px-4 bg-white flex flex-col gap-0"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-2 w-2/3">
                        {/* CROWNS FOR TOP SPENDERS */}
                        {index === 0 && (
                          <i
                            className="fa fa-crown text-yellow-500 text-md"
                            aria-hidden="true"
                          ></i> // Gold Crown
                        )}
                        {index === 1 && (
                          <i
                            className="fa fa-crown text-gray-400 text-md"
                            aria-hidden="true"
                          ></i> // Silver Crown
                        )}
                        {index === 2 && (
                          <i
                            className="fa fa-crown text-orange-700 text-md"
                            aria-hidden="true"
                          ></i> // Bronze Crown
                        )}
                        {index >= 3 && (
                          <i
                            className="fa fa-crown text-orange-100 text-md"
                            aria-hidden="true"
                          ></i> // Gray Crown
                        )}
                        <h1 className="text-sm font-semibold text-gray-900">
                          {cus.firstName} {cus.lastName}
                        </h1>
                      </div>
                      <h1 className="text-[13px] pt-[2px] w-1/3 text-right font-semibold text-gray-900">
                        PHP {cus.amount.toFixed(2)}
                      </h1>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <h1 className="text-xs text-gray-400 font-light">
                        {cus.username}
                      </h1>
                      <h1
                        className={`text-xs uppercase font-semibold ${
                          cus.membership === "REGULAR"
                            ? "text-neutral-500"
                            : cus.membership === "BRONZE"
                            ? "text-orange-800"
                            : cus.membership === "SILVER"
                            ? "text-gray-300"
                            : cus.membership === "GOLD"
                            ? "text-yellow-500"
                            : "text-emerald-400"
                        }`}
                      >
                        {cus.membership}
                      </h1>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <div className="flex w-full items-center justify-between gap-2">
              <h1 className="text-lg font-bold text-orange-950">
                Customer Reviews
              </h1>
              <Link
                href={`/adminhome/reviews`}
                className="h-10 bg-white border-2 border-gray-100 shadow-md rounded-md pt-2 px-2 text-sm
      font-bold text-gray-500 hover:scale-[1.02] hover:bg-gray-50 duration-200 w-24 text-center"
              >
                See All
              </Link>
            </div>

            <div
              className="aspect-square rounded-md shadow-md border-2 border-gray-100 flex flex-col justify-start items-center p-2 md:p-4
          bg-white"
            >
              <h1 className="font-bold text-gray-700">Customer Reviews</h1>
              <LikesDislikesChart />
            </div>

            {/* CUSTOMER REVIEWS */}
            <div className="flex flex-col gap-1 pb-2 justify-center overflow-y-auto">
              {latestReviews.map((rev) => (
                <div
                  className="w-full border-gray-100 border-2 shadow-md rounded-md pt-2 pb-4 px-4 bg-white flex flex-col gap-1"
                  key={rev.id}
                >
                  <div className="w-full flex items-center gap-2">
                    <i
                      className={`fa fa-thumbs-${
                        rev.positiveFeedback
                          ? "up text-[#60A66F]"
                          : "down text-[#F0565F]"
                      } text-lg`}
                      aria-hidden="true"
                    ></i>
                    <span className="text-md font-semibold text-gray-900">
                      {rev.name}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{rev.userEmail} - </span> {/* Updated email */}
                    <span>
                      {rev.dateAdded} - {rev.timeAdded}
                    </span>{" "}
                    {/* Updated date and time */}
                  </div>
                  <p className="text-gray-700 text-sm italic">
                  {`"${rev.comments}"`}
                  </p>{" "}
                  {/* Updated review content */}
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="mt-10 mb-4" />
        <div className="w-full justify-center flex">
          <div
            className="flex flex-col w-full items-center mb-4 max-w-[300px] bg-white border-2
        border-gray-100 shadow-md rounded-md px-6 py-4 gap-2"
          >
            <h1 className="font-bold text-base text-orange-950 text-center">
              Customer Orders -{" "}
              <span
                className={
                  isOrderingEnabled ? "text-[#60A66F]" : "text-[#F0565F]"
                }
              >
                {isOrderingEnabled ? "Enabled" : "Disabled"}
              </span>
            </h1>
            <p className="font-light text-gray-500 text-sm text-center mt-[-5px]">
              Click or tap to{" "}
              <span className={`font-normal text-gray-700`}>
                {isOrderingEnabled ? "disable" : "enable"}
              </span>{" "}
              ordering for customers.
            </p>
            <button
              className={`font-bold h-10 ${
                isOrderingEnabled
                  ? "bg-[#F0565F] hover:bg-red-400"
                  : "bg-[#60A66F] hover:bg-green-400"
              } max-w-60 w-full text-white duration-200
          rounded-md shadow-md text-sm hover:scale-[1.02]`}
              onClick={handleToggle}
            >
              {isOrderingEnabled ? "Disable Ordering" : "Enable Ordering"}
            </button>
          </div>
        </div>
      </div>
      <InputExpenses isOpen={isFormOpen} toggleForm={toggleForm} />
    </div>
  );
};

export default AdminHomePage;
