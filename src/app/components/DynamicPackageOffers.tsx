"use client";

import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase"; // Adjust the path as necessary
import {
  collection,
  setDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface PackageOffer {
  id: string;
  title?: string; // Add other fields if applicable
  items?: string[]; // Adjust types based on your actual data structure
  limits?: Record<string, number>; // Adjust the type of `limits` if necessary
}

const DynamicPackageOffers = () => {
  const [categories, setCategories] = useState<PackageOffer[]>([]);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [foodItemInput, setFoodItemInput] = useState<{ [key: string]: string }>(
    {}
  );
  const [showFoodInput, setShowFoodInput] = useState<{
    [key: string]: boolean;
  }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const packageOffersRef = collection(db, "packageOffers");
  const [selectedLimits, setSelectedLimits] = useState<{
    [key: string]: { key: string; value: string | number };
  }>({});

  const modalRef = useRef<HTMLDivElement | null>(null); // Create a ref for the modal

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal(); // Close the modal if the click is outside
    }
  };

  useEffect(() => {
    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasLimits = (category: PackageOffer): category is PackageOffer & { limits: Record<string, number> } => {
    return category.limits !== undefined;
  };
  
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(packageOffersRef);
  
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as PackageOffer))
        .filter(hasLimits) // Use the type guard to filter only categories with limits
        .map((category) => {
          // Sort the limits object keys
          const sortedLimits = Object.keys(category.limits)
            .sort()
            .reduce((acc, key) => {
              acc[key] = category.limits[key];
              return acc;
            }, {} as Record<string, number>);
  
          return { ...category, limits: sortedLimits }; // Return the category with sorted limits
        });
  
      setCategories(data);
    };
  
    fetchCategories();
  }, [packageOffersRef]);

  const handleAddCategory = async () => {
    if (newCategoryTitle) {
      const newCategory = {
        title: newCategoryTitle,
        items: [],
        limits: {
          A: 1,
          B: 2,
          C: 3,
        },
      };

      await setDoc(doc(packageOffersRef, newCategoryTitle), newCategory);

      setCategories([
        ...categories,
        {
          id: newCategoryTitle,
          title: newCategoryTitle,
          items: [],
          limits: newCategory.limits,
        },
      ]);

      setNewCategoryTitle("");
    }
  };

  const handleSetLimit = async (
    categoryId: string,
    limitKey: string,
    limitValue: string | number
  ) => {
    if (limitKey && limitValue) {
      const categoryRef = doc(packageOffersRef, categoryId);
      await updateDoc(categoryRef, {
        [`limits.${limitKey}`]: Number(limitValue), // Update the specific limit
      });
  
      // Update the local state
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                limits: {
                  ...cat.limits,
                  [limitKey]: Number(limitValue),
                },
              }
            : cat
        )
      );
    }
  };

  const handleAddFoodItem = async (categoryId: string) => {
    const foodItem = foodItemInput[categoryId];
    if (foodItem) {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category) {
        const updatedItems = [...(category.items ?? []), foodItem];
        await updateDoc(doc(packageOffersRef, categoryId), {
          items: updatedItems,
        });

        setCategories(
          categories.map((cat) =>
            cat.id === categoryId ? { ...cat, items: updatedItems } : cat
          )
        );
        setFoodItemInput({ ...foodItemInput, [categoryId]: "" });
        setShowFoodInput({ ...showFoodInput, [categoryId]: false });
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteDoc(doc(packageOffersRef, categoryId));
    setCategories(categories.filter((cat) => cat.id !== categoryId));
  };

  const handleDeleteFoodItem = async (categoryId: string, foodItem: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      const updatedItems = (category.items ?? []).filter((item) => item !== foodItem);
      await updateDoc(doc(packageOffersRef, categoryId), {
        items: updatedItems,
      });
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, items: updatedItems } : cat
        )
      );
    }
  };

  const handleShowFoodInput = (categoryId: string) => {
    setShowFoodInput({
      ...showFoodInput,
      [categoryId]: !showFoodInput[categoryId],
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="">
      <button
        onClick={openModal}
        className="bg-orange-300 text-white h-10 rounded-md px-4
        font-bold shadow-md hover:bg-orange-200 hover:scale-[1.02]
        duration-200"
      >
        Package Offers
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-md p-6 w-full max-w-xl mx-4 z-50 max-h-[80vh] overflow-y-auto"
          >
            {" "}
            {/* max-w-sm for mobile */}
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-xl font-bold text-center flex-1
              text-orange-950"
              >
                Manage Package Offers
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 p-2 bg-white rounded-full hover:bg-gray-50
                transition-colors duration-200 w-10 h-10 border-2 border-gray-100 shadow-md
                font-bold" // Increased width and height for better touch target
              >
                X
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm mb-1 text-gray-500">Add New Category</p>
              <input
                type="text"
                placeholder="New Category Title"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                className="border border-gray-300 rounded-md p-2 mr-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              />
              <button
                onClick={handleAddCategory}
                className="bg-orange-950 text-white px-4 py-2 rounded-md w-full mt-2
                font-bold hover:bg-orange-900 hover:scale-[1.01] duration-300"
              >
                Add Category
              </button>
            </div>
            {/* Categories List */}
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border shadow-md p-4 rounded-lg bg-white hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="border shadow-md p-4 rounded-lg bg-white hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl text-gray-800">
                        {category.title}
                      </h3>
                      <button
                        onClick={() => {
                          setCategoryToDelete(category.id);
                          setIsConfirmDeleteOpen(true);
                        }}
                        className="bg-red-500 text-white font-semibold text-sm px-4 h-10 rounded-md
                        hover:bg-red-400 space-x-2 transition-colors hover:scale-[1.02] duration-300"
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* New Section for Selection Limits */}
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 relative">
                        {/* ComboBox for selecting limits */}
                        <select
                          className="border border-gray-300 rounded-md p-2 w-full max-w-32
                          text-sm font-semibold text-gray-600"
                          value={selectedLimits[category.id]?.key || ""} // Set selected value based on state
                          onChange={(e) => {
                            const limitKey = e.target.value;

                            if (category.limits) {
                              setSelectedLimits({
                                ...selectedLimits,
                                [category.id]: {
                                  key: limitKey,
                                  value: String(category.limits[limitKey] || ""), // Safely access limits
                                },
                              });
                            }
                          }}
                        >
                          <option value="">Select Limit</option>
                          {Object.keys(category.limits ?? {}).map((key) => (
                            <option key={key} value={key}>
                              {key} - {category.limits?.[key]}
                            </option>
                          ))}
                        </select>

                        {/* Input field for setting the limit value */}
                        <input
                          type="number"
                          value={selectedLimits[category.id]?.value || ""}
                          onChange={(e) => {
                            setSelectedLimits({
                              ...selectedLimits,
                              [category.id]: {
                                ...selectedLimits[category.id],
                                value: e.target.value,
                              },
                            });
                          }}
                          className="border border-gray-300 rounded-md aspect-square w-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200
                          text-center font-semibold pl-2"
                          min={0}
                          placeholder="0"
                        />

                        {/* SET button */}
                        <button
                          onClick={() =>
                            handleSetLimit(
                              category.id,
                              selectedLimits[category.id]?.key,
                              selectedLimits[category.id]?.value
                            )
                          }
                          className="bg-orange-300 text-white text-sm px-4 rounded-md hover:bg-orange-200
                          transition-colors duration-200 absolute right-0 font-semibold h-10 hover:scale-[1.02]"
                        >
                          Set
                        </button>
                      </div>
                    </div>

                    {/* Food Items List */}
                    <ul className="space-y-2 mt-4">
                      {category.items?.map((foodItem, foodIndex) => (
                        <li
                          key={foodIndex}
                          className="flex justify-between items-center p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                        >
                          <span className="text-gray-700 text-sm font-bold">
                            {foodItem}
                          </span>
                          <span className="text-gray-700 text-sm font-bold">{foodItem}</span>
                          <button
                            onClick={() =>
                              handleDeleteFoodItem(category.id, foodItem)
                            }
                            className="text-white text-xs hover:text-white transition-colors rounded-full shadow-md mr-1
                            aspect-square w-5 bg-gray-300 hover:bg-gray-400 hover:scale-[1.02] duration-200"
                          >
                            x
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Confirmation Modal for Deletion */}
                  {isConfirmDeleteOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
                      <div className="bg-white rounded-md p-4 w-full max-w-sm mx-4 z-50">
                        <h2 className="text-lg font-bold mb-4 text-center">
                          Are you sure you want to delete this category?
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-between">
                          {" "}
                          {/* Stack buttons on small screens */}
                          <button
                            onClick={() => {
                              if (categoryToDelete) {
                                handleDeleteCategory(categoryToDelete);
                              }
                              setIsConfirmDeleteOpen(false);
                              setCategoryToDelete(null);
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 mb-2 sm:mb-0 sm:mr-2"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => {
                              setIsConfirmDeleteOpen(false);
                              setCategoryToDelete(null);
                            }}
                            className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center mt-4">
                    {/* "+" Button to Add Food Item */}
                    {!showFoodInput[category.id] && (
                      <button
                        onClick={() => handleShowFoodInput(category.id)}
                        className="border-2 border-gray-200 bg-white shadow-md text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50
                        transition-colors duration-300 w-full opacity-75 relative font-bold hover:scale-[1.02]"
                      >
                        <span className="relative z-10">Add Item</span>
                      </button>
                    )}
                    {/* Input Box for New Food Item */}
                    {showFoodInput[category.id] && (
                      <div className="mt-2 flex flex-col sm:flex-row w-full ml-2 items-end sm:items-center">
                        <input
                          type="text"
                          placeholder="New Item"
                          value={foodItemInput[category.id] || ""}
                          onChange={(e) =>
                            setFoodItemInput({
                              ...foodItemInput,
                              [category.id]: e.target.value,
                            })
                          }
                          className="border border-gray-300 rounded-md p-2 sm:mr-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
                        />
                        <button
                          onClick={() => {
                            handleAddFoodItem(category.id);
                            setFoodItemInput({
                              ...foodItemInput,
                              [category.id]: "",
                            });
                          }}
                          className="bg-orange-950 font-bold text-white px-4 py-2 rounded-md w-full mt-2 sm:mt-0
                          sm:w-auto hover:bg-orange-900 shadow-md hover:scale-[1.02] transition-colors duration-200"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => handleShowFoodInput(category.id)}
                          className="bg-white text-gray-500 h-10 rounded-md w-1/2 sm:w-auto hover:bg-gray-50 transition-colors duration-200 mt-2 sm:mt-0 sm:ml-2
                          border-2 shadow-md border-gray-100 font-bold hover:scale-[1.02] px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPackageOffers;