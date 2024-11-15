"use client";
import { customerReviewList } from "@/app/data";
import Link from "next/link";
import React, { useState } from "react";

const CustomerReviewsPage = () => {
  const [review, setReview] = useState("all");

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  // Sort customer reviews by date in descending order
  const sortedReviews = [...customerReviewList].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Descending order
  });

  return (
    <div
      className="w-full mt-14 min-h-[calc(100vh-56px)] px-10 md:px-24 xl:px-56 py-4
    flex items-start justify-center"
    >
      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1200px]">
        {/* HEADER CONTAINER */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1 justify-start">
            <Link
              href={"/adminhome"}
              className="flex items-center space-x-1 font-bold text-orange-950 text-lg sm:text-xl text-left
              hover:text-orange-800 cursor-pointer md:text-2xl"
            >
              <span>Dashboard</span>
              <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
            </Link>
            <h1 className="text-lg sm:text-xl text-orange-950 font-bold md:text-2xl">
              Reviews
            </h1>
          </div>
          <select
            name=""
            id=""
            className="text-center w-32 font-bold text-gray-500 h-10 border-2
            border-gray-100 shadow-md rounded-md"
            onChange={handleReviewChange}
          >
            <option value="all">All</option>
            <option value="like">Like</option>
            <option value="dislike">Dislike</option>
          </select>
        </div>
        {/* REVIEWS CONTAINER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sortedReviews.map((rev) => (
            <div
              className={`w-full border-gray-100 border-2 shadow-md rounded-md pt-2 pb-4 px-4
      bg-white flex flex-col gap-1 ${
        review === "dislike" && rev.like
          ? "hidden"
          : review === "like" && !rev.like
          ? "hidden"
          : "visible"
      }`}
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
  );
};

export default CustomerReviewsPage;
