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
} from "firebase/firestore";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";

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
            status: data.status === "PENDING" ? "Requested" : data.status,
            package: data.packageOffer || "d",
            buffet: buffetChosen,
            price: data.totalPrice || 0,
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

  return (
    <div className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8 lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56">
      {/* BACKGROUND IMAGE CONTAINER */}
      <div className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1] lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"></div>

      {/* HEADER AND RESERVATIONS CONTAINER */}
      <div className="w-full lg:max-w-[800px]">
        <div className="flex gap-2 justify-start items-center">
          <Link
            href={"/book"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-2xl text-left w-auto hover:text-orange-800 cursor-pointer mb-2"
          >
            <i className="fa fa-book text-lg" aria-hidden="true"></i>
            <span>Booking</span>
          </Link>
          <h1 className="font-bold text-2xl mb-2 text-orange-950 flex gap-2 items-center w-auto">
            <i className="fa fa-angle-right" aria-hidden="true"></i>
            <span>My Reservations</span>
          </h1>
        </div>

        {/* RESERVATIONS CONTAINER */}
        <div className="space-y-2 w-full max-h-[720px] pb-4 overflow-y-auto">
          {/* RESERVATIONS LIST */}
          {hasReservation ? (
            reservations.map((res) => (
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
                          res.status === "Requested"
                            ? "text-blue-500"
                            : "text-green-500"
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
                      <span className={`font-bold text-gray-600`}>
                        {res.type === "Table" ? "" : `P${res.price}`}
                      </span>
                    </div>
                  </div>
                  <span className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center mr-4 cursor-pointer">
                    <i
                      className={`fa ${
                        expandedRes[res.id] ? "fa-caret-down" : "fa-caret-right"
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
                      {res.dateReserved + " - " + res.timeReserved}
                    </span>
                    {/* CANCEL BUTTON */}
                    <button
                      className="font-bold bg-red-500 rounded-md text-white py-2 shadow-md hover: scale-[1.03] duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReservationId(res.id);
                        setConfirmPopup(true);
                      }}
                    >
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </div>
            ))
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
