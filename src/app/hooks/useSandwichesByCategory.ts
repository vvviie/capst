import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Sandwiches } from "../data"; // Adjust path as needed

const useSandwichesByCategory = (mainCategory: string, selectedCategory: string | null) => {
  const [sandwiches, setSandwiches] = useState<Sandwiches[]>([]);

  useEffect(() => {
    // If the mainCategory is "Sandwiches" and selectedCategory is "All", fetch all sandwiches
    if (mainCategory === "Sandwiches" && selectedCategory === "All") {
      const sandwichesRef = collection(db, "sandwiches");
      const sandwichesQuery = query(sandwichesRef); // No filtering by category

      const unsubscribe = onSnapshot(
        sandwichesQuery,
        (querySnapshot) => {
          const fetchedSandwiches: Sandwiches[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Sandwiches, "id">),
          }));

          setSandwiches(fetchedSandwiches);
        },
        (err) => {
          console.error("Error fetching sandwiches:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If a specific category is selected, filter by that category
    if (selectedCategory) {
      const sandwichesRef = collection(db, "sandwiches");
      const sandwichesQuery = query(sandwichesRef, where("prodCategory", "==", selectedCategory));

      const unsubscribe = onSnapshot(
        sandwichesQuery,
        (querySnapshot) => {
          const fetchedSandwiches: Sandwiches[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Sandwiches, "id">),
          }));

          setSandwiches(fetchedSandwiches);
        },
        (err) => {
          console.error("Error fetching sandwiches:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If no category is selected, clear the sandwich state
    setSandwiches([]);
  }, [mainCategory, selectedCategory]); // Dependency array ensures updates on changes

  return sandwiches;
};

export default useSandwichesByCategory;
