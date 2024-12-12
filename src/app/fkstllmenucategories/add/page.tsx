"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";

const AddMenuCategoryPage = () => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = () => {
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };

  // Format camelCase to human-readable strings
  const formatCamelCase = (str: string): string => {
    return str
      .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()); // Capitalize the first letter
  };

  useEffect(() => {
    // Check if the cookie 'user' exists
    const userCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='));

    if (userCookie || !userCookie) {
      // Redirect to '/' if the cookie 'user' exists or doesn't exist
    router.push('/');
    }
}, [router]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      const slug = window.location.pathname.split("/").pop(); // Get the last part of the URL
      
      if (!slug) {
        console.error("Slug is undefined!");
        return;
      }
  
      const docRef = doc(db, "menuCategories", slug); // Only call doc() if slug is defined
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSubCategories(data.categories || []);
      } else {
        console.error("Document not found!");
      }
    };
  
    fetchSubCategories();
  }, []);

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
          className="bg-white border-2 pt-4 px-6 pb-6 border-gray-100 shadow-md rounded-md
        flex flex-col gap-2"
        >
          <div className="w-full flex flex-col gap-1.5 items-center justify-center">
            <label className="text-orange-950 text-sm space-x-1" htmlFor="prodID">
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
          {/* ADD SUBCATEGORIES */}
          {subCategories.length > 0 && (
            <div>
              <label className="text-orange-950 text-sm w-full text-left space-x-1">
                <span>Sub Categories</span>
              </label>
              {subCategories.map((sub, index) => (
                <div key={index}>
                  <hr className="my-1" />
                  <div className="w-full flex flex-col sm:flex-row gap-2 sm:items-center">
                    <h1 className="text-gray-800 font-semibold sm:w-1/3">
                      {formatCamelCase(sub)}
                    </h1>
                    <div className="flex items-center justify-between gap-2 sm:w-2/3">
                      <select
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
                </div>
              ))}
              <hr className="my-1" />
            </div>
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
