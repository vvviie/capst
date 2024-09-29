import React, { useState, useEffect } from "react";

interface DrinksOptionsProps {
  addEspresso: number;
  addSyrup: number;
  milkAlmond: number;
  milkOat: number;
  addVanilla?: number; // Optional
  onAdditionalCostChange: (cost: number) => void;
  onOptionsChange: (additionals: string[], milkOption: string | null) => void; // New callback
  selectedMilkOption?: string | null; // New prop
  selectedAdditionals?: string[]; // New prop
}

const DrinksOptions: React.FC<DrinksOptionsProps> = ({
  addEspresso,
  addSyrup,
  milkAlmond,
  milkOat,
  addVanilla,
  onAdditionalCostChange,
  onOptionsChange,
  selectedMilkOption,
  selectedAdditionals,
}) => {
  const selectedAdditionalsProp = selectedAdditionals ?? [];
  const selectedMilkOptionProp = selectedMilkOption ?? null;

  const [selectedAdditionalsState, setSelectedAdditionals] = useState(
    selectedAdditionalsProp
  );
  const [selectedMilkOptionState, setSelectedMilkOption] = useState(
    selectedMilkOptionProp
  );

  useEffect(() => {
    let price = 0;

    if (selectedAdditionalsState.includes("Espresso")) {
      price += addEspresso;
    }

    if (selectedAdditionalsState.includes("Syrup")) {
      price += addSyrup;
    }

    if (addVanilla && selectedAdditionalsState.includes("Vanilla")) {
      price += addVanilla;
    }

    if (selectedMilkOptionState === "Almond Milk") {
      price += milkAlmond;
    } else if (selectedMilkOptionState === "Oat Milk") {
      price += milkOat;
    }

    // Notify parent about the additional cost
    onAdditionalCostChange(price);

    // Pass the selected options back to the parent
    onOptionsChange(selectedAdditionalsState, selectedMilkOptionState);
  }, [
    selectedAdditionalsState,
    selectedMilkOptionState,
    addEspresso,
    addSyrup,
    addVanilla,
    milkAlmond,
    milkOat,
    onAdditionalCostChange,
    onOptionsChange,
  ]);

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
              selectedAdditionalsState.includes("Espresso")
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
              checked={selectedAdditionalsState.includes("Espresso")}
            />
            <span className="ml-4 font-semibold">Espresso</span>
            <span className="ml-2"> (+{addEspresso})</span>
          </div>
          {/* ADDITIONAL SYRUP */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedAdditionalsState.includes("Syrup")
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
              checked={selectedAdditionalsState.includes("Syrup")}
            />
            <span className="ml-4 font-semibold">Syrup</span>
            <span className="ml-2"> (+{addSyrup})</span>
          </div>
          {/* ADDITIONAL VANILLA */}
          {addVanilla > 0 && ( // Conditionally render if addVanilla exists and is greater than 0
            <div
              className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
                selectedAdditionalsState.includes("Vanilla")
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
                checked={selectedAdditionalsState.includes("Vanilla")}
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
          {/* FRESH MILK OPTION */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedMilkOptionState === "Fresh Milk"
                ? "bg-orange-50"
                : "bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="milkOptions"
              id="FreshMilk"
              className="w-5 h-5 cursor-pointer"
              value="Fresh Milk"
              checked={selectedMilkOptionState === "Fresh Milk"}
              onChange={() => handleMilkOptionChange("Fresh Milk")}
            />
            <span className="ml-4 font-semibold">Fresh Milk</span>
          </div>
          {/* ALMOND MILK OPTION */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedMilkOptionState === "Almond Milk"
                ? "bg-orange-50"
                : "bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="milkOptions"
              id="AlmondMilk"
              className="w-5 h-5 cursor-pointer"
              value="Almond Milk"
              checked={selectedMilkOptionState === "Almond Milk"}
              onChange={() => handleMilkOptionChange("Almond Milk")}
            />
            <span className="ml-4 font-semibold">Almond Milk</span>
            <span className="ml-2"> (+{milkAlmond})</span>
          </div>
          {/* OAT MILK OPTION */}
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedMilkOptionState === "Oat Milk"
                ? "bg-orange-50"
                : "bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="milkOptions"
              id="OatMilk"
              className="w-5 h-5 cursor-pointer"
              value="Oat Milk"
              checked={selectedMilkOptionState === "Oat Milk"}
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