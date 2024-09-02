"use client";

import React, { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import useHotDrinks from "@/app/hooks/useHotDrinks";
import useIcedDrinks from "@/app/hooks/useIcedDrinks";
import useBlendedDrinks from "@/app/hooks/useBlendedDrinks";
import useAffogatoDrinks from "@/app/hooks/useAffogatoDrinks";
import Link from "next/link";

import DrinksFilter from "@/app/components/DrinksFilter";
import { Drinks } from "@/app/data";

type DrinksCategoryData = {
  title: string;
  drinks: Drinks[];
}[];

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
    </div>
  );
};

export default MenuCategoryPage;
