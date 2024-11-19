import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Snacks } from "../data"; // Adjust path as needed

const useSnacksByCategory = (mainCategory: string, selectedCategory: string | null) => {
  const [snacks, setSnacks] = useState<Snacks[]>([]);

  useEffect(() => {
    // If the mainCategory is "Snacks" and selectedCategory is "All", fetch all snacks
    if (mainCategory === "Snacks" && selectedCategory === "All") {
      const snacksRef = collection(db, "snacks");
      const snacksQuery = query(snacksRef); // No filtering by category

      const unsubscribe = onSnapshot(
        snacksQuery,
        (querySnapshot) => {
          const fetchedSnacks: Snacks[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Snacks, "id">),
          }));

          setSnacks(fetchedSnacks);
        },
        (err) => {
          console.error("Error fetching snacks:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If a specific category is selected, filter by that category
    if (selectedCategory) {
      const snacksRef = collection(db, "snacks");
      const snacksQuery = query(snacksRef, where("prodCategory", "==", selectedCategory));

      const unsubscribe = onSnapshot(
        snacksQuery,
        (querySnapshot) => {
          const fetchedSnacks: Snacks[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Snacks, "id">),
          }));

          setSnacks(fetchedSnacks);
        },
        (err) => {
          console.error("Error fetching snacks:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If no category is selected, clear the snack state
    setSnacks([]);
  }, [mainCategory, selectedCategory]); // Dependency array ensures updates on changes

  return snacks;
};

export default useSnacksByCategory;
