"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ReservationDetails } from "@/app/data";

// KUNG MAY RESERVATION/S ANG CUSTOMER
const hasReservation = true;

const ReservationsPage = () => {
  const [expandedRes, setExpandedRes] = useState<Record<string, boolean>>({});

  const toggleRes = (id: string) => {
    setExpandedRes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // FOR OPENING NG POP UP
  const [confirmPopup, setConfirmPopup] = useState(false);

  // FOR CLOSING NG POP UP
  const formRef = useRef<HTMLDivElement | null>(null);

  // CLOSE FORM WHEN CLICK OUTSIDE
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

  return (
    <div
      className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8
    lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56"
    >
      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>

      {/* HEADER AND RESERVATIONS CONTAINER */}
      <div className="w-full  lg:max-w-[800px]">
        <div className="flex gap-2 justify-start items-center">
          <Link
            href={"/book"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-2xl text-left w-auto
            hover:text-orange-800 cursor-pointer mb-2"
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
            ReservationDetails.map((res) => (
              <div
                className="w-full py-4 rounded-md border-2 border-gray-50 shadow-md gap-2 bg-white cursor-pointer
                hover:scale-[0.98] duration-300"
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
                        {res.type === "Mobile Cart" ? "" : ` ${res.pax} pax on`}
                        {" " + res.dateRes} -{" "}
                        {res.type === "Event"
                          ? res.timeRes + ` to ${res.timeResEnd}`
                          : res.timeRes}
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
                        {res.buffet.map((items) => (
                          <div className="flex flex-col gap-1">
                            <hr />
                            {/* ITEM TITLE AND PRICE CONTAINER */}
                            <div className="font-bold text-sm text-left">
                              <span className="font-semibold">
                                {items.title}
                              </span>
                            </div>
                            {items.foods.map((food) => (
                              <p className="text-xs">-{food}</p>
                            ))}
                          </div>
                        ))}
                      </>
                    )}
                    <span className="text-xs text-gray-400">
                      Date Requested: {res.dateReq + " - " + res.timeReq}
                    </span>
                    {/* CANCEL BUTTON */}
                    <button
                      className="font-bold bg-red-500 rounded-md text-white py-2 shadow-md
                      hover:scale-[1.03] duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Cancel button clicked");
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
            <div
              className="space-x-2 text-gray-400 text-2xl font-bold bg-white py-8 rounded-md
            shadow-lg w-full text-center border-2 border-gray-50"
            >
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
                <button className="w-24 py-2 rounded-md shadow-md bg-white font-bold border-2 border-gray-50 text-gray-500">
                  Yes
                </button>
                <button
                  onClick={() => setConfirmPopup(false)}
                  className="w-24 py-2 rounded-md shadow-md bg-orange-950 border-2 border-orange-950 font-bold text-white"
                >
                  No
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