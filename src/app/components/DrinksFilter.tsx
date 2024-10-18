import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AllergyFilter from "./AllergyFilter";
import { usePathname } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Define a unified filter array with categories
const Filters = {
  drinks: [
    { name: "drinktype", id: "radioAllDrinks", onChange: "all", title: "All" },
    { name: "drinktype", id: "radioCoffee", onChange: "Coffee", title: "Coffee" },
    { name: "drinktype", id: "radioNonCoffee", onChange: "Non-Coffee", title: "Non-Coffee" },
  ],
  pasta: [
    { name: "pastatype", id: "radioAllPasta", onChange: "all", title: "All Pasta" },
    { name: "pastatype", id: "radioPesto", onChange: "Pesto", title: "Pesto" },
    { name: "pastatype", id: "radioNonPesto", onChange: "Non-Pesto", title: "Non-Pesto" },
  ],
  maincourse: [
    { name: "maincoursetype", id: "radioAllMainCourse", onChange: "all", title: "All" },
    { name: "maincoursetype", id: "radioMeat", onChange: "Meat", title: "Meat" },
    { name: "maincoursetype", id: "radioSeaFood", onChange: "Sea Food", title: "Sea Food" },
  ],
};

const FilterCalories = [
  { name: "caloriecount", id: "radioLow", onChange: "low", title: "Low" },
  { name: "caloriecount", id: "radioMedium", onChange: "med", title: "Medium" },
  { name: "caloriecount", id: "radioHigh", onChange: "high", title: "High" },
];

const DrinksFilter: React.FC<{
  onFilterChange: (filter: string) => void;
  onCalorieChange: (calorie: string) => void;
  onAllergyChange: (selectedAllergies: string[]) => void; // New prop for allergy changes
}> = ({ onFilterChange, onCalorieChange, onAllergyChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null);
  const [selectedCalorie, setSelectedCalorie] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const pathname = usePathname();
  const slug = pathname.split("/").pop()?.toLowerCase() || "";

  const [allergies, setAllergies] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]); // Change type to any[]
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]); // Change type to any[]

  const handleAllergySelection = (allergy: string) => {
    setSelectedAllergies((prev) => {
      const newAllergies = prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy];

      // Notify parent component of the selected allergies
      onAllergyChange(newAllergies);
      return newAllergies;
    });
  };

  // Effect to filter products based on selected allergies
  useEffect(() => {
    if (selectedAllergies.length > 0) {
      // Filter out products that contain any selected allergy
      const updatedProducts = products.filter(product => {
        const containsAllergy = selectedAllergies.some(allergy => product.allergens.includes(allergy));
        return !containsAllergy; // Keep products that do not contain selected allergies
      });
      setFilteredProducts(updatedProducts);
    } else {
      setFilteredProducts(products); // Reset to all products if no allergies are selected
    }
  }, [selectedAllergies, products]);

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

  // Fetch allergy options from Firestore based on the slug
  useEffect(() => {
    const fetchAllergies = async () => {
      if (!slug) return; // Ensure slug is valid

      try {
        // Query the collection to find allergies
        const allergyQuery = query(
          collection(db, slug),
          where("contains", "array-contains-any", ["Soy", "Wheat", "Milk", "Eggs", "Tree Nuts", "Peanuts"])
        );
        const querySnapshot = await getDocs(allergyQuery);
  
        const fetchedAllergies: string[] = [];
        const fetchedProducts: any[] = []; // Array to store fetched products
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
  
          if (data.contains) {
            fetchedAllergies.push(...data.contains);
          }
  
          // Ensure data.products exists and is an array before spreading
          if (Array.isArray(data.products)) {
            fetchedProducts.push(...data.products);
          }
        });
  
        setAllergies(fetchedAllergies);
        setProducts(fetchedProducts); // Set the products state
        setFilteredProducts(fetchedProducts); // Initialize filtered products with all products
  
      } catch (error) {
        console.error("Error fetching allergies from Firestore:", error);
      }
    };
  
    fetchAllergies();
  }, [slug]);

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
            {["drinks", "pasta", "maincourse"].includes(slug) && (
              <>
                <h1 className="text-2xl text-center font-semibold text-orange-950 mt-0">
                  {slug === "drinks"
                    ? "Drink Type"
                    : slug === "pasta"
                    ? "Pasta Type"
                    : "Main Course Type"}
                </h1>
                <hr className="mb-4" />
              </>
            )}
  
            <div className="flex gap-2 justify-around flex-wrap">
              {currentFilters.map((filter) => (
                <div className="flex items-center justify-start space-x-2" key={filter.id}>
                  <input
                    type="radio"
                    name="drinktype"
                    id={filter.id}
                    className="w-4 h-4"
                    checked={selectedDrinkType === filter.onChange}
                    onChange={() => handleDrinkFilterChange(filter.onChange)}
                  />
                  <span className="text-lg">{filter.title}</span>
                </div>
              ))}
            </div>
            <hr className="mt-4" />
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
                    checked={selectedCalorie === filter.onChange}
                    onChange={() => handleCalorieFilterChange(filter.onChange)}
                  />
                  <span className="text-lg">{filter.title}</span>
                </div>
              ))}
            </div>
            <AllergyFilter
              slug={slug}
              selectedAllergies={selectedAllergies}
              onAllergySelection={handleAllergySelection}
            />
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-orange-950 text-white rounded-md py-2 px-4 hover:bg-orange-700"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DrinksFilter;
