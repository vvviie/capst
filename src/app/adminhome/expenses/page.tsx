"use client";
import { months } from "@/app/data"; // Import months from your data file
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Spinner from "@/app/components/Spinner";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";

type Expense = {
  expenseAmount: number;
  expenseLabel: string;
  time: string;
};

type ExpenseDocument = {
  docID: string;
  addedExpenses: Expense[];
  date: string;
  totalExpenses: number;
};

const ExpensesPage = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [ExpenseDocs, setExpenseDocs] = useState<ExpenseDocument[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  ); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Function to get the month index from month name
  const getMonthIndex = (monthName: string) => {
    return months.indexOf(monthName);
  };

  useEffect(() => {
    const fetchCafeExpenses = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "cafeExpenses"));
        const expenses: ExpenseDocument[] = [];

        querySnapshot.forEach((doc) => {
          const expenseData = {
            docID: doc.id,
            ...doc.data(),
          } as ExpenseDocument;
          const expenseDate = new Date(expenseData.date);
          const expenseMonth = expenseDate.toLocaleString("default", {
            month: "long",
          }); // Get month name
          const expenseYear = expenseDate.getFullYear(); // Get year

          // Check if the expense matches the selected month and year
          if (
            (selectedMonth === "----Show All----" && expenseYear === selectedYear) ||
            (expenseMonth === selectedMonth && expenseYear === selectedYear)
          ) {
            expenses.push(expenseData);
          }
        });

        // Sort expenses in descending order by date
        expenses.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime(); // Sort in descending order
        });

        setExpenseDocs(expenses);
        console.log(expenses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cafeExpenses: ", error);
      }
    };

    // Fetch expenses only if both month and year are selected
    if (selectedYear !== null) {
      fetchCafeExpenses();
    }
  }, [selectedMonth, selectedYear]);

  // totalExpenses of all the docz
  //  // Calculate the total expenses when the component mounts or when ExpenseDocs changes
  //  useEffect(() => {
  //   const total = ExpenseDocs.reduce(
  //     (sum, doc) =>
  //       sum +
  //       doc.addedExpenses.reduce(
  //         (innerSum, expense) => innerSum + expense.expenseAmount,
  //         0
  //       ),
  //     0
  //   );
  //   setTotalExpenses(total);
  // }, [ExpenseDocs]);

  // Calculate the total expenses when the component mounts or when ExpenseDocs changes

  useEffect(() => {
    const total = ExpenseDocs.reduce((sum, doc) => {
      const expenseDate = new Date(doc.date);
      const expenseYear = expenseDate.getFullYear();

      // Check if the selected month is "Show All"
      if (
        selectedMonth === "----Show All----" &&
        expenseYear === selectedYear
      ) {
        return (
          sum +
          doc.addedExpenses.reduce(
            (innerSum, expense) => innerSum + expense.expenseAmount,
            0
          )
        );
      }

      // Get the selected month index
      const selectedMonthIndex = getMonthIndex(selectedMonth);

      // Check if the expense is in the selected month and the selected year
      if (
        expenseDate.getMonth() === selectedMonthIndex &&
        expenseYear === selectedYear
      ) {
        return (
          sum +
          doc.addedExpenses.reduce(
            (innerSum, expense) => innerSum + expense.expenseAmount,
            0
          )
        );
      }
      return sum;
    }, 0);

    setTotalExpenses(total);
  }, [ExpenseDocs, selectedMonth, selectedYear]);

  //#region PAGES CODE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const pagesToShow = 5;
  // Calculate total pages
  const totalPages = Math.ceil(ExpenseDocs.length / itemsPerPage);

  const [currentExp, setCurrentExp] = useState<ExpenseDocument[]>([]); // Filtered expenses

  // Filter expenses based on the selected month and year
  useEffect(() => {
    const filteredExpenses = ExpenseDocs.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.getMonth(); // 0-11 for Jan-Dec
      const expenseYear = expenseDate.getFullYear(); // Get the year

      // Check if the selected month is "Show All"
      if (selectedMonth === "----Show All----") {
        return expenseYear === selectedYear; // Only filter by year
      }

      // Check if the expense month matches the selected month and the expense year matches the selected year
      return (
        months[expenseMonth] === selectedMonth && expenseYear === selectedYear
      );
    });

    // Update the currentExp based on the filtered expenses and items per page
    setCurrentExp(filteredExpenses.slice(0, itemsPerPage));
  }, [ExpenseDocs, selectedMonth, selectedYear, itemsPerPage]);

  // For pages
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentExp(ExpenseDocs.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, ExpenseDocs]);

  const visiblePages = Array.from(
    { length: Math.min(pagesToShow, totalPages - pageWindowStart + 1) },
    (_, index) => pageWindowStart + index
  );

  // Handle page change
  const goToPage = (pageNumber: number) => {
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

  // Handle items per page change
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = parseInt(e.target.value, 10);
    setItemsPerPage(selectedValue);
    setCurrentPage(1);
    setPageWindowStart(1);
  };
  //#endregion

  const years = Array.from(
    { length: 8 }, // LENGTH OF YEARS (2028 to 2021 is 8 years)
    (_, i) => 2028 - i // Start from 2028 and decrement
  );

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
    setSelectedDate(null);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
    setSelectedDate(null); // Reset selectedDate to null
  };

  //const [selectedDate, setSelectedDate] = useState(ExpenseDocs[0]);
  const [selectedDate, setSelectedDate] = useState<ExpenseDocument | null>(
    null
  );

  useEffect(() => {
    // Reset editing index when the selected date changes or when expenses are updated
    setEditingIndex(null);
  }, [selectedDate]);

  // Assuming ExpenseDocument is the correct type for doc
  const handleDateClick = (doc: ExpenseDocument) => {
    setSelectedDate(doc);
    console.log("Selected Date:", doc);
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedAmount, setEditedAmount] = useState<number | null>(null);

  const handleEditClick = (index: number, currentAmount: number) => {
    setEditingIndex(index);
    setEditedAmount(currentAmount);
  };

  const handleSaveClick = async (index: number) => {
    // Check if selectedDate is not null
    if (selectedDate) {
      const expenseDocRef = doc(db, "cafeExpenses", selectedDate.docID);

      try {
        // Fetch the current totalExpenses from Firestore
        const expenseDoc = await getDoc(expenseDocRef);
        const currentTotalExpenses = expenseDoc.exists()
          ? expenseDoc.data().totalExpenses
          : 0;

        const updatedExpenses = [...selectedDate.addedExpenses];

        // Get the old expense amount for the specific index
        const oldExpenseAmount = updatedExpenses[index].expenseAmount;

        // Update the specific expenseAmount
        updatedExpenses[index].expenseAmount =
          editedAmount !== null ? editedAmount : 0; // Default to 0 or any other value

        // Calculate the difference
        const difference =
          updatedExpenses[index].expenseAmount - oldExpenseAmount;

        // Update the document in Firestore
        await updateDoc(expenseDocRef, {
          addedExpenses: updatedExpenses,
          totalExpenses: currentTotalExpenses + difference, // Update totalExpenses based on difference
        });

        // Update the selectedDate in local state
        setSelectedDate({
          ...selectedDate,
          addedExpenses: updatedExpenses,
          totalExpenses: currentTotalExpenses + difference, // Update totalExpenses here as well
        });

        // Update the local totalExpenses state
        setTotalExpenses((prevTotal) => prevTotal + difference); // Adjust totalExpenses based on the difference
        setEditingIndex(null);

        // Format the date from selectedDate.docID (which is assumed to be in YYYY-MM-DD format)
        const dateParts = selectedDate.docID.split("-"); // Split the date string into parts
        const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`; // Format as MM/DD/YYYY

        // Submit to salesData collection
        const salesDocumentId = "salesExpensesToday"; // Use a fixed document ID for today
        const salesDataRef = doc(db, "salesData", salesDocumentId);

        // Update the salesData document
        const expensesData = {
          Expenses: {
            data: {
              [formattedDate]: currentTotalExpenses + difference, // Use the updated total expenses for the formatted date
            },
          },
        };

        // Merge the new expenses data with the existing document
        try {
          await setDoc(salesDataRef, expensesData, { merge: true }); // Use merge to avoid overwriting other fields
        } catch (error) {
          console.error("Error updating sales data: ", error);
        }
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    } else {
      console.error("No expense document is selected.");
    }
  };

  const handleRemove = async (index: number) => {
    if (selectedDate) {
      const expenseDocRef = doc(db, "cafeExpenses", selectedDate.docID);

      try {
        // Create a copy of the addedExpenses array
        const updatedExpenses = [...selectedDate.addedExpenses];

        // Get the amount of the expense to be removed for total calculation
        const removedExpenseAmount = updatedExpenses[index].expenseAmount;

        // Remove the specific expense from the array
        updatedExpenses.splice(index, 1); // Remove the expense at the specified index

        // Update the document in Firestore
        await updateDoc(expenseDocRef, {
          addedExpenses: updatedExpenses,
          totalExpenses: selectedDate.totalExpenses - removedExpenseAmount, // Update totalExpenses accordingly
        });

        // Update the selectedDate in local state immediately
        const updatedTotalExpenses =
          selectedDate.totalExpenses - removedExpenseAmount;
        setSelectedDate({
          ...selectedDate,
          addedExpenses: updatedExpenses,
          totalExpenses: updatedTotalExpenses,
        });

        // Update the local totalExpenses state
        setTotalExpenses((prevTotal) => prevTotal - removedExpenseAmount); // Adjust totalExpenses based on the removed amount

        // Update ExpenseDocs to reflect the change
        setExpenseDocs((prevDocs) => {
          return prevDocs.map((doc) => {
            if (doc.docID === selectedDate.docID) {
              return {
                ...doc,
                addedExpenses: updatedExpenses,
                totalExpenses: updatedTotalExpenses,
              };
            }
            return doc;
          });
        });

        console.log("Expense removed successfully");

        // Format the date from selectedDate.docID (which is assumed to be in YYYY-MM-DD format)
        const dateParts = selectedDate.docID.split("-"); // Split the date string into parts
        const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`; // Format as MM/DD/YYYY

        // Submit to salesData collection
        const salesDocumentId = "salesExpensesToday"; // Use a fixed document ID for today
        const salesDataRef = doc(db, "salesData", salesDocumentId);

        // Update the salesData document
        const expensesData = {
          Expenses: {
            data: {
              [formattedDate]: updatedTotalExpenses, // Use the current total expenses for the formatted date
            },
          },
        };

        await setDoc(salesDataRef, expensesData, { merge: true }); // Use merge to avoid overwriting other fields
      } catch (error) {
        console.error("Error updating sales data: ", error);
      }
      setEditingIndex(null);
    } else {
      console.error("No expense document is selected.");
    }
  };

  const handleDelete = async () => {
    if (selectedDate) {
      try {
        await deleteDoc(doc(db, "cafeExpenses", selectedDate.docID));

        setExpenseDocs((prevDocs) => {
          const updatedDocs = prevDocs.filter(
            (doc) => doc.docID !== selectedDate.docID
          );
          const newTotalExpenses = updatedDocs.reduce(
            (sum, doc) => sum + doc.totalExpenses,
            0
          );
          setTotalExpenses(newTotalExpenses);
          return updatedDocs;
        });

        // Reset selected date after deletion
        setSelectedDate(null);

        console.log("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    } else {
      console.error("No document selected for deletion");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const confirmDelete = () => {
    handleDelete();
    closeModal();
  };

  return (
    <div
      className="bg-white min-h-[80vh] mt-14 w-full flex justify-center items-start
    px-5 md:px-24 xl:px-56 
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center py-10"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[500px] lg:max-w-[900px]">
        {/* LINK BACK TO DASHBOARD */}
        <Link
          href={"/adminhome"}
          className="flex items-center space-x-1 font-bold text-orange-950 text-xl text-left
              hover:text-orange-800 cursor-pointer lg:text-2xl mb-2"
        >
          <i className="fa fa-angle-left" aria-hidden="true"></i>
          <span>Dashboard</span>
        </Link>
        {/* HEADER */}
        <div className="w-full flex gap-4 items-center mb-2">
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          <span className="text-2xl text-center font-bold text-orange-900">
            Expenses
          </span>
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
        </div>
        {/* FORM */}
        <div
          className="w-full bg-white border-2 border-gray-100 shadow-md rounded-md pt-4 pb-6 px-4
        flex flex-col gap-2 items-center"
        >
          {/* MONTH AND YEAR */}
          <div className="w-full flex gap-2 items-center font-bold">
            <select
              name="selectMonth"
              id="selectMonth"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value); // Set the selected month
                setSelectedDate(null); // Reset selected date to null
              }}
              className="border-2 pl-2 pr-4 py-1 rounded-md text-gray-500 w-2/3 text-center border-gray-200"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={handleYearChange}
              className="border-2 pl-2 pr-4 py-1 rounded-md text-gray-500 w-1/3 border-gray-200 text-center"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="h-0.5 bg-gray-100 w-full my-2"></div>
          <div className="w-full flex justify-between gap-2 items-center font-bold">
            <span className="text-gray-800">Monthly Total</span>
            {currentExp.length > 0 ? (
              <span className="text-red-500 font-bold text-sm">
                PHP {totalExpenses.toFixed(2)}
              </span>
            ) : (
              <span className="text-gray-500 text-sm">
                {selectedMonth === "----Show All----"
                  ? "No expenses for this year."
                  : "No expenses for the selected month."}
              </span>
            )}
          </div>
          <div className="h-0.5 bg-gray-100 w-full my-2"></div>

          {/* DATE AND DETAILS CONTAINER */}
          <div className="flex flex-col gap-4 items-center w-full lg:flex-row lg:items-start">
            {/* DATE CONTAINER */}
            <div
              className="flex flex-col gap-2 w-full bg-gray-100 p-2 rounded-md lg:w-2/5
            lg:min-w-80"
            >
              <div className="w-full flex justify-between gap-2 items-center">
                <h1 className="font-semibold text-gray-700">Dates</h1>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-gray-500">
                    Shown Items:
                  </span>
                  <select
                    name="selectItemsPerPage"
                    id="selectItemsPerPage"
                    className="border-2 pl-1 rounded-md text-gray-500 w-12"
                    onChange={handleItemsPerPageChange}
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </span>
              </div>
              <hr />
              {/* DATE LIST */}
              <div className="flex flex-col gap-2 justify-center">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    {" "}
                    {/* Center spinner vertically */}
                    <Spinner /> {/* Display spinner while loading */}
                  </div>
                ) : currentExp.length === 0 ? (
                  <p className="text-center text-gray-600">
                    There is no recorded expense this month.
                  </p>
                ) : (
                  <>
                    {currentExp.map((exp) => (
                      <div
                        className={`w-full border-2 py-2 px-4 rounded-md shadow-md text-gray-600 cursor-pointer transition duration-300 ease-in-out ${
                          selectedDate?.docID === exp.docID
                            ? "bg-orange-300 border-orange-300 text-white"
                            : "bg-white border-gray-100 hover:bg-orange-100 hover:text-orange-500 hover:border-orange-100"
                        }`}
                        key={exp.docID}
                        onClick={() => handleDateClick(exp)}
                      >
                        <p className="w-full font-bold text-center">
                          {exp.date}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
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
            </div>
            {/* DETAILS CONTAINER */}
            <div className="p-2 sm:px-4 rounded-md bg-gray-100 w-full lg:w-3/5">
              {selectedDate ? (
                <>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="w-full flex justify-between gap-2 items-center">
                      <h1 className="font-semibold text-gray-700">Details</h1>
                      <button
                        className="bg-red-500 shadow-md rounded-md px-2 py-1 text-white font-semibold text-sm space-x-2"
                        onClick={openModal} // Open the confirmation modal
                      >
                        <i
                          className="fa fa-trash text-xs"
                          aria-hidden="true"
                        ></i>
                        <span className="">Delete</span>
                      </button>
                    </div>
                    <hr />

                    {/* Confirmation Modal */}
                    {isModalOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-md shadow-lg p-6">
                          <h2 className="text-lg font-semibold">
                            Confirm Deletion
                          </h2>
                          <p>Are you sure you want to delete this item?</p>
                          <div className="mt-4 flex justify-end">
                            <button
                              className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2"
                              onClick={closeModal}
                            >
                              Cancel
                            </button>
                            <button
                              className="bg-red-500 text-white px-4 py-2 rounded-md"
                              onClick={confirmDelete}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="w-full flex justify-between gap-2 items-center">
                      {/* PUT THE SELECTED DOCEXPENSE DATE HERE */}
                      <h1 className="font-bold text-sm text-gray-600 bg-white px-2 py-1 rounded-sm shadow-sm space-x-2">
                        <span>For</span>
                        <span className="text-orange-300">
                          {selectedDate.date}
                        </span>
                      </h1>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-xs text-gray-500">
                          Shown Items:
                        </span>
                        <span className="bg-gray-500 text-xs px-2 py-0.5 rounded-md text-center text-white">
                          {selectedDate.addedExpenses.length}
                        </span>
                      </span>
                    </div>
                    <hr className="mb-1" />
                  </div>
                  {/* LIST OF EXPENSES */}
                  <div className="flex flex-col w-full max-w-4xl mx-auto">
                    {" "}
                    {/* Adjust the max width here */}
                    {/* Header Row */}
                    <div className="flex bg-gray-200 font-bold text-gray-700 py-2 px-4 rounded-md mb-2">
                      <span className="w-1/4 mr-4">Title</span>{" "}
                      {/* Adjusted width */}
                      <span className="w-1/4 text-center ">Time</span>{" "}
                      {/* Adjusted width */}
                      <span className="w-1/4 text-right mr-4">Amount</span>{" "}
                      {/* Adjusted width */}
                      <span className="w-1/4 text-right mr-3">
                        Actions
                      </span>{" "}
                      {/* New Actions column */}
                    </div>
                    {/* Expense Items */}
                    {selectedDate.addedExpenses.map((expense, index) => (
                      <div
                        className="flex items-center justify-between bg-white border-2 border-gray-100 shadow-md py-2 px-4 sm:px-6 rounded-md mb-1"
                        key={index}
                      >
                        {/* EXPENSE LABEL */}
                        <span className="text-gray-600 font-bold text-sm w-1/4">
                          {expense.expenseLabel}
                        </span>

                        {/* TIME FIELD */}
                        <span className="text-gray-500 font-bold text-sm w-1/4 text-center">
                          {expense.time} {/* Display time */}
                        </span>

                        {/* EXPENSE AMOUNT OR INPUT FIELD */}
                        <span className="text-red-500 font-bold text-sm text-right w-1/4">
                          {editingIndex === index ? (
                            <input
                              type="number"
                              min={1}
                              className="border-2 rounded-md max-w-20 pl-2 text-sm h-8 text-red-500 font-bold mr-2" // Added margin to the right
                              placeholder="Amount"
                              value={editedAmount !== null ? editedAmount : ""} // Use empty string if editedAmount is null
                              onChange={(e) =>
                                setEditedAmount(Number(e.target.value))
                              }
                            />
                          ) : (
                            `PHP ${expense.expenseAmount.toFixed(2)}`
                          )}
                        </span>

                        {/* ACTIONS */}
                        <div className="flex items-center w-1/4 justify-end gap-2">
                          {editingIndex === index ? (
                            <>
                              <button
                                onClick={() => handleSaveClick(index)}
                                className="text-sm font-bold bg-orange-300 h-8 w-8 rounded-md text-white hover:bg-orange-200 hover:scale-[1.02] duration-200 flex items-center justify-center"
                              >
                                <i className="fas fa-check"></i>{" "}
                                {/* Font Awesome Check Icon */}
                              </button>

                              {/* REMOVE ITEM BUTTON - Only visible in edit mode */}
                              <button
                                onClick={() => handleRemove(index)}
                                className="h-8 w-8 text-white bg-gray-300 rounded-md text-xs font-bold hover:bg-gray-400 hover:scale-[1.01] duration-200 text-center flex items-center justify-center"
                              >
                                DEL
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                handleEditClick(index, expense.expenseAmount)
                              }
                              className="text-sm font-bold bg-white border-2 border-gray-100 h-8 px-4 rounded-md text-gray-500 hover:bg-gray-50 hover:scale-[1.02] duration-200"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <hr />
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-700 text-sm font-bold">
                        Total Expenses for the day:
                      </span>
                      <span className="text-white bg-red-500 font-semibold text-xs px-2 py-1 rounded-full">
                        PHP{" "}
                        {selectedDate.addedExpenses
                          .reduce((sum, exp) => sum + exp.expenseAmount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center bg-white border-2 border-gray-100 shadow-md py-5">
                  <span className="text-gray-500 font-bold text-center">
                    Choose a date to see the details
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
