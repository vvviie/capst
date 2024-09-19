"use client";
import React, { useState } from "react";

type deets = {
  id: string;
  type: string;
  subject: string;
  details: string;
  time: string;
  date: string;
  read: boolean;
};

type notifs = deets[];

const notifItems: notifs = [
  {
    id: "1213",
    type: "Order",
    subject: "Order Status",
    details: "Your order is currently being prepared in the kitchen.",
    time: "12:00",
    date: "09/18/2024",
    read: false,
  },
  {
    id: "2213",
    type: "Book",
    subject: "Booking Status",
    details:
      "Your request for a reservation for 2 on September 21, 2024 has been accepted.",
    time: "12:00",
    date: "09/18/2024",
    read: true,
  },
  {
    id: "3213",
    type: "Voucher",
    subject: "New Voucher",
    details:
      "Congratulations! You've received a P10 off voucher for a minimum spend of P200!",
    time: "12:00",
    date: "09/18/2024",
    read: true,
  },
  {
    id: "4213",
    type: "Announcement",
    subject: "Announcement",
    details: "Order on October 31 for a surprise!",
    time: "12:00",
    date: "09/18/2024",
    read: true,
  },
];

const hasNotifs = true;
const hasUnreadNotifs = true;

const NotificationBell = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="cursor-pointer">
      {/* RED CIRCLE ON NOTIF BELL WHEN THERE IS/ARE UNREAD MESSAGE/S */}
      {hasUnreadNotifs && (
        <span
          className="w-3 aspect-square bg-red-500 absolute rounded-full top-4 translate-x-[10px]"
          style={{ boxShadow: "0 2px 6px rgba(200, 100, 100, 0.8)" }}
          onClick={() => setOpen(open ? false : true)}
        ></span>
      )}
      {/* ICON OF THE NOTIF BELL WHEN OPEN AND CLOSED */}
      {!open ? (
        // NOT OPENED
        <i
          className="fa-solid fa-bell text-xl mt-1 md:text-base md:mt-0 text-white hover:text-yellow-100"
          onClick={() => setOpen(true)}
        ></i>
      ) : (
        // OPENED
        <i
          className="fa-solid fa-bell text-xl mt-1 md:text-base md:mt-0 text-yellow-200"
          onClick={() => setOpen(false)}
        ></i>
      )}
      {/* NOTIF DROPDOWN */}
      {open && (
        // DARKENS THE BACKGROUND
        <div
          className="fixed top-14 left-0 w-[100vw] h-[calc(100vh-56px)] z-30
          flex justify-center items-start cursor-default"
          style={{ background: "rgba(0, 0, 0, 0.1)" }}
        >
          {/* NOTIFS CONTAINER */}
          <div
            className="mx-2 pt-4 pb-3 pl-6 pr-4 bg-white rounded-md shadow-md relative mt-2
          max-h-[calc(96vh-56px)] overflow-y-clip flex items-center flex-col max-w-[410px] md:max-w-[480px]
          md:max-h-[calc(65vh)] cursor-default overflow-x-clip"
          >
            {/* CONTAINER FOR DROPDOWN HEADER */}
            <div className="flex justify-between items-center w-full">
              {/* NOTIFICATION HEADER */}
              <span className="text-xl font-bold text-orange-950">
                Notifications
              </span>
              {/* CLOSE BUTTON #1 - X BUTTON */}
              <div
                className="h-6 aspect-square bg-gray-50 text-gray-400 border-2 cursor-pointer
              border-gray-50 text-center font-thin rounded-full flex items-center justify-center
              hover:bg-white hover:shadow-md hover:border-gray-100 hover:font-normal duration-200"
                onClick={() => setOpen(false)}
              >
                <p>X</p>
              </div>
            </div>
            {/* NOTIF ITEMS MAPPING */}
            {hasNotifs ? (
              // PARENT DIV PARA WALANG OVERFLOW
              <div className="max-h-[1560px] overflow-y-auto overflow-x-clip">
                {notifItems.map((notifs) => (
                  // PARENT DIV TO HOLD THE HR AND NOTIF ITEM TOGETHER IN THE MAPPING
                  <div key={notifs.id}>
                    {/* HR FOR SEPARATION */}
                    <hr className="my-4" />
                    {/* WHOLE NOTIFICATION ITEM */}
                    <div className="relative flex items-start">
                      {/* CIRCLE CONTAINER NG NOTIF */}
                      <div
                        className={`h-14 rounded-full aspect-square
                      flex items-center justify-center mr-3 mt-1
                      ${notifs.read ? "bg-gray-300" : "bg-orange-900"}`}
                      >
                        {/* ICON NG NOTIF */}
                        <i
                          className={`fa fa-${
                            notifs.type === "Order"
                              ? "mug-hot ml-1 text-xl"
                              : notifs.type === "Book"
                              ? "book text-lg"
                              : notifs.type === "Voucher"
                              ? "tag mt-1 text-xl"
                              : "bullhorn"
                          } ${
                            notifs.read ? "text-gray-100" : "text-yellow-100"
                          }`}
                          aria-hidden="true"
                        ></i>
                      </div>
                      {/* NOTIF TITLE, DETAILS, DATE, TIME, MARK AS, AND DELETE CONTAINER */}
                      <div className="w-[300px] md:w-[320px] lg:w-[340px] pr-2">
                        {/* TITLE OF NOTIFICATION */}
                        <h1
                          className={`${
                            notifs.read
                              ? "text-gray-500 font-semibold"
                              : "text-orange-950 font-bold"
                          }`}
                        >
                          {notifs.subject}
                        </h1>
                        {/* DETAILS OF NOTIFICATION */}
                        <p
                          className={`${
                            notifs.read
                              ? "text-gray-400 font-normal"
                              : "text-gray-700 font-semibold"
                          } text-sm`}
                        >
                          {notifs.details}
                        </p>
                        {/* DATE AND TIME OF NOTIFICATION */}
                        <div className="mt-1 flex justify-between items-center">
                          <span
                            className={`${
                              notifs.read ? "text-gray-300" : "text-gray-500"
                            } text-xs`}
                          >
                            {notifs.date} | {notifs.time}
                          </span>
                          {/* MARK AS READ OR UNREAD */}
                          <span
                            className={`text-xs underline underline-offset-2 text-gray-500
                            cursor-pointer hover:text-gray-400 duration-150`}
                          >
                            Mark as {notifs.read ? "unread" : "read"}
                          </span>
                          {/* DELETE OPTION */}
                          <span
                            className={`text-xs underline underline-offset-2 text-red-300
                            cursor-pointer hover:text-red-400 duration-150`}
                          >
                            Delete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // IF THERE ARE NO NOTIFICATION
              <div className="w-[410px]">
                <hr />
                <h1 className="text-gray-400 pt-4 text-center">
                  You do not have any notification.
                </h1>
              </div>
            )}
            {hasNotifs && (
              // MARK ALL AS READ / DELETE ALL CONTAINER
              <div className="flex items-center gap-4 w-full mt-4">
                {/* MARK ALL AS READ BUTTON */}
                <button
                  className="bg-white rounded-md shadow-md h-9 flex-1 font-bold text-gray-600
                border-gray-50 border-2 cursor-pointer hover:bg-gray-50 hover:text-gray-400 duration-150
                text-sm"
                >
                  Mark all as read
                </button>
                {/* DELETE ALL BUTTON */}
                <button
                  className="bg-red-500 rounded-md shadow-md h-9 flex-1 font-bold text-white
                border-red-500 border-2 cursor-pointer hover:border-red-400 hover:bg-red-400 hover:text-red-50 duration-150
                text-sm"
                >
                  Delete all
                </button>
              </div>
            )}
            {/* CLOSE BUTTON #2 - BAR SA BABA NA PWEDE RIN PANG-CLOSE NG DROPDOWN */}
            <span
              className="self-center mt-6 block bg-gray-300 w-24 h-1 rounded-full border-[3px]
              cursor-pointer border-gray-300 hover:bg-gray-200 hover:border-gray-200 duration-150"
              onClick={() => setOpen(false)}
            ></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
