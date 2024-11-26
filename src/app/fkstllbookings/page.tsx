"use client";

import React from "react";
import { useState, useEffect } from "react";
import CheckoutPopup from "../components/CheckoutPopup";
import Link from "next/link";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import AdminReservationFilter from "../components/AdminReservationFilter";
import DynamicPackageOffers from "../components/DyanmicPackageOffers";
import jsPDF from "jspdf";

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
  paymentType: string;
  downpayment: number;
};

type resList = res[];

//#endregion

const AdminCheckReservationsPage = () => {
  const [reservations, setReservations] = useState<res[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [resType, setResType] = useState("table");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [isToPaymentVisible, setIsToPaymentVisible] = useState(false);
  const [isRejectedVisible, setIsRejectedVisible] = useState(false);
  const [isMarkAsDoneVisible, setIsMarkAsDoneVisible] = useState(false);
  const [isPaidVisible, setIsPaidVisible] = useState(false);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [isPendingVisible, setIsPendingVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [filterDate, setFilterDate] = useState<string>("");
  const [isFilterClicked, setIsFilterClicked] = useState<boolean>(false);
  const [selectedFilterDate, setSelectedFilterDate] = useState<string>("");

  const handleToPayment = async (id: string) => {
    try {
      await updateDoc(doc(db, "tableReservations", id), {
        status: "TO PAY",
      });

      setIsToPaymentVisible(true);
      setTimeout(() => {
        setIsToPaymentVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'TO PAY':", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "tableReservations", id), {
        status: "REJECTED",
      });

      setIsRejectedVisible(true);
      setTimeout(() => {
        setIsRejectedVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'REJECTED':", error);
    }
  };

  const handlePayment = (res) => {
    if (res.paymentType === "downpayment") {
      handlePaid(res.id, res.totalPrice, res.downpayment); // Pass downpayment
    } else if (res.paymentType === "fullpayment") {
      handlePaid(res.id, res.totalPrice); // No downpayment to pass
    }
  };

  const handlePaid = async (
    id: string,
    totalPrice: number,
    downpayment?: number
  ) => {
    // Log the totalPrice and downpayment to check if they're being passed correctly
    console.log("Total Price:", totalPrice);
    console.log("Downpayment:", downpayment);

    try {
      // Fetch the current reservation document to check its status
      const reservationDoc = await getDoc(doc(db, "tableReservations", id));
      let currentStatus = reservationDoc.exists()
        ? reservationDoc.data().status
        : null;

      // Determine the amount to use based on paymentType
      const amountToUse = downpayment ? downpayment : totalPrice;
      let paymentStatus;
      let balance;

      if (currentStatus === "DOWNPAYMENT PAID") {
        // If the current status is "DOWNPAYMENT PAID", set the next payment status to "PAID"
        paymentStatus = "PAID";
        balance = 0; // Set balance to 0 when fully paid
      } else {
        // Otherwise, set the status based on whether downpayment is made
        paymentStatus = downpayment ? "DOWNPAYMENT PAID" : "PAID";
        balance = downpayment ? totalPrice * 0.5 : 0; // Calculate balance for downpayment
      }

      // Update the status of the table reservation
      await updateDoc(doc(db, "tableReservations", id), {
        status: paymentStatus,
        balance: balance, // Set the calculated balance
      });

      //#region Submit to salesData
      // Update Net Sales in salesData collection
      const salesDocumentId = "salesExpensesToday";
      const salesDataRef = doc(db, "salesData", salesDocumentId);

      // Get the current date
      const now = new Date();
      const formattedDate = `${
        now.getMonth() + 1
      }/${now.getDate()}/${now.getFullYear()}`; // Format date as MM/DD/YYYY

      // Fetch existing Net Sales data
      const salesDoc = await getDoc(salesDataRef);
      let existingNetSales = 0;

      if (salesDoc.exists()) {
        const salesData = salesDoc.data();
        existingNetSales = salesData.NetSales?.data[formattedDate] || 0; // Get existing sales or default to 0
      }

      // Calculate the new total sales for today
      const updatedNetSales = existingNetSales + totalPrice;

      // Prepare the updated sales data
      const salesDataUpdate = {
        NetSales: {
          data: {
            [formattedDate]: updatedNetSales, // Increment the total sales for today
          },
        },
      };

      // Merge the new sales data with the existing document
      await setDoc(salesDataRef, salesDataUpdate, { merge: true }); // Use merge to avoid overwriting other fields
      //#endregion

      // Show the paid confirmation
      setIsPaidVisible(true);
      setTimeout(() => {
        setIsPaidVisible(false);
      }, 750);
    } catch (error) {
      console.error(
        "Error updating status to 'PAID' or updating sales data:",
        error
      );
    }
  };
  const handleMarkAsPending = async (id: string) => {
    try {
      await updateDoc(doc(db, "tableReservations", id), {
        status: "PENDING",
      });

      setIsPendingVisible(true);
      setTimeout(() => {
        setIsPendingVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'PENDING':", error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateDoc(doc(db, "tableReservations", id), {
        status: "CANCELLED",
      });

      setIsCancelVisible(true);
      setTimeout(() => {
        setIsCancelVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'CANCELLED':", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete the document that matches the provided ID
      await deleteDoc(doc(db, "tableReservations", id));

      setIsDeleteVisible(true);
      setTimeout(() => {
        setIsDeleteVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleMarkAsDone = async (id: string) => {
    try {
      await updateDoc(doc(db, "tableReservations", id), {
        status: "DONE",
      });

      setIsMarkAsDoneVisible(true);
      setTimeout(() => {
        setIsMarkAsDoneVisible(false);
      }, 750);
    } catch (error) {
      console.error("Error updating status to 'DONE':", error);
    }
  };

  const handlePrintDetails = async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, "tableReservations", id));

      if (docSnap.exists()) {
        const reservation = docSnap.data();

        const doc = new jsPDF();

        // Set font for title, address, and details to 16px, bold, centered
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);

        // Title and address - Centered
        doc.text("fikaställe by fika kafé", 105, 20, null, null, "center");
        doc.text(
          "Brgy. Iba, Silang, Cavite, 4118",
          105,
          30,
          null,
          null,
          "center"
        );

        // Add spacing
        doc.text("BOOKING DETAILS", 105, 50, null, null, "center");

        // Set font for content text to 14px and justified
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Booking Details - Justified
        const text = `A pleasant day to you! Upon the reservation of ${reservation.reservedBy} for the appointed date ${reservation.dateToBeReserved} at ${reservation.timeToBeReserved} for ${reservation.numberOfPersons} persons, we have deemed that your booking request was successful. Please do not forget your appointment, as this might result in the termination of your account.
\nWith the reservation's consumables amounting to PHP ${reservation.totalPrice}, please do note that this would be deducted towards your total bill upon ordering.\n\nJust present this as as a sign that your booking was approved upon entering the shop to use its validity. Thank you and we hope to see you soon, coffee buddy!`;
        doc.text(text, 20, 60, { maxWidth: 170, align: "left" });

        doc.autoPrint();
        doc.output("dataurlnewwindow");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error handling reservation details:", error);
    }
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

  const handleStatusChange = (status: string) => setSelectedStatus(status);

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    return `${String(parsedDate.getMonth() + 1).padStart(2, "0")}/${String(
      parsedDate.getDate()
    ).padStart(2, "0")}/${parsedDate.getFullYear()}`;
  };

  // Filter button click handler
  const handleFilterClick = () => {
    // Log the date in MM/DD/YYYY format when the filter button is clicked
    console.log("Filter Date (MM/DD/YYYY):", formatDate(selectedFilterDate));

    setFilterDate(selectedFilterDate); // Now set the filterDate when the filter button is clicked
    setIsFilterClicked(true); // Trigger the filter action (which will be used in useEffect)
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    console.log("Selected date:", selectedDate); // Log the selected date

    // Update the state with the selected date
    setSelectedFilterDate(selectedDate);
  };

  const handlePrintEventDetails = async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, "tableReservations", id));

      if (docSnap.exists()) {
        const reservation = docSnap.data();

        const doc = new jsPDF();

        // Set font for title, address, and details to 16px, bold, centered
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);

        // Title and address - Centered
        doc.text("fikaställe by fika kafé", 105, 20, null, null, "center");
        doc.text(
          "Brgy. Iba, Silang, Cavite, 4118",
          105,
          30,
          null,
          null,
          "center"
        );

        // Add spacing
        doc.text("BOOKING DETAILS", 105, 50, null, null, "center");

        // Set font for general content text to 14px, normal, left-aligned
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // First part of the booking details text
        const initialText = `A pleasant day to you! Upon the reservation of ${reservation.reservedBy} for the appointed date ${reservation.dateToBeReserved} at ${reservation.timeToBeReserved} for ${reservation.numberOfPersons} persons, we have deemed that your booking request was successful. Please do not forget your appointment, as this might result in the termination of your account.`;
        doc.text(initialText, 20, 60, { maxWidth: 170, align: "left" });

        // Bold text for the total bill information
        const boldText = `Upon reviewing, your total bill to be settled would amount to PHP ${reservation.totalPrice}.`;
        doc.setFont("helvetica", "bold");
        doc.text(boldText, 20, 90, { maxWidth: 170, align: "left" });

        // Reset font to normal for the remaining content
        doc.setFont("helvetica", "normal");
        const closingText = `Just present this as a sign that your booking was approved upon entering the shop to use its validity. Thank you and we hope to see you soon, coffee buddy!`;
        doc.text(closingText, 20, 105, { maxWidth: 170, align: "left" });

        doc.setFont("helvetica", "normal");
        const confirText = `Here is the breakdown of your chosen items for ${reservation.packageOffer}:`;
        doc.text(confirText, 20, 125, { maxWidth: 170, align: "left" });

        // Add Buffet Chosen details if available
        if (reservation.buffetChosen) {
          let buffetYPosition = 135; // Start position for the buffet section

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Buffet Chosen:", 20, buffetYPosition); // Buffet section title
          buffetYPosition += 10;

          // Iterate over buffet categories and their items
          Object.entries(reservation.buffetChosen).forEach(
            ([category, items], index) => {
              // Ensure items is a string and split it into an array if needed
              let itemsArray = [];
              if (typeof items === "string") {
                itemsArray = items.split(",").map((item) => item.trim()); // Split by commas and trim extra spaces
              } else if (Array.isArray(items)) {
                itemsArray = items; // If it's already an array, use it directly
              }

              // Add category title
              doc.setFont("helvetica", "bold");
              doc.text(category, 20, buffetYPosition);
              buffetYPosition += 8;

              // Add items under the category
              doc.setFont("helvetica", "normal");
              itemsArray.forEach((item, itemIndex) => {
                doc.text(`- ${item}`, 30, buffetYPosition);
                buffetYPosition += 6;
              });

              // Add spacing after each category
              buffetYPosition += 6;
            }
          );
        }

        doc.autoPrint();
        doc.output("dataurlnewwindow");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error handling reservation details:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tableReservations"),
      (querySnapshot) => {
        const fetchedReservations: res[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as res[];

        const parseDateTime = (date: string, time: string) => {
          const startTime = time.split(" to ")[0];
          return new Date(`${date} ${convertTo24Hour(startTime)}`);
        };

        const convertTo24Hour = (time: string) => {
          const [timePart, modifier] = time.split(/(AM|PM)/i);
          let [hours, minutes] = timePart.split(":").map(Number);
          if (!minutes) minutes = 0;
          if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
          if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}`;
        };

        // Convert filterDate to Date object for comparison
        const formattedFilterDate = filterDate ? new Date(filterDate) : null;

        // Apply selected status and date filters
        const filteredReservations = fetchedReservations.filter(
          (reservation) => {
            const matchesStatus =
              selectedStatus === "all" || reservation.status === selectedStatus;

            // Compare the dates correctly by converting both to Date objects
            const reservationDate = new Date(reservation.dateToBeReserved);
            const matchesDate =
              !formattedFilterDate ||
              reservationDate.toDateString() ===
                formattedFilterDate.toDateString();

            return matchesStatus && matchesDate;
          }
        );

        const sortedAndFilteredReservations = filteredReservations.sort(
          (a, b) => {
            if (a.status < b.status) return -1;
            if (a.status > b.status) return 1;

            const dateA =
              a.dateToBeReserved && a.timeToBeReserved
                ? parseDateTime(
                    a.dateToBeReserved,
                    a.timeToBeReserved
                  ).getTime()
                : 0;
            const dateB =
              b.dateToBeReserved && b.timeToBeReserved
                ? parseDateTime(
                    b.dateToBeReserved,
                    b.timeToBeReserved
                  ).getTime()
                : 0;

            return dateB - dateA; // Descending order
          }
        );

        console.log(
          "Sorted and Filtered Reservations:",
          sortedAndFilteredReservations
        );
        setReservations(sortedAndFilteredReservations);
      },
      (error) => {
        console.error("Error fetching reservations:", error);
      }
    );

    return () => unsubscribe();
  }, [selectedStatus, filterDate, isFilterClicked]);

  useEffect(() => {
    if (selectedFilterDate === "") {
      setIsFilterClicked(false); // Reset the filter state when date is cleared
    } else {
      setIsFilterClicked(true); // Apply filter when date is set
    }
  }, [selectedFilterDate]); // Trigger useEffect when selectedFilterDate changes

  //#region PAGES CODE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = 5;
  const pagesToShow = 5;

  // Get current page orders
  const filteredTableRes = reservations.filter(
    (res) => res.type === "Table" && res.status !== "PAID"
  );

  const filteredExclusiveRes = reservations.filter(
    (res) => res.type === "Event" && res.status !== "PAID"
  );

  // Calculate total pages
  const totalTablePages = Math.ceil(filteredTableRes.length / itemsPerPage);
  const totalExclusivePages = Math.ceil(
    filteredExclusiveRes.length / itemsPerPage
  );

  const tableRes = filteredTableRes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exclusiveRes = filteredExclusiveRes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const visiblePages = Array.from(
    {
      length: Math.min(
        pagesToShow,
        (resType === "table" ? totalTablePages : totalExclusivePages) -
          pageWindowStart +
          1
      ),
    },
    (_, index) => pageWindowStart + index
  );

  // Handle page change
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);

    // Adjust the visible page numbers if necessary
    if (pageNumber >= pageWindowStart + pagesToShow) {
      setPageWindowStart(pageWindowStart + 1);
    } else if (pageNumber < pageWindowStart) {
      setPageWindowStart(pageWindowStart - 1);
    }
  };

  const handleTableNext = () => {
    if (currentPage < totalTablePages) {
      goToPage(currentPage + 1);

      // Adjust page window start for "Next"
      if (currentPage + 1 >= pageWindowStart + pagesToShow) {
        setPageWindowStart(pageWindowStart + 1);
      }
    }
  };

  const handleExclusiveNext = () => {
    if (currentPage < totalExclusivePages) {
      goToPage(currentPage + 1);

      // Adjust page window start for "Next"
      if (currentPage + 1 >= pageWindowStart + pagesToShow) {
        setPageWindowStart(pageWindowStart + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);

      // Adjust page window start for "Previous"
      if (currentPage - 1 < pageWindowStart) {
        setPageWindowStart(pageWindowStart - 1);
      }
    }
  };
  //#endregion

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-start md:items-center h-auto md:min-h-[calc(100vh-56px)]
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full flex flex-col gap-10 md:flex-row md:items-start md:justify-center md:min-h-[67vh]">
        <div className="w-full max-w-[580px]">
          {/* REQUESTS CONTAINER */}
          <div className="w-full flex flex-col gap-4 overflow-auto pb-3 max-h-[640px]">
            {/* HEADER AND BUTTON FOR SWITCHING RESERVATIONS */}
            <div className="w-full flex gap-4 items-center">
              <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
              <span className="text-2xl text-center font-bold text-orange-900">
                Requests
              </span>
              <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
            </div>
            <div className="w-full flex justify-between items-center gap-1">
              <Link
                href={`/fkstllbookings/${
                  resType === "table" ? "table" : "event"
                }`}
                className="bg-orange-950 rounded-md shadow-md text-white pt-2 text-center
font-bold h-10 px-4 hover:bg-orange-900 hover:scale-[1.03] duration-200 w-24"
              >
                Add
              </Link>
              {/* Conditionally render DynamicPackageOffers if resType is "event" */}
              {resType === "event" && (
                <div className="flex items-center mt-4">
                  {" "}
                  {/* Add margin-top to push it down */}
                  <DynamicPackageOffers />
                </div>
              )}
              <div className="flex items-center gap-2 flex-1 justify-end">
                <select
                  className="h-10 bg-white border-2 border-gray-100 shadow-md rounded-md w-full font-bold
            text-gray-500 hover:bg-gray-50 hover:scale-[1.02] duration-200 text-center max-w-40"
                  onChange={handleCategoryChange}
                >
                  <option value="table">Table</option>
                  <option value="event">Exclusive</option>
                </select>
                <AdminReservationFilter onStatusChange={handleStatusChange} />
              </div>
            </div>
            {/* BOOKING REQUESTS */}
            <div className="w-full flex flex-col gap-2 max-h-[720px]">
              {
                //#region Requests - Table
                resType === "table" ? (
                  reservations.some(
                    (res) => res.type === "Table" && res.status !== "PAID"
                  ) ? (
                    tableRes.map((res) => (
                      <div
                        className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                              flex flex-col justify-center gap-2`}
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
                                <span>{`${res.numberOfPersons} PAX - PHP ${
                                  res.totalPrice
                                    ? res.totalPrice.toFixed(2)
                                    : "0.00"
                                }`}</span>
                              ) : resType === "table" ? (
                                <span>{`${res.numberOfPersons} PAX - PHP ${
                                  res.totalPrice
                                    ? res.totalPrice.toFixed(2)
                                    : "0.00"
                                }`}</span>
                              ) : null}
                            </p>
                            <p
                              className={`text-sm font-semibold text-${
                                res.status === "PENDING" ||
                                res.status === "CANCELLED" ||
                                res.status === "REJECTED"
                                  ? "red-500"
                                  : "blue-500"
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
                        {/* BUTTON CONTAINER */}
                        {expandedOrders[res.id] && (
                          <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-1 items-start">
                            <p className="text-xs select-none text-gray-400">{`Reservation ID: ${res.id}`}</p>
                            <p className="text-xs select-none text-gray-400">{`Date Requested: ${res.dateReserved} - ${res.timeReserved}`}</p>
                            <p className="text-xs select-none text-gray-400">{`From: ${res.reservedBy}`}</p>
                          <p className="text-xs select-none text-gray-400">{`Remarks: ${res.remarks}`}</p>

                            {/* BUTTON CONTAINER */}
                            {res.status === "PENDING" ? (
                              <div className="flex gap-2 items-center w-full mt-1">
                                <button
                                  className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                                          border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handleToPayment(res.id)}
                                >
                                  <i className="fa-solid fa-money-bill"></i>
                                  <span>To Payment</span>
                                </button>
                                <button
                                  className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                  onClick={() => handleReject(res.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : res.status === "CANCELLED" ? (
                              <div className="flex gap-2 items-center w-full mt-1">
                                <button
                                  className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                                border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handleMarkAsPending(res.id)}
                                >
                                  Mark as Pending
                                </button>
                                <button
                                  className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                  onClick={() => handleDelete(res.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : res.status === "DONE" ? (
                              <div className="flex gap-2 items-center w-full mt-1">
                                <button
                                  className="w-2/3 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white gap-1
                                          hover:bg-blue-400 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => handlePrintDetails(res.id)}
                                >
                                  Print Details
                                </button>
                                <button
                                  className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                  onClick={() => handleDelete(res.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : res.status === "REJECTED" ? (
                              <div className="flex items-center w-full mt-1">
                                <button
                                  className="w-full h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                  onClick={() => handleDelete(res.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : res.status !== "REJECTED" ? (
                              <div className="flex gap-2 items-center w-full mt-1">
                                <button
                                  className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1 
    border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                  onClick={() => {
                                    handlePaid(res.id, res.totalPrice);
                                    handlePayment(res);
                                  }} // Pass the totalPrice from the reservation
                                >
                                  <i className="fa-solid fa-money-bill"></i>
                                  <span>Mark as Paid</span>
                                </button>
                                <button
                                  className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                  onClick={() => handleCancel(res.id)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full bg-white p-4 border-2 border-gray-100 shadow-md rounded-md">
                      <p className="text-gray-300 font-bold text-center">
                        No reservation requests.
                      </p>
                    </div>
                  )
                ) : // #endregion
                // #region Requests - Exclusive
                reservations.some(
                    (res) => res.type === "Event" && res.status !== "PAID"
                  ) ? (
                  exclusiveRes.map((res) => (
                    <div
                      className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                             flex flex-col justify-center gap-2`}
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
                            {resType === "event" ? (
                              <span>{`${res.numberOfPersons} PAX - PHP ${
                                res.totalPrice
                                  ? res.totalPrice.toFixed(2)
                                  : "0.00"
                              }`}</span>
                            ) : resType === "table" ? (
                              <span>{`${res.numberOfPersons} PAX`}</span>
                            ) : null}
                          </p>
                          {/* STATUS */}
                          <p
                            className={`text-sm font-semibold flex gap-1 items-center select-none ${
                              res.status === "PENDING" ||
                              res.status === "CANCELLED"
                                ? "text-red-500"
                                : res.status === "REQUESTED"
                                ? "text-orange-500"
                                : res.status === "TO PAY"
                                ? "text-yellow-500"
                                : res.status === "PAID"
                                ? "text-blue-500"
                                : res.status === "DONE"
                                ? "text-green-500"
                                : "text-gray-500" // Default color if no status matches
                            }`}
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
                          <p className="text-xs select-none text-gray-400">{`Payment Type: ${res.paymentType}`}</p>

                          {/* Conditional rendering for Downpayment Amount or Balance label */}
                          {res.paymentType !== "fullpayment" && (
                            <p className="text-xs select-none text-gray-400">
                              {res.status === "DOWNPAYMENT PAID"
                                ? "Balance:"
                                : "Downpayment Amount:"}{" "}
                              {res.downpayment}
                            </p>
                          )}

                          <p className="text-xs select-none text-gray-400">{`From: ${res.reservedBy}`}</p>
                          <p className="text-xs select-none text-gray-400">{`Remarks: ${res.remarks}`}</p>
                          <span className="w-full bg-gray-200 h-0.5 rounded-full"></span>
                          <p className="text-xs select-none text-gray-400">{`Chosen Package: ${res.packageOffer}`}</p>
                          <div className="flex flex-col gap-4">
                            {res.buffetChosen &&
                              Object.entries(res.buffetChosen).map(
                                ([category, items], index) => {
                                  console.log(
                                    "Buffet Category:",
                                    category,
                                    "Items:",
                                    items
                                  ); // Log each buffet category and its items

                                  // Ensure items is a string and split it into an array if needed
                                  let itemsArray = [];
                                  if (typeof items === "string") {
                                    itemsArray = items
                                      .split(",")
                                      .map((item) => item.trim()); // Split by commas and trim extra spaces
                                  } else if (Array.isArray(items)) {
                                    itemsArray = items; // If it's already an array, use it directly
                                  } else {
                                    console.warn(
                                      `Expected 'items' to be a string or an array but got:`,
                                      items
                                    );
                                  }

                                  return (
                                    <div
                                      key={index}
                                      className="pl-2 w-full flex flex-col gap-2"
                                    >
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
                                }
                              )}
                          </div>
                          {/* BUTTON CONTAINER */}
                          {res.status === "PENDING" ? (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                                          border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handleToPayment(res.id)}
                              >
                                <i className="fa-solid fa-money-bill"></i>
                                <span>To Payment</span>
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleReject(res.id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : res.status === "CANCELLED" ? (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                                border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => handleMarkAsPending(res.id)}
                              >
                                Mark as Pending
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleDelete(res.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : res.status === "DONE" ? (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-blue-500 font-bold shadow-md rounded-md text-white gap-1
                                          hover:bg-blue-400 hover:scale-[1.02] flex items-center justify-center duration-200"
                                onClick={() => handlePrintEventDetails(res.id)}
                              >
                                Print Details
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleDelete(res.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : res.status === "REJECTED" ? (
                            <div className="flex items-center w-full mt-1">
                              <button
                                className="w-full h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleDelete(res.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : res.status !== "REJECTED" ? (
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-2/3 h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1 
            border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center"
                                onClick={() => {
                                  handlePaid(res.id, res.totalPrice);
                                  handlePayment(res);
                                }} // Pass the totalPrice from the reservation
                              >
                                <i className="fa-solid fa-money-bill"></i>
                                <span>Mark as Paid</span>
                              </button>
                              <button
                                className="w-1/3 h-10 bg-red-500 font-bold shadow-md rounded-md text-white
                                          hover:bg-red-400 hover:scale-[1.02] duration-200"
                                onClick={() => handleCancel(res.id)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-full bg-white p-4 border-2 border-gray-100 shadow-md rounded-md">
                    <p className="text-gray-400 font-bold text-center">
                      No reservation requests.
                    </p>
                  </div>
                )
                // #endregion
              }
            </div>
          </div>
          {/* PAGINATION CONTROLS */}
          <div
            className={`flex justify-center items-center space-x-2
              ${
                (resType === "table" &&
                  !reservations.some(
                    (res) => res.type === "Table" && res.status !== "PAID"
                  )) ||
                (resType === "event" &&
                  !reservations.some(
                    (res) => res.type === "Event" && res.status !== "PAID"
                  ))
                  ? "hidden"
                  : ""
              }`}
          >
            <button
              className="font-semibold cursor-pointer w-24 border-2 shadow-md h-9 border-gray-100 bg-white rounded-md text-gray-500 hover:bg-gray-50"
              disabled={currentPage === 1}
              onClick={handlePrevious}
            >
              Prev
            </button>
            {visiblePages.map((page) => (
              <button
                key={page}
                className={`cursor-pointer h-9 aspect-square font-semibold rounded-md ${
                  currentPage === page
                    ? "bg-orange-300 text-white border-orange-300 border-2"
                    : "bg-white text-gray-500 hover:bg-orange-50 border-2 border-gray-100 hover:border-orange-50 hover:text-orange-500"
                } shadow-md`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="cursor-pointer font-semibold w-24 border-2 shadow-md h-9 border-gray-100 bg-white rounded-md text-gray-500 hover:bg-gray-50"
              disabled={
                currentPage ===
                (resType === "table" ? totalTablePages : totalExclusivePages)
              }
              onClick={
                resType === "table" ? handleTableNext : handleExclusiveNext
              }
            >
              Next
            </button>
          </div>
        </div>

        {/* BOOKED RESERVATIONS CONTAINER */}
        <div className="flex flex-col gap-4 w-full max-w-[580px] max-h-[720px] overflow-auto pb-3">
          {/* HEADER AND DATE FILTER CONTAINER */}
          <div className="w-full flex flex-col items-end">
            {/* HEADER */}
            <div className="w-full flex gap-4 items-center">
              <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
              <span className="text-2xl text-center font-bold text-orange-900">
                Reservations
              </span>
              <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
            </div>
            {/* DATE SEARCH/FILTER BAR */}
            <div className="w-full flex justify-end items-center gap-1 mt-2">
              <input
                type="date"
                name="dateFilter"
                id="inputDateFilter"
                value={selectedFilterDate}
                onChange={handleDateChange}
                className="border-2 border-solid border-gray-200 text-sm sm:text-base sm:max-w-44 text-center
                        text-gray-600 h-10 pl-2 rounded-md bg-gray-50 w-full font-semibold pr-2"
              />
              <button
                className="bg-orange-950 rounded-md shadow-md text-white
                    font-bold h-10 px-4 hover:bg-orange-900 hover:scale-[1.03] duration-200"
                onClick={handleFilterClick}
              >
                Filter
              </button>
            </div>
          </div>
          {/* BOOKED RESERVATIONS LIST CONTAINER */}
          <div className="w-full flex flex-col gap-2 max-h-[720px]">
            {
              //#region Reserved Bookings - Table
              resType === "table" ? (
                reservations.some(
                  (res) => res.type === "Table" && res.status === "PAID"
                ) ? (
                  reservations.map(
                    (res) =>
                      res.type === "Table" &&
                      res.status === "PAID" && (
                        <div
                          className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                 flex flex-col justify-center gap-2`}
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
                                {resType === "event" ? (
                                  <span>{`${res.numberOfPersons} PAX - PHP ${
                                    res.totalPrice
                                      ? res.totalPrice.toFixed(2)
                                      : "0.00"
                                  }`}</span>
                                ) : resType === "table" ? (
                                  <span>{`${res.numberOfPersons} PAX`}</span>
                                ) : null}
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
                            <p className="text-xs select-none text-gray-400">{`Remarks: ${res.remarks}`}</p>
                                {/* BUTTON CONTAINER */}
                                <div className="flex gap-2 items-center w-full mt-1">
                                  <button
                                    className="w-full h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex justify-center items-center"
                                    onClick={() => handleMarkAsDone(res.id)}
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
                      )
                  )
                ) : (
                  <div className="w-full bg-white p-4 border-2 border-gray-100 shadow-md rounded-md">
                    <p className="text-gray-400 font-bold text-center">
                      No booked reservations.
                    </p>
                  </div>
                )
              ) : reservations.some(
                  (res) => res.type === "Event" && res.status === "PAID"
                ) ? (
                //#region Reserved Bookings - Exclusive
                reservations.map(
                  (res) =>
                    res.type === "Event" &&
                    res.status === "PAID" && (
                      <div
                        className={`w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                            flex flex-col justify-center gap-2`}
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
                              {resType === "event" ? (
                                <span>{`${res.numberOfPersons} PAX - PHP ${
                                  res.totalPrice
                                    ? res.totalPrice.toFixed(2)
                                    : "0.00"
                                }`}</span>
                              ) : resType === "table" ? (
                                <span>{`${res.numberOfPersons} PAX`}</span>
                              ) : null}
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
                          <p className="text-xs select-none text-gray-400">{`Remarks: ${res.remarks}`}</p>
                            <span className="w-full bg-gray-200 h-0.5 rounded-full"></span>
                            <p className="text-xs select-none text-gray-400">{`Chosen Package: ${res.packageOffer}`}</p>
                            <div className="flex flex-col gap-4">
                              {res.buffetChosen &&
                                Object.entries(res.buffetChosen).map(
                                  ([category, items], index) => {
                                    console.log(
                                      "Buffet Category:",
                                      category,
                                      "Items:",
                                      items
                                    ); // Log each buffet category and its items

                                    // Ensure items is a string and split it into an array if needed
                                    let itemsArray = [];
                                    if (typeof items === "string") {
                                      itemsArray = items
                                        .split(",")
                                        .map((item) => item.trim()); // Split by commas and trim extra spaces
                                    } else if (Array.isArray(items)) {
                                      itemsArray = items; // If it's already an array, use it directly
                                    } else {
                                      console.warn(
                                        `Expected 'items' to be a string or an array but got:`,
                                        items
                                      );
                                    }

                                    return (
                                      <div
                                        key={index}
                                        className="pl-2 w-full flex flex-col gap-2"
                                      >
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
                                  }
                                )}
                            </div>
                            {/* BUTTON CONTAINER */}
                            <div className="flex gap-2 items-center w-full mt-1">
                              <button
                                className="w-full h-10 bg-white border-2 shadow-md rounded-md font-bold text-gray-500 gap-1
                        border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200 flex justify-center items-center"
                                onClick={() => handleMarkAsDone(res.id)}
                              >
                                <i className="fa-solid fa-circle-check"></i>
                                <span>Mark as Done</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                )
              ) : (
                <div className="w-full bg-white p-4 border-2 border-gray-100 shadow-md rounded-md">
                  <p className="text-gray-400 font-bold text-center">
                    No booked reservations.
                  </p>
                </div>
              )
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

        {/* PENDING POP UP */}
        {isPendingVisible && <CheckoutPopup message="Marked as Pending!" />}

        {/* DELETE POP UP */}
        {isDeleteVisible && <CheckoutPopup message="Booking Deleted!" />}
      </div>
    </div>
  );
};

export default AdminCheckReservationsPage;