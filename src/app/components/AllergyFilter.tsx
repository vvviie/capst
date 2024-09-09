import React from "react";

interface DrinksFilterProps {
onFilterChange: (filter: string) => void;
}

// CHANGEABLE, DEPENDE SA KUNG ANONG MGA ALLERGENS ANG ILALAGAY NATIN
const Allergens = ["Peanut", "Fish", "Chicken", "Almond", "Shrimp"];

const AllergyFilter = () => {
return (
    <>
    <hr className="mt-4" />
    <h1 className={`text-2xl text-center font-semibold text-orange-950`}>
        Allergens
    </h1>
    <hr />
    <p className="text-xs text-center text-gray-400">Hide items with:</p>
    <div className="grid grid-cols-3">
        {Allergens.map((items) => (
        <div className="flex items-center justify-start space-x-2 mx-1 my-3">
            <input
            type="checkbox"
            name="allergens"
            id={`checkbox${items}`}
            className="w-4 h-4"
            />
            <span className="text-lg">{items}</span>
        </div>
        ))}
    </div>
    </>
);
};

export default AllergyFilter;
