"use client";

import React, { useState, useEffect, useRef } from "react";
import { Buffet } from "../data";

const PackageOffers = ({ selectedPackage, onFinalize, onPackageChange }) => {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [prevSelectedPackage, setPrevSelectedPackage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (prevSelectedPackage !== selectedPackage) {
      setSelectedItems({
        Veggies: [],
        Pasta: [],
        Mains: [],
        Dessert: [],
      });
      setPrevSelectedPackage(selectedPackage);
    }
  }, [selectedPackage, prevSelectedPackage]); // Ensure prevSelectedPackage is included to avoid loops

  // State to track selected items per category
  const [selectedItems, setSelectedItems] = useState({
    Veggies: [],
    Pasta: [],
    Mains: [],
    Dessert: [],
  });

  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Category limits based on package
  const getLimits = {
    Veggies: 1,
    Pasta: selectedPackage === "C" ? 2 : 1,
    Mains: selectedPackage === "A" ? 2 : 3,
    Dessert: selectedPackage === "C" ? 2 : 1,
  };

  const handleItemSelect = (category, item) => {
    setSelectedItems((prev) => {
      const currentSelection = prev[category];

      // If already selected, unselect the item
      if (currentSelection.includes(item)) {
        return {
          ...prev,
          [category]: currentSelection.filter((selected) => selected !== item),
        };
      }

      // Only allow selection if the limit has not been reached
      if (currentSelection.length < getLimits[category]) {
        return {
          ...prev,
          [category]: [...currentSelection, item],
        };
      }

      return prev;
    });
  };

  // Function to handle finalization and validation
  const handleFinalize = () => {
    const unmetSelections = Object.keys(getLimits).filter(
      (category) => selectedItems[category].length < getLimits[category]
    );

    if (unmetSelections.length > 0) {
      setShowErrorModal(true);
      setErrorMessage(
        `Please complete your selection for: ${unmetSelections.join(", ")}`
      );
    } else {
      const chosenItemsArray = Object.keys(selectedItems).map((category) => ({
        title: category,
        items: selectedItems[category],
      }));
      onFinalize(chosenItemsArray); // Pass selected items back to ReservationPage
      setOpen(false);
    }
  };

  return (
    <div className="w-1/2 cursor-pointer z-10">
      <button
        type="button"
        className="flex items-center justify-center space-x-1 w-full h-10 rounded-md shadow-md text-gray-700 bg-white
            hover:bg-gray-100 border-2 border-gray-50 hover:scale-[1.02] duration-300"
        onClick={() => setOpen(true)}
      >
        <i className="fas fa-utensil-spoon text-sm"></i>
        <span className="font-bold text-md">Buffet Contents</span>
      </button>
      {open && (
        <div
          className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <form
            ref={formRef}
            id="drinksFilter"
            className="bg-white rounded-md shadow-xl p-8 flex flex-col gap-2 min-w-96 mx-10
            max-h-[720px] overflow-auto border-2 border-gray-100"
          >
            {Buffet.map((item) => (
              <div key={item.title}>
                <h1 className="text-xl text-left font-semibold text-orange-950 my-1">
                  {item.title}
                </h1>
                <hr />
                <p className="text-xs text-left text-gray- 400 mt-2">
                  Choose {getLimits[item.title]} {item.title}:
                  <span className="ml-2 text-orange-900 font-semibold">
                    {selectedItems[item.title].length} out of{" "}
                    {getLimits[item.title]} selected
                  </span>
                </p>
                <div className="grid grid-cols-2">
                  {item.items.map((food) => (
                    <div
                      className="flex items-center justify-start space-x-2 mx-1 my-3"
                      key={food}
                    >
                      <input
                        type="checkbox"
                        name={`checkbox${food}`}
                        id={`checkbox${food}`}
                        className="w-5 h-5"
                        checked={selectedItems[item.title].includes(food)}
                        onChange={() => handleItemSelect(item.title, food)}
                        disabled={
                          !selectedItems[item.title].includes(food) &&
                          selectedItems[item.title].length >=
                            getLimits[item.title]
                        }
                      />
                      <span className="text-sm w-4/5">{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="w-full text-white font-bold text-xl bg-orange-950 px-4 py-2 rounded-md shadow-md mt-4
              hover:bg-orange-900 hover:scale-[1.02] duration-300"
              onClick={handleFinalize}
            >
              Finalize Buffet
            </button>
            {showErrorModal && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-4 rounded-md shadow-md">
                <p className="text-sm">{errorMessage}</p>
                <button
                  type="button"
                  className="bg-orange-950 text-white font-bold text-sm px-4 py-2 rounded-md shadow-md mt-2
                  hover:bg-orange-900 hover:scale-[1.02] duration-300"
                  onClick={() => setShowErrorModal(false)}
                >
                  OK
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default PackageOffers;
