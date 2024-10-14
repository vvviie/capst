"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Chosen, Promo, Reserve } from "@/app/data";
import { useState, useEffect } from "react";
import PackageOffers from "@/app/components/PackageOffers";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import { auth, db } from "@/app/firebase";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";

const ReservationPage = () => {
  const pathname = usePathname();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const slug = pathname.split("/").pop();
  const [selectedPackage, setSelectedPackage] = useState("A"); // Default to 'A'
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [numberOfPersons, setNumberOfPersons] = useState<number>(1);
  const [hourInput, setHourInput] = useState<number | "">(""); 
  const [minuteInput, setMinuteInput] = useState<number | "">("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const loggedIn = !!authUser && authUser.emailVerified;
      setIsLoggedIn(loggedIn);
      setUserEmail(authUser?.email || null);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (!authToken) {
    } else {
      // Cookie is found, proceed to check Firebase auth state
      const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        if (authUser && authUser.emailVerified) {
          setIsLoggedIn(true);
        }
      });

      // Clean up the listener when component unmounts
      return () => unsubscribeAuth();
    }
  }, [router]);

  useEffect(() => {
    // Calculate the date 5 days from today
    const today = new Date();
    today.setDate(today.getDate() + 5); // Add 5 days

    // Format the date to YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');

    // Set the min date in the correct format
    setMinDate(`${yyyy}-${mm}-${dd}`);
}, []);

  const handleNumberOfPersonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 20) {
      setNumberOfPersons(20); // Set to 20 if exceeds max
    } else {
      setNumberOfPersons(value);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    
    // Check if minute exceeds 59
    if (value > 59) {
      setMinuteInput(59); // Revert to 59
    } else {
      setMinuteInput(value);
    }
  };

  // Handle form submission
  const generateOrderId = () =>
    Math.floor(1000000000 + Math.random() * 9000000000).toString();
  
  const validateDate = (selectedDate: string) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current date to midnight

    const inputDate = new Date(selectedDate);
    inputDate.setHours(0, 0, 0, 0); // Normalize input date to midnight

    // Check if the selected date is in the past
    if (inputDate < currentDate) {
        setDateError("Selected date cannot be in the past!"); // Error for past date
        return false;
    }

    const minDate = new Date(currentDate);
    minDate.setDate(minDate.getDate() + 5); // Calculate the minimum valid date

    // Check if the selected date is less than 5 days from today
    if (inputDate < minDate) {
        setDateError("Selected date must be at least 5 days from today!"); // Error for insufficient future date
        return false;
    }

    // If it passes both checks, return true
    return true;
};
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const dateInput = (document.getElementById("inputDate") as HTMLInputElement)?.value;
  const hourInput = parseInt((document.getElementById("inputTimeHour") as HTMLInputElement)?.value, 10);
  const minuteInput = parseInt((document.getElementById("inputTimeMinute") as HTMLInputElement)?.value, 10);
  const num = numberOfPersons;

  // Validate that all required fields are filled
  if (!dateInput || isNaN(hourInput) || isNaN(minuteInput) || !num) {
      setError("Please fill in all required fields."); // Show error message
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      return;
  }

  // Check for hour input of 0 specifically
  if (hourInput === 0) {
      setError("Please enter a valid hour."); // Show error message for invalid hour
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      return;
  }

  // Validate date
  if (!validateDate(dateInput)) {
      // An error message is already set in validateDate, so just return
      setTimeout(() => setDateError(""), 3000); // Clear the date error after 3 seconds
      return;
  }

  const orderId = generateOrderId();
  const now = new Date();

  const dateReserved = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
      now.getDate()
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const timeReserved = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
  ).padStart(2, "0")}`;

  // Format date and time to be reserved
  const dateToBeReserved = new Date(dateInput);
  const formattedDateToBeReserved = `${String(dateToBeReserved.getMonth() + 1).padStart(2, "0")}/${String(
      dateToBeReserved.getDate()
  ).padStart(2, "0")}/${dateToBeReserved.getFullYear()}`;

  const timeToBeReserved = `${String(hourInput).padStart(2, "0")}:${String(minuteInput).padStart(2, "0")}`;

  try {
      await setDoc(doc(db, "tableReservations", orderId), {
          dateReserved,
          timeReserved,
          numberOfPersons: num,
          reservedBy: userEmail,
          status: "PENDING",
          dateToBeReserved: formattedDateToBeReserved,
          timeToBeReserved,
      });

      setIsPopupVisible(true); // Show success popup
      setTimeout(() => setIsPopupVisible(false), 750);
  } catch (error) {
      console.error("Error adding reservation: ", error);
      alert("Failed to make reservation. Please try again.");
  }
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
          {error && (
            <p className="text-xs text-red-500 font-semibold my-[-20px] text-center">
              {error}
            </p>
          )}

          {timeError && (
              <p className="text-xs text-red-500 font-semibold my-[-20px] text-center">
                  {timeError}
              </p>
          )}

          {dateError && (
                <p className="text-xs text-red-500 font-semibold my-[-20px] text-center">
                    {dateError}
                </p>
            )}
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
                  min={minDate}
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
                    value={minuteInput} // Bind to state
                    onChange={handleMinuteChange} // Use new handler
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
                  value={numberOfPersons} // Bind the state variable here
                  onChange={handleNumberOfPersonsChange} // Use the new change handler
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
            onClick={(e) => handleSubmit(e)}
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
