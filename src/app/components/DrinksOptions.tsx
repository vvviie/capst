import React, { useState, useEffect } from "react";

interface DrinksOptionsProps {
  addEspresso: number;
  addSyrup: number;
  milkAlmond: number;
  milkOat: number;
  addVanilla?: number; // Optional
  onAdditionalCostChange: (cost: number) => void;
  onOptionsChange: (additionals: string[], milkOption: string | null) => void; // New callback
}

const DrinksOptions: React.FC<DrinksOptionsProps> = ({
  addEspresso,
  addSyrup,
  milkAlmond,
  milkOat,
  addVanilla,
  onAdditionalCostChange,
  onOptionsChange,
}) => {
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [selectedMilkOption, setSelectedMilkOption] = useState<string | null>(null);

  useEffect(() => {
    let price = 0;

    if (selectedAdditionals.includes("Espresso")) {
      price += addEspresso;
    }

    if (selectedAdditionals.includes("Syrup")) {
      price += addSyrup;
    }

    if (addVanilla && selectedAdditionals.includes("Vanilla")) {
      price += addVanilla;
    }

    if (selectedMilkOption === "Almond Milk") {
      price += milkAlmond;
    } else if (selectedMilkOption === "Oat Milk") {
      price += milkOat;
    }

    // Notify parent about the additional cost
    onAdditionalCostChange(price);

    // Pass the selected options back to the parent
    onOptionsChange(selectedAdditionals, selectedMilkOption);
  }, [selectedAdditionals, selectedMilkOption, addEspresso, addSyrup, addVanilla, milkAlmond, milkOat, onAdditionalCostChange, onOptionsChange]);

  const handleAdditionalsChange = (value: string) => {
    setSelectedAdditionals((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
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
              className="w-5 h-5 cursor-pointer"
              onChange={() => handleAdditionalsChange("Espresso")}
              checked={selectedAdditionals.includes("Espresso")}
            />
            <span className="ml-4 font-semibold">Espresso</span>
            <span className="ml-2"> (+{addEspresso})</span>
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
            <span className="ml-2"> (+{addSyrup})</span>
          </div>
          {/* ADDITIONAL VANILLA */}
          {addVanilla > 0 && ( // Conditionally render if addVanilla exists and is greater than 0
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
              <span className="ml-2"> (+{addVanilla})</span>
            </div>
          )}
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
            <span className="ml-2"> (+{milkAlmond})</span>
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
            <span className="ml-2"> (+{milkOat})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrinksOptions;
