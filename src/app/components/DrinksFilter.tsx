import React, { useState } from "react";
import Image from "next/image";

interface DrinksFilterProps {
  onFilterChange: (filter: string) => void;
}

const DrinksFilter: React.FC<DrinksFilterProps> = ({ onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState("all");

  const handleFilterChange = (filter: string) => {
    setSelectedDrinkType(filter);
    onFilterChange(filter);
  };

  return (
    <div className="relative w-6 h-6 cursor-pointer">
      <Image
        src="/filter.webp"
        alt="filter"
        fill
        className="object-contain"
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <form
            id="drinksFilter"
            className="bg-white rounded-md shadow-xl p-6 flex flex-col gap-2 w-64"
          >
            <h1 className="text-2xl text-center font-semibold text-orange-950">
              Drink Type
            </h1>
            <hr className="mb-4" />
            <div className="space-y-4 pl-8">
              <div className="flex items-center justify-start space-x-2">
                <input
                  type="radio"
                  name="drinktype"
                  id="radioBoth"
                  className="w-4 h-4"
                  checked={selectedDrinkType === "all"}
                  onChange={() => handleFilterChange("all")}
                />
                <span className="text-xl">All</span>
              </div>
              <div className="flex items-center justify-start space-x-2">
                <input
                  type="radio"
                  name="drinktype"
                  id="radioCoffee"
                  className="w-4 h-4"
                  checked={selectedDrinkType === "Coffee"}
                  onChange={() => handleFilterChange("Coffee")}
                />
                <span className="text-xl">Coffee</span>
              </div>
              <div className="flex items-center justify-start space-x-2">
                <input
                  type="radio"
                  name="drinktype"
                  id="radioNonCoffee"
                  className="w-4 h-4"
                  checked={selectedDrinkType === "Non-Coffee"}
                  onChange={() => handleFilterChange("Non-Coffee")}
                />
                <span className="text-xl">Non-Coffee</span>
              </div>
            </div>
            <button
              type="button"
              className="w-full text-white font-bold text-xl bg-orange-950 px-4 py-2 rounded-md shadow-md mt-4"
              onClick={() => setOpen(false)}
            >
              Filter Menu
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DrinksFilter;
