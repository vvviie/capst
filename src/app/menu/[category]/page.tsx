"use client";

import React, { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
<<<<<<< HEAD
=======
import useHotDrinks from "@/app/hooks/useHotDrinks";
import useIcedDrinks from "@/app/hooks/useIcedDrinks";
import useBlendedDrinks from "@/app/hooks/useBlendedDrinks";
import useAffogatoDrinks from "@/app/hooks/useAffogatoDrinks";
import Link from "next/link";

import DrinksFilter from "@/app/components/DrinksFilter";
import { Drinks } from "@/app/data";
>>>>>>> 09f40122b3a477650fa430187c20c14e0e3179a8

// Drinks
import useHotDrinks from "@/app/hooks/useHotDrinks";
import useIcedDrinks from "@/app/hooks/useIcedDrinks";
import useBlendedDrinks from "@/app/hooks/useBlendedDrinks";
import useAffogatoDrinks from "@/app/hooks/useAffogatoDrinks";

// Pasta
import usePasta from "@/app/hooks/usePasta";

// Sandwiches
import useSandwich from "@/app/hooks/useSandwich";

// Main Courses
import useMainCourse from "@/app/hooks/useMainCourse";

// Snacks
import useSnacks from "@/app/hooks/useSnacks";

import Link from "next/link";

import DrinksFilter from "@/app/components/DrinksFilter";

// General Data from Data Folder
import { Drinks } from "@/app/data";
import { Pasta } from "@/app/data";
import { Sandwiches } from "@/app/data";
import { MainCourse } from "@/app/data";
import { Snacks } from "@/app/data";

// Initialization of Arrays for each category
type DrinksCategoryData = {
  title: string;
  drinks: Drinks[];
}[];

<<<<<<< HEAD
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

=======
>>>>>>> 09f40122b3a477650fa430187c20c14e0e3179a8
const MenuCategoryPage: React.FC = () => {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  const { hotDrinks } = useHotDrinks();
  const { icedDrinks } = useIcedDrinks();
  const { blendedDrinks } = useBlendedDrinks();
  const { affogatoDrinks } = useAffogatoDrinks();

  const drinks: DrinksCategoryData = [
    { title: "Hot Drinks", drinks: hotDrinks },
    { title: "Iced Drinks", drinks: icedDrinks },
    { title: "Blended Drinks", drinks: blendedDrinks },
    { title: "Affogato Drinks", drinks: affogatoDrinks },
  ];

<<<<<<< HEAD
  const { servingPasta } = usePasta();
  
  const pastas: PastasCategoryData = [
    { title: "Pasta", pastas: servingPasta } 
  ];

  const { servingSandwich } = useSandwich();

  const sandwiches: SandwichesCategoryData = [
    { title: "Sandwiches", sandwiches: servingSandwich }
  ];

  const { servingMainCourse } = useMainCourse();

  const mainCourses: MainCourseCategoryData = [
    { title: "Main Courses", mainCourses: servingMainCourse }
  ];

  const { servingSnacks } = useSnacks();
  
  const snacks: SnacksCategoryData = [
    { title: "Snacks", snacks: servingSnacks }
  ];

  // Function to handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

=======
  // Function to handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

>>>>>>> 09f40122b3a477650fa430187c20c14e0e3179a8
  // Filter drinks based on selected filter and search text
  const filteredDrinks = useMemo(
    () =>
      drinks.map((category) => ({
        ...category,
        drinks: category.drinks
          .filter((drink) => {
            const matchesFilter =
              selectedFilter === "all" || drink.type === selectedFilter;
            const matchesSearch = drink.title
              .toLowerCase()
              .includes(searchText.toLowerCase());
            return matchesFilter && matchesSearch;
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
    [selectedFilter, searchText, drinks]
  );
<<<<<<< HEAD
  
  const filteredPastas = useMemo(
    () =>
      pastas.map((category) => ({
        ...category,
        pastas: category.pastas
          .filter((pasta) => {
            const matchesFilter =
              selectedFilter === "all" || pasta.type === selectedFilter;
            const matchesSearch = pasta.title
              .toLowerCase()
              .includes(searchText.toLowerCase());
            return matchesFilter && matchesSearch;
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
    [selectedFilter, searchText, pastas]
  );

  const filteredSandwiches = useMemo(
    () =>
      sandwiches.map((category) => ({
        ...category,
        sandwiches: category.sandwiches
          .filter((sandwich) => {
            const matchesFilter =
              selectedFilter === "all" || sandwich.type === selectedFilter;
            const matchesSearch = sandwich.title
              .toLowerCase()
              .includes(searchText.toLowerCase());
            return matchesFilter && matchesSearch;
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
    [selectedFilter, searchText, sandwiches]
  );

  const filteredMainCourses = useMemo(
    () =>
      mainCourses.map((category) => ({
        ...category,
        mainCourses: category.mainCourses
          .filter((mainCourse) => {
            const matchesFilter =
              selectedFilter === "all" || mainCourse.type === selectedFilter;
            const matchesSearch = mainCourse.title
              .toLowerCase()
              .includes(searchText.toLowerCase());
            return matchesFilter && matchesSearch;
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
    [selectedFilter, searchText, mainCourses]
  );

  const filteredSnacks = useMemo(
    () =>
      snacks.map((category) => ({
        ...category,
        snacks: category.snacks
          .filter((snack) => {
            const matchesFilter =
              selectedFilter === "all" || snack.type === selectedFilter;
            const matchesSearch = snack.title
              .toLowerCase()
              .includes(searchText.toLowerCase());
            return matchesFilter && matchesSearch;
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
    [selectedFilter, searchText, snacks]
  );
=======
>>>>>>> 09f40122b3a477650fa430187c20c14e0e3179a8

  if (!slug) return <p>No category found.</p>;

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex flex-col gap-2 py-4 mt-14">
      <div className="flex justify-between items-center pr-10 py-4 px-10 md:px-24 xl:px-56">
        <span className="text-2xl font-bold text-orange-950">Menu</span>
        <div className="flex md:w-2/3 justify-end items-center gap-4 z-10">
          <input
            type="text"
            className="border-2 border-solid border-gray-200 w-52 text-md md:w-64 md:text-lg pl-4 rounded-md bg-gray-50"
            name="inputSearch"
            id="inputSearch"
            placeholder="Search the menu..."
            value={searchText}
            onChange={handleSearchChange}
          />
          <DrinksFilter onFilterChange={setSelectedFilter} />
        </div>
      </div>
      {slug === "drinks" &&
        filteredDrinks.map(
          (category, index) =>
            category.drinks.length > 0 && (
              <div key={index} className="mb-8">
                <h1 className="text-3xl text-center font-bold mb-4 text-orange-950 px-10 md:px-24 xl:px-56">
                  {category.title}
                </h1>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.drinks.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}`}
                      key={item.id}
                      className="p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-0 left-0 flex flex-col gap-2">
                          <div className="relative w-6 h-6">
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
                          <div className="relative w-6 h-6">
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
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-orange-950 text-center mb-[-10px]">
                        {item.title}
                      </h2>
                      <p className="font-bold text-lg text-gray-700 text-center">
                        ₱{item.price}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}
<<<<<<< HEAD

{slug === "pasta" &&
        filteredPastas.map(
          (category, index) =>
            category.pastas.length > 0 && (
              <div key={index} className="mb-8">
                <h1 className="text-3xl text-center font-bold mb-4 text-orange-950 px-10 md:px-24 xl:px-56">
                  {category.title}
                </h1>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.pastas.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}`}
                      key={item.id}
                      className="p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-0 left-0 flex flex-col gap-2">
                          <div className="relative w-6 h-6">
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
                          <div className="relative w-6 h-6">
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
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-orange-950 text-center mb-[-10px]">
                        {item.title}
                      </h2>
                      <p className="font-bold text-lg text-gray-700 text-center">
                        ₱{item.price}
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
                <h1 className="text-3xl text-center font-bold mb-4 text-orange-950 px-10 md:px-24 xl:px-56">
                  {category.title}
                </h1>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.sandwiches.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}`}
                      key={item.id}
                      className="p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-0 left-0 flex flex-col gap-2">
                          <div className="relative w-6 h-6">
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
                          <div className="relative w-6 h-6">
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
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-orange-950 text-center mb-[-10px]">
                        {item.title}
                      </h2>
                      <p className="font-bold text-lg text-gray-700 text-center">
                        ₱{item.price}
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
                <h1 className="text-3xl text-center font-bold mb-4 text-orange-950 px-10 md:px-24 xl:px-56">
                  {category.title}
                </h1>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.mainCourses.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}`}
                      key={item.id}
                      className="p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-0 left-0 flex flex-col gap-2">
                          <div className="relative w-6 h-6">
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
                          <div className="relative w-6 h-6">
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
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-orange-950 text-center mb-[-10px]">
                        {item.title}
                      </h2>
                      <p className="font-bold text-lg text-gray-700 text-center">
                        ₱{item.price}
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
                <h1 className="text-3xl text-center font-bold mb-4 text-orange-950 px-10 md:px-24 xl:px-56">
                  {category.title}
                </h1>
                <div className="grid grid-cols-1 px-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:px-24 xl:px-56">
                  {category.snacks.map((item) => (
                    <Link
                      href={`/product/${slug}/${item.id}`}
                      key={item.id}
                      className="p-4 border rounded-lg shadow-lg bg-white aspect-square flex flex-col items-center justify-center gap-2 md:min-w-[200px]"
                    >
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-0 left-0 flex flex-col gap-2">
                          <div className="relative w-6 h-6">
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
                          <div className="relative w-6 h-6">
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
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-orange-950 text-center mb-[-10px]">
                        {item.title}
                      </h2>
                      <p className="font-bold text-lg text-gray-700 text-center">
                        ₱{item.price}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}

        
=======
>>>>>>> 09f40122b3a477650fa430187c20c14e0e3179a8
    </div>
  );
};

export default MenuCategoryPage;
