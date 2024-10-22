"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Chosen, Promo, Reserve } from "@/app/data";
import PackageOffers from "@/app/components/PackageOffers";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import { auth, db } from "@/app/firebase";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
z
const ReservationPage = () => {
  //#region Global Variables
  const pathname = usePathname();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const slug = pathname.split("/").pop();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const [date, setDate] = useState("");
  const [minDate, setMinDate] = useState(""); // used by "table" & "event"
  const [error, setError] = useState<boolean>(false); // used by "table" & "event"
  //#endregion

  //#region "table" Variables
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [hourInput, setHourInput] = useState<number | "">("");
  const [minuteInput, setMinuteInput] = useState<number | "">("");
  const [numberOfPersonsTable, setNumberOfPersonsTable] = useState<number>(1);
  //#endregion

  //#region "event" Variables
  const [selectedPackage, setSelectedPackage] = useState("A"); // Default to 'A'
  const [startTime, setStartTime] = useState(12); // Default start time 12 PM
  const [endTime, setEndTime] = useState(12);
  const [totalHours, setTotalHours] = useState(0);
  const packagePricePerPerson = 550; // Price per person
  const [totalPrice, setTotalPrice] = useState(0);
  const [chosenItems, setChosenItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [numberOfPersonsEvent, setNumberOfPersonsEvent] = useState<number>(1);
  //#endregion

  //#region Global EffectHooks
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
  //#endregion

  //#region "table" EffectHooks
  useEffect(() => {
    // Calculate the date 5 days from today
    const today = new Date();
    today.setDate(today.getDate() + 5); // Add 5 days

    // Format the date to YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");

    // Set the min date in the correct format
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleNumberOfPersonsTableChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (value > 20) {
      setNumberOfPersonsTable(20); // Set to 20 if exceeds max
    } else {
      setNumberOfPersonsTable(value);
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

    const dateInput = (document.getElementById("inputDate") as HTMLInputElement)
      ?.value;
    const hourInput = parseInt(
      (document.getElementById("inputTimeHour") as HTMLInputElement)?.value,
      10
    );
    const minuteInput = parseInt(
      (document.getElementById("inputTimeMinute") as HTMLInputElement)?.value,
      10
    );
    const num = numberOfPersonsTable;
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

    const dateReserved = `${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
    const timeReserved = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // Format date and time to be reserved
    const dateToBeReserved = new Date(dateInput);
    const formattedDateToBeReserved = `${String(
      dateToBeReserved.getMonth() + 1
    ).padStart(2, "0")}/${String(dateToBeReserved.getDate()).padStart(
      2,
      "0"
    )}/${dateToBeReserved.getFullYear()}`;

    const timeToBeReserved = `${String(hourInput).padStart(2, "0")}:${String(
      minuteInput
    ).padStart(2, "0")}`;

    try {
      await setDoc(doc(db, "tableReservations", orderId), {
        dateReserved,
        timeReserved,
        numberOfPersonsTable: num,
        reservedBy: userEmail,
        status: "PENDING",
        dateToBeReserved: formattedDateToBeReserved,
        timeToBeReserved,
        type: "Table",
      });

      setIsPopupVisible(true); // Show success popup
      setTimeout(() => setIsPopupVisible(false), 750);
    } catch (error) {
      //console.error("Error adding reservation: ", error);
      alert("Failed to make reservation. Please try again.");
    }
  };
  //#endregion

  //#region "events" EffectHooks
  useEffect(() => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 14); // Set minimum date to 14 days from today

    // Format the date to YYYY-MM-DD for the input
    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const dd = String(minDate.getDate()).padStart(2, "0");

    setMinDate(`${yyyy}-${mm}-${dd}`); // Set the state for minDate
  }, []);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPackage(e.target.value);
    clearSelectedItems(); // Call the callback function
  };

  const clearSelectedItems = () => {
    setChosenItems([]); // Clear chosen items when package changes
  };

  // Calculate total price whenever numberOfPersons changes
  useEffect(() => {
    if (numberOfPersonsEvent < 1) {
      setTotalPrice(0);
    } else {
      setTotalPrice(numberOfPersonsEvent * packagePricePerPerson);
    }
  }, [numberOfPersonsEvent]);

  const handlePersonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Strip out non-numeric characters

    // If the value is empty, set numberOfPersons to 1 (or handle it as you prefer)
    if (value === "") {
      setNumberOfPersonsEvent(1); // Set to default value instead of empty
    } else {
      // Validate the number of persons (between 1 and 30)
      let numericValue = parseInt(value, 10);
      if (numericValue > 30) {
        numericValue = 30; // Cap at 30 if exceeds max
      } else if (numericValue < 1 || isNaN(numericValue)) {
        numericValue = 1; // Reset to 1 if invalid
      }
      setNumberOfPersonsEvent(numericValue); // Update state with a number
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
      numberOfPersonsEvent < 1 ? 0 : basePricePerPerson * numberOfPersonsEvent; // Adjusted check
    setTotalPrice(basePrice + excessCharge);
  }, [totalHours, selectedPackage, numberOfPersonsEvent]);

  const handleFinalize = (chosenItemsArray) => {
    setChosenItems(chosenItemsArray);
  };

  const handleReserve = async () => {
    const selectedDate = new Date(date);
    const today = new Date();

    // Set the time to midnight for comparison
    today.setHours(0, 0, 0, 0);

    // Calculate minimum date (14 days in the future)
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 14);

    // Set the time to midnight for minDate as well
    minDate.setHours(0, 0, 0, 0);

    // Check for valid date
    if (isNaN(selectedDate.getTime()) || selectedDate < minDate) {
      setError(true);
      setErrorMessage("Please select a date at least 14 days in the future.");
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }

    if (chosenItems.length === 0) {
      setError(true);
      setErrorMessage('Please complete the "Buffet Contents" selection.');
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }

    /* Validate start and end times
    if (startTime >= endTime) {
      setError(true);
      setErrorMessage("End time must be greater than start time.");
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }*/

    if (startTime < 1 || startTime > 12 || endTime < 1 || endTime > 12) {
      setError(true);
      setErrorMessage("Start and end times must be between 1 and 12.");
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }

    // Format the selected date
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}/${day}/${year}`;
    };

    const formattedDateToBeReserved = formatDate(selectedDate);
    const formattedTime = `${startTime}PM to ${endTime}PM`;
    const packageOffer =
      selectedPackage === "A"
        ? "Package A"
        : selectedPackage === "B"
        ? "Package B"
        : "Package C";
    const buffetChosen = chosenItems.reduce((acc, item) => {
      acc[item.title] = item.items.join(", ");
      return acc;
    }, {});

    const orderId = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();
    const now = new Date();

    const dateReserved = `${
      now.getMonth() + 1
    }/${now.getDate()}/${now.getFullYear()}`;
    const timeReserved = `${now.getHours()}:${now.getMinutes()}`;

    try {
      await setDoc(doc(db, "tableReservations", orderId), {
        dateReserved,
        timeReserved,
        dateToBeReserved: formattedDateToBeReserved,
        timeToBeReserved: formattedTime,
        packageOffer,
        buffetChosen,
        numberOfPersons: numberOfPersonsEvent,
        totalPrice: totalPrice,
        status: "Requested",
        type: "Event",
        reservedBy: userEmail,
      });
      setIsPopupVisible(true);
      setTimeout(() => {
        setIsPopupVisible(false); // Hide after a few seconds if desired
        router.push("/book/reservations"); // Redirect to /book
      }, 3000);
    } catch (error) {
      console.error("Error adding reservation: ", error);
    }
  };

  //#endregion

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
          {error && slug === "table" && (
            <p className="text-xs text-red-500 font-semibold my-[-20px] text-center">
              {error}
            </p>
          )}
          {timeError && slug === "table" && (
            <p className="text-xs text-red-500 font-semibold my-[-20px] text-center">
              {timeError}
            </p>
          )}
          {dateError && slug === "table" && (
            <p className="text-xs text-red-500 font-semibold my-[-20px] text-center">
            {dateError}
        </p>
          )}

          {error &&
            slug === "event" && ( // Only render if there's an error and slug is "event"
              <div className="bg-red-400 border border-red-600 text-white p-2 rounded text-xs text-center">
                <span className="block">{errorMessage}</span>
              </div>
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
                  value={numberOfPersonsTable} // Bind the state variable here
                  onChange={handleNumberOfPersonsTableChange} // Use the new change handler
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
                  value={date}
                  min={minDate}
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
                    className="border-2 border-solid border-orange-900 w-1/4 h-10 px-3 rounded-md bg-orange-50 inline-block"
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
                    className="border-2 border-solid border-orange-900 w-1/4 h-10 px-3 rounded-md bg-orange-50 inline-block"
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
                  <span className="text-orange-900 pl-2 text-sm">
                    | Total hours:
                  </span>
                  <span className="text-orange-900 pl-1 text-2xl font-bold transform -translate-y-1 mt-1">
                    {totalHours}
                  </span>
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
                    onPackageChange={clearSelectedItems}
                  />
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
                  {chosenItems.map((item) => (
                    <div className="space-x-2" key={item.title}>
                      <span className="font-semibold text-orange-700">
                        {item.title} -
                      </span>
                      {item.items.length > 0 ? (
                        item.items.map((food) => (
                          <span className="text-orange-600" key={food}>
                            {food},
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No items selected</span>
                      )}
                    </div>
                  ))}
                  <div className="space-x-2">
                    <span className="font-semibold text-orange-700">
                      Inclusions -
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
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  max={30}
                  placeholder="Number of Persons"
                  value={numberOfPersonsEvent} // Bind to state
                  onChange={handlePersonsChange}
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
            type="button" // Change type to "button" to prevent default form submission
            className={`flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
  hover:bg-orange-900 hover:scale-[1.02] duration-300 mt-2 ${
    slug === "mobilecafe" ? "hidden" : ""
  }`}
            onClick={slug === "event" ? handleReserve : handleSubmit} // Call the appropriate function directly
          >
            <i className="fa fa-book text-sm" aria-hidden="true"></i>
            <span className="font-bold text-md">
              {slug === "table"
                ? "Reserve Table"
                : slug === "event"
                ? "Reserve Place (P" + totalPrice + ")"
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
