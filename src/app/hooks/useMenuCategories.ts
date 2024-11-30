import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore"; // Use onSnapshot for real-time updates
import { db } from "../firebase"; // Adjust path as needed

const useMenuCategories = (mainCategory: string) => {
  const [menuCategories, setMenuCategories] = useState<string[]>([]);

  // Use useCallback to memoize the fetchCategoriesFromDB function
  const fetchCategoriesFromDB = useCallback(() => {
    let categoryDoc = ""; // Initialize to an empty string

    // Choose the document name based on the selected mainCategory
    switch (mainCategory) {
      case "Drinks":
        categoryDoc = "drinksCategories"; // Document name under menuCategories
        break;
      case "Main Course":
        categoryDoc = "mainCourseCategories";
        break;
      case "Pastries":
        categoryDoc = "pastriesCategories";
        break;
      case "Snacks":
        categoryDoc = "snacksCategories";
        break;
      case "Sandwiches":
        categoryDoc = "sandwichesCategories";
        break;
      case "Pasta":
        categoryDoc = "pastaCategories";
        break;
      default:
        categoryDoc = ""; // If no valid category is selected, do nothing
        break;
    }

    // If no valid category is selected, return
    if (!categoryDoc) {
      setMenuCategories([]); // Clear categories if mainCategory is invalid
      return;
    }

    // Fetch the document based on the selected category with real-time updates
    const docRef = doc(db, "menuCategories", categoryDoc); // Target the document
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          let allCategories: string[] = [];

          if (data && data.categories && Array.isArray(data.categories)) {
            // Filter only available categories and map them
            allCategories = data.categories
              .filter((item: any) => item.available) // Only available categories
              .map((item: any) => item.category); // Use the category name

            // Add the "All" option to the categories if it's not already there
            if (!allCategories.includes("All")) {
              allCategories.unshift("All"); // "All" option as the first item in the list
            }
          }

          setMenuCategories(allCategories); // Set the filtered categories
        } else {
          console.log("No such document!");
          setMenuCategories([]); // Clear categories if the document is missing
        }
      },
      (error) => {
        console.error("Error fetching categories:", error);
        setMenuCategories([]); // Clear categories on error
      }
    );

    // Cleanup listener on component unmount or category change
    return () => unsubscribe();
  }, [mainCategory]); // Dependency array now includes mainCategory

  // Fetch categories whenever mainCategory changes
  useEffect(() => {
    if (mainCategory) {
      fetchCategoriesFromDB(); // Trigger fetching based on mainCategory
    }
  }, [mainCategory, fetchCategoriesFromDB]); // Add fetchCategoriesFromDB to the dependency array

  return menuCategories; // Return the filtered menu categories
};

export default useMenuCategories;
