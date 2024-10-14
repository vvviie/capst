"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PackageOffers from "@/app/components/PackageOffers";
import { Chosen } from "@/app/data";

const ReservationPage = () => {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();
  const [selectedPackage, setSelectedPackage] = useState("A"); // Default to 'A'
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState(12); // Default start time 12 PM
  const [endTime, setEndTime] = useState(12);
  const [totalHours, setTotalHours] = useState(0);
  const [numberOfPersons, setNumberOfPersons] = useState<string>("1"); // Default to '1'
  const packagePricePerPerson = 550; // Price per person
  const [totalPrice, setTotalPrice] = useState(0);
  const [chosenItems, setChosenItems] = useState([]);

  // Set date to 14 days from today
  useEffect(() => {
    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + 14));
    const formattedMinDate = minDate.toISOString().split("T")[0];
    setDate(formattedMinDate);
  }, []);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPackage(e.target.value);
    clearSelectedItems(); // Call the callback function
  };

  const clearSelectedItems = () => {
    // This function will be passed to PackageOffers component
  };
  // Calculate total price whenever numberOfPersons changes
  useEffect(() => {
    if (numberOfPersons === "") {
      setTotalPrice(0);
    } else {
      setTotalPrice(parseInt(numberOfPersons, 10) * packagePricePerPerson);
    }
  }, [numberOfPersons]);

  const handlePersonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Strip out non-numeric characters

    // If the value is empty, set numberOfPersons to an empty string
    if (value === "") {
      setNumberOfPersons("");
    } else {
      // Validate the number of persons (between 1 and 30)
      let numericValue = parseInt(value, 10);
      if (numericValue > 30 || numericValue < 1 || isNaN(numericValue)) {
        numericValue = 1; // Reset to 1 if invalid
      }
      setNumberOfPersons(numericValue.toString()); // Update state
    }
  };

  useEffect(() => {
    setChosenItems([]); // Clear chosen items when package changes
  }, [selectedPackage]);

  const getPastaCount = () => (selectedPackage === "C" ? 2 : 1);
  const getMainsCount = () => (selectedPackage === "A" ? 2 : 3);
  const getDessertCount = () => (selectedPackage === "C" ? 2 : 1);

  // Handle manual time change and validate
  const handleManualTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isStart: boolean
  ) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Strip out non-numeric characters
    let numericValue = parseInt(value, 10);

    // If the value is out of range (0, negative, or above 12), clear it or reset to a valid number
    if (numericValue > 12 || numericValue < 1 || isNaN(numericValue)) {
      numericValue = 0; // Reset to 0 if invalid
    }

    if (isStart) {
      setStartTime(numericValue);
    } else {
      setEndTime(numericValue);
    }
  };

  useEffect(() => {
    const hours =
      endTime >= startTime ? endTime - startTime : endTime + (12 - startTime);
    setTotalHours(hours);
  }, [startTime, endTime]);

  // Calculate total price with excess rate if over 4 hours
  useEffect(() => {
    const excessHours = totalHours > 4 ? totalHours - 4 : 0;
    const excessCharge = excessHours * 2000;
    const basePricePerPerson =
      selectedPackage === "A" ? 550 : selectedPackage === "B" ? 600 : 700;
    const basePrice =
      numberOfPersons === ""
        ? basePricePerPerson
        : basePricePerPerson * parseInt(numberOfPersons, 10);
    setTotalPrice(basePrice + excessCharge);
  }, [totalHours, selectedPackage, numberOfPersons]);

  const handleFinalize = (chosenItemsArray) => {
    setChosenItems(chosenItemsArray);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-md shadow-md mt-20 mb-10">
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-700">
          Book Exclusive Café
        </h1>
        <p className="text-xs text-red-500 font-semibold text-center">
          * Dito ilalagay ang error proofing. *
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
          min={date}
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
            className="border-2 border-solid border-orange-900 w-1/5 h-10 px-3 rounded-md bg-orange-50"
            name="timeStartingHour"
            id="inputTimeStartingHour"
            type="tel" // or you can use inputmode="numeric"
            inputMode="numeric"
            pattern="[0-9]*"
            value={startTime === 0 ? "" : startTime} // to handle default 12 with clearing issue
            onChange={(e) => handleManualTimeChange(e, true)}
            required
          />
          <span className="text-gray-500">TO</span>
          <input
            className="border-2 border-solid border-orange-900 w-1/5 h-10 px-3 rounded-md bg-orange-50"
            name="timeEndingHour"
            id="inputTimeEndingHour"
            type="tel" // or inputmode="numeric"
            inputMode="numeric"
            pattern="[0-9]*"
            value={endTime === 0 ? "" : endTime}
            onChange={(e) => handleManualTimeChange(e, false)}
            required
          />
          <span className="text-gray-500">PM</span>
          <span className="text-orange-900 pl-2">
            {" "}
            | Total hours: {totalHours}
          </span>
        </div>
        <p className="text-xs text-orange-900 pl-2">
          Inclusive of 3-4 hours exclusive usage and services. Excess rate:
          P2,000/hour.
          <span className="text-orange-600 font-semibold">
            {" "}
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
            className="border-2 border-solid border-orange-900 w-1/2 h-10 px-3 rounded-md bg-orange-50"
            name="packageOffer"
            id="selectPackageOffer"
            value={selectedPackage}
            onChange={handlePackageChange}
          >
            <option value="A">A - P550 per person</option>
            <option value="B">B - P600 per person</option>
            <option value="C">C - P700 per person</option>
          </select>
          <PackageOffers
            selectedPackage={selectedPackage}
            onFinalize={handleFinalize}
            onPackageChange={clearSelectedItems} // Pass the callback function
          />
        </div>
        <p className="text-xs text-orange-900 pl-2 mt-1">
          Buffet: 1 Rice, 1 Veggie, {getPastaCount()} Pasta, {getMainsCount()}{" "}
          Mains, {getDessertCount()} Dessert
        </p>
      </div>
      {/*BUFFET AND SERVICES CONTENTS */}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-gray-700 flex items-center space-x-1 font-semibold">
          You've chosen:
        </span>
        <div className="text-sm">
          {chosenItems.map((item) => (
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
            <span className="font-semibold text-orange-700">Inclusions - </span>
            <span className="text-orange-600">
              1 Rice, Unlimited Ice Tea or Cucumber Lemonade, 20% off of Café
              Drinks
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
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          max={30}
          placeholder="Number of Persons"
          value={numberOfPersons} // Bind the value to the state
          onChange={handlePersonsChange} // Handle changes
          required
        />
        <p className="text-xs text-orange-900 pl-2">
          Maximum of 30 persons can be accommodated.
        </p>
      </div>
      {/* RESERVE BUTTON */}
      <button
        type="submit"
        className={`flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950 hover:bg-orange-900 hover:scale-[1.02] duration-300 mt-2 mb-4`}
      >
        <i className="fa fa-book text-sm" aria-hidden="true"></i>
        <span className="font-bold text-md">Reserve Place (P{totalPrice})</span>
      </button>
      <p className="text-xs text-orange-900 text-center mb-4">
        There must be a 50% downpayment upon reservation.
      </p>{" "}
    </div>
  );
};

export default ReservationPage;
