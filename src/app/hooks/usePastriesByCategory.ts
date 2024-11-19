import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Pastries } from "../data"; // Adjust path as needed

const usePastriesByCategory = (mainCategory: string, selectedCategory: string | null) => {
  const [pastries, setPastries] = useState<Pastries[]>([]);

  useEffect(() => {
    // If mainCategory is "Pastries" and selectedCategory is "All", fetch all pastries
    if (mainCategory === "Pastries" && selectedCategory === "All") {
      const pastriesRef = collection(db, "pastries");
      const pastriesQuery = query(pastriesRef); // No filtering by category

      const unsubscribe = onSnapshot(
        pastriesQuery,
        (querySnapshot) => {
          const fetchedPastries: Pastries[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Pastries, "id">),
          }));

          setPastries(fetchedPastries);
        },
        (err) => {
          console.error("Error fetching pastries:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If a specific category is selected, filter by that category
    if (selectedCategory) {
      const pastriesRef = collection(db, "pastries");
      const pastriesQuery = query(pastriesRef, where("prodCategory", "==", selectedCategory));

      const unsubscribe = onSnapshot(
        pastriesQuery,
        (querySnapshot) => {
          const fetchedPastries: Pastries[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Pastries, "id">),
          }));

          setPastries(fetchedPastries);
        },
        (err) => {
          console.error("Error fetching pastries:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If no category is selected, clear the pastries state
    setPastries([]);
  }, [mainCategory, selectedCategory]); // Dependency array ensures updates on changes

  return pastries;
};

export default usePastriesByCategory;
