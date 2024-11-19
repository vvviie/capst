"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";

const hasSubCategories = true;

const AddMenuCategoryPage = () => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [subCategories, setSubCategories] = useState([]); // Store the full subcategory object
  const [categoryName, setCategoryName] = useState(""); // To store category name for title
  const [categorySlug, setCategorySlug] = useState(""); // To store the extracted category slug
  const [newSubCategory, setNewSubCategory] = useState("");

  // Extract the category slug from the URL path
  useEffect(() => {
    const urlPath = window.location.pathname;
    const slug = urlPath.split("/").pop(); // e.g., "drinksCategories"
    setCategorySlug(slug); // Update state with the extracted slug

    console.log("Category Slug:", slug); // Log slug for debugging
  }, []); // Only run once when the component mounts

  useEffect(() => {
    // Function to fetch subcategories from Firestore
    const fetchSubCategories = async () => {
      if (!categorySlug) return; // Do nothing if slug is empty
  
      try {
        console.log("Fetching category data from Firestore for slug:", categorySlug); // Log the fetch action
  
        // Correct Firestore reference using the categorySlug inside the "menuCategories" collection
        const categoryRef = doc(db, "menuCategories", categorySlug); // Firestore path to your category document
        const categorySnap = await getDoc(categoryRef);
  
        if (categorySnap.exists()) {
          const categoryData = categorySnap.data();
          const categories = categoryData.categories || []; // Assuming categories is an array of maps
  
          // Map each subcategory to an object with 'category' and 'available' properties
          const formattedSubCategories = categories.map(subCategoryMap => ({
            category: subCategoryMap.category.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()), // Converts camelCase to Title Case
            available: subCategoryMap.available,
          }));
  
          setSubCategories(formattedSubCategories);
          setCategoryName(categorySlug.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())); // Set formatted category name for title
        } else {
          console.log("Category not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
  
    fetchSubCategories(); // Fetch the subcategories whenever categorySlug is updated
  }, [categorySlug]); // Re-run when categorySlug changes

  const handleSubmit = () => {
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };

  // Helper function to convert camelCase to Title Case
  const toTitleCase = (str) => {
    return str
      .replace(/([A-Z])/g, " $1")  // Add space before capital letters
      .replace(/^./, (match) => match.toUpperCase())  // Capitalize the first letter
      .trim();  // Remove any leading/trailing spaces
  };

  // Helper function to convert Title Case to camelCase for Firestore
  const toCamelCase = (str) => {
    return str
      .replace(/\s(.)/g, (match, group1) => group1.toUpperCase()) // Convert space followed by a letter to uppercase
      .replace(/\s+/g, '') // Remove spaces
      .replace(/^(.)/, (match, group1) => group1.toLowerCase()); // Make the first character lowercase
  };

  // Delete subcategory from Firestore and local state
  const handleDelete = async (subCategory) => {
    const categoryRef = doc(db, "menuCategories", categorySlug);
  
    try {
      // Fetch the document first to see the full structure of categories
      const categorySnap = await getDoc(categoryRef);
      if (categorySnap.exists()) {
        const categoryData = categorySnap.data();
        console.log("Category Data from Firestore:", categoryData);
  
        // Create the exact object to remove from Firestore by converting to camelCase
        const subCategoryToDelete = {
          category: toCamelCase(subCategory.category.trim()),  // Trim and convert to camelCase for Firestore
          available: subCategory.available // Availability status
        };
        console.log("Subcategory to delete:", subCategoryToDelete);
  
        // Update the Firestore document by removing the exact subcategory object
        await updateDoc(categoryRef, {
          categories: arrayRemove(subCategoryToDelete) // Remove the exact object
        });
  
        // Remove from the local state as well
        setSubCategories(subCategories.filter((item) => item.category !== subCategory.category));
  
        console.log(`Subcategory ${subCategory.category.trim()} deleted successfully.`);
      } else {
        console.log("Category not found in Firestore.");
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  // Add subcategory to Firestore and local state
  const handleAdd = async () => {
    if (!newSubCategory) return; // Prevent adding if the input is empty
  
    const categoryRef = doc(db, "menuCategories", categorySlug);
  
    try {
      // Convert the input to Title Case for UI display
      const formattedDisplayName = toTitleCase(newSubCategory);
      // Convert to camelCase for Firestore storage
      const formattedSubCategory = toCamelCase(newSubCategory);
  
      // Create the new subcategory object with 'category' in Title Case for display and 'available' set to true
      const newSubCategoryObject = {
        category: formattedSubCategory, // Store in camelCase
        available: true
      };
  
      // Update Firestore document by adding the new subcategory object to the categories array
      await updateDoc(categoryRef, {
        categories: arrayUnion(newSubCategoryObject) // Add the whole object, not just the category string
      });
  
      // Update the local state with the new subcategory object for immediate UI display
      setSubCategories(prevState => [
        ...prevState,
        { category: formattedDisplayName, available: true }
      ]);
  
      setNewSubCategory(""); // Clear the input after adding
  
    } catch (error) {
      console.error("Error adding subcategory:", error);
    }
  };

  const handleStatusChange = async (subCategory, newStatus) => {
    const categoryRef = doc(db, "menuCategories", categorySlug);
  
    try {
      // Fetch the current categories from Firestore
      const categorySnap = await getDoc(categoryRef);
      if (!categorySnap.exists()) {
        console.error("Category not found in Firestore.");
        return;
      }
  
      // Get the current categories array from Firestore
      const categoryData = categorySnap.data();
      const categories = categoryData.categories || [];
  
      // Convert subcategory name to camelCase for consistency with Firestore
      const formattedSubCategory = toCamelCase(subCategory.category);
  
      // Update the availability status in the categories array
      const updatedCategories = categories.map(sub => 
        sub.category === formattedSubCategory
          ? { ...sub, available: newStatus === 'active' } // Update the availability
          : sub
      );
  
      // Set the updated categories array back to Firestore
      await updateDoc(categoryRef, {
        categories: updatedCategories
      });
  
      // Update local state to reflect the new availability status
      setSubCategories(updatedCategories);
  
      console.log(`Subcategory ${formattedSubCategory} status updated to ${newStatus}.`);
  
    } catch (error) {
      console.error("Error updating subcategory status:", error);
    }
  };

  return (
    <div className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full flex justify-center items-center">
      {/* BACKGROUND IMAGE CONTAINER */}
      <div className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1] lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"></div>
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[600px] flex flex-col gap-2 py-4">
        <div className="flex items-center gap-1 justify-start">
          <Link href={"/fkstllmenucategories"} className="flex items-center space-x-1 font-bold text-orange-950 text-xl text-left hover:text-orange-800 cursor-pointer lg:text-2xl">
            <span>Categories</span>
            <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
          </Link>
          <h1 className="text-xl text-orange-950 font-bold lg:text-2xl">Update</h1>
        </div>
        <form action="" className="bg-white border-2 pt-4 px-6 pb-6 border-gray-100 shadow-md rounded-md flex flex-col gap-2">
          {/* ADD SUBCATEGORIES */}
          <div className="w-full flex flex-col gap-1.5 items-center justify-center mb-4">
            <h1 className="text-xl text-orange-950 font-bold lg:text-2xl mb-6">
              {toTitleCase(categorySlug)} {/* Apply Title Case transformation here */}
            </h1>
            <label className="text-orange-950 text-sm w-full text-left space-x-1" htmlFor="inputSub">
              <span>Sub Category Name</span>
            </label>
            <div className="flex w-full justify-between gap-2">
              <input
                className="border-2 border-solid border-orange-900 w-2/3 h-10 pl-4 rounded-md bg-orange-50"
                name="inputSub"
                id="inputSub"
                type="text"
                placeholder="Sub Category Name"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
              />
              <button
                type="button"
                className="h-10 w-1/3 font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md hover:bg-gray-50 hover:scale-[1.02] duration-200"
                onClick={handleAdd}
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
              <div key={sub.category}>  {/* Add a unique key for each subcategory */}
                <hr className="my-1" />
                <div className="w-full flex flex-col sm:flex-row gap-2 sm:items-center">
                  <h1 className="text-gray-800 font-semibold sm:w-1/3">
                    {toTitleCase(sub.category)} {/* Apply Title Case here */}
                  </h1>
                  <div className="flex items-center justify-between gap-2 sm:w-2/3">
                    <select
                      name=""
                      id=""
                      className="h-10 border-2 border-gray-100 shadow-md rounded-md text-center w-2/3 font-bold text-gray-500 cursor-pointer"
                      value={sub.available ? "active" : "inactive"}
                      onChange={(e) => handleStatusChange(sub, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <button
                      type="button"
                      className="bg-red-500 rounded-md shadow-md w-1/3 h-10 text-white font-bold hover:bg-red-400 hover:scale-[1.02] duration-200"
                      onClick={() => handleDelete(sub)} // Delete the subcategory when clicked
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <hr className="my-1" />
          </>
        )}
        </form>
      </div>
      {isPopUpVisible && <CheckoutPopup message={"Category Updated!"} />}
    </div>
  );
};

export default AddMenuCategoryPage;
