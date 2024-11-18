import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Pastries } from "../data"; // Adjust path as needed

const usePastriesByCategory = (selectedCategory: string | null) => {
    const [pastries, setPastries] = useState<Pastries[]>([]);

    useEffect(() => {
        if (!selectedCategory) {
            setPastries([]); // Clear pastries if no category is selected
            return;
        }

        // Create a real-time listener with onSnapshot
        const pastriesRef = collection(db, "pastries");
        const pastriesQuery = query(pastriesRef, where("prodCategory", "==", selectedCategory));

        const unsubscribe = onSnapshot(pastriesQuery, (querySnapshot) => {
            const fetchedPastries: Pastries[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Pastries, "id">),
            }));

            setPastries(fetchedPastries);
        }, (err) => {
            console.error("Error fetching pastries:", err);
        });

        // Cleanup listener on unmount or when selectedCategory changes
        return () => unsubscribe();
    }, [selectedCategory]);

    return pastries;
};

export default usePastriesByCategory;
