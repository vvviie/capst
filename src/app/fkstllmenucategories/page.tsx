import Image from "next/image";
import Link from "next/link";
import React from "react";
import { category } from "../data";

const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, ''); // Remove spaces
};

const AdminMenuCategories = () => {
  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full flex 
      justify-center items-center"
    >
      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1400px] space-y-2">
        <div className="w-full flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
            Categories
          </h1>

          <Link
            href={"/fkstllmenucategories/add"}
            className="h-10 border-2 border-gray-100 shadow-md rounded-md pt-1.5
                    bg-white font-bold text-gray-500 w-1/2 max-w-28 text-center
                    hover:bg-gray-50 hover:scale-[1.02] duration-200"
          >
            Add
          </Link>
        </div>
        {/* CATEGORIES CONTAINER */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {category.map((cat) => (
            <Link
              href={`/fkstllmenucategories/${toCamelCase(cat.title) + 'Categories'}`}
              className="border-2 border-gray-100 shadow-md rounded-md bg-white px-4 relative aspect-square
                overflow-clip flex flex-col justify-end"
              key={cat.id}
            >
              {/* IMAGE CONTAINER */}
              <div className="absolute top-0 left-0 w-full h-2/3">
                <Image
                  src={cat.img}
                  alt={cat.img}
                  fill
                  className="object-cover"
                />
              </div>
              {/* TITLE AND DESC */}
              <div className="h-1/3 py-4 text-center flex flex-col justify-center md:gap-0 lg:gap-1">
                <h1 className="text-lg lg:text-xl font-bold text-orange-950">
                  {cat.title}
                </h1>
                <p className="text-xs text-gray-500 lg:text-sm">
                  Click or tap to update or delete the subcategories of this category.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMenuCategories;
