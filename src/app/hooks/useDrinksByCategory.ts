import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Drinks } from "../data"; // Adjust path as needed

const useDrinksByCategory = (selectedCategory: string | null) => {
    const [drinks, setDrinks] = useState<Drinks[]>([]);

    useEffect(() => {
        if (!selectedCategory) {
            setDrinks([]);
            return;
        }

        // Create a real-time listener with onSnapshot
        const drinksRef = collection(db, "drinks");
        const drinksQuery = query(drinksRef, where("prodCategory", "==", selectedCategory));

        const unsubscribe = onSnapshot(drinksQuery, (querySnapshot) => {
            const fetchedDrinks: Drinks[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Drinks, "id">),
            }));

            setDrinks(fetchedDrinks);
        }, (err) => {
            console.error("Error fetching drinks:", err);
        });

        // Cleanup listener on unmount or when selectedCategory changes
        return () => unsubscribe();
    }, [selectedCategory]);

    return drinks;
};

export default useDrinksByCategory;
