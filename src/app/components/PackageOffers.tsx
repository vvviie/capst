"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase"; // Adjust the path as needed
import { collection, getDocs } from "firebase/firestore";
import { ChosenItem } from "../hooks/types";

type PackageOffersProps = {
  selectedPackage: string;
  onFinalize: (chosenItemsArray: ChosenItemInterface[]) => void; // Use ChosenItemInterface here
  onPackageChange: () => void;
};

type BuffetItem = {
  id: string;
  title: string;
  items: string[];
  limits: Record<string, number>;
};

interface Item {
  id: string;
  label: string;
  price: number;
  items: string[];
  title: string;
}

interface ChosenItemInterface {
  id: string;
  label: string;
  price: number;
  items: string[];
  title: string;
}

  const PackageOffers: React.FC<PackageOffersProps> = ({
    selectedPackage,
    onFinalize,
    onPackageChange,
  }) => {

  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [prevSelectedPackage, setPrevSelectedPackage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buffet, setBuffet] = useState<BuffetItem[]>([]); // State to hold fetched buffet items
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: string[] }>({}); // State to track selected items per category
  const [getLimits, setGetLimits] = useState<Record<string, Record<string, number>>>({}); // State to hold limits

  useEffect(() => {
    const fetchBuffetData = async () => {
      const buffetCollection = collection(db, "packageOffers");
      const buffetSnapshot = await getDocs(buffetCollection);
      const buffetList = buffetSnapshot.docs
      .map((doc) => {
        const data = doc.data() as BuffetItem; // Explicitly cast data to BuffetItem type
        const { title, items, limits } = data; // Destructure data and avoid including `id` here
        return {
          id: doc.id, // Explicitly add the id
          title,      // Add title, items, and limits manually
          items,
          limits,
        };
      })
      .filter((item) => item.title && item.title !== "PackageChoices");

      // Assuming the structure of each document in the packageOffers collection has a title, items, and limits
      const limits: Record<string, Record<string, number>> = {}; // Define the type for limits

      buffetList.forEach((item) => {
        limits[item.title] = item.limits; // Store limits for each category
      });

      setBuffet(buffetList);
      setGetLimits(limits);
      // Initialize selectedItems based on fetched categories
      const initialSelectedItems: Record<string, any[]> = {};
      buffetList.forEach((item) => {
        initialSelectedItems[item.title] = [];
      });
      setSelectedItems(initialSelectedItems);
    };

    fetchBuffetData();
  }, []);

  useEffect(() => {
    if (prevSelectedPackage !== selectedPackage) {
      const resetSelectedItems: Record<string, any[]> = {}; // Define the type for resetSelectedItems
  
      buffet.forEach((item) => {
        resetSelectedItems[item.title] = []; // Initialize with an empty array for each title
      });
  
      setSelectedItems(resetSelectedItems);
      setPrevSelectedPackage(selectedPackage);
  
      // Call the onPackageChange callback when the package changes
      if (onPackageChange) {
        onPackageChange(); // Updated callback to onPackageChange
      }
    }
  }, [selectedPackage, buffet, prevSelectedPackage, onPackageChange]);

  useEffect(() => {
    // Event listener setup and teardown based on the 'open' state
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
  
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  
    // Cleanup event listener on unmount or when 'open' changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleItemSelect = (category: string, item: string) => {
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
      if (currentSelection.length < getLimits[category][selectedPackage]) {
        return {
          ...prev,
          [category]: [...currentSelection, item],
        };
      }

      return prev;
    });
  };

  const handleFinalize = () => {
    const unmetSelections = Object.keys(getLimits).filter(
      (category) =>
        selectedItems[category].length < getLimits[category][selectedPackage]
    );
  
    if (unmetSelections.length > 0) {
      setShowErrorModal(true);
      setErrorMessage(
        `Please complete your selection for the following categories:\n- ${unmetSelections.join("\n- ")}`
      );
    } else {
      const chosenItemsArray: ChosenItemInterface[] = Object.keys(selectedItems).map((category) => ({
        id: category,
        label: category, // You can derive label or assign a default
        price: 0, // You can assign a default or fetch price from elsewhere
        items: selectedItems[category], // Ensure items is of the correct type
        title: category, // Add the title property from the category or something else
      }));
  
      onFinalize(chosenItemsArray); // Pass mapped items to onFinalize
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
            {buffet.map((item) => (
              <div key={item.title}>
                <h1 className="text-xl text-left font-semibold text-orange-950 my-1">
                  {item.title}
                </h1>
                <hr />
                <p className="text-xs text-left text-gray-400 mt-2">
                  {getLimits[item.title] &&
                  getLimits[item.title][selectedPackage] !== undefined ? (
                    <>
                      Choose {getLimits[item.title][selectedPackage]}{" "}
                      {item.title}:
                      <span className="ml-2 text-orange-900 font-semibold">
                        {selectedItems[item.title]?.length || 0} out of{" "}
                        {getLimits[item.title][selectedPackage]} selected
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500">Limits not defined</span>
                  )}
                </p>
                <div className="grid grid-cols-2">
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    item.items.map((food) => (
                      <div
                        className="flex items-center justify-start space-x-2 mx-1 my-3"
                        key={food}
                      >
                        <input
                          type="checkbox"
                          name={`checkbox${food}`}
                          id={`checkbox${food}`}
                          className="w-5 h-5"
                          checked={
                            selectedItems[item.title]?.includes(food) || false
                          }
                          onChange={() => handleItemSelect(item.title, food)}
                          disabled={
                            !selectedItems[item.title]?.includes(food) &&
                            selectedItems[item.title]?.length >=
                              (getLimits[item.title]
                                ? getLimits[item.title][selectedPackage]
                                : 0)
                          }
                        />
                        <span className="text-sm w-4/5">{food}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-red-500">No items available</span>
                  )}
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