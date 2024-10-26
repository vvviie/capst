"use client";
import Link from "next/link";
import React, { useState } from "react";
import { vouchers, Availability } from "../data";

type voucherType = {
  id: number;
  title: string;
  value: string;
};

type voucherTypes = voucherType[];

let voucherTypesSelection = [
  {
    id: 1,
    title: "Percentage",
    value: "percent",
  },
  {
    id: 2,
    title: "Deduction",
    value: "minus",
  },
];

let selectedCategory = "percent";

const VoucherListPage = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleItemClick = (id: string) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const handleOptionsClick = () => {
    setActiveItem(null);
  };

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex
    justify-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1480px]">
        {/* HEADER, MENU CAT, AND SEARCH BAR CONTAINER */}
        <div className="flex flex-col gap-4">
          {/* HEADER*/}
          <h1 className="text-2xl font-bold text-orange-950">
            Voucher Listings
          </h1>
          {/* CREATE AND SEARCH CONTAINER */}
          <div className="flex justify-between items-center gap-4">
            {/* SELECT MENU CATEGORY */}
            <select
              name="menuCategory"
              id="menuCat"
              className="rounded-md shadow-sm border-2 border-gray-100
            text-sm sm:text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-9 w-1/2 max-w-72"
            >
              {voucherTypesSelection.map((types) => (
                <option
                  value={types.value}
                  key={types.id}
                  className="text-center"
                >
                  {types.title}
                </option>
              ))}
            </select>
            {/* SEARCH BAR */}
            <input
              type="text"
              id="inputSearch"
              placeholder="Search menu..."
              className="border-2 border-solid border-gray-200 text-xs sm:text-base md:text-lg h-9 pl-2 rounded-md bg-gray-50
              w-full"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          Tap or hover on the voucher to set availability, edit, or delete.
        </p>
        {/* PRODUCTS */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {/* ADD PRODUCT BUTTON */}
          <Link
            href={"/fkstllvouchers/addvoucher"}
            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer py-4
            aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-200
            justify-center items-center hover:bg-gray-100 group"
          >
            <i
              className="fa-solid fa-circle-plus text-gray-300 text-7xl md:text-9xl
            group-hover:text-gray-400"
            ></i>
            <span className="text-xs md:text-lg text-gray-300 font-bold group-hover:text-gray-400">
              Add a voucher
            </span>
          </Link>
          {/* MENU ITEMS */}
          {vouchers.map((items) => (
            <div
              key={items.voucherID}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer items-center px-8
            aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300 justify-center"
              onClick={() => handleItemClick(items.voucherID)}
              onMouseEnter={() => setActiveItem(items.voucherID)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* VOUCHER ICON */}
              <i className="fa-solid fa-ticket text-orange-950 text-7xl"></i>
              {/* PRODUCT TITLE */}
              <h1 className="text-center text-orange-950 lg:text-lg font-semibold md:text-xl px-6">
                {items.voucherName}
              </h1>
              {/* VOUCHER DESCRIPTION */}
              <p className="text-center text-gray-600 text-xs lg:text-sm">
                {items.voucherDescription}
              </p>

              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === items.voucherID && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <select
                    name=""
                    id=""
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer
                    text-sm font-semibold text-gray-600 min-h-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Availability.map((availability) => (
                      <option
                        key={availability.id}
                        value={availability.value}
                        className={`${
                          availability.value === "Available"
                            ? "text-green-600"
                            : "text-gray-500"
                        } font-bold`}
                      >
                        {availability.value}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/fkstllvouchers/editvoucher/${items.voucherID}`}
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center
                  font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm
                  min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400
                  w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200
                  hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoucherListPage;
