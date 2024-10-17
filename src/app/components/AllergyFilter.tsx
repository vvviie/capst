import React from "react";

interface AllergyFilterProps {
  slug: string;
  selectedAllergies: string[];
  onAllergySelection: (allergy: string) => void;
}

const allergensByCategory: { [key: string]: string[] } = {
  default: ["Peanut", "Fish", "Chicken", "Almond", "Shrimp"],
  pastries: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
  drinks: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
};

const AllergyFilter: React.FC<AllergyFilterProps> = ({
  slug,
  selectedAllergies,
  onAllergySelection,
}) => {
  const allergens = allergensByCategory[slug] || allergensByCategory["default"];

  return (
    <>
      <hr className="mt-4" />
      <h1 className="text-2xl text-center font-semibold text-orange-950">Allergens</h1>
      <hr />
      <p className="text-xs text-center text-gray-400">Hide items with:</p>
      <div className="grid grid-cols-3">
        {allergens.map((item) => (
          <div className="flex items-center justify-start space-x-2 mx-1 my-3" key={item}>
            <input
              type="checkbox"
              name="allergy"
              id={`checkbox_${item}`}
              className="w-4 h-4"
              checked={selectedAllergies.includes(item)} // Check if the allergy is selected
              onChange={() => onAllergySelection(item)} // Call the selection handler
            />
            <span className="text-lg">{item}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default AllergyFilter;
