"use client";

import React, { useState } from "react";
import NetSalesExpensesGraph from "../components/NetSalesExpensesGraph";
import FoodDrinksGraph from "../components/FoodDrinksGraph";
import AverageOrdersGraph from "../components/AverageOrdersGraph";
import LikesDislikesChart from "../components/LikesDislikesChart";
import { customerReviewList, topSpendingCustomers } from "../data";
import Link from "next/link";
import InputExpenses from "../components/InputExpenses";

const AdminHomePage = () => {
  const [timeFrame, setTimeFrame] = useState("today");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
  };

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  // GETS THE FIVE LATEST REVIEWS TO DISPLAY
  const latestReviews = customerReviewList
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB - dateA; // Sort in descending order
    })
    .slice(0, 5);

  return (
    <div className="mt-14 min-h-[calc(100vh-56px)] w-full px-10 md:px-24 2xl:px-56">
      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>
      <div className="w-full max-w-[1400px] py-4">
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="font-bold text-orange-950 text-lg sm:text-2xl">
            Dashboard
          </h1>
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
            onClick={() => {
              setIsFormOpen(true);
              e.stopPropagation();
              toggleForm();
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
                      <h1 className="text-sm w-1/3 text-right font-semibold text-gray-900">
                        PHP {cus.amount}
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
                  className="w-full border-gray-100 border-2 shadow-md rounded-md pt-2 pb-4 px-4
        bg-white flex flex-col gap-1"
                  key={rev.id}
                >
                  <div className="w-full flex items-center gap-2">
                    <i
                      className={`fa fa-thumbs-${
                        rev.like ? "up text-[#60A66F]" : "down text-[#F0565F]"
                      } text-lg`}
                      aria-hidden="true"
                    ></i>
                    <span className="text-md font-semibold text-gray-900">
                      {rev.name}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{rev.email} - </span>
                    <span>
                      {rev.date} - {rev.time}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm italic">"{rev.review}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <InputExpenses isOpen={isFormOpen} toggleForm={toggleForm} />
    </div>
  );
};

export default AdminHomePage;
