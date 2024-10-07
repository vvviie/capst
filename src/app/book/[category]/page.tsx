"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Chosen, Promo, Reserve } from "@/app/data";
import { useState } from "react";
import PackageOffers from "@/app/components/PackageOffers";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";

const ReservationPage = () => {
  const pathname = usePathname();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const slug = pathname.split("/").pop();
  const [selectedPackage, setSelectedPackage] = useState("A"); // Default to 'A'

  // Handle form submission
  const handleSubmit = () => {
    // Show the popup when the form is submitted
    setIsPopupVisible(true);

    // Hide the popup after 1.5 seconds
    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };
  const handlePackageChange = (e) => {
    setSelectedPackage(e.target.value);
  };
  const getPastaCount = () => {
    return selectedPackage === "C" ? 2 : 1;
  };
  const getMainsCount = () => {
    return selectedPackage === "A" ? 2 : 3;
  };
  const getDessertCount = () => {
    return selectedPackage === "C" ? 2 : 1;
  };

  return (
    <div
      className="h-auto lg:min-h-[69.2vh] bg-white mt-14 py-6 px-10 lg:flex lg:flex-col
    lg:justify-center lg:px-24 lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center
    lg:gap-4 xl:px-56 items-center lg:py-16"
    >
      {/* HEADER */}
      <Link
        href={"/book"}
        className="flex items-center space-x-2 font-bold text-orange-950 text-2xl text-left w-full
      max-w-[1000px] lg:min-w-[800px] hover:text-orange-800 cursor-pointer mb-2"
      >
        <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
        <i className="fa fa-book text-lg" aria-hidden="true"></i>
        <span>Booking</span>
      </Link>
      <div
        className="bg-white rounded-md shadow-md pt-3 border-gray-100 border-2 overflow-clip flex flex-col
      lg:flex-row-reverse lg:pt-0 lg:rounded-lg lg:min-w-[800px] w-full max-w-[1000px]"
      >
        {/* RESERVATION FORM */}
        <form
          action=""
          className="flex flex-col gap-4 px-4 mb-6 lg:w-1/2 lg:mb-0 lg:py-4 lg:gap-6"
        >
          {/* HEADER */}
          <h1 className="text-xl font-semibold text-gray-700">
            {slug === "table"
              ? "Table Reservation"
              : slug === "event"
              ? "Book Exclusive Café"
              : "Mobile Café Booking"}
          </h1>
          {/* USE THIS FOR ERROR PROOFING */}
          <p
            className={`text-xs text-red-500 font-semibold my-[-20px] text-center ${
              slug === "mobilecafe" ? "hidden" : ""
            }`}
          >
            * ! Dito ilalagay ang error proofing. ! *
          </p>
          {slug === "table" ? (
            //#region Table Reservation
            <>
              {/* DATE */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                  <span>Date</span>
                </span>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 px-3 rounded-md bg-orange-50"
                  name="date"
                  id="inputDate"
                  type="date"
                  required
                />

                <p className="text-xs text-orange-900 pl-2">
                  Reservation must be made at least 5 days after today.
                </p>
              </div>
              {/* TIME */}
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center space-x-1 text-sm text-gray-500">
                  <i className="fas fa-clock" aria-hidden="true"></i>
                  <span>Time</span>
                </span>
                <div className="w-full flex gap-2 justify-start items-center">
                  <input
                    className="border-2 border-solid border-orange-900 w-2/5 h-10 px-3 rounded-md bg-orange-50
            inline-block"
                    name="timeHour"
                    id="inputTimeHour"
                    type="number"
                    placeholder="Hour (12-7)"
                    min={7}
                    max={12}
                    required
                  />
                  <span>:</span>
                  <input
                    className="border-2 border-solid border-orange-900 w-2/5 h-10 px-3 rounded-md bg-orange-50
            inline-block"
                    name="timeMinute"
                    id="inputTimeMinute"
                    type="number"
                    placeholder="Min (00-59)"
                    min={0}
                    max={59}
                    required
                  />
                  <span className="text-gray-500">PM</span>
                </div>
              </div>
              {/* PAX */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <i className="fa-solid fa-user-group"></i>
                  <span>Number of Persons</span>
                </span>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 px-3 rounded-md bg-orange-50"
                  name="numberOfPersons"
                  id="inputNumberOfPersons"
                  type="number"
                  min={1}
                  max={20}
                  placeholder="Number of Persons"
                  required
                />
              </div>
            </>
          ) : //#endregion
          slug === "event" ? (
            //#region Exclusive Café
            <>
              {/* DATE */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                  <span>Date</span>
                </span>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 px-3 rounded-md bg-orange-50"
                  name="date"
                  id="inputDate"
                  type="date"
                  required
                />
                <p className="text-xs text-orange-900 pl-2">
                  Reservation must be made at least 14 days after today.
                </p>
              </div>

              {/* TIME AND HOURS */}
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center space-x-1 text-sm text-gray-500">
                  <i className="fas fa-clock" aria-hidden="true"></i>
                  <span>Time</span>
                </span>
                <div className="w-full flex gap-2 justify-start items-center">
                  <input
                    className="border-2 border-solid border-orange-900 w-2/5 h-10 px-3 rounded-md bg-orange-50
            inline-block"
                    name="timeStartingHour"
                    id="inputTimeStartingHour"
                    type="number"
                    placeholder="Start"
                    min={1}
                    max={12}
                    required
                  />
                  <span className="text-gray-500">TO</span>
                  <input
                    className="border-2 border-solid border-orange-900 w-2/5 h-10 px-3 rounded-md bg-orange-50
            inline-block"
                    name="timeEndingHour"
                    id="inputTimeEndingHour"
                    type="number"
                    placeholder="End"
                    min={1}
                    max={12}
                    required
                  />
                  <span className="text-gray-500">PM</span>
                </div>
                <p className="text-xs text-orange-900 pl-2">
                  Inclusive of 3-4 hours exclusive usage and services. Excess
                  rate: P2,000/hour.{" "}
                  <span className="text-orange-600 font-semibold">
                    Café opens at 12pm.
                  </span>
                </p>
              </div>

              {/* PACKAGE */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <i className="fa-solid fa-user-group"></i>
                  <span>Package Offers</span>
                </span>
                <div className="flex gap-2 items-center">
                  <select
                    className="border-2 border-solid border-orange-900 w-1/2 h-10 px-3 rounded-md bg-orange-50 overflow-clip"
                    name="packageOffer"
                    id="selectPackageOffer"
                    value={selectedPackage}
                    onChange={handlePackageChange}
                  >
                    <option value="A">A - P550 per person</option>
                    <option value="B">B - P600 per person</option>
                    <option value="C">C - P700 per person</option>
                  </select>
                  <PackageOffers selectedPackage={selectedPackage} />
                </div>
                <p className="text-xs text-orange-900 pl-2 mt-1">
                  Buffet: 1 Rice, 1 Veggie, {getPastaCount()} Pasta,{" "}
                  {getMainsCount()} Mains, {getDessertCount()} Dessert
                </p>
              </div>

              {/*BUFFET AND SERVICES CONTENTS */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-700 flex items-center space-x-1 font-semibold">
                  You've chosen:
                </span>
                <div className="text-sm">
                  {Chosen.map((item) => (
                    <div className="space-x-2">
                      {/* TYPE OF FOOD */}
                      <span className="font-semibold text-orange-700">
                        {item.title} -
                      </span>
                      {/* FOODS */}
                      {item.items.map((foods) => (
                        <span className="text-orange-600">{foods}, </span>
                      ))}
                    </div>
                  ))}
                  <div className="space-x-2">
                    <span className="font-semibold text-orange-700">
                      Inclusions -{" "}
                    </span>
                    <span className="text-orange-600">
                      1 Rice, Unlimited Ice Tea or Cucumber Lemonade, 20% off of
                      Café Drinks
                    </span>
                  </div>
                </div>
              </div>

              {/* PAX */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <i className="fa-solid fa-user-group"></i>
                  <span>Number of Persons</span>
                </span>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 px-3 rounded-md bg-orange-50"
                  name="numberOfPersons"
                  id="inputNumberOfPersons"
                  type="number"
                  min={1}
                  max={30}
                  placeholder="Number of Persons"
                  required
                />
                <p className="text-xs text-orange-900 pl-2">
                  Maximum of 30 persons can be accommodated.
                </p>
              </div>
            </>
          ) : (
            //#endregion
            //#region Mobile Café
            <>
              <div className="text-2xl text-gray-400 h-96 text-center flex items-center justify-center">
                <span className="font-semibold">Mobile Café coming soon!</span>
              </div>
            </>
            //#endregion
          )}
          {/* RESERVE BUTTON */}
          <button
            type="submit"
            className={`flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
            hover:bg-orange-900 hover:scale-[1.02] duration-300 mt-2 ${
              slug === "mobilecafe" ? "hidden" : ""
            }`}
            onClick={() => {
              handleSubmit();
            }}
          >
            <i className="fa fa-book text-sm" aria-hidden="true"></i>
            <span className="font-bold text-md">
              {slug === "table"
                ? "Reserve Table"
                : slug === "event"
                ? "Reserve Place (P69420)"
                : "Book Mobile Café"}{" "}
            </span>
          </button>
          <p
            className={`${
              slug === "Event" ? "" : "hidden"
            } text-xs text-orange-900 text-center mt-[-10px]`}
          >
            There must be a 50% downpayment upon reservation.
          </p>
        </form>
        {/* IMAGE CONTAINER */}
        <div className="w-full aspect-video relative lg:aspect-auto lg:w-1/2 z-0">
          <Image
            src={
              slug === "table"
                ? Reserve[0].img
                : slug === "event"
                ? Reserve[1].img
                : Reserve[2].img
            }
            fill
            className="object-cover lg:h-full"
          />
        </div>
      </div>
      {/* BOOKING MADE POP UP */}
      {isPopupVisible && <CheckoutPopup message="Booking Requested!" />}
    </div>
  );
};

export default ReservationPage;
