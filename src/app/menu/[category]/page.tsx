"use client";

import React, { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Drinks
/* import useHotDrinks from "@/app/hooks/useHotDrinks";
import useIcedDrinks from "@/app/hooks/useIcedDrinks";
import useBlendedDrinks from "@/app/hooks/useBlendedDrinks";
import useAffogatoDrinks from "@/app/hooks/useAffogatoDrinks"; */

import useAllDrinks from "@/app/hooks/useAllDrinks"; // The new hook

// Pasta
/* import usePasta from "@/app/hooks/usePasta"; */
import useAllPasta from "@/app/hooks/useAllPasta";

// Sandwiches
/* import useSandwich from "@/app/hooks/useSandwich"; */
import useAllSandwiches from "@/app/hooks/useAllSandwiches";

// Main Courses
/* import useMainCourse from "@/app/hooks/useMainCourse"; */
import useAllMainCourses from "@/app/hooks/useAllMainCourses";

// Snacks
/* import useSnacks from "@/app/hooks/useSnacks"; */
import useAllSnacks from "@/app/hooks/useAllSnacks";

// Pastries
/* import usePastries from "@/app/hooks/usePastries"; */
import useAllPastries from "@/app/hooks/useAllPastries";

import Link from "next/link";

import DrinksFilter from "@/app/components/DrinksFilter";
import AllergyFilter from "@/app/components/AllergyFilter";

// General Data from Data Folder
import { Drinks } from "@/app/data";
import { Pasta } from "@/app/data";
import { Sandwiches } from "@/app/data";
import { MainCourse } from "@/app/data";
import { Snacks } from "@/app/data";
import { Pastries } from "@/app/data";

// Initialization of Arrays for each category
type DrinksCategoryData = {
  title: string;
  drinks: Drinks[];
}[];

type PastasCategoryData = {
  title: string;
  pastas: Pasta[];
}[];

type SandwichesCategoryData = {
  title: string;
  sandwiches: Sandwiches[];
}[];

type MainCourseCategoryData = {
  title: string;
  mainCourses: MainCourse[];
}[];

type SnacksCategoryData = {
  title: string;
  snacks: Snacks[];
}[];

type PastriesCategoryData = {
  title: string;
  pastries: Pastries[];
}[];

const MenuCategoryPage: React.FC = () => {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCalorie, setSelectedCalorie] = useState<string>("all");

  const formatCategoryTitle = (category: string) => {
    return category
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
      .trim();
  };

  const { drinksByCategory } = useAllDrinks();

  // Convert drinksByCategory into a format compatible with your existing structure
  const drinks: DrinksCategoryData = Object.entries(drinksByCategory).map(
    ([category, drinks]) => ({
      title: formatCategoryTitle(category), // Use the utility function here
      drinks,
    })
  );

  const { pastasByCategory } = useAllPasta();

  const pastas: PastasCategoryData = Object.entries(pastasByCategory).map(
    ([category, pastas]) => ({
      title: formatCategoryTitle(category), // Use the utility function here
      pastas,
    })
  );

  const { sandwichesByCategory } = useAllSandwiches();

  const sandwiches: SandwichesCategoryData = Object.entries(
    sandwichesByCategory
  ).map(([category, sandwiches]) => ({
    title: formatCategoryTitle(category), // Use the utility function here
    sandwiches,
  }));

  const { mainCoursesByCategory } = useAllMainCourses();

  const mainCourses: MainCourseCategoryData = Object.entries(
    mainCoursesByCategory
  ).map(([category, mainCourses]) => ({
    title: formatCategoryTitle(category), // Use the utility function here
    mainCourses,
  }));

  const { snacksByCategory } = useAllSnacks();
  const snacks: SnacksCategoryData = Object.entries(snacksByCategory).map(
    ([category, snacks]) => ({
      title: formatCategoryTitle(category), // Use the utility function here
      snacks,
    })
  );

  const { pastriesByCategory } = useAllPastries();
  const pastries: PastriesCategoryData = Object.entries(pastriesByCategory).map(
    ([category, pastries]) => ({
      title: formatCategoryTitle(category), // Use the utility function here
      pastries,
    })
  );

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const handleAllergyChange = (allergies: string[]) => {
    setSelectedAllergies(allergies);
  };

  // Function to handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Filter drinks based on selected filter and search text
  const filteredDrinks = useMemo(
    () =>
      drinks.map((category) => ({
        ...category,
        drinks: category.drinks
          .filter((drink) => {
            const matchesFilter =
              selectedFilter === "all" || drink.type === selectedFilter;
            const matchesCalorie =
              selectedCalorie === "all" || drink.calorie === selectedCalorie;
            const matchesSearch = drink.title
              .toLowerCase()
              .startsWith(searchText.toLowerCase());
            const matchesAllergies =
              selectedAllergies.length === 0 ||
              (Array.isArray(drink.contains) &&
                !selectedAllergies.some((allergy) =>
                  drink.contains.includes(allergy)
                ));

            return (
              matchesFilter &&
              matchesCalorie &&
              matchesSearch &&
              matchesAllergies
            );
          })
          .sort((a, b) => {
            const typeA = a.type || "";
            const typeB = b.type || "";
            const typeComparison = typeA.localeCompare(typeB);
            return typeComparison !== 0
              ? typeComparison
              : a.prodID.localeCompare(b.prodID);
          }),
      })),
    [selectedFilter, selectedCalorie, searchText, drinks, selectedAllergies]
  );

  const filteredPastas = useMemo(
    () =>
      pastas.map((category) => ({
        ...category,
        pastas: category.pastas
          .filter((pasta) => {
            const matchesFilter =
              selectedFilter === "all" || pasta.type === selectedFilter;
            const matchesCalorie =
              selectedCalorie === "all" || pasta.calorie === selectedCalorie;
            const matchesSearch = pasta.title
              .toLowerCase()
              .startsWith(searchText.toLowerCase());
              const matchesAllergies =
              selectedAllergies.length === 0 ||
              (Array.isArray(pasta.contains) &&
                !selectedAllergies.some((allergy) =>
                  pasta.contains.includes(allergy)
                ));

            return (
              matchesFilter &&
              matchesCalorie &&
              matchesSearch &&
              matchesAllergies
            );
          })
          .sort((a, b) => {
            const typeA = a.type || "";
            const typeB = b.type || "";
            const typeComparison = typeA.localeCompare(typeB);
            return typeComparison !== 0
              ? typeComparison
              : a.prodID.localeCompare(b.prodID);
          }),
      })),
    [selectedFilter, selectedCalorie, searchText, pastas, selectedAllergies]
  );

  const filteredSandwiches = useMemo(
    () =>
      sandwiches.map((category) => ({
        ...category,
        sandwiches: category.sandwiches
          .filter((sandwich) => {
            const matchesFilter =
              selectedFilter === "all" || sandwich.type === selectedFilter;
            const matchesCalorie =
              selectedCalorie === "all" || sandwich.calorie === selectedCalorie;
            const matchesSearch = sandwich.title
              .toLowerCase()
              .startsWith(searchText.toLowerCase());
              const matchesAllergies =
              selectedAllergies.length === 0 ||
              (Array.isArray(sandwich.contains) &&
                !selectedAllergies.some((allergy) =>
                  sandwich.contains.includes(allergy)
                ));

            return (
              matchesFilter &&
              matchesCalorie &&
              matchesSearch &&
              matchesAllergies
            );
          })
          .sort((a, b) => {
            const typeA = a.type || "";
            const typeB = b.type || "";
            const typeComparison = typeA.localeCompare(typeB);
            return typeComparison !== 0
              ? typeComparison
              : a.prodID.localeCompare(b.prodID);
          }),
      })),
    [selectedFilter, selectedCalorie, searchText, sandwiches, selectedAllergies]
  );

  const filteredMainCourses = useMemo(
    () =>
      mainCourses.map((category) => ({
        ...category,
        mainCourses: category.mainCourses
          .filter((mainCourse) => {
            const matchesFilter =
              selectedFilter === "all" || mainCourse.type === selectedFilter;
            const matchesCalorie =
              selectedCalorie === "all" ||
              mainCourse.calorie === selectedCalorie;
            const matchesSearch = mainCourse.title
              .toLowerCase()
              .startsWith(searchText.toLowerCase());
              const matchesAllergies =
              selectedAllergies.length === 0 ||
              (Array.isArray(mainCourse.contains) &&
                !selectedAllergies.some((allergy) =>
                  mainCourse.contains.includes(allergy)
                ));

            return (
              matchesFilter &&
              matchesCalorie &&
              matchesSearch &&
              matchesAllergies
            );
          })
          .sort((a, b) => {
            const typeA = a.type || "";
            const typeB = b.type || "";
            const typeComparison = typeA.localeCompare(typeB);
            return typeComparison !== 0
              ? typeComparison
              : a.prodID.localeCompare(b.prodID);
          }),
      })),
    [selectedFilter, selectedCalorie, searchText, mainCourses, selectedAllergies]
  );

  const filteredSnacks = useMemo(
    () =>
      snacks.map((category) => ({
        ...category,
        snacks: category.snacks
          .filter((snack) => {
            const matchesFilter =
              selectedFilter === "all" || snack.type === selectedFilter;
            const matchesCalorie =
              selectedCalorie === "all" || snack.calorie === selectedCalorie;
            const matchesSearch = snack.title
              .toLowerCase()
              .startsWith(searchText.toLowerCase());
              const matchesAllergies =
              selectedAllergies.length === 0 ||
              (Array.isArray(snack.contains) &&
                !selectedAllergies.some((allergy) =>
                  snack.contains.includes(allergy)
                ));

            return (
              matchesFilter &&
              matchesCalorie &&
              matchesSearch &&
              matchesAllergies
            );
          })
          .sort((a, b) => {
            const typeA = a.type || "";
            const typeB = b.type || "";
            const typeComparison = typeA.localeCompare(typeB);
            return typeComparison !== 0
              ? typeComparison
              : a.prodID.localeCompare(b.prodID);
          }),
      })),
    [selectedFilter, selectedCalorie, searchText, snacks, selectedAllergies]
  );

  const filteredPastries = useMemo(
    () =>
      pastries.map((category) => ({
        ...category,
        pastries: category.pastries
          .filter((pastry: Pastry) => {
            const matchesFilter =
              selectedFilter === "all" || pastry.type === selectedFilter;
            const matchesCalorie =
              selectedCalorie === "all" || pastry.calorie === selectedCalorie;
            const matchesSearch = pastry.title
              .toLowerCase()
              .startsWith(searchText.toLowerCase());

            // Check if pastry.contains is an array before using includes
            const matchesAllergies =
              selectedAllergies.length === 0 ||
              (Array.isArray(pastry.contains) &&
                !selectedAllergies.some((allergy) =>
                  pastry.contains.includes(allergy)
                ));

            return (
              matchesFilter &&
              matchesCalorie &&
              matchesSearch &&
              matchesAllergies
            );
          })
          .sort((a, b) => {
            const typeA = a.type || "";
            const typeB = b.type || "";
            const typeComparison = typeA.localeCompare(typeB);
            return typeComparison !== 0
              ? typeComparison
              : a.prodID.localeCompare(b.prodID);
          }),
      })),
    [selectedFilter, searchText, selectedCalorie, pastries, selectedAllergies]
  );

  if (!slug) return <p>No category found.</p>;

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex flex-col gap-2 py-4 mt-14">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start md:items-center pr-10 py-2 mb-2 px-10 md:flex-row md:gap-0 md:px-24 xl:px-56">
        <Link
          href={"/menu"}
          className="flex items-center space-x-2 font-bold text-orange-950 text-xl text-left hover:text-orange-800 cursor-pointer"
        >
          <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
          <span>Menu</span>
        </Link>
        <div className="flex w-full md:w-2/3 justify-between items-center gap-4 sm:justify-end">
          <input
            type="text"
            className="border-2 border-solid border-gray-200 w-56 sm:w-60 text-md md:w-64 md:text-lg pl-2 rounded-md bg-gray-50"
            name="inputSearch"
            id="inputSearch"
            placeholder="Search the menu..."
            value={searchText}
            onChange={handleSearchChange}
          />
          <DrinksFilter
            onFilterChange={setSelectedFilter}
            onCalorieChange={setSelectedCalorie}
            onAllergyChange={handleAllergyChange} // New prop for handling allergy changes
          />
        </div>
      </div>
      {slug === "drinks" &&
        filteredDrinks.map(
          (category, index) =>
            category.drinks.length > 0 && (
              <div key={index} className="mb-8">
                <div className="flex gap-4 items-center px-10 md:px-24 xl:px-56 mb-4">
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                  <span className="text-2xl text-center font-bold text-orange-900">
                    {category.title}
                  </span>
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                <p className="font-light text-xs text-center text-gray-500 mt-[-10px] mb-4">
                  Click or tap an item to view details or order.
                </p>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.drinks.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}?p=${item.price}`}
                      key={item.id}
                      className="relative p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="availability picture"
                              src={
                                item.availability === "available"
                                  ? "/availability/available.webp"
                                  : "/availability/unavailable.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold
                              ${
                                item.availability === "available"
                                  ? "text-green-500"
                                  : "text-gray-700"
                              }`}
                          >
                            {item.availability === "available"
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="calorie count picture"
                              src={
                                item.calorie === "low"
                                  ? "/calorie/lowcal.webp"
                                  : item.calorie === "med"
                                  ? "/calorie/medcal.webp"
                                  : "/calorie/highcal.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold text-center
                              ${
                                item.calorie === "low"
                                  ? "text-yellow-600"
                                  : item.calorie === "med"
                                  ? "text-orange-600"
                                  : "text-red-800"
                              }`}
                          >
                            {item.calorie === "low"
                              ? "Low Cal."
                              : item.calorie === "med"
                              ? "Med Cal."
                              : "High Cal."}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2/3 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-lg rounded-full font-bold text-gray-800 text-center">
                        {item.title}
                      </h2>
                      <p className="font-bold bg-orange-300 text-xs py-1 mt-[-5px] px-4 rounded-full text-white text-center">
                        PHP {item.price.toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}

      {slug === "pasta" &&
        filteredPastas.map(
          (category, index) =>
            category.pastas.length > 0 && (
              <div key={index} className="mb-8">
                <div className="flex gap-4 items-center px-10 md:px-24 xl:px-56 mb-4">
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                  <span className="text-2xl text-center font-bold text-orange-900">
                    {category.title}
                  </span>
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                <p className="font-light text-xs text-center text-gray-500 mt-[-10px] mb-4">
                  Click or tap an item to view details or order.
                </p>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.pastas.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}?p=${item.price}`}
                      key={item.id}
                      className="relative p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="availability picture"
                              src={
                                item.availability === "available"
                                  ? "/availability/available.webp"
                                  : "/availability/unavailable.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold
                              ${
                                item.availability === "available"
                                  ? "text-green-500"
                                  : "text-gray-700"
                              }`}
                          >
                            {item.availability === "available"
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="calorie count picture"
                              src={
                                item.calorie === "low"
                                  ? "/calorie/lowcal.webp"
                                  : item.calorie === "med"
                                  ? "/calorie/medcal.webp"
                                  : "/calorie/highcal.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold text-center
                              ${
                                item.calorie === "low"
                                  ? "text-yellow-600"
                                  : item.calorie === "med"
                                  ? "text-orange-600"
                                  : "text-red-800"
                              }`}
                          >
                            {item.calorie === "low"
                              ? "Low Cal."
                              : item.calorie === "med"
                              ? "Med Cal."
                              : "High Cal."}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-sm bg-orange-900 rounded-full py-1 px-4 font-bold text-white text-center">
                        {item.title}
                      </h2>
                      <p className="font-bold bg-orange-300 text-xs py-1 mt-[-5px] px-4 rounded-full text-white text-center">
                        PHP {item.price.toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}

      {slug === "sandwiches" &&
        filteredSandwiches.map(
          (category, index) =>
            category.sandwiches.length > 0 && (
              <div key={index} className="mb-8">
                <div className="flex gap-4 items-center px-10 md:px-24 xl:px-56 mb-4">
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                  <span className="text-2xl text-center font-bold text-orange-900">
                    {category.title}
                  </span>
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                <p className="font-light text-xs text-center text-gray-500 mt-[-10px] mb-4">
                  Click or tap an item to view details or order.
                </p>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.sandwiches.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}?p=${item.price}`}
                      key={item.id}
                      className="relative p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="availability picture"
                              src={
                                item.availability === "available"
                                  ? "/availability/available.webp"
                                  : "/availability/unavailable.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold
                              ${
                                item.availability === "available"
                                  ? "text-green-500"
                                  : "text-gray-700"
                              }`}
                          >
                            {item.availability === "available"
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="calorie count picture"
                              src={
                                item.calorie === "low"
                                  ? "/calorie/lowcal.webp"
                                  : item.calorie === "med"
                                  ? "/calorie/medcal.webp"
                                  : "/calorie/highcal.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold text-center
                              ${
                                item.calorie === "low"
                                  ? "text-yellow-600"
                                  : item.calorie === "med"
                                  ? "text-orange-600"
                                  : "text-red-800"
                              }`}
                          >
                            {item.calorie === "low"
                              ? "Low Cal."
                              : item.calorie === "med"
                              ? "Med Cal."
                              : "High Cal."}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-sm bg-orange-900 rounded-full py-1 px-4 font-bold text-white text-center">
                        {item.title}
                      </h2>
                      <p className="font-bold bg-orange-300 text-xs py-1 mt-[-5px] px-4 rounded-full text-white text-center">
                        PHP {item.price.toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}

      {slug === "maincourse" &&
        filteredMainCourses.map(
          (category, index) =>
            category.mainCourses.length > 0 && (
              <div key={index} className="mb-8">
                <div className="flex gap-4 items-center px-10 md:px-24 xl:px-56 mb-4">
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                  <span className="text-2xl text-center font-bold text-orange-900">
                    {category.title}
                  </span>
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                <p className="font-light text-xs text-center text-gray-500 mt-[-10px] mb-4">
                  Click or tap an item to view details or order.
                </p>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.mainCourses.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}?p=${item.price}`}
                      key={item.id}
                      className="relative p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="availability picture"
                              src={
                                item.availability === "available"
                                  ? "/availability/available.webp"
                                  : "/availability/unavailable.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold
                              ${
                                item.availability === "available"
                                  ? "text-green-500"
                                  : "text-gray-700"
                              }`}
                          >
                            {item.availability === "available"
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="calorie count picture"
                              src={
                                item.calorie === "low"
                                  ? "/calorie/lowcal.webp"
                                  : item.calorie === "med"
                                  ? "/calorie/medcal.webp"
                                  : "/calorie/highcal.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold text-center
                              ${
                                item.calorie === "low"
                                  ? "text-yellow-600"
                                  : item.calorie === "med"
                                  ? "text-orange-600"
                                  : "text-red-800"
                              }`}
                          >
                            {item.calorie === "low"
                              ? "Low Cal."
                              : item.calorie === "med"
                              ? "Med Cal."
                              : "High Cal."}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-sm bg-orange-900 rounded-full py-1 px-4 font-bold text-white text-center">
                        {item.title}
                      </h2>
                      <p className="font-bold bg-orange-300 text-xs py-1 mt-[-5px] px-4 rounded-full text-white text-center">
                        PHP {item.price.toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}

      {slug === "snacks" &&
        filteredSnacks.map(
          (category, index) =>
            category.snacks.length > 0 && (
              <div key={index} className="mb-8">
                <div className="flex gap-4 items-center px-10 md:px-24 xl:px-56 mb-4">
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                  <span className="text-2xl text-center font-bold text-orange-900">
                    {category.title}
                  </span>
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                <p className="font-light text-xs text-center text-gray-500 mt-[-10px] mb-4">
                  Click or tap an item to view details or order.
                </p>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.snacks.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}?p=${item.price}`}
                      key={item.id}
                      className="relative p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="availability picture"
                              src={
                                item.availability === "available"
                                  ? "/availability/available.webp"
                                  : "/availability/unavailable.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold
                              ${
                                item.availability === "available"
                                  ? "text-green-500"
                                  : "text-gray-700"
                              }`}
                          >
                            {item.availability === "available"
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="calorie count picture"
                              src={
                                item.calorie === "low"
                                  ? "/calorie/lowcal.webp"
                                  : item.calorie === "med"
                                  ? "/calorie/medcal.webp"
                                  : "/calorie/highcal.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold text-center
                              ${
                                item.calorie === "low"
                                  ? "text-yellow-600"
                                  : item.calorie === "med"
                                  ? "text-orange-600"
                                  : "text-red-800"
                              }`}
                          >
                            {item.calorie === "low"
                              ? "Low Cal."
                              : item.calorie === "med"
                              ? "Med Cal."
                              : "High Cal."}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-sm bg-orange-900 rounded-full py-1 px-4 font-bold text-white text-center">
                        {item.title}
                      </h2>
                      <p className="font-bold bg-orange-300 text-xs py-1 mt-[-5px] px-4 rounded-full text-white text-center">
                        PHP {item.price.toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}

      {slug === "pastries" &&
        filteredPastries.map(
          (category, index) =>
            category.pastries.length > 0 && (
              <div key={index} className="mb-8">
                <div className="flex gap-4 items-center px-10 md:px-24 xl:px-56 mb-4">
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                  <span className="text-2xl text-center font-bold text-orange-900">
                    {category.title}
                  </span>
                  <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                <p className="font-light text-xs text-center text-gray-500 mt-[-10px] mb-4">
                  Click or tap an item to view details or order.
                </p>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.pastries.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}?p=${item.price}`}
                      key={item.id}
                      className="relative p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="availability picture"
                              src={
                                item.availability === "available"
                                  ? "/availability/available.webp"
                                  : "/availability/unavailable.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold
                              ${
                                item.availability === "available"
                                  ? "text-green-500"
                                  : "text-gray-700"
                              }`}
                          >
                            {item.availability === "available"
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-full
                          border-2 border-gray-100 shadow-md w-28"
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              alt="calorie count picture"
                              src={
                                item.calorie === "low"
                                  ? "/calorie/lowcal.webp"
                                  : item.calorie === "med"
                                  ? "/calorie/medcal.webp"
                                  : "/calorie/highcal.webp"
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold text-center
                              ${
                                item.calorie === "low"
                                  ? "text-yellow-600"
                                  : item.calorie === "med"
                                  ? "text-orange-600"
                                  : "text-red-800"
                              }`}
                          >
                            {item.calorie === "low"
                              ? "Low Cal."
                              : item.calorie === "med"
                              ? "Med Cal."
                              : "High Cal."}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-sm bg-orange-900 rounded-full py-1 px-4 font-bold text-white text-center">
                        {item.title}
                      </h2>
                      <p className="font-bold bg-orange-300 text-xs py-1 mt-[-5px] px-4 rounded-full text-white text-center">
                        PHP {item.price.toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}
    </div>
  );
};

export default MenuCategoryPage;