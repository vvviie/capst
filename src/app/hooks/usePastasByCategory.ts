import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { Pasta } from "../data"; // Adjust path as needed

const usePastasByCategory = (selectedCategory: string | null) => {
    const [pasta, setPasta] = useState<Pasta[]>([]);

    useEffect(() => {
        if (!selectedCategory) {
            setPasta([]); // Clear pasta if no category is selected
            return;
        }

        // Create a real-time listener with onSnapshot
        const pastaRef = collection(db, "pasta");
        const pastaQuery = query(pastaRef, where("prodCategory", "==", selectedCategory));

        const unsubscribe = onSnapshot(pastaQuery, (querySnapshot) => {
            const fetchedPastas: Pasta[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Pasta, "id">),
            }));

            setPasta(fetchedPastas);
        }, (err) => {
            console.error("Error fetching pasta:", err);
        });

        // Cleanup listener on unmount or when selectedCategory changes
        return () => unsubscribe();
    }, [selectedCategory]);

    return pasta;
};

export default usePastasByCategory;
