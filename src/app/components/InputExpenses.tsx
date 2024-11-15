"use client";
import React, { useEffect, useState, useRef } from "react";
import { expenseList } from "../data";
import CheckoutPopup from "./CheckoutPopup";

const hasExpenses = true;

const InputExpenses = ({ isOpen, toggleForm }) => {
  const formRef = useRef(null);
  const [input, setInput] = useState("today");
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);

  const handleSubmit = () => {
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };

  const handleChange = (event) => {
    setInput(event.target.value);
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-14 left-0 w-full h-[100vh] flex justify-center items-center px-4"
      style={{ background: "rgba(0, 0, 0, 0.85" }}
    >
      <form
        action=""
        className="bg-white border-2 border-100 rounded-md shadow-md pt-4 pb-6 px-6 w-full
        max-w-[500px] flex flex-col gap-2 mt-[-100px]"
        ref={formRef}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <select
            name=""
            id=""
            className="h-10 w-28 font-bold text-gray-500 border-2 border-gray-100
        shadow-md rounded-md cursor-pointer text-center"
            onChange={handleChange}
          >
            <option value="today">Today</option>
            <option value="date">Date</option>
          </select>
        </div>
        {input !== "today" && (
          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor={`inputDate`}
            >
              <span>Date</span>
            </label>
            <input
              className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
              name={`inputDate`}
              id={`inputDate`}
              type="date"
              required
            />
          </div>
        )}

        <div className="w-full flex flex-col gap-1 items-center justify-center">
          <label
            className="text-orange-950 text-sm w-full text-left space-x-1"
            htmlFor={`inputExpenseName`}
          >
            <span>Expense Label</span>
          </label>
          <input
            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
            name={`inputExpenseName`}
            id={`inputExpenseName`}
            type="text"
            placeholder="Expense Label"
            required
          />
        </div>

        <div className="w-full flex flex-col gap-1 items-center justify-center">
          <label
            className="text-orange-950 text-sm w-full text-left space-x-1"
            htmlFor={`inputExpenses`}
          >
            <span>Expense Amount</span>
          </label>
          <input
            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
            name={`inputExpenses`}
            id={`inputExpenses`}
            type="number"
            placeholder="Expense Amount"
            min={0}
            required
          />
        </div>
        <div className="w-full flex justify-end">
          <button
            className="w-1/3 min-w-20 bg-white border-2 border-gray-100 h-10 font-bold rounded-md
          shadow-md text-gray-500 hover:bg-gray-50 hover:scale-[1.02] duration-200"
          >
            Add
          </button>
        </div>
        {hasExpenses && (
          <>
            <hr className="mt-2" />
            <h1 className="text-sm font-semibold text-gray-500">
              Added Expenses
            </h1>
            <div className="w-full flex flex-wrap gap-1">
              {expenseList.map((exp) => (
                <span className="rounded-full shadow-md bg-red-400 text-white text-sm px-2 py-0.5">
                  {exp.name} : PHP {exp.amount.toFixed(2)}
                </span>
              ))}
            </div>
            <hr className="mt-1" />
            <div className="flex items-center justify-between font-bold text-orange-950">
              <span className="">Total Expense:</span>
              <span className="">PHP 15000.00</span>
            </div>
            <hr />
          </>
        )}
        <div className="mt-1 flex items-center gap-2 justify-between">
          <button
            className="w-2/3 bg-orange-950 h-10 font-bold text-white rounded-md shadow-md
        hover:bg-orange-900 hover:scale-[1.02] duration-200"
            onClick={() => {
              setIsPopUpVisible(true);

              setTimeout(() => {
                setIsPopUpVisible(false);
                toggleForm();
              }, 750);
            }}
          >
            Submit
          </button>
          <button
            className="w-1/3 bg-white h-10 font-bold text-gray-500 rounded-md shadow-md
        hover:bg-gray-50 hover:scale-[1.02] duration-200 border-2 border-gray-100
        "
            onClick={() => toggleForm()}
          >
            Cancel
          </button>
        </div>
      </form>
      {isPopUpVisible && <CheckoutPopup message={"Expense Submitted!"} />}
    </div>
  );
};

export default InputExpenses;
