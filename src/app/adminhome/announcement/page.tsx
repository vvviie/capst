"use client";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React, { useState } from "react";

const MakeAnnouncementPage = () => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);

  const handleSubmit = () => {
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };

  return (
    <div className="mt-14 min-h-[57vh] sm:min-h-[80vh] w-full px-10 md:px-24 xl:px-56 flex justify-center items-start">
      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>
      {/* MAIN CONTAINER */}
      <div className="max-w-[600px] w-full flex flex-col gap-2 py-4">
        {/* HEADER CONTAINER */}
        <div className="flex items-center gap-1 justify-start">
          <Link
            href={"/adminhome"}
            className="flex items-center space-x-1 font-bold text-orange-950 text-xl text-left
              hover:text-orange-800 cursor-pointer lg:text-2xl"
          >
            <span>Dashboard</span>
            <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
          </Link>
          <h1 className="text-xl text-orange-950 font-bold lg:text-2xl">
            Announcement
          </h1>
        </div>
        {/* ANNOUNCEMENT FORM */}
        <form
          action=""
          className="bg-white border-2 border-gray-100 rounded-md shadow-md pt-4 pb-6 px-6
          flex flex-col gap-2"
        >
          <h1 className="flex items-center gap-2 text-gray-900 font-semibold text-xl mb-2">
            <i className="fa fa-bullhorn" aria-hidden="true"></i>
            <span>Make an announcement!</span>
          </h1>
          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor={`inputSubject`}
            >
              <span>Subject</span>
            </label>
            <input
              className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
              name={`inputSubject`}
              id={`inputSubject`}
              type="text"
              placeholder="Subject"
              required
            />
          </div>

          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor={`inputBody`}
            >
              <span>Body</span>
            </label>
            <textarea
              className="border-2 border-solid border-orange-900 w-full pl-2 
              rounded-md bg-orange-50 h-36"
              name={`inputBody`}
              id={`inputBody`}
              placeholder="Body"
              required
            />
            <button
              className="w-full bg-orange-950 text-white font-bold h-10 shadow-md
            hover:bg-orange-900 hover:scale-[1.02] duration-200 rounded-md mt-2"
              onClick={() => handleSubmit()}
            >
              Publish
            </button>
          </div>
        </form>
      </div>
      {isPopUpVisible && <CheckoutPopup message={"Announcement Published!"} />}
    </div>
  );
};

export default MakeAnnouncementPage;
