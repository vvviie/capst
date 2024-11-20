import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Pasta } from "../data"; // Adjust path as needed

const usePastasByCategory = (mainCategory: string, selectedCategory: string | null) => {
  const [pastas, setPastas] = useState<Pasta[]>([]);

  useEffect(() => {
    // If the mainCategory is "Pasta" and selectedCategory is "All", fetch all pasta items
    if (mainCategory === "Pasta" && selectedCategory === "All") {
      const pastaRef = collection(db, "pasta");
      const pastaQuery = query(pastaRef); // No filtering by category

      const unsubscribe = onSnapshot(
        pastaQuery,
        (querySnapshot) => {
          const fetchedPastas: Pasta[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Pasta, "id">),
          }));

          setPastas(fetchedPastas);
        },
        (err) => {
          console.error("Error fetching pastas:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If a specific category is selected, filter by that category
    if (selectedCategory) {
      const pastaRef = collection(db, "pasta");
      const pastaQuery = query(pastaRef, where("prodCategory", "==", selectedCategory));

      const unsubscribe = onSnapshot(
        pastaQuery,
        (querySnapshot) => {
          const fetchedPastas: Pasta[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Pasta, "id">),
          }));

          setPastas(fetchedPastas);
        },
        (err) => {
          console.error("Error fetching pastas:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If no category is selected, clear the pasta state
    setPastas([]);
  }, [mainCategory, selectedCategory]); // Dependency array ensures updates on changes

  return pastas;
};

export default usePastasByCategory;
