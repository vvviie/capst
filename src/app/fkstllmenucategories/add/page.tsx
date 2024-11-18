"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import { subCategories } from "@/app/data";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const hasSubCategories = true;

const AddMenuCategoryPage = () => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const handleSubmit = () => {
    // Show success popup
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };
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
      <div className="w-full max-w-[600px] flex flex-col gap-2 py-4">
        <div className="flex items-center gap-1 justify-start">
          <Link
            href={"/fkstllmenucategories"}
            className="flex items-center space-x-1 font-bold text-orange-950 text-xl text-left
              hover:text-orange-800 cursor-pointer lg:text-2xl"
          >
            <span>Categories</span>
            <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
          </Link>
          <h1 className="text-xl text-orange-950 font-bold lg:text-2xl">Add</h1>
        </div>
        <form
          action=""
          className="bg-white border-2 pt-4 px-6 pb-6 border-gray-100 shadow-md rounded-md
        flex flex-col gap-2"
        >
          <div className="w-full flex flex-col gap-1.5 items-center justify-center">
            <label
              className="text-orange-950 text-sm space-x-1"
              htmlFor="prodID"
            >
              <span>Category Image</span>
            </label>
            {/* IMAGE CONTAINER */}
            <div className="w-52 aspect-square rounded-md relative border-2 border-gray-100 text-xs">
              <Image
                src={""}
                alt="product img"
                fill
                className="object-contain"
              />
            </div>
          </div>
          {/* UPLOAD BUTTON AND PRODUCT ID */}
          <div className="w-full flex flex-col gap-1.5 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor="catID"
            >
              <span>Image Name</span>
            </label>
            <div className="flex flex-col w-full items-end gap-2">
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                name="catImg"
                id="inputCatImg"
                type="text"
                placeholder="File Name"
              />
              {/* UPLOAD BUTTON */}
              <button
                className="h-10 w-1/2 font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md
                hover:bg-gray-50 hover:scale-[1.02] duration-200"
              >
                Upload
              </button>
            </div>
          </div>
          {/* ADD SUBCATEGORIES */}
          <div className="w-full flex flex-col gap-1.5 items-center justify-center mb-4">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor="inputSub"
            >
              <span>Sub Category Name</span>
            </label>
            <div className="flex w-full justify-between gap-2">
              <input
                className="border-2 border-solid border-orange-900 w-2/3 h-10 pl-4 rounded-md bg-orange-50"
                name="inputSub"
                id="inputSub"
                type="text"
                placeholder="Sub Category Name"
              />
              <button
                className="h-10 w-1/3 font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md
                hover:bg-gray-50 hover:scale-[1.02] duration-200"
              >
                Add
              </button>
            </div>
          </div>
          {hasSubCategories && (
            <>
              <label className="text-orange-950 text-sm w-full text-left space-x-1">
                <span>Sub Categories</span>
              </label>
              {subCategories.map((sub) => (
                <>
                  <hr className="my-1" />
                  <div className="w-full flex flex-col sm:flex-row gap-2 sm:items-center">
                    <h1 className="text-gray-800 font-semibold sm:w-1/3">
                      {sub}
                    </h1>
                    <div className="flex items-center justify-between gap-2 sm:w-2/3">
                      <select
                        name=""
                        id=""
                        className="h-10 border-2 border-gray-100 shadow-md rounded-md
                      text-center w-2/3 font-bold text-gray-500 cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button
                        className="bg-red-500 rounded-md shadow-md w-1/3 h-10 text-white font-bold
                    hover:bg-red-400 hover:scale-[1.02] duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              ))}
              <hr className="my-1" />
            </>
          )}
          <button
            className="bg-orange-950 hover:bg-orange-900 h-10 w-full hover:scale-[1.02]
          duration-200 rounded-md shadow-md font-bold text-white"
            onClick={() => handleSubmit()}
          >
            Add Category
          </button>
        </form>
      </div>
      {isPopUpVisible && <CheckoutPopup message={"Category Added!"} />}
    </div>
  );
};

export default AddMenuCategoryPage;
