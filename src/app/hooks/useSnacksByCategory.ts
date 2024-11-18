import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Snacks } from "../data"; // Adjust path as needed

const useSnacksByCategory = (selectedCategory: string | null) => {
    const [snacks, setSnacks] = useState<Snacks[]>([]);

    useEffect(() => {
        if (!selectedCategory) {
            setSnacks([]); // Clear snacks if no category is selected
            return;
        }

        // Create a real-time listener with onSnapshot
        const snacksRef = collection(db, "snacks");
        const snacksQuery = query(snacksRef, where("prodCategory", "==", selectedCategory));

        const unsubscribe = onSnapshot(snacksQuery, (querySnapshot) => {
            const fetchedSnacks: Snacks[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Snacks, "id">),
            }));

            setSnacks(fetchedSnacks);
        }, (err) => {
            console.error("Error fetching snacks:", err);
        });

        // Cleanup listener on unmount or when selectedCategory changes
        return () => unsubscribe();
    }, [selectedCategory]);

    return snacks;
};

export default useSnacksByCategory;
