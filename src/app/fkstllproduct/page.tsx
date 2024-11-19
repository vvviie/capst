"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import {
  menuCategory,
  Availability,
  Drinks,
  MainCourse,
  Pastries,
  Pasta,
  Snacks,
  Sandwiches,
} from "../data";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import useMenuCategories from "../hooks/useMenuCategories";

import useDrinksByCategory from "../hooks/useDrinksByCategory";
import useMainCoursesByCategory from "../hooks/useMainCoursesByCategory";
import usePastasByCategory from "../hooks/usePastasByCategory";
import usePastriesByCategory from "../hooks/usePastriesByCategory";
import useSnacksByCategory from "../hooks/useSnacksByCategory";
import useSandwichesByCategory from "../hooks/useSandwichesByCategory";

interface FeaturedItem {
  id: string;
  // Add other fields if necessary
  fromDB?: string;
}

const CRUDProductPage = () => {
  const [mainCategory, setMainCategory] = useState<string>("Drinks");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("icedDrinks");
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const drinks = useDrinksByCategory(selectedCategory);
  const mainCourses = useMainCoursesByCategory(selectedCategory);
  const pastas = usePastasByCategory(selectedCategory);
  const pastries = usePastriesByCategory(selectedCategory);
  const snacks = useSnacksByCategory(selectedCategory);
  const sandwiches = useSandwichesByCategory(selectedCategory);

  const menuCategories = useMenuCategories(mainCategory);

  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleItemClick = (id: string) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const handleOptionsClick = () => {
    setActiveItem(null);
  };

  const handleMainCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMainCategory(e.target.value); // Set the selected main category
  };

  // Fetch categories from the database
  const fetchCategoriesFromDB = async (mainCategory) => {
    try {
      // Determine the collection based on the selected main category
      let categoriesCollection = "";
      switch (mainCategory) {
        case "Drinks":
          categoriesCollection = "drinksCategories";
          break;
        case "Main Course":
          categoriesCollection = "mainCourseCategories";
          break;
        case "Pastries":
          categoriesCollection = "pastriesCategories";
          break;
        case "Snacks":
          categoriesCollection = "snacksCategories";
          break;
        case "Sandwiches":
          categoriesCollection = "sandwichesCategories";
          break;
        case "Pasta":
          categoriesCollection = "pastaCategories";
          break;
        default:
          categoriesCollection = ""; // Default case, in case no main category is selected
          break;
      }

      // If no category collection is selected, return early
      if (!categoriesCollection) return;

      // Fetch categories from the selected collection
      const querySnapshot = await getDocs(collection(db, categoriesCollection));

      let allCategories: any[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // Assuming each category item is in the format of { category: "someCategory" }
          if (data.categories && Array.isArray(data.categories)) {
            const categoriesFromMaps = data.categories
              .filter((item) => item.category) // Filter out any items without a category
              .map((item) => item.category); // Extract the category names
            allCategories = allCategories.concat(categoriesFromMaps);
          }
        }
      });

      // Format categories for display (if needed)
      const formattedCategories = allCategories.map((category) =>
        category
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
      );

      setMenuCategories(formattedCategories);

      // Only set the selectedCategory if it's a valid option in the new categories list
      if (formattedCategories.includes(selectedCategory)) {
        // Don't reset selectedCategory if it's already a valid category
        return;
      }

      // If selectedCategory is not valid anymore (e.g., it was part of "Pastries" and now we're in "Drinks"), reset it to the first available category
      if (formattedCategories.length > 0) {
        setSelectedCategory(formattedCategories[0]); // Optionally, set the first category as the default
      }
    } catch (error) {
      console.error("Error fetching categories from database:", error);
    }
  };

  useEffect(() => {
    if (mainCategory) {
      fetchCategoriesFromDB(mainCategory); // Fetch categories based on selected main category
    }
  }, [mainCategory]);

  useEffect(() => {
    if (
      menuCategories.length > 0 &&
      !menuCategories.includes(selectedCategory)
    ) {
      // If the current selectedCategory is not in the new menuCategories, reset to the first category
      setSelectedCategory(menuCategories[0]);
    }
  }, [menuCategories]); // Run when menuCategories changes

  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) =>
      drink.title.toLowerCase().startsWith(searchTerm)
    );
  }, [drinks, searchTerm]);

  const filteredMainCourses = useMemo(() => {
    return mainCourses.filter((course) =>
      course.title.toLowerCase().startsWith(searchTerm)
    );
  }, [mainCourses, searchTerm]);

  const filteredPastas = useMemo(() => {
    return pastas.filter((pasta) =>
      pasta.title.toLowerCase().startsWith(searchTerm)
    );
  }, [pastas, searchTerm]);

  const filteredPastries = useMemo(() => {
    return pastries.filter((pastry) =>
      pastry.title.toLowerCase().startsWith(searchTerm)
    );
  }, [pastries, searchTerm]);

  const filteredSnacks = useMemo(() => {
    return snacks.filter((snack) =>
      snack.title.toLowerCase().startsWith(searchTerm)
    );
  }, [snacks, searchTerm]);

  const filteredSandwiches = useMemo(() => {
    return sandwiches.filter((sandwich) =>
      sandwich.title.toLowerCase().startsWith(searchTerm)
    );
  }, [sandwiches, searchTerm]);

  // Delete function for items
  const handleDelete = async (id: string, category: string) => {
    try {
      // Define the correct collection based on the category
      const collectionMap = {
        drinks: "drinks",
        mainCourses: "mainCourse",
        pastas: "pasta",
        pastries: "pastries",
        snacks: "snacks",
        sandwiches: "sandwiches",
      };

      const collectionName = collectionMap[category];
      if (!collectionName) {
        console.error("Invalid category");
        return;
      }

      // Delete from Firestore
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAvailabilityChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    id: string,
    collectionName: string
  ) => {
    const newAvailability = e.target.value;

    try {
      const itemRef = doc(db, collectionName, id); // Use collectionName dynamically
      await updateDoc(itemRef, { availability: newAvailability });
      console.log(
        `Availability for item ${id} in ${collectionName} updated to ${newAvailability}`
      );

      // Optionally, update local state directly to avoid re-fetching data
      updateLocalStateAvailability(collectionName, id, newAvailability);
    } catch (error) {
      console.error(`Error updating availability in ${collectionName}:`, error);
    }
  };

  const updateLocalStateAvailability = (
    collectionName: string,
    id: string,
    newAvailability: string
  ) => {
    switch (collectionName) {
      case "drinks":
        setDrinks((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, availability: newAvailability } : item
          )
        );
        break;
      case "mainCourse":
        setMainCourses((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, availability: newAvailability } : item
          )
        );
        break;
      case "pasta":
        setPasta((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, availability: newAvailability } : item
          )
        );
        break;
      case "pastries":
        setPastries((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, availability: newAvailability } : item
          )
        );
        break;
      case "snacks":
        setSnacks((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, availability: newAvailability } : item
          )
        );
        break;
      case "sandwiches":
        setSandwiches((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, availability: newAvailability } : item
          )
        );
        break;
      default:
        console.warn("Unknown collection name:", collectionName);
    }
  };

  const handleToggleFeatureItem = async (
    itemId: string,
    collectionName: string
  ) => {
    try {
      const itemDocRef = doc(db, collectionName, itemId); // Original collection reference
      const featuredDocRef = doc(db, "featuredItems", itemId); // Featured collection reference

      const featuredSnapshot = await getDoc(featuredDocRef);

      if (featuredSnapshot.exists()) {
        // If the item is already in featuredItems, unfeature it by deleting it
        await deleteDoc(featuredDocRef);
        console.log(`Item ${itemId} has been unfeatured.`);
      } else {
        // If the item is not in featuredItems, feature it by copying the document data
        const itemSnapshot = await getDoc(itemDocRef);

        if (itemSnapshot.exists()) {
          const itemData = itemSnapshot.data();

          await setDoc(featuredDocRef, {
            ...itemData,
            fromDB: collectionName, // Indicate the original collection
          });
          console.log(
            `Item ${itemId} from ${collectionName} featured successfully.`
          );
        } else {
          console.warn(`Item ${itemId} does not exist in ${collectionName}.`);
        }
      }
    } catch (error) {
      console.error(
        `Error toggling feature for item ${itemId} from ${collectionName}:`,
        error
      );
    }
  };

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const featuredCollection = collection(db, "featuredItems");
        const featuredSnapshot = await getDocs(featuredCollection);
        const featuredData: FeaturedItem[] = featuredSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );
        setFeaturedItems(featuredData);
      } catch (error) {
        console.error("Error fetching featured items:", error);
      }
    };

    fetchFeaturedItems();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "featuredItems"),
      (snapshot) => {
        const featuredData: FeaturedItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FeaturedItem[];
        setFeaturedItems(featuredData);
      }
    );

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  const isItemFeatured = (id: string) =>
    featuredItems.some((featuredItem) => featuredItem.id === id);

  return (
    <div className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full flex justify-center">
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1480px]">
        {/* HEADER, MENU CAT, AND SEARCH BAR CONTAINER */}
        <div className="flex flex-col gap-4">
          {/* HEADER */}
          <div className="flex justify-between items-center gap-2 w-full">
            <h1 className="text-2xl font-bold text-orange-950">
              Product Listings
            </h1>
            <Link
              href={"/fkstllmenucategories"}
              className="h-10 border-2 border-gray-100 shadow-md rounded-md pt-1.5
                                bg-white font-bold text-gray-500 w-1/2 max-w-28 text-center
                                hover:bg-gray-50 hover:scale-[1.02] duration-200"
            >
              Categories
            </Link>
          </div>
          {/* CREATE AND SEARCH CONTAINER */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex justify-between items-center gap-4 w-full">
              {/* SELECT MAIN CATEGORY */}
              <select
                name="mainCategory"
                id="mainCategory"
                value={mainCategory}
                onChange={handleMainCategoryChange}
                className="rounded-md shadow-sm border-2 border-gray-100 text-sm sm:text-lg text-gray-600 font-semibold bg-white
                cursor-pointer h-9 text-center flex items-center justify-center flex-1"
              >
                <option value="Drinks">Drinks</option>
                <option value="Main Course">Main Course</option>
                <option value="Pastries">Pastries</option>
                <option value="Snacks">Snacks</option>
                <option value="Sandwiches">Sandwiches</option>
                <option value="Pasta">Pasta</option>
              </select>

              {/* SELECT MENU CATEGORY */}
              <select
                name="menuCategory"
                id="menuCat"
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value)} // Update the selected subcategory
                className="rounded-md shadow-sm border-2 border-gray-100 text-sm sm:text-lg text-gray-600
                font-semibold bg-white cursor-pointer h-9 flex-1"
              >
                {menuCategories.map((category, index) => (
                  <option value={category} key={index} className="text-center">
                    {
                      category
                        .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
                        .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
                    }
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH BAR */}
            <input
              type="text"
              id="inputSearch"
              placeholder="Search menu..."
              className="border-2 border-solid border-gray-200 text-xs sm:text-base md:text-lg h-9 pl-2 rounded-md bg-gray-50 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          Tap or hover on the item to set availability, edit, or delete.
        </p>
        {/* PRODUCTS */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* ADD PRODUCT BUTTON */}
          <Link
            href={"/fkstllproduct/addproduct"}
            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer py-4 aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-200 justify-center items-center hover:bg-gray-100 group"
          >
            <i className="fa-solid fa-circle-plus text-gray-300 text-7xl md:text-9xl group-hover:text-gray-400"></i>
            <span className="text-xs md:text-lg text-gray-300 font-bold group-hover:text-gray-400">
              Add an item
            </span>
          </Link>
          {/* MENU ITEMS */}
          {filteredDrinks.map((item) => (
            <div
              key={item.id}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* IMAGE CONTAINER */}
              <div className="h-4/5 w-full relative">
                <Image src={item.img} alt="" fill className="object-contain" />
              </div>

              {/* PRODUCT TITLE */}
              <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                {item.title}
              </h1>

              {/* AVAILABILITY INDICATOR */}
              <span
                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${
                  item.availability === "available"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}
              ></span>

              {/* CALORIE CONTENT */}
              <span
                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                  item.calorie === "high"
                    ? "bg-red-500"
                    : item.calorie === "med"
                    ? "bg-orange-400"
                    : "bg-green-400"
                }`}
              ></span>

              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === item.id && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <button
                    className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering parent onClick
                      handleToggleFeatureItem(item.id, "drinks"); // Call toggle feature function with item ID and collection name
                    }}
                  >
                    {isItemFeatured(item.id) ? "Remove Feature" : "Feature"}
                  </button>

                  <select
                    value={item.availability.toLowerCase()}
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                    onChange={(e) =>
                      handleAvailabilityChange(e, item.id, "drinks")
                    } // Dynamically pass the collection name
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
                        {availability.name}
                      </option>
                    ))}
                  </select>

                  <Link
                    href={`/fkstllproduct/editproduct/${item.id}`}
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>

                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, "drinks"); // Pass the dynamic collection name
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredMainCourses.map((item) => (
            <div
              key={item.id}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* IMAGE CONTAINER */}
              <div className="h-4/5 w-full relative">
                <Image src={item.img} alt="" fill className="object-contain" />
              </div>
              {/* PRODUCT TITLE */}
              <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                {item.title}
              </h1>
              {/* AVAILABILITY */}
              <span
                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${
                  item.availability === "available"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}
              ></span>
              {/* CALORIE CONTENT */}
              <span
                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                  item.calorie === "high"
                    ? "bg-red-500"
                    : item.calorie === "med"
                    ? "bg-orange-400"
                    : "bg-green-400"
                }`}
              ></span>
              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === item.id && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <button
                    className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering parent onClick
                      handleToggleFeatureItem(item.id, "mainCourse"); // Call toggle feature function with item ID and collection name
                    }}
                  >
                    {isItemFeatured(item.id) ? "Remove Feature" : "Feature"}
                  </button>
                  <select
                    name=""
                    id=""
                    value={item.availability.toLowerCase()}
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                    onChange={(e) =>
                      handleAvailabilityChange(e, item.id, "mainCourse")
                    }
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
                        {availability.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/fkstllproduct/editproduct/${item.id}`}
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, "mainCourses");
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredPastas.map((item) => (
            <div
              key={item.id}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* IMAGE CONTAINER */}
              <div className="h-4/5 w-full relative">
                <Image src={item.img} alt="" fill className="object-contain" />
              </div>
              {/* PRODUCT TITLE */}
              <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                {item.title}
              </h1>
              {/* AVAILABILITY */}
              <span
                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${
                  item.availability === "available"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}
              ></span>
              {/* CALORIE CONTENT */}
              <span
                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                  item.calorie === "high"
                    ? "bg-red-500"
                    : item.calorie === "med"
                    ? "bg-orange-400"
                    : "bg-green-400"
                }`}
              ></span>
              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === item.id && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <button
                    className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering parent onClick
                      handleToggleFeatureItem(item.id, "pasta"); // Call toggle feature function with item ID and collection name
                    }}
                  >
                    {isItemFeatured(item.id) ? "Remove Feature" : "Feature"}
                  </button>
                  <select
                    name=""
                    id=""
                    value={item.availability.toLowerCase()}
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                    onChange={(e) =>
                      handleAvailabilityChange(e, item.id, "pasta")
                    }
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
                        {availability.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/fkstllproduct/editproduct/${item.id}`}
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, "pastas");
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredPastries.map((item) => (
            <div
              key={item.id}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* IMAGE CONTAINER */}
              <div className="h-4/5 w-full relative">
                <Image src={item.img} alt="" fill className="object-contain" />
              </div>
              {/* PRODUCT TITLE */}
              <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                {item.title}
              </h1>
              {/* AVAILABILITY */}
              <span
                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${
                  item.availability === "available"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}
              ></span>
              {/* CALORIE CONTENT */}
              <span
                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                  item.calorie === "high"
                    ? "bg-red-500"
                    : item.calorie === "med"
                    ? "bg-orange-400"
                    : "bg-green-400"
                }`}
              ></span>
              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === item.id && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <button
                    className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering parent onClick
                      handleToggleFeatureItem(item.id, "pastries"); // Call toggle feature function with item ID and collection name
                    }}
                  >
                    {isItemFeatured(item.id) ? "Remove Feature" : "Feature"}
                  </button>
                  <select
                    name=""
                    id=""
                    value={item.availability.toLowerCase()}
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                    onChange={(e) =>
                      handleAvailabilityChange(e, item.id, "pastries")
                    }
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
                        {availability.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/fkstllproduct/editproduct/${item.id}`}
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, "pastries");
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredSnacks.map((item) => (
            <div
              key={item.id}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* IMAGE CONTAINER */}
              <div className="h-4/5 w-full relative">
                <Image src={item.img} alt="" fill className="object-contain" />
              </div>
              {/* PRODUCT TITLE */}
              <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                {item.title}
              </h1>
              {/* AVAILABILITY */}
              <span
                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${
                  item.availability === "available"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}
              ></span>
              {/* CALORIE CONTENT */}
              <span
                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                  item.calorie === "high"
                    ? "bg-red-500"
                    : item.calorie === "med"
                    ? "bg-orange-400"
                    : "bg-green-400"
                }`}
              ></span>
              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === item.id && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <button
                    className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering parent onClick
                      handleToggleFeatureItem(item.id, "snacks"); // Call toggle feature function with item ID and collection name
                    }}
                  >
                    {isItemFeatured(item.id) ? "Remove Feature" : "Feature"}
                  </button>
                  <select
                    name=""
                    id=""
                    value={item.availability.toLowerCase()}
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                    onChange={(e) =>
                      handleAvailabilityChange(e, item.id, "snacks")
                    }
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
                        {availability.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/fkstllproduct/editproduct/${item.id}`}
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, "snacks");
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredSandwiches.map((item) => (
            <div
              key={item.id}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* IMAGE CONTAINER */}
              <div className="h-4/5 w-full relative">
                <Image src={item.img} alt="" fill className="object-contain" />
              </div>
              {/* PRODUCT TITLE */}
              <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                {item.title}
              </h1>
              {/* AVAILABILITY */}
              <span
                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${
                  item.availability === "available"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}
              ></span>
              {/* CALORIE CONTENT */}
              <span
                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                  item.calorie === "high"
                    ? "bg-red-500"
                    : item.calorie === "med"
                    ? "bg-orange-400"
                    : "bg-green-400"
                }`}
              ></span>
              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === item.id && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <button
                    className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering parent onClick
                      handleToggleFeatureItem(item.id, "sandwiches"); // Call toggle feature function with item ID and collection name
                    }}
                  >
                    {isItemFeatured(item.id) ? "Remove Feature" : "Feature"}
                  </button>
                  <select
                    name=""
                    id=""
                    value={item.availability.toLowerCase()}
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                    onChange={(e) =>
                      handleAvailabilityChange(e, item.id, "sandwiches")
                    }
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
                        {availability.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/fkstllproduct/editproduct/${item.id}`}
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, "sandwiches");
                    }}
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

export default CRUDProductPage;
