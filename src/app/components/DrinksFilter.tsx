import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AllergyFilter from "./AllergyFilter";
import { usePathname } from "next/navigation";
import CaloriesFilter from "./CaloriesFilter";

interface DrinksFilterProps {
  onFilterChange: (filter: string) => void;
}

// #region Declaration of Filters based on Slug

type Filter = {
  name: string;
  id: string;
  onChange: string;
  checked: string;
  title: string;
};

type Filters = Filter[];

// FILTER FOR DRINKS
const FilterDrink: Filters = [
  {
    name: "drinktype",
    id: "radioBoth",
    onChange: "all",
    checked: "all",
    title: "All",
  },
  {
    name: "drinktype",
    id: "radioBoth",
    onChange: "Coffee",
    checked: "Coffee",
    title: "Coffee",
  },

  {
    name: "drinktype",
    id: "radioNonCoffee",
    onChange: "Non-Coffee",
    checked: "Non-Coffee",
    title: "Non-Coffee",
  },
];

// FILTER FOR PASTA
const FilterPasta: Filters = [
  {
    name: "pastatype",
    id: "radioAllPasta",
    onChange: "allPasta",
    checked: "allPasta",
    title: "All Pasta",
  },
  {
    name: "pastatype",
    id: "radioPesto",
    onChange: "Pesto",
    checked: "Pesto",
    title: "Pesto",
  },

  {
    name: "pastatype",
    id: "radioNonPesto",
    onChange: "Non-Pesto",
    checked: "Non-Pesto",
    title: "Non-Pesto",
  },
];

// FILTER FOR MAIN COURSE

const FilterMainCourse: Filters = [
  {
    name: "maincoursetype",
    id: "radioAllMainCourse",
    onChange: "allMainCourse",
    checked: "allMainCourse",
    title: "All",
  },
  {
    name: "maincoursetype",
    id: "radioMeat",
    onChange: "Meat",
    checked: "Meat",
    title: "Meat",
  },

  {
    name: "maincoursetype",
    id: "radioSeaFood",
    onChange: "SeaFood",
    checked: "SeaFood",
    title: "Sea Food",
  },
];

//#endregion

const DrinksFilter: React.FC<DrinksFilterProps> = ({ onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState("all");
  const formRef = useRef<HTMLFormElement | null>(null);
  const pathname = usePathname();
  const slug = pathname.split("/").pop();

  // DRINK FILTER CHANGE HANDLER
  const handleDrinkFilterChange = (filter: string) => {
    setSelectedDrinkType(filter);
    onFilterChange(filter);
  };

  // MAKO-CLOSE ANG FORM KAPAG PININDOT OUTSIDE OF FORM
  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  // USEEFFECT PARA SA PAG-CLOSE NG FORM OUTSIDE FORM
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
              className={`mb-4 ${
                slug === "pastries"
                  ? "hidden"
                  : slug === "sandwiches"
                  ? "hidden"
                  : slug === "snacks"
                  ? "hidden"
                  : "visible"
              }`}
            />
            <div className="flex gap-2 justify-around">
              {slug === "drinks" &&
                FilterDrink.map((filters) => (
                  <div className="flex items-center justify-start space-x-2">
                    <input
                      type="radio"
                      name={filters.name}
                      id={filters.id}
                      className="w-4 h-4"
                      checked={selectedDrinkType === filters.checked}
                      onChange={() =>
                        handleDrinkFilterChange(`${filters.onChange}`)
                      }
                    />
                    <span className="text-lg">{filters.title}</span>
                  </div>
                ))}
              {slug === "pasta" &&
                FilterPasta.map((filters) => (
                  <div className="flex items-center justify-start space-x-2">
                    <input
                      type="radio"
                      name={filters.name}
                      id={filters.id}
                      className="w-4 h-4"
                      checked={selectedDrinkType === filters.checked}
                      onChange={() =>
                        handleDrinkFilterChange(`${filters.onChange}`)
                      }
                    />
                    <span className="text-lg">{filters.title}</span>
                  </div>
                ))}
              {slug === "maincourse" &&
                FilterMainCourse.map((filters) => (
                  <div className="flex items-center justify-start space-x-2">
                    <input
                      type="radio"
                      name={filters.name}
                      id={filters.id}
                      className="w-4 h-4"
                      checked={selectedDrinkType === filters.checked}
                      onChange={() =>
                        handleDrinkFilterChange(`${filters.onChange}`)
                      }
                    />
                    <span className="text-lg">{filters.title}</span>
                  </div>
                ))}
            </div>
            <hr
              className={`mt-4 ${
                slug === "pastries"
                  ? "hidden"
                  : slug === "sandwiches"
                  ? "hidden"
                  : slug === "snacks"
                  ? "hidden"
                  : "visible"
              }`}
            />
            <CaloriesFilter />
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
