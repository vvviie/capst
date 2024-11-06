"use client";

import React from "react";
import { useState, useEffect } from "react";
import CheckoutPopup from "../components/CheckoutPopup";
import Link from "next/link";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

//#region Sample Data
type res = {
  id: string;
  dateReserved: string;
  dateToBeReserved: string;
  numberOfPersons: number;
  reservedBy: string;
  timeReserved: string;
  timeToBeReserved: string;
  type: string;
  buffetChosen?: {
    Dessert: string[];
    Mains: string[];
    Pasta: string[];
    Veggies: string[];
  };
  packageOffer?: string;
  status: string;
  totalPrice?: number;
};

type resList = res[];

//#endregion

const AdminCheckReservationsPage = () => {
  const [reservations, setReservations] = useState<res[]>([]);
  const [resType, setResType] = useState("table");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [isToPaymentVisible, setIsToPaymentVisible] = useState(false);
  const [isRejectedVisible, setIsRejectedVisible] = useState(false);
  const [isMarkAsDoneVisible, setIsMarkAsDoneVisible] = useState(false);
  const [isPaidVisible, setIsPaidVisible] = useState(false);
  const [isCancelVisible, setIsCancelVisible] = useState(false);

  const handleToPayment = () => {
    setIsToPaymentVisible(true);

    setTimeout(() => {
      setIsToPaymentVisible(false);
    }, 750);
  };

  const handleReject = () => {
    setIsRejectedVisible(true);

    setTimeout(() => {
      setIsRejectedVisible(false);
    }, 750);
  };

  const handlePaid = () => {
    setIsPaidVisible(true);

    setTimeout(() => {
      setIsPaidVisible(false);
    }, 750);
  };

  const handleCancel = () => {
    setIsCancelVisible(true);

    setTimeout(() => {
      setIsCancelVisible(false);
    }, 750);
  };

  const handleMarkAsDone = () => {
    setIsMarkAsDoneVisible(true);

    setTimeout(() => {
      setIsMarkAsDoneVisible(false);
    }, 750);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResType(event.target.value === "table" ? "table" : "event");
  };

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tableReservations"));
        const fetchedReservations: res[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as res[];
  
        // Helper function to convert time to 24-hour format and handle time ranges
        const parseDateTime = (date: string, time: string) => {
          // Extract start time if it's a range (e.g., "12PM to 4PM" -> "12PM")
          const startTime = time.split(" to ")[0];
          
          // Parse date and time to a consistent format
          return new Date(`${date} ${convertTo24Hour(startTime)}`);
        };
  
        // Helper function to convert "4:30PM" or "12PM" to "16:30" or "12:00" (24-hour time)
        const convertTo24Hour = (time: string) => {
          const [timePart, modifier] = time.split(/(AM|PM)/i);
          let [hours, minutes] = timePart.split(":").map(Number);
          if (!minutes) minutes = 0;
          
          if (modifier.toUpperCase() === "PM" && hours < 12) {
            hours += 12;
          }
          if (modifier.toUpperCase() === "AM" && hours === 12) {
            hours = 0;
          }
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        };
  
        // Sort reservations by parsed date and time in descending order
        const sortedReservations = fetchedReservations.sort((a, b) => {
          const dateA = a.dateToBeReserved && a.timeToBeReserved
            ? parseDateTime(a.dateToBeReserved, a.timeToBeReserved).getTime()
            : 0;
          const dateB = b.dateToBeReserved && b.timeToBeReserved
            ? parseDateTime(b.dateToBeReserved, b.timeToBeReserved).getTime()
            : 0;
  
          return dateB - dateA; // Descending order
        });
  
        console.log("Sorted Reservations:", sortedReservations); // Log to verify order
  
        // Log the buffetChosen if it exists
        sortedReservations.forEach((res) => {
          if (res.buffetChosen) {
            console.log("Buffet Chosen for Reservation ID", res.id, ":", res.buffetChosen);
          }
        });
  
        setReservations(sortedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };
  
    fetchReservations();
  }, []);


  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-start md:items-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div
        className="w-full flex flex-col gap-10 md:flex-row md:items-start md:justify-center
      md:h-[805px]"
      >
        {/* REQUESTS CONTAINER */}
        <div className="w-full flex flex-col gap-2 max-w-[580px]">
          {/* HEADER AND BUTTON FOR SWITCHING RESERVATIONS */}
          <div className="w-full flex gap-2 justify-between items-center">
            {/* HEADER */}
            <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
              Requests
            </h1>
            <div className="w-full flex justify-end items-center gap-1">
              <select
                className="h-10 bg-white border-2 border-gray-100 shadow-md rounded-md w-full font-bold
            text-gray-500 hover:bg-gray-50 hover:scale-[1.02] duration-200 text-center max-w-40"
                onChange={handleCategoryChange}
              >
                <option value="table">Table</option>
                <option value="event">Exclusive</option>
              </select>
              <Link
                href={`/fkstllbookings/${
                  resType === "table" ? "table" : "event"
                }`}
                className="bg-orange-950 rounded-md shadow-md text-white pt-2
            font-bold h-10 px-4 hover:bg-orange-900 hover:scale-[1.03] duration-200"
              >
                Add
              </Link>
            </div>
          </div>
          {/* BOOKING REQUESTS */}
          <div className="w-full flex flex-col gap-2 max-h-[720px]">
            {
              // #region Requests - Table
              resType === "table"
                ? reservations.map((res) => (
                    <div
                      className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                              ${
                                res.type === "Table" && res.status !== "PAID"
                                  ? "visible"
                                  : "hidden"
                              } flex flex-col justify-center gap-2`}
                      key={res.id}
                      onClick={() => toggleOrder(res.id)}
                    >
                      {/* RESERVATION HEADER CONTAINER */}
                      <div className="flex gap-2 justify-between items-center pl-2">
                        <div className="flex flex-col gap-0.5">
                          {/* DATE TO BE RESERVED */}
                          <h1
                            className="sm:text-lg font-bold text-gray-900 flex items-center
                      gap-1 select-none"
                          >
                            <i
                              className="far fa-calendar-alt text-sm mb-[1.5px]"
                              aria-hidden="true"
                            ></i>
                            <span>
                              For{" "}
                              {res.dateToBeReserved +
                                " - " +
                                res.timeToBeReserved}
                            </span>
                          </h1>
                          {/* NUMBER OF PERSONS + PRICE CONTAINER */}
                          <p className="text-sm font-semibold text-gray-500 flex gap-1 items-center select-none">
                            <i className="fa-solid fa-people-group text-sm"></i>
                            {resType === "event" ? (
                              <span>{`${res.numberOfPersons} PAX - PHP ${res.totalPrice ? res.totalPrice.toFixed(2) : "0.00"}`}</span>
                            ) : resType === "table" ? (
                              <span>{`${res.numberOfPersons} PAX`}</span>
                            ) : null}
                          </p>
                          <p
                            className={`text-sm font-semibold text-${
                              res.status === "PENDING" ? "red-500" : "blue-500"
                            } flex gap-1 items-center select-none`}
                          >
                            {res.status}
                          </p>
                        </div>

                        {/* ARROW */}
                        <span
                          className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center
                                            mr-4 cursor-pointer"
                        >
                          <i
                            className={`fa ${
                              expandedOrders[res.id]
                                ? "fa-caret-down"
                                : "fa-caret-right"
                            } text-gray-300 text-xs`}
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                      {expandedOrders[res.id] && (
                        <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-1 items-start">
                          <p className="text-xs select-none text-gray-400">{`Reservation ID: ${res.id}`}</p>
                          <p className="text-xs select-none text-gray-400">{`Date Requested: ${res.dateReserved} - ${res.timeReserved}`}</p>
                          <p className="text-xs select-none text-gray-400">{`From: ${res.reservedBy}`}</p>
                          {/* BUTTON CONTAINER */}
                          {res.status === "PENDING" ? (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handleToPayment()}
                              >
                                <i className="fa-solid fa-money-bill"></i>
                                <span>To Payment</span>
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                        hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleReject()}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handlePaid()}
                              >
                                <i className="fa-solid fa-money-bill"></i>
                                <span>Mark as Paid</span>
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                        hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleCancel()}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                : // #endregion
                  // #region Requests - Exclusive
                  reservations.map((res) => (
                    <div
                      className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                              ${
                                res.type === "Event" && res.status !== "PAID"
                                  ? "visible"
                                  : "hidden"
                              } flex flex-col justify-center gap-2`}
                      key={res.id}
                      onClick={() => toggleOrder(res.id)}
                    >
                      {/* RESERVATION HEADER CONTAINER */}
                      <div className="flex gap-2 justify-between items-center pl-2">
                        <div className="flex flex-col gap-0.5">
                          {/* DATE TO BE RESERVED */}
                          <h1
                            className="sm:text-lg font-bold text-gray-900 flex items-center
                      gap-1 select-none"
                          >
                            <i
                              className="far fa-calendar-alt text-sm mb-[1.5px]"
                              aria-hidden="true"
                            ></i>
                            <span>
                              For{" "}
                              {res.dateToBeReserved +
                                " - " +
                                res.timeToBeReserved}
                            </span>
                          </h1>
                          {/* PERSONS AND PRICE CONTAINER */}
                          <p className="text-sm font-semibold text-gray-500 flex gap-1 items-center select-none">
                            <i className="fa-solid fa-people-group text-sm"></i>
                            <span>{`${res.numberOfPersons} PAX - PHP ${
                              res.totalPrice
                                ? res.totalPrice.toFixed(2)
                                : "0.00"
                            }`}</span>
                          </p>
                          {/* STATUS */}
                          <p
                            className={`text-sm font-semibold text-${
                              res.status === "PENDING" ? "red-500" : "blue-500"
                            } flex gap-1 items-center select-none`}
                          >
                            {res.status}
                          </p>
                        </div>

                        {/* ARROW */}
                        <span
                          className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center
                                            mr-4 cursor-pointer"
                        >
                          <i
                            className={`fa ${
                              expandedOrders[res.id]
                                ? "fa-caret-down"
                                : "fa-caret-right"
                            } text-gray-300 text-xs`}
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                      {expandedOrders[res.id] && (
                        <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-1 items-start">
                          <p className="text-xs select-none text-gray-400">{`Reservation ID: ${res.id}`}</p>
                          <p className="text-xs select-none text-gray-400">{`Date Requested: ${res.dateReserved} - ${res.timeReserved}`}</p>
                          <p className="text-xs select-none text-gray-400">{`From: ${res.reservedBy}`}</p>
                          <span className="w-full bg-gray-200 h-0.5 rounded-full"></span>
                          <p className="text-xs select-none text-gray-400">{`Chosen Package: ${res.packageOffer}`}</p>
                          <div className="flex flex-col gap-4">
                          {Object.entries(res.buffetChosen).map(([category, items], index) => {
                          console.log("Buffet Category:", category, "Items:", items); // Log each buffet category and its items
                          
                          // Ensure items is a string and split it into an array if needed
                          let itemsArray = [];
                          if (typeof items === 'string') {
                            itemsArray = items.split(',').map(item => item.trim()); // Split by commas and trim extra spaces
                          } else if (Array.isArray(items)) {
                            itemsArray = items; // If it's already an array, use it directly
                          } else {
                            console.warn(`Expected 'items' to be a string or an array but got:`, items);
                          }

                          return (
                            <div key={index} className="pl-2 w-full flex flex-col gap-2">
                              <h1 className="py-0.5 bg-gray-400 text-white rounded-full text-xs w-20 text-center font-semibold shadow-sm">
                                {category}
                              </h1>
                              <div className="w-full flex flex-wrap gap-1">
                                {itemsArray.map((item, itemIndex) => (
                                  <span
                                    key={itemIndex}
                                    className="py-0.5 bg-gray-50 text-gray-400 rounded-full text-xs px-2 text-center shadow-sm"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                          </div>
                          {/* BUTTON CONTAINER */}
                          {res.status === "PENDING" ? (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handleToPayment()}
                              >
                                <i className="fa-solid fa-money-bill"></i>
                                <span>To Payment</span>
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                        hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleReject()}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handlePaid()}
                              >
                                <i className="fa-solid fa-money-bill"></i>
                                <span>Mark as Paid</span>
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                        hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleCancel()}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
              // #endregion
            }
          </div>
        </div>

        {/* BOOKED RESERVATIONS CONTAINER */}
        <div className="flex flex-col gap-2 max-w-[580px]">
          {/* HEADER AND DATE FILTER CONTAINER */}
          <div className="w-full flex gap-2 items-center justify-between">
            {/* HEADER */}
            <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
              Bookings
            </h1>
            {/* DATE SEARCH/FILTER BAR */}
            <div className="w-full flex justify-end items-center gap-1">
              <input
                type="date"
                name="dateFilter"
                id="inputDateFilter"
                className="border-2 border-solid border-gray-200 text-sm sm:text-base w-2/3 max-w-40 text-center
                       text-gray-600 md:text-lg h-10 pl-2 rounded-md bg-gray-50 md:w-full font-semibold pr-2"
              />
              <button
                className="bg-orange-950 rounded-md shadow-md text-white
            font-bold h-10 px-4 hover:bg-orange-900 hover:scale-[1.03] duration-200"
              >
                Filter
              </button>
            </div>
          </div>
          {/* BOOKED RESERVATIONS LIST CONTAINER */}
          <div className="w-full flex flex-col gap-2 max-h-[720px]">
            {
              //#region Reserved Bookings - Table
              resType === "table"
                ? reservations.map((res) => (
                    <div
                      className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                ${
                  res.type === "Table" && res.status === "PAID"
                    ? "visible"
                    : "hidden"
                } flex flex-col justify-center gap-2`}
                      key={res.id}
                      onClick={() => toggleOrder(res.id)}
                    >
                      {/* RESERVATION HEADER CONTAINER */}
                      <div className="flex gap-2 justify-between items-center pl-2">
                        <div className="flex flex-col gap-0.5">
                          {/* DATE TO BE RESERVED */}
                          <h1
                            className="sm:text-lg font-bold text-gray-900 flex items-center
                      gap-1 select-none"
                          >
                            <i
                              className="far fa-calendar-alt text-sm mb-[1.5px]"
                              aria-hidden="true"
                            ></i>
                            <span>
                              For{" "}
                              {res.dateToBeReserved +
                                " - " +
                                res.timeToBeReserved}
                            </span>
                          </h1>
                          {/* USER PERSONS AND PRICE CONTAINER */}
                          <p className="text-sm font-semibold text-gray-500 flex gap-1 items-center select-none">
                            <i className="fa-solid fa-people-group text-sm"></i>
                            <span>{`${res.numberOfPersons} PAX - PHP ${
                              res.totalPrice
                                ? res.totalPrice.toFixed(2)
                                : "0.00"
                            }`}</span>
                          </p>
                        </div>

                        {/* ARROW */}
                        <span
                          className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center
                                            mr-4 cursor-pointer"
                        >
                          <i
                            className={`fa ${
                              expandedOrders[res.id]
                                ? "fa-caret-down"
                                : "fa-caret-right"
                            } text-gray-300 text-xs`}
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                      {
                        expandedOrders[res.id] && (
                          <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-1 items-start">
                            <p className="text-xs select-none text-gray-400">{`Reservation ID: ${res.id}`}</p>
                            <p className="text-xs select-none text-gray-400">{`Date Requested: ${res.dateReserved} - ${res.timeReserved}`}</p>
                            <p className="text-xs select-none text-gray-400">{`From: ${res.reservedBy}`}</p>
                            {/* BUTTON CONTAINER */}
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-full h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex justify-center items-center"
                                onClick={() => handleMarkAsDone()}
                              >
                                <i className="fa-solid fa-circle-check"></i>
                                <span>Mark as Done</span>
                              </button>
                            </div>
                          </div>
                        )
                        //#endregion
                      }
                    </div>
                  ))
                : //#region Reserved Bookings - Exclusive
                  reservations.map((res) => (
                    <div
                      className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                            ${
                              res.type === "Event" && res.status === "PAID"
                                ? "visible"
                                : "hidden"
                            } flex flex-col justify-center gap-2`}
                      key={res.id}
                      onClick={() => toggleOrder(res.id)}
                    >
                      {/* RESERVATION HEADER CONTAINER */}
                      <div className="flex gap-2 justify-between items-center pl-2">
                        <div className="flex flex-col gap-0.5">
                          {/* DATE TO BE RESERVED */}
                          <h1
                            className="sm:text-lg font-bold text-gray-900 flex items-center
                    gap-1 select-none"
                          >
                            <i
                              className="far fa-calendar-alt text-sm mb-[1.5px]"
                              aria-hidden="true"
                            ></i>
                            <span>
                              For{" "}
                              {res.dateToBeReserved +
                                " - " +
                                res.timeToBeReserved}
                            </span>
                          </h1>
                          {/* USER EMAIL */}
                          <p className="text-sm font-semibold text-gray-500 flex gap-1 items-center select-none">
                            <i className="fa-solid fa-people-group text-sm"></i>
                            <span>{`${res.numberOfPersons} PAX - PHP ${
                              res.totalPrice
                                ? res.totalPrice.toFixed(2)
                                : "0.00"
                            }`}</span>
                          </p>
                        </div>

                        {/* ARROW */}
                        <span
                          className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center
                                          mr-4 cursor-pointer"
                        >
                          <i
                            className={`fa ${
                              expandedOrders[res.id]
                                ? "fa-caret-down"
                                : "fa-caret-right"
                            } text-gray-300 text-xs`}
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                      {expandedOrders[res.id] && (
                        <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-1 items-start">
                          <p className="text-xs select-none text-gray-400">{`Reservation ID: ${res.id}`}</p>
                          <p className="text-xs select-none text-gray-400">{`Date Requested: ${res.dateReserved} - ${res.timeReserved}`}</p>
                          <p className="text-xs select-none text-gray-400">{`From: ${res.reservedBy}`}</p>
                          <span className="w-full bg-gray-200 h-0.5 rounded-full"></span>
                          <p className="text-xs select-none text-gray-400">{`Chosen Package: ${res.packageOffer}`}</p>
                          <div className="flex flex-col gap-4">
                          {Object.entries(res.buffetChosen).map(([category, items], index) => {
                          console.log("Buffet Category:", category, "Items:", items); // Log each buffet category and its items
                          
                          // Ensure items is a string and split it into an array if needed
                          let itemsArray = [];
                          if (typeof items === 'string') {
                            itemsArray = items.split(',').map(item => item.trim()); // Split by commas and trim extra spaces
                          } else if (Array.isArray(items)) {
                            itemsArray = items; // If it's already an array, use it directly
                          } else {
                            console.warn(`Expected 'items' to be a string or an array but got:`, items);
                          }

                          return (
                            <div key={index} className="pl-2 w-full flex flex-col gap-2">
                              <h1 className="py-0.5 bg-gray-400 text-white rounded-full text-xs w-20 text-center font-semibold shadow-sm">
                                {category}
                              </h1>
                              <div className="w-full flex flex-wrap gap-1">
                                {itemsArray.map((item, itemIndex) => (
                                  <span
                                    key={itemIndex}
                                    className="py-0.5 bg-gray-50 text-gray-400 rounded-full text-xs px-2 text-center shadow-sm"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                          </div>
                          {/* BUTTON CONTAINER */}
                          <div className="flex gap-2 items-center w-full mt-1">
                            <button
                              className="w-full h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex justify-center items-center"
                              onClick={() => handleMarkAsDone()}
                            >
                              <i className="fa-solid fa-circle-check"></i>
                              <span>Mark as Done</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              //#endregion
            }
          </div>
        </div>

        {/* MOVED TO PAYMENT POP UP */}
        {isToPaymentVisible && <CheckoutPopup message="Moved to Payment!" />}

        {/* BOOKING REJECTED POP UP */}
        {isRejectedVisible && <CheckoutPopup message="Booking Rejected." />}

        {/* MARKED AS DONE POP UP */}
        {isMarkAsDoneVisible && <CheckoutPopup message="Marked as Done!" />}

        {/* PAID POP UP */}
        {isPaidVisible && <CheckoutPopup message="Marked as Paid!" />}

        {/* CANCEL POP UP */}
        {isCancelVisible && <CheckoutPopup message="Booking Canceled!" />}
      </div>
    </div>
  );
};

export default AdminCheckReservationsPage;