"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

const ReservationsPage = () => {
  const [expandedRes, setExpandedRes] = useState<Record<string, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [reservations, setReservations] = useState([]);
  const [hasReservation, setHasReservation] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const toggleRes = (id: string) => {
    setExpandedRes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [confirmPopup, setConfirmPopup] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setConfirmPopup(false);
    }
  };

  useEffect(() => {
    if (confirmPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [confirmPopup]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const loggedIn = !!authUser && authUser.emailVerified;
      setIsLoggedIn(loggedIn);
      setUserEmail(authUser?.email || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (authToken) {
      const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        if (authUser && authUser.emailVerified) {
          setIsLoggedIn(true);
        }
      });

      return () => unsubscribeAuth();
    }
  }, [router]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!userEmail) return;

      try {
        const reservationsRef = collection(db, "tableReservations");
        const querySnapshot = await getDocs(
          query(reservationsRef, where("reservedBy", "==", userEmail))
        );

        const fetchedReservations = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // Parse buffetChosen from the stored object with comma-separated values
          const buffetChosen = Object.entries(data.buffetChosen || {}).map(
            ([title, foods]) => ({
              title,
              foods: foods.split(",").map((food) => food.trim()),
            })
          );

          return {
            id: doc.id,
            type: data.type,
            dateReserved: new Date(data.dateReserved).toLocaleDateString(),
            dateToBeReserved: new Date(
              data.dateToBeReserved
            ).toLocaleDateString(),
            timeReserved: data.timeReserved || "N/A",
            timeToBeReserved: data.timeToBeReserved || "N/A",
            numberOfPersons: data.numberOfPersons || 1,
            reservedBy: data.reservedBy,
            status: data.status === "PENDING" ? "REQUESTED" : data.status,
            package: data.packageOffer || "d",
            buffet: buffetChosen,
            price: data.totalPrice || 0,
            paymentType: data.paymentType,
            downpayment: data.downpayment,
            balance: data.balance,
          };
        });

        setReservations(fetchedReservations);
        setHasReservation(fetchedReservations.length > 0);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, [userEmail]);

  useEffect(() => {
    const userCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("user="));

    // If no user cookie is found, show the login modal
    if (!userCookie) {
      setShowLoginModal(true);
    }

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

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      await deleteDoc(doc(db, "tableReservations", reservationId));
      setReservations((prev) => prev.filter((res) => res.id !== reservationId));
      setHasReservation(reservations.length > 1);
      setConfirmPopup(false);
    } catch (error) {
      console.error("Error deleting reservation:", error);
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

  //#region PAGES CODE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = 5;
  const pagesToShow = 5;

  // Calculate total pages
  const totalPages = Math.ceil(reservations.length / itemsPerPage);

  // Get current page orders
  const currentRes = reservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const visiblePages = Array.from(
    { length: Math.min(pagesToShow, totalPages - pageWindowStart + 1) },
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

  const handleNext = () => {
    if (currentPage < totalPages) {
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
    <div className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8 lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56">
      {/* Show login modal if no user cookie is found */}
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
      {/* BACKGROUND IMAGE CONTAINER */}
      <div className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1] lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"></div>

      {/* HEADER AND RESERVATIONS CONTAINER */}
      <div className="w-full lg:max-w-[800px]">
        <div className="flex gap-2 justify-start items-center">
          <Link
            href={"/book"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-2xl text-left w-auto hover:text-orange-800 cursor-pointer mb-2"
          >
            <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
            <span>Booking</span>
          </Link>
        </div>
        <div className="w-full flex gap-4 items-center mb-4">
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          <span className="text-2xl text-center font-bold text-orange-900">
            My Reservations
          </span>
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
        </div>

        {/* RESERVATIONS CONTAINER */}
        <div className="space-y-2 w-full max-h-[720px] pb-4 overflow-y-auto">
          {/* RESERVATIONS LIST */}
          {hasReservation ? (
            <>
              {currentRes.map((res) => (
                <div
                  className="w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white cursor-pointer"
                  key={res.id}
                  onClick={() => toggleRes(res.id)}
                >
                  {/* UNOPENED CONTAINER */}
                  <div className="flex items-center justify-between">
                    {/* UNEXPANDED RESERVATION DETAILS CONTAINER */}
                    <div className="flex flex-col gap-1 w-5/6">
                      {/* HEADERS CONTAINER */}
                      <div className="w-full px-4 flex justify-between items-center text-lg font-bold text-gray-800">
                        <span className="">{res.type}</span>
                        <span
                          className={`${
                            res.status === "REQUESTED"
                              ? "text-orange-500"
                              : res.status === "TO PAY"
                              ? "text-yellow-500"
                              : res.status === "PAID"
                              ? "text-blue-500"
                              : res.status === "DONE"
                              ? "text-green-500"
                              : "text-gray-500"
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      {/* SUBHEADER CONTAINER */}
                      <div className="w-full px-4 flex justify-between font-semibold items-center text-sm text-gray-400">
                        {/* DATE AND TIME OF RESERVATION */}
                        <span>
                          For
                          {res.type === "Mobile Cart"
                            ? ""
                            : ` ${res.numberOfPersons} pax on`}
                          {" " + res.dateToBeReserved} -{" "}
                          {res.type === "Event"
                            ? res.timeToBeReserved // Only display the end time for events
                            : res.timeToBeReserved}
                        </span>

                        {/* PRICE IF IT IS EVENT OR IN THE FUTURE, MOBILE CART */}
                        <span
                          className={`bg-orange-300 text-white px-3 py-0.5 rounded-full text-xs sm:text-sm`}
                        >
                          {`PHP ${res.price.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <span className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center mr-4 cursor-pointer">
                      <i
                        className={`fa ${
                          expandedRes[res.id]
                            ? "fa-caret-down"
                            : "fa-caret-right"
                        } text-gray-300 text-xs`}
                        aria-hidden="true"
                      ></i>
                    </span>
                  </div>
                  {expandedRes[res.id] && (
                    <div className="mx-4 my-2 px-4 py-2 rounded-md bg-gray-50 text-gray-400 flex flex-col gap-4">
                      {/* EXPANDED CONTENT */}
                      {res.type === "Event" && (
                        <>
                          <div className="font-bold text-sm flex justify-between items-center">
                            <span className="font-semibold">Event Package</span>
                            <span>Package - {" " + res.package}</span>
                          </div>
                          {res.buffet.map((buffet) => (
                            <div
                              className="flex flex-col gap-1"
                              key={buffet.title}
                            >
                              <hr />
                              {/* ITEM TITLE AND PRICE CONTAINER */}
                              <div className="font-bold text-sm text-left">
                                <span className="font-semibold">
                                  {buffet.title}
                                </span>
                              </div>
                              {buffet.foods.map((food, index) => (
                                <p className="text-xs" key={index}>
                                  -{food}
                                </p>
                              ))}
                            </div>
                          ))}
                        </>
                      )}
                      <span className="text-xs text-gray-400">
                        Date Requested:{" "}
                        {res.dateReserved + " - " + res.timeReserved} <br />
                        {res.type !== "Table" && (
                          <>
                            Payment Type: {res.paymentType} <br />
                            {res.paymentType !== "fullpayment" &&
                            res.status === "DOWNPAYMENT PAID" ? (
                              <>Balance: {res.downpayment}</>
                            ) : (
                              res.paymentType !== "fullpayment" && (
                                <>Downpayment: {res.downpayment}</>
                              )
                            )}
                          </>
                        )}
                      </span>
                      {/* CONDITIONAL BUTTON RENDERING */}
                      {res.status === "REJECTED" ||
                      res.status === "CANCELLED" ||
                      res.status === "PAID" ||
                      res.status === "DOWNPAYMENT PAID" ? null : res.status ===
                        "DONE" ? (
                        res.type === "Table" ? (
                          <button
                            className="font-bold bg-blue-500 rounded-md text-white py-2 shadow-md hover:scale-[1.03] duration-300"
                            onClick={() => handlePrintDetails(res.id)}
                          >
                            Print Details
                          </button>
                        ) : res.type === "Event" ? (
                          <button
                            className="font-bold bg-blue-500 rounded-md text-white py-2 shadow-md hover:scale-[1.03] duration-300"
                            onClick={() => handlePrintEventDetails(res.id)}
                          >
                            Print Details
                          </button>
                        ) : null
                      ) : (
                        <button
                          className="font-bold bg-red-500 rounded-md text-white py-2 shadow-md hover:scale-[1.03] duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReservationId(res.id);
                            setConfirmPopup(true);
                          }}
                        >
                          Cancel Reservation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {/* PAGINATION CONTROLS */}
              <div className="flex justify-center items-center space-x-2">
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
                  disabled={currentPage === totalPages}
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            //KAPAG HINDI PA NAKAKAPAGPA-RESERVE KAHIT ONCE, ITO ANG LALABAS
            <div className="space-x-2 text-gray-400 text-2xl font-bold bg-white py-8 rounded-md shadow-lg w-full text-center border-2 border-gray-50">
              <i className="fa-solid fa-newspaper"></i>
              <span>No reservation made yet.</span>
            </div>
          )}
        </div>
        {confirmPopup && (
          <div
            className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-center justify-center"
            style={{ background: "rgba(0, 0, 0, 0.1)" }}
          >
            <div
              ref={formRef}
              className="py-4 px-6 w-64 text-center bg-white shadow-md rounded-md"
            >
              <i
                className="fa fa-exclamation-triangle text-5xl text-orange-900 mb-2"
                aria-hidden="true"
              ></i>
              <h1 className="font-bold text-2xl text-orange-950">
                Cancel Reservation?
              </h1>
              <span className="text-md text-gray-700">
                Are you sure you want to cancel this reservation?
              </span>
              <div className="flex gap-2 items-center justify-center mt-4">
                <button
                  className="w-24 py-2 rounded-md shadow-md bg-white font-bold border-2 border-gray-50 text-gray-500"
                  onClick={() => setConfirmPopup(false)}
                >
                  No
                </button>
                <button
                  className="w-24 py-2 rounded-md shadow-md bg-orange-950 border-2 border-orange-950 font-bold text-white"
                  onClick={() =>
                    handleDeleteReservation(selectedReservationId || "")
                  }
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
