import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Drinks } from "../data"; // Adjust path as needed

const useDrinksByCategory = (mainCategory: string, selectedCategory: string | null) => {
  const [drinks, setDrinks] = useState<Drinks[]>([]);

  useEffect(() => {
    // If the mainCategory is "Drinks" and selectedCategory is "All", fetch all drinks
    if (mainCategory === "Drinks" && selectedCategory === "All") {
      const drinksRef = collection(db, "drinks");
      const drinksQuery = query(drinksRef); // No filtering by category

      const unsubscribe = onSnapshot(
        drinksQuery,
        (querySnapshot) => {
          const fetchedDrinks: Drinks[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Drinks, "id">),
          }));

          setDrinks(fetchedDrinks);
        },
        (err) => {
          console.error("Error fetching drinks:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If a specific category is selected, filter by that category
    if (selectedCategory) {
      const drinksRef = collection(db, "drinks");
      const drinksQuery = query(drinksRef, where("prodCategory", "==", selectedCategory));

      const unsubscribe = onSnapshot(
        drinksQuery,
        (querySnapshot) => {
          const fetchedDrinks: Drinks[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Drinks, "id">),
          }));

          setDrinks(fetchedDrinks);
        },
        (err) => {
          console.error("Error fetching drinks:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If no category is selected, clear the drinks state
    setDrinks([]);
  }, [mainCategory, selectedCategory]); // Dependency array ensures updates on changes

  return drinks;
};

export default useDrinksByCategory;
