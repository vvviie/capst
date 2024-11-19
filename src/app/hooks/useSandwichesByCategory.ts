import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Sandwiches } from "../data"; // Adjust path as needed

const useSandwichesByCategory = (selectedCategory: string | null) => {
    const [sandwiches, setSandwiches] = useState<Sandwiches[]>([]);

    useEffect(() => {
        if (!selectedCategory) {
            setSandwiches([]); // Clear sandwiches if no category is selected
            return;
        }

        // Create a real-time listener with onSnapshot
        const sandwichesRef = collection(db, "sandwiches");
        const sandwichesQuery = query(sandwichesRef, where("prodCategory", "==", selectedCategory));

        const unsubscribe = onSnapshot(sandwichesQuery, (querySnapshot) => {
            const fetchedSandwiches: Sandwiches[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Sandwiches, "id">),
            }));

            setSandwiches(fetchedSandwiches);
        }, (err) => {
            console.error("Error fetching sandwiches:", err);
        });

        // Cleanup listener on unmount or when selectedCategory changes
        return () => unsubscribe();
    }, [selectedCategory]);

    return sandwiches;
};

export default useSandwichesByCategory;
