"use client";
import React, { useEffect, useState, useRef } from "react";
import CheckoutPopup from "./CheckoutPopup";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
const hasExpenses = true;
const InputExpenses = ({ isOpen, toggleForm }) => {
  const formRef = useRef(null);
  const [input, setInput] = useState("today");
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [addedExpenses, setAddedExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseLabel, setExpenseLabel] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [activeExpenseIndex, setActiveExpenseIndex] = useState(null); // State to track the active expense

  const handleExpenseClick = (index) => {
    setActiveExpenseIndex(index); // Set the clicked expense as active
  };

  const handleClose = () => {
    setExpenseLabel("");
    setExpenseAmount(0);
    setAddedExpenses([]);
    setTotalExpense(0);
    setError("");
    toggleForm();
  };

  const handleCancel = () => {
    setActiveExpenseIndex(null); // Reset the active expense index to close the action menu
  };
  
  const handleAddExpense = () => {
    // Clear previous error
    setError("");

    // Validate inputs
    if (!expenseLabel || !expenseAmount || (input !== "today" && !date)) {
      // Set error message based on which input is missing
      if (!expenseLabel && !expenseAmount && input !== "today" && !date) {
        setError("Please fill in all fields");
      } else if (!expenseLabel) {
        setError("Expense Label is required.");
      } else if (!expenseAmount) {
        setError("Expense Amount is required.");
      } else if (input !== "today" && !date) {
        setError("Date is required when not selecting 'Today'.");
      }
      // Clear the error after 4 seconds
      setTimeout(() => {
        setError(""); // Clear the error message
      }, 4000); // 4000 milliseconds = 4 seconds
      return; // Exit the function if validation fails
    }

    if (expenseLabel && expenseAmount > 0) {
      const newExpense = { expenseLabel, expenseAmount: Number(expenseAmount) };
      setAddedExpenses([...addedExpenses, newExpense]);
      setTotalExpense(totalExpense + Number(expenseAmount));
      setExpenseLabel("");
      setExpenseAmount(0);
      setActiveExpenseIndex(null); // Reset active expense index when adding a new expense
    }
  };

  const handleRemoveExpense = (index) => {
    // Get the amount of the expense being removed
    const removedExpenseAmount = addedExpenses[index].expenseAmount;

    // Update the totalExpense by subtracting the removed amount
    setTotalExpense((prevTotal) => prevTotal - removedExpenseAmount);

    // Remove the expense from the addedExpenses array
    setAddedExpenses((prevExpenses) =>
      prevExpenses.filter((_, i) => i !== index)
    );

    // Reset active expense index if necessary
    setActiveExpenseIndex(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    let isValid = true;
  
    // Validation checks
    if (addedExpenses.length === 0) {
      setError("Please add at least one expense.");
      setTimeout(() => {
        setError("");
      }, 4000);
      isValid = false;
    }
  
    if (input !== "today" && !date) {
      setError("Date is required when not selecting 'Today'.");
      setTimeout(() => {
        setError("");
      }, 4000);
      isValid = false;
    }
  
    // If validation fails, stop the function here
    if (!isValid) {
      return; // Exit the function if validation fails
    }
  
    // Show the popup after successful validation
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  
    const now = new Date();
    const expenseData = {
      date: date || now.toISOString().split("T")[0], // Use today's date if not provided
      time: `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`, // Get time in HH:MM format (military time)
      totalExpenses: totalExpense,
      addedExpenses: addedExpenses,
    };
  
    // Use the date in YYYY-MM-DD format for the document ID
    const documentId =
      input === "today" ? now.toISOString().split("T")[0] : date; // Use selected date if input is not "today"
  
    try {
      // Get the current data from Firestore (if any) to accumulate expenses
      const docRef = doc(db, "cafeExpenses", documentId);
      const docSnap = await getDoc(docRef);
  
      let updatedExpenses = [...addedExpenses];
      let newTotalExpense = totalExpense;
  
      if (docSnap.exists()) {
        // If the document exists, fetch the existing addedExpenses and append new ones
        const existingExpenses = docSnap.data().addedExpenses || [];
        const existingTotalExpense = docSnap.data().totalExpenses || 0;
  
        // Update the newTotalExpense by adding the existing totalExpense and the new totalExpense
        newTotalExpense = existingTotalExpense + totalExpense;
  
        // Merge the existing expenses with the new expenses
        updatedExpenses = [...existingExpenses, ...addedExpenses];
      }
  
      // Use setDoc with merge: true to create or update the document
      await setDoc(docRef, { addedExpenses: updatedExpenses, totalExpenses: newTotalExpense });
  
      // Handle sales data update for formatted date (e.g., "11/27/2024")
      const salesDocumentId = "salesExpensesToday";
      const salesDataRef = doc(db, "salesData", salesDocumentId);
  
      const formattedDate = `${
        now.getMonth() + 1
      }/${now.getDate()}/${now.getFullYear()}`; // Format date as MM/DD/YYYY
  
      // Get the current sales data (if any) to accumulate expenses
      const salesDocSnap = await getDoc(salesDataRef);
      let currentSalesData = salesDocSnap.exists() ? salesDocSnap.data() : {};
  
      // Ensure the data structure is available for Expenses and NetSales
      const expensesData = currentSalesData.Expenses || { data: {}, labels: "Expenses" };
  
      // Accumulate the existing expenses and update the total expenses for the formatted date
      let newSalesTotal = expensesData.data[formattedDate] || 0;
      newSalesTotal += totalExpense;
  
      // Update the sales data with the new total for the formatted date
      expensesData.data[formattedDate] = newSalesTotal;
  
      // Now update or create the sales data document in Firestore
      await setDoc(salesDataRef, { Expenses: expensesData }, { merge: true });
  
      // Hide the popup and toggle the form after a delay
      setTimeout(() => {
        setIsPopUpVisible(false);
        toggleForm(); // Close the form
      }, 750);
    } catch (error) {
      console.error("Error submitting expenses: ", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "expenseLabel") {
      setExpenseLabel(value);
    } else if (name === "expenseAmount") {
      setExpenseAmount(value);
    } else if (name === "date") {
      setDate(value);
    } else {
      setInput(value);
    }
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
        onSubmit={handleSubmit}
        className="bg-white border-2 border-100 rounded-md shadow-md pt-4 pb-6 px-6 w-full
  max-w-[500px] flex flex-col gap-2 mt-[-100px]"
        ref={formRef}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <select
            name="inputSelect"
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
              name={`date`}
              id={`inputDate`}
              type="date"
              value={date}
              required
              onChange={handleChange}
            />
          </div>
        )}

        <div className="w-full flex flex-col gap-1 items-center justify-center">
          <label
            className="text-orange-950 text-sm w-full text-left space-x-1"
            htmlFor="expenseLabel"
          >
            Expense Label
          </label>
          <input
            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
            name="expenseLabel"
            id="expenseLabel"
            type="text"
            placeholder="Enter expense label, e.g., 'Coffee Beans', 'Salary'"
            value={expenseLabel}
            onChange={handleChange}
          />
        </div>

        <div className="w-full flex flex-col gap-1 items-center justify-center">
          <label
            className="text-orange-950 text-sm w-full text-left space-x-1"
            htmlFor="expenseAmount"
          >
            <span>Expense Amount</span>
          </label>
          <input
            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
            name="expenseAmount"
            id="expenseAmount"
            type="number"
            value={expenseAmount}
            onChange={handleChange}
            placeholder="Expense Amount"
            min={0}
            required
          />
        </div>
        <div className="flex items-center w-full">
          <div className="flex-grow flex items-center justify-between">
            {error && (
              <span className="text-red-600 text-sm mr-2 min-w-[200px]">
                {error}
              </span> // Display error message with a minimum width
            )}
          </div>

          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={handleAddExpense}
              className="w-1/3 min-w-[150px] bg-white border-2 border-gray-100 h-10 font-bold rounded-md
      shadow-md text-gray-500 hover:bg-gray-50 hover:scale-[1.02] duration-200"
            >
              Add Expense
            </button>
          </div>
        </div>
        {addedExpenses.length > 0 && (
          <>
            <hr className="mt-2" />
            <h1 className="text-sm font-semibold text-gray-500">
              Added Expenses
            </h1>
            <div className="w-full flex flex-wrap gap-1">
              {addedExpenses.map((expense, index) => (
                <div key={index} className="relative flex items-center mb-2">
                  {activeExpenseIndex === index ? (
                    <span className="flex items-center py-1 px-2 bg-orange-300 text-white rounded-full text-sm cursor-pointer">
                      <button
                        className="bg-transparent text-white rounded-full text-sm cursor-pointer hover:bg-orange-400 transition duration-200 ease -in-out py-1 px-2"
                        onClick={() => handleRemoveExpense(index)}
                      >
                        Remove
                      </button>
                      <span className="mx-2 text-white">|</span>
                      <button
                        className="bg-transparent text-white rounded-full text-sm cursor-pointer hover:bg-orange-400 transition duration-200 ease-in-out py-1 px-2"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span
                      className="py-1 px-2 bg-orange-300 text-white rounded-full text-sm cursor-pointer"
                      onClick={() => handleExpenseClick(index)}
                    >
                      {expense.expenseLabel} : PHP{" "}
                      {expense.expenseAmount.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <hr className="mt-1" />
            <div className="flex items-center justify-between font-bold text-orange-950">
              <span>Total Expense:</span>
              <span>PHP {totalExpense}</span>
            </div>
            <hr />
          </>
        )}
        <div className="mt-1 flex items-center gap-2 justify-between">
          <button
            type="submit"
            className="w-2/3 bg-orange-950 h-10 font-bold text-white rounded-md shadow-md
        hover:bg-orange-900 hover:scale-[1.02] duration-200"
          >
            Submit
          </button>
          <button
            type="button"
            className="w-1/3 bg-white h-10 font-bold text-gray-500 rounded-md shadow-md
      hover:bg-gray-50 hover:scale-[1.02] duration-200 border-2 border-gray-100"
            onClick={handleClose} // Connect to handleCancel function
          >
            Cancel
          </button>
          {isPopUpVisible && <CheckoutPopup message={"Expense Submitted!"} />}
        </div>
      </form>
    </div>
  );
};

export default InputExpenses;
