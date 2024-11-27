"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
  collection,
  doc,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

const ReservationPage = () => {
  //#region Global Variables
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const slug = pathname.split("/").pop();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const [minDate, setMinDate] = useState(""); // used by "table" & "event"
  const [error, setError] = useState<boolean>(false); // used by "table" & "event"
  //#endregion

  //#region "table" Variables
  const [tableMinDate, setTableMinDate] = useState(""); // New state variable for the 'table' slug
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [hourInput, setHourInput] = useState<number | "">("");
  const [minuteInput, setMinuteInput] = useState<number | "">("");
  const [numberOfPersonsTable, setNumberOfPersonsTable] = useState<number>(1);
  //#endregion

  //#region "event" Variables
  const [date, setDate] = useState("");

  const [startTime, setStartTime] = useState(12); // Default start time 12 PM
  const [endTime, setEndTime] = useState(1);
  const [totalHours, setTotalHours] = useState(0);

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPriceT, setTotalPriceT] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [numberOfPersonsEvent, setNumberOfPersonsEvent] = useState<number>(30);
  const [paymentType, setPaymentType] = useState("downpayment"); // Default to downpayment

  const packagePricePerPerson = 550; // Price per person
  const [selectedPackage, setSelectedPackage] = useState("A"); // Default to 'A'
  const [chosenItems, setChosenItems] = useState([]);
  const [packageChoices, setPackageChoices] = useState([]);
  const [limits, setLimits] = useState({}); // To store limits for each category

  const [remarks, setRemarks] = useState("");
  //#endregion

  //#region Global EffectHooks

  useEffect(() => {
    if (slug === "table") {
      // Calculate the date 5 days from today for the table reservation
      const today = new Date();
      today.setDate(today.getDate() + 5); // Add 5 days

      // Format the date to YYYY-MM-DD
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      // Set the min date for 'table' slug
      setMinDate(`${yyyy}-${mm}-${dd}`);
      setTableMinDate(`${yyyy}-${mm}-${dd}`); // Optional: keep this if you need a separate variable
    } else if (slug === "event") {
      // Calculate the date 14 days from today for the event reservation
      const today = new Date();
      today.setDate(today.getDate() + 14); // Add 14 days

      // Format the date to YYYY-MM-DD
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      // Set the min date for 'event' slug
      setMinDate(`${yyyy}-${mm}-${dd}`);
      setDate(""); // Reset date for event if necessary
    }
  }, [slug]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLoginModal(false);
      }
    };

    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLoginModal]);

  //#endregion

  //#region "table" EffectHooks
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
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
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
      setTimeout(() => setDateError(""), 3000); // Clear the date error after 3 seconds
      return;
    }

    // Check if the number of persons is less than 30 or greater than 50
    if (numberOfPersonsTable > 20) {
      setError(true); // Trigger error state
      setErrorMessage("Number of persons must be below 20.");
      setTimeout(() => {
        setError(false);
      }, 5000); // Clear the error after 5 seconds
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

    const timeToBeReserved = `${
      hourInput > 9 ? hourInput : hourInput % 12
    }:${String(minuteInput).padStart(2, "0")}PM`;

    // Log the reservation details
    console.log("Submitting reservation with the following details:");
    console.log({
      orderId,
      dateReserved,
      timeReserved,
      numberOfPersons: num,
      reservedBy: userEmail,
      status: "PENDING",
      dateToBeReserved: formattedDateToBeReserved,
      timeToBeReserved,
      type: "Table",
    });

    try {
      await setDoc(doc(db, "tableReservations", orderId), {
        dateReserved,
        timeReserved,
        numberOfPersons: numberOfPersonsTable,
        reservedBy: userEmail,
        status: "PENDING",
        dateToBeReserved: formattedDateToBeReserved,
        timeToBeReserved,
        totalPrice: totalPriceT,
        type: "Table",
      });

      console.log("Reservation successfully saved.");
      setIsPopupVisible(true);
      setTimeout(() => {
        setIsPopupVisible(false); // Hide after a few seconds if desired
        router.push("/book/reservations"); // Redirect to /book
      }, 3000);
    } catch (error) {
      console.error("Error adding reservation: ", error);
      alert("Failed to make reservation. Please try again.");
    }
  };
  //#endregion

  //#region "events" EffectHooks

  // useEffect(() => {
  //   const fetchPackageChoices = async () => {
  //     try {
  //       const packageChoicesCollection = collection(db, 'packageOffers');
  //       const packageChoicesSnapshot = await getDocs(packageChoicesCollection);
  //       const choices = packageChoicesSnapshot.docs.map(doc => ({
  //         id: doc.id,
  //         ...doc.data()
  //       }));

  //       console.log("Fetched Package Choices:", choices); // Debugging log
  //       setPackageChoices(choices);
  //     } catch (error) {
  //       console.error("Error fetching package choices:", error);
  //     }
  //   };

  //   fetchPackageChoices();
  // }, []);

  useEffect(() => {
    const fetchPackageChoices = async () => {
      const packageDocRef = doc(db, "packageOffers", "PackageChoices"); // Reference the specific document
      const packageDoc = await getDoc(packageDocRef);

      if (packageDoc.exists()) {
        const data = packageDoc.data();
        // Convert the data to an array
        const choices = Object.entries(data).map(([key, value]) => ({
          id: key,
          label: value.label,
          price: value.price,
        }));

        // Sort choices alphabetically by label
        choices.sort((a, b) => a.id.localeCompare(b.id));

        setPackageChoices(choices);
      } else {
        console.log("No such document!");
      }
    };

    fetchPackageChoices();
  }, []);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const limitsCollection = collection(db, "packageOffers"); // Assuming limits are in the same collection
        const limitsSnapshot = await getDocs(limitsCollection);
        const limitsMap = {};

        limitsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.limits) {
            limitsMap[data.title] = data.limits; // Store limits by document title
          }
        });

        console.log("Fetched Limits:", limitsMap); // Debugging log
        setLimits(limitsMap);
      } catch (error) {
        console.error("Error fetching limits:", error);
      }
    };

    fetchLimits();
  }, []);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPackage(e.target.value);
    clearSelectedItems(); // Call the callback function
  };

  useEffect(() => {
    setChosenItems([]); // Clear chosen items when package changes
  }, [selectedPackage]);

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

  useEffect(() => {
    if (numberOfPersonsTable < 1) {
      setTotalPriceT(0);
    } else {
      setTotalPriceT(numberOfPersonsTable * 50);
    }
  }, [numberOfPersonsTable]);

  const handlePersonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Strip out non-numeric characters

    // Update the state with the current input value
    setNumberOfPersonsEvent(value === "" ? 0 : parseInt(value, 10)); // Set to 0 if empty
  };

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

  // Check for the "user" cookie when the component mounts
  useEffect(() => {
    const userCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("user="));

    if (userCookie) {
      // If user cookie is found, set isLoggedIn to true
      setIsLoggedIn(true);
    } else {
      // If no user cookie is found, show the login modal
      setShowLoginModal(true);
    }

    // Firebase Authentication listener
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setIsLoggedIn(true); // User is authenticated, set loggedIn to true
        setUserEmail(authUser.email); // Optionally store the email
      }
    });

    // Cleanup Firebase listener when component unmounts
    return () => unsubscribeAuth();
  }, []); // Empty dependency array to run once when the component mounts

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLoginModal(false); // Close the modal if clicked outside
      }
    };

    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLoginModal]);

  const handleFinalize = (chosenItemsArray) => {
    setChosenItems(chosenItemsArray);
  };

  // Function to check if a reservation already exists
  const checkExistingReservation = async (
    date: string,
    time: string,
    numberOfPersons: number
  ) => {
    const q = query(
      collection(db, "tableReservations"),
      where("dateToBeReserved", "==", date),
      where("timeToBeReserved", "==", time),
      where("numberOfPersons", "==", numberOfPersons)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Return true if a reservation exists
  };

  const handleReserve = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    // Set the time to midnight for comparison
    today.setHours(0, 0, 0, 0);
    // Calculate minimum date (14 days in the future)
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 14);
    // Set the time to midnight for minDate as well
    minDate.setHours(0, 0, 0, 0);

    //#region Validations
    // Check for 0 hours, meaning the user can't book with the same start and end times
    if (totalHours <= 0) {
      setError(true);
      setErrorMessage(
        "Current Total hours cannot be 0. Please choose a valid time range."
      );
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }

    // Check for valid date
    if (isNaN(selectedDate.getTime()) || selectedDate < minDate) {
      setError(true);
      setErrorMessage("Please select a date at least 14 days in the future.");
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }
    //#region Time StartEnd
    // Helper function to convert 12-hour format to 24-hour format for proper comparison
    function convertTo24Hour(time) {
      if (time === 12) return 12; // 12 PM is 12 in 24-hour format
      if (
        time === 1 ||
        time === 2 ||
        time === 3 ||
        time === 4 ||
        time === 5 ||
        time === 6 ||
        time === 7 ||
        time === 8 ||
        time === 9 ||
        time === 10 ||
        time === 11
      ) {
        return time + 12; // PM times are 13-23 in 24-hour format
      }
      return time; // AM times stay the same
    }

    // Convert startTime and endTime to 24-hour format for comparison
    const startTime24 = convertTo24Hour(startTime);
    const endTime24 = convertTo24Hour(endTime);

    if (startTime24 >= 21) {
      // 21 in 24-hour format is 9 PM
      setError(true);
      setErrorMessage("Reservations cannot be made starting at or after 9 PM.");
      setTimeout(() => {
        setError(false);
      }, 5000); // Clear the error after 5 seconds
      return; // Exit the function early
    }

    // Check if endTime is 12 PM (closed time)
    if (endTime === 12) {
      // 12 PM means store is closed
      setError(true);
      setErrorMessage(
        "End time cannot be 12 as the store is closed at that time."
      );
      setTimeout(() => {
        setError(false);
      }, 5000); // Clear the error after 5 seconds
      return; // Exit the function early
    }
    // Check if startTime is greater than endTime
    if (startTime24 > endTime24) {
      setError(true);
      setErrorMessage("Start time cannot be greater than end time.");
      setTimeout(() => {
        setError(false);
      }, 5000); // Clear the error after 5 seconds
      return; // Exit the function early
    }
    //#endregion

    if (chosenItems.length === 0) {
      setError(true);
      setErrorMessage('Please complete the "Buffet Contents" selection.');
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }

    if (numberOfPersonsEvent < 30 || numberOfPersonsEvent > 50) {
      setError(true);
      setErrorMessage("The number of persons must be between 30 and 50.");
      setTimeout(() => {
        setError(false);
      }, 5000); // Clear the error after 5 seconds
      return; // Exit the function early
    }

    //#endregion

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

    const reservationExists = await checkExistingReservation(
      formattedDateToBeReserved,
      formattedTime,
      numberOfPersonsEvent
    );
    if (reservationExists) {
      setError(true);
      setErrorMessage("You have already booked this date and time.");
      setTimeout(() => setError(false), 5000);
      return;
    }

    // Calculate the downpayment and balance
    const downpaymentAmount =
      paymentType === "downpayment" ? totalPrice / 2 : 0;

    // Define totalPrice to be submitted, depending on paymentType
    const amountToSubmit =
      paymentType === "fullpayment" ? totalPrice : downpaymentAmount;

    try {
      await setDoc(doc(db, "tableReservations", orderId), {
        dateReserved,
        timeReserved,
        dateToBeReserved: formattedDateToBeReserved,
        timeToBeReserved: formattedTime,
        packageOffer,
        buffetChosen,
        numberOfPersons: numberOfPersonsEvent,
        downpayment: paymentType === "downpayment" ? downpaymentAmount : null, // Store downpayment amount only if applicable
        totalPrice: totalPrice, // Always store the original totalPrice
        paymentType: paymentType,
        status: "REQUESTED",
        type: "Event",
        reservedBy: userEmail,
        remarks: remarks || "None",
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
                    className="border-2 border-solid border-orange-900 w-2/5 h-10 px-3 rounded-md bg-orange-50 inline-block"
                    name="timeHour"
                    id="inputTimeHour"
                    type="number"
                    placeholder="Hour (12-7)"
                    min={12}
                    max={19}
                    required
                    onInput={(e) => {
                      // Limit to 2 digits and prevent values greater than 19
                      if (
                        e.target.value.length > 2 ||
                        parseInt(e.target.value) > 19
                      ) {
                        e.target.value = e.target.value.slice(0, 2); // Limit to 2 digits
                        if (parseInt(e.target.value) > 19) {
                          e.target.value = "19"; // Set to max value if exceeded
                        }
                      }
                    }}
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
                    placeholder="12-8" //placeholder
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
                    placeholder="1-9"
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
                  rate: PHP 2,000.00/hour.{" "}
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
                    {packageChoices.map((choice) => (
                      <option key={choice.id} value={choice.id}>
                        {choice.label} - PHP {choice.price} per person
                      </option>
                    ))}
                  </select>
                  <PackageOffers
                    selectedPackage={selectedPackage}
                    onFinalize={handleFinalize}
                    onPackageChange={clearSelectedItems}
                  />
                </div>
                <p className="text-xs text-orange-900 pl-2 mt-1">
                  Available buffet items to select:
                  {Object.keys(limits).map((title) => (
                    <span key={title}>
                      {` ${limits[title]?.[selectedPackage] || 0} ${title}, `}
                    </span>
                  ))}
                </p>
              </div>

              {/* BUFFET AND SERVICES CONTENTS */}
              <div className="flex flex-col gap-0.5">
                {chosenItems.length > 0 && ( // Check if there are chosen items
                  <span className="text-sm text-gray-700 flex items-center space-x-1 font-semibold">
                    You've chosen:
                  </span>
                )}
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
                </div>
              </div>

              {/* REMARKS */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <i className="fa-solid fa-pencil"></i>
                  <span>Remarks</span>
                </span>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 px-3 rounded-md bg-orange-50"
                  placeholder="Add any special requests or remarks here"
                  value={remarks} // Bind the input value to the state
                  onChange={(e) => setRemarks(e.target.value)} // Update state on change
                  required
                />
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
                  min={30}
                  max={50}
                  maxLength={2} // Add this to limit the input to 2 digits
                  placeholder="Number of Persons"
                  value={numberOfPersonsEvent} // Bind to state
                  onChange={handlePersonsChange}
                  required
                />
                <p className="text-xs text-orange-900 pl-2">
                  Minimum of 30 and maximum of 50 persons can be accommodated.
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
          <div className="flex flex-col items-center">
            {/* Total Price Label */}
            <span className="font-bold text-lg mb-2 text-brown-500">
              {" "}
              {/* Added text-brown-500 */}
              {slug === "table"
                ? "Total Cost: PHP " + totalPriceT + ".00"
                : slug === "event"
                ? "Estimated Cost: PHP " + totalPrice + ".00"
                : ""}
            </span>

            {/* Payment Type Selection - Only for 'event' slug */}
            {slug === "event" && (
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-700 mr-2">
                  Payment Type:
                </span>

                <label className="flex items-center mr-4 bg-white rounded-md px-6 py-2 shadow-md hover:shadow-lg transition-shadow duration-300 w-1/2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="downpayment"
                    checked={paymentType === "downpayment"}
                    onChange={() => setPaymentType("downpayment")}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    Downpayment
                    <br />
                    <span className="font-bold text-orange-700">
                      PHP {(totalPrice / 2).toFixed(2)}
                    </span>
                  </span>
                </label>

                <label className="flex items-center bg-white rounded-md px-6 py-2 shadow-md hover:shadow-lg transition-shadow duration-300 w-1/2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="fullpayment"
                    checked={paymentType === "fullpayment"}
                    onChange={() => setPaymentType("fullpayment")}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    Full Payment
                    <br />
                    <span className="font-bold text-orange-700">
                      PHP {totalPrice}
                    </span>
                  </span>
                </label>
              </div>
            )}

            {/* Button */}
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
                  ? "Reserve Place"
                  : "Book Mobile Café"}{" "}
              </span>
            </button>
          </div>
          <p
            className={`${
              slug === "event" ? "" : slug === "table" ? "" : "hidden"
            } text-xs text-orange-900 text-center mt-[-10px]`}
          >
            {slug === "event"
              ? "There must be a 50% downpayment upon reservation."
              : slug === "table"
              ? "The reservation fee would be deductable to the total bill upon ordering."
              : ""}
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
      {showLoginModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
          onClick={() => setShowLoginModal(false)} // Close modal when clicking on the background
        >
          {/* SIGN IN REQUIRED CONTAINER */}
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center border-2 border-gray-50"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
            ref={modalRef}
          >
            <h2 className="text-xl font-bold mb-4">Sign in required!</h2>
            <p className="mb-4">
              Please sign in to book your reservations with us.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Link
                href="/login"
                className="bg-orange-950 text-white w-full py-2 rounded-md font-bold shadow-md border-2 border-orange-950"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;