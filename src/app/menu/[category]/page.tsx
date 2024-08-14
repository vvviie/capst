"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { HotDrinks, IcedDrinks, BlendedDrinks, Affogato } from "@/app/data";
import DrinksFilter from "@/app/components/DrinksFilter";
import { Drinks, Pastries } from "@/app/data";

type DrinksCategoryData = {
  title: string;
  drinks: Drinks[];
}[];

type PastriesCategoryData = {
  title: string;
  pastries: Pastries[];
}[];

type PastaCategoryData = {
  title: string;
  pastries: Pastries[];
}[];

type SandwichesCategoryData = {
  title: string;
  pastries: Pastries[];
}[];

type MainCourseCategoryData = {
  title: string;
  pastries: Pastries[];
}[];

type SnacksCategoryData = {
  title: string;
  pastries: Pastries[];
}[];

const MenuCategoryPage: React.FC = () => {
  const pathname = usePathname();
  const slug = pathname.split("/").pop(); // INE-EXTRACT 'YUNG LAST PART NG PATH AS SLUG

  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  let drinks: DrinksCategoryData = [
    { title: "Hot Drinks", drinks: HotDrinks },
    { title: "Iced Drinks", drinks: IcedDrinks },
    { title: "Blended Drinks", drinks: BlendedDrinks },
    { title: "Affogato", drinks: Affogato },
  ];

  const filteredDrinks = drinks.map((category) => ({
    ...category,
    drinks: category.drinks.filter((drink) => {
      if (selectedFilter === "all") return true;
      return drink.type === selectedFilter;
    }),
  }));

  if (!slug) return null;

  return (
    <div className="relative h-auto flex flex-col gap-2 py-4 mt-14">
      <div className="flex justify-between items-center pr-10 py-4">
        <span className="text-2xl font-bold text-orange-950 px-10">Menu</span>
        <DrinksFilter onFilterChange={setSelectedFilter} />
      </div>
      {slug === "drinks" &&
        filteredDrinks.map((category, index) => (
          <div key={index} className="mb-8">
            <h1 className="text-3xl text-center font-bold mb-4 text-orange-950 px-10">
              {category.title}
            </h1>
            <div className="grid grid-cols-1 px-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.drinks &&
                category.drinks.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg shadow-lg aspect-square flex flex-col items-center justify-center gap-2"
                  >
                    <div className="relative w-full h-48 mb-4 z-[-2]">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="object-contain"
                      />
                      <div className="absolute top-0 left-0 flex flex-col gap-2">
                        <div className="relative w-10 h-10">
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
                        <div className="relative w-10 h-10">
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
                    <h2 className="text-2xl font-bold text-orange-950 text-center">
                      {item.title}
                    </h2>
                    <p className="font-bold text-xl text-gray-700 text-center">
                      Price: ₱{item.price}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MenuCategoryPage;
