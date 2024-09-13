import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AllergyFilter from "./AllergyFilter";
import { usePathname } from "next/navigation";

interface DrinksFilterProps {
  onFilterChange: (filter: string) => void;
  onCalorieChange: (calorie: string) => void;
}

// Define a unified filter array with categories
const Filters = {
  drinks: [
    { name: "drinktype", id: "radioAllDrinks", onChange: "all", checked: "all", title: "All" },
    { name: "drinktype", id: "radioCoffee", onChange: "Coffee", checked: "Coffee", title: "Coffee" },
    { name: "drinktype", id: "radioNonCoffee", onChange: "Non-Coffee", checked: "Non-Coffee", title: "Non-Coffee" },
  ],
  pasta: [
    { name: "pastatype", id: "radioAllPasta", onChange: "all", checked: "all", title: "All Pasta" },
    { name: "pastatype", id: "radioPesto", onChange: "Pesto", checked: "Pesto", title: "Pesto" },
    { name: "pastatype", id: "radioNonPesto", onChange: "Non-Pesto", checked: "Non-Pesto", title: "Non-Pesto" },
  ],
  maincourse: [
    { name: "maincoursetype", id: "radioAllMainCourse", onChange: "all", checked: "all", title: "All" },
    { name: "maincoursetype", id: "radioMeat", onChange: "Meat", checked: "Meat", title: "Meat" },
    { name: "maincoursetype", id: "radioSeaFood", onChange: "Sea Food", checked: "Sea Food", title: "Sea Food" },
  ],
};

const FilterCalories = [
  { name: "caloriecount", id: "radioLow", onChange: "low", checked: "low", title: "Low" },
  { name: "caloriecount", id: "radioMedium", onChange: "med", checked: "med", title: "Medium" },
  { name: "caloriecount", id: "radioHigh", onChange: "high", checked: "high", title: "High" },
];

const DrinksFilter: React.FC<DrinksFilterProps> = ({ onFilterChange, onCalorieChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState("all");
  const [selectedCalorie, setSelectedCalorie] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const pathname = usePathname();
  const slug = pathname.split("/").pop()?.toLowerCase() || "";

  // DRINK FILTER CHANGE HANDLER
  const handleDrinkFilterChange = (filter: string) => {
    setSelectedDrinkType(filter);
    onFilterChange(filter);
  };

  // CALORIE FILTER CHANGE HANDLER
  const handleCalorieFilterChange = (calorie: string) => {
    setSelectedCalorie(calorie);
    onCalorieChange(calorie);
  };

  // CLOSE FORM WHEN CLICK OUTSIDE
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

  // Determine which filters to show based on slug
  const currentFilters = Filters[slug] || [];

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
            ref={formRef}
            id="drinksFilter"
            className="bg-white rounded-md shadow-xl p-6 flex flex-col gap-2 min-w-96 mx-10"
          >
            <h1 className="text-2xl text-center font-semibold text-orange-950">
              {slug === "drinks"
                ? "Drink Type"
                : slug === "pasta"
                ? "Pasta Type"
                : slug === "maincourse"
                ? "Main Course Type"
                : ""}
            </h1>
            <hr
              className={`mb-4 ${slug === "pastries" || slug === "sandwiches" || slug === "snacks" ? "hidden" : "visible"}`}
            />
            <div className="flex gap-2 justify-around">
              {currentFilters.map((filter) => (
                <div className="flex items-center justify-start space-x-2" key={filter.id}>
                  <input
                    type="radio"
                    name={filter.name}
                    id={filter.id}
                    className="w-4 h-4"
                    checked={selectedDrinkType === filter.checked}
                    onChange={() => handleDrinkFilterChange(filter.onChange)}
                  />
                  <span className="text-lg">{filter.title}</span>
                </div>
              ))}
            </div>
            <hr
              className={`mt-4 ${slug === "pastries" || slug === "sandwiches" || slug === "snacks" ? "hidden" : "visible"}`}
            />
            <h1 className="text-2xl text-center font-semibold text-orange-950 mt-0">Calories</h1>
            <hr />
            <div className="flex justify-around items-center">
              {FilterCalories.map((filter) => (
                <div className="flex items-center justify-start space-x-2 mx-1 my-3" key={filter.id}>
                  <input
                    type="radio"
                    name={filter.name}
                    id={filter.id}
                    className="w-4 h-4"
                    checked={selectedCalorie === filter.checked}
                    onChange={() => handleCalorieFilterChange(filter.onChange)}
                  />
                  <span className="text-lg">{filter.title}</span>
                </div>
              ))}
            </div>
            <AllergyFilter />
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
