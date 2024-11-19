import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore"; // Use getDoc for documents
import { db } from "../firebase"; // Adjust path as needed

const useMenuCategories = (mainCategory: string) => {
    const [menuCategories, setMenuCategories] = useState<string[]>([]);

    const fetchCategoriesFromDB = async () => {
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
      if (!categoryDoc) return;
  
      // Fetch the document based on the selected category
      const docRef = doc(db, "menuCategories", categoryDoc); // Target the document
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
          const data = docSnap.data();
          let allCategories: string[] = [];
  
          if (data && data.categories && Array.isArray(data.categories)) {
              // Filter the categories for available ones and map to the category names
              allCategories = data.categories
                  .filter((item: any) => item.available) // Only available categories
                  .map((item: any) => item.category); // Use the category name
          }
  
          setMenuCategories(allCategories); // Set the filtered categories
      } else {
          console.log("No such document!");
      }
  };
  

    // Fetch categories whenever mainCategory changes
    useEffect(() => {
        if (mainCategory) {
            fetchCategoriesFromDB(); // Trigger fetching based on mainCategory
        }
    }, [mainCategory]); // Dependency array ensures fetch is triggered when mainCategory changes

    return menuCategories; // Return the filtered menu categories
};

export default useMenuCategories;
