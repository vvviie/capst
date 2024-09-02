"use client";

import React, { useState } from "react";

const MainCourseOptions = () => {
  // Initialize selectedDrinkSize to "12oz"
  const [selectedOption, setSelectedOption] = useState<string>("rice");

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };
  return (
    <div className="flex flex-col gap-2">
      <hr />

      {/* OPTIONS */}
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-500">Options</h1>
        {/* RICE OR MASHED POTATO CHOICES */}
        <div className="flex flex-col">
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedOption === "rice" ? "bg-orange-50" : "bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="drinkSize"
              id="rice"
              className="w-5 h-5 cursor-pointer"
              checked={selectedOption === "rice"}
              onChange={() => handleOptionChange("rice")}
            />
            <span className="ml-4 font-semibold">Rice</span>
            <span className="ml-2"> (+0)</span>
          </div>
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedOption === "mashed" ? "bg-orange-50" : "bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="drinkSize"
              id="16oz"
              className="w-5 h-5 cursor-pointer"
              checked={selectedOption === "mashed"}
              onChange={() => handleOptionChange("mashed")}
            />
            <span className="ml-4 font-semibold">Mashed Potato</span>
            <span className="ml-2"> (+0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCourseOptions;
