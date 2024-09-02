"use client";

import React, { useState } from "react";

const DrinksOptions = () => {
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [selectedMilkOption, setSelectedMilkOption] = useState<string | null>(
    null
  );

  const handleAdditionalsChange = (value: string) => {
    setSelectedAdditionals((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleMilkOptionChange = (value: string) => {
    setSelectedMilkOption((prev) => (prev === value ? null : value));
  };

  return (
    <div className="flex flex-col gap-2">
      <hr />

      {/* ADDITIONALS */}
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-500">Additionals</h1>
        {/* ADDITIONALS CHOICES */}
        <div className="flex flex-col">
          {/* ADDITIONAL ESPRESSO */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedAdditionals.includes("Espresso")
                ? "bg-orange-50"
                : "bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name="additionals"
              id="Espresso"
              className="w-5 h-5"
              onChange={() => handleAdditionalsChange("Espresso")}
              checked={selectedAdditionals.includes("Espresso")}
            />
            <span className="ml-4 font-semibold">Espresso</span>
            <span className="ml-2"> (+30)</span>
          </div>
          {/* ADDITIONAL SYRUP */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedAdditionals.includes("Syrup")
                ? "bg-orange-50"
                : "bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name="additionals"
              id="Syrup"
              className="w-5 h-5 cursor-pointer"
              onChange={() => handleAdditionalsChange("Syrup")}
              checked={selectedAdditionals.includes("Syrup")}
            />
            <span className="ml-4 font-semibold">Syrup</span>
            <span className="ml-2"> (+30)</span>
          </div>
          {/* ADDITIONAL VANILLA */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedAdditionals.includes("Vanilla")
                ? "bg-orange-50"
                : "bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name="additionals"
              id="Vanilla"
              className="w-5 h-5 cursor-pointer"
              onChange={() => handleAdditionalsChange("Vanilla")}
              checked={selectedAdditionals.includes("Vanilla")}
            />
            <span className="ml-4 font-semibold">Vanilla</span>
            <span className="ml-2"> (+25)</span>
          </div>
        </div>
      </div>

      <hr />

      {/* MILK OPTIONS */}
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-500">Milk Options</h1>
        {/* MILK OPTIONS CHOICES */}
        <div className="flex flex-col">
          {/* ALMOND MILK OPTION */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedMilkOption === "Almond Milk"
                ? "bg-orange-50"
                : "bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name="milkOptions"
              id="AlmondMilk"
              className="w-5 h-5 cursor-pointer"
              checked={selectedMilkOption === "Almond Milk"}
              onChange={() => handleMilkOptionChange("Almond Milk")}
            />
            <span className="ml-4 font-semibold">Almond Milk</span>
            <span className="ml-2"> (+30)</span>
          </div>
          {/* OAT MILK OPTION */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedMilkOption === "Oat Milk" ? "bg-orange-50" : "bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name="milkOptions"
              id="OatMilk"
              className="w-5 h-5 cursor-pointer"
              checked={selectedMilkOption === "Oat Milk"}
              onChange={() => handleMilkOptionChange("Oat Milk")}
            />
            <span className="ml-4 font-semibold">Oat Milk</span>
            <span className="ml-2"> (+40)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrinksOptions;
