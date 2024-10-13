"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PackageOffers from "@/app/components/PackageOffers";
import { Chosen } from "@/app/data";

const ReservationPage = () => {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();
  const [selectedPackage, setSelectedPackage] = useState("A"); // Default to 'A'

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
    <div className="max-w-md mx-auto p-4 bg-white rounded-md shadow-md mt-20 mb-10">
    {/* HEADER */}
    <div className="mb-4">
      <h1 className="text-xl font-semibold text-gray-700">
        Book Exclusive Café
      </h1>
      {/* USE THIS FOR ERROR PROOFING */}
      <p className="text-xs text-red-500 font-semibold text-center">
        * ! Dito ilalagay ang error proofing. ! *
      </p>
    </div>

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

      {/* RESERVE BUTTON */}
      <button
        type="submit"
        className={`flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
        hover:bg-orange-900 hover:scale-[1.02] duration-300 mt-2 mb-4`}
      >
        <i className="fa fa-book text-sm" aria-hidden="true"></i>
        <span className="font-bold text-md">Reserve Place (P69420)</span>
      </button>
      <p className="text-xs text-orange-900 text-center mb-4">
        There must be a 50% downpayment upon reservation.
      </p>
    </div>
  );
};

export default ReservationPage;