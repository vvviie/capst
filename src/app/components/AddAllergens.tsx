"use client";

import React, { useState, useEffect, useRef } from "react";

const allergensByCategory: { [key: string]: string[] } = {
  default: ["Peanut", "Fish", "Chicken", "Almond", "Shrimp"],
  pastries: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
  drinks: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
};

const AddAllergens = ({ selectedCat }) => {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

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
  return (
    <div className="w-full cursor-pointer z-10">
      <button
        type="button"
        className="h-10 w-full font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md
                hover:bg-gray-50 hover:scale-[1.02] duration-200"
        onClick={() => setOpen(true)}
      >
        Add Allergens
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
            max-h-[720px] overflow-auto border-2 border-gray-100 mt-[-4rem]"
          >
            <h1 className="text-xl font-bold text-orange-950">Allergens</h1>
            <hr className="mb-2" />
            <div className="w-full grid grid-cols-2 gap-2">
              {(selectedCat === "drinks"
                ? allergensByCategory.drinks
                : selectedCat === "pastries"
                ? allergensByCategory.pastries
                : allergensByCategory.default
              ).map((items) => (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={items}
                    className="h-5 w-5"
                    id={items}
                    value={items}
                  />
                  <span className="text-lg text-gray-600">{items}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full text-white font-bold text-xl bg-orange-950 px-4 py-2 rounded-md shadow-md mt-4
              hover:bg-orange-900 hover:scale-[1.02] duration-300"
              onClick={() => setOpen(false)}
            >
              Add Allergens
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddAllergens;
