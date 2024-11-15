"use client";

import React, { useState, useEffect, useRef } from "react";
import CheckoutPopup from "./CheckoutPopup";

let hasRecipients = true;

const recipients = [
  "abc@gmail.com",
  "def@gmail.com",
  "ghi@gmail.com",
  "jkl@gmail.com",
];

type tier = {
  id: number;
  value: string;
};

type tiers = tier[];

const tierList: tiers = [
  {
    id: 1,
    value: "Regular",
  },
  {
    id: 2,
    value: "Bronze",
  },
  {
    id: 3,
    value: "Silver",
  },
  {
    id: 4,
    value: "Gold",
  },
  {
    id: 5,
    value: "Diamond",
  },
];

const GiveVoucherForm = ({ isOpen, toggleForm }) => {
  const formRef = useRef(null);
  const [type, setType] = useState("user"); // Set the initial value to match the first option
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);

  const handlePopUp = async (id: string) => {
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      toggleForm();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  if (!isOpen) return null; // Only render if form is open

  return (
    <div
      className="fixed left-0 top-14 w-full h-[100vh] flex justify-center items-center z-10 px-4"
      style={{ background: "rgba(0, 0, 0, 0.85)" }}
    >
      <form
        action=""
        ref={formRef}
        className="bg-white px-4 py-2 rounded shadow-lg flex-1 max-w-[300px] sm:max-w-[420px] md:max-w-[500px]
        flex flex-col gap-4"
      >
        {/* HEADER */}
        <div className="flex gap-2 items-center justify-between">
          <h1 className="font-semibold text-gray-700 text-lg">
            Send Voucher To
          </h1>
          <select
            name="type"
            id="type"
            value={type} // Set the value to match the state
            onChange={handleTypeChange} // Update the state on change
            className="rounded-md border-2 border-gray-100 shadow-md px-2 py-1 w-1/2 h-10 text-center
          text-gray-500 font-bold"
          >
            <option value="user">User</option>
            <option value="tier">Tier</option>
          </select>
        </div>
        {type === "user" ? (
          <div className="flex flex-col gap-2">
            {/* INPUT AND BUTTON CONTAINER */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="inputUser"
              >
                <span>Username of recipient</span>
              </label>
              <input
                type="text"
                name="inputUser"
                id="inputUser"
                placeholder="Username"
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
              />
              <div className="w-full flex justify-end">
                <button
                  className="w-1/2 bg-white border-2 border-gray-100 shadow-md rounded-md
              font-bold h-10 hover:scale-[1.02] hover:bg-gray-50 duration-200 text-gray-500"
                  type="button"
                >
                  Add User
                </button>
              </div>
            </div>
            {hasRecipients && (
              <>
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1 mb-[-4px] mt-1"
                  htmlFor="recipients"
                >
                  <span>Recipients</span>
                </label>
                <hr />
                <div className="w-full flex flex-wrap gap-1">
                  {recipients.map((users) => (
                    <span className="py-1 px-2 bg-orange-300 text-white rounded-full text-sm">
                      {users}
                    </span>
                  ))}
                </div>
                <hr />
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {tierList.map((tier) => (
              <div
                className={`w-full flex items-center justify-start h-10 pl-3
                ${
                  tier.value === "Regular"
                    ? "bg-neutral-400"
                    : tier.value === "Bronze"
                    ? "bg-orange-900"
                    : tier.value === "Silver"
                    ? "bg-gray-300"
                    : tier.value === "Gold"
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                } rounded-md`}
              >
                <input
                  type="checkbox"
                  name="inputTier"
                  id={`input${tier.value}`}
                  className={`h-5 w-5`}
                />
                <span className="pl-3 text-white">{tier.value} Members</span>
              </div>
            ))}
          </div>
        )}
        <button
          className="w-full bg-orange-950 h-10 font-bold text-white rounded-md shadow-md
    hover:bg-orange-900 hover:scale-[1.02] duration-200 mb-1"
          type="button"
          onClick={() => {
            setIsPopUpVisible(true);

            setTimeout(() => {
              setIsPopUpVisible(false);
              toggleForm();
            }, 750);
          }}
        >
          Send Voucher
        </button>
      </form>
      {isPopUpVisible && <CheckoutPopup message={`Voucher sent!`} />}
    </div>
  );
};

export default GiveVoucherForm;
