import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed
import { Pastries } from "../data"; // Import the Drinks type

const usePastries = () => {
    const [servingPastries, setPastries] = useState<Pastries[]>([]);

    useEffect(() => {
        const fetchPastries = async () => {
            try {
                const pastriesRef = collection(db, "pastries");
                const q = query(pastriesRef, where("prodCategory", "==", "pastriesMenu"));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No matching documents.");
                    setPastries([]);
                    return;
                }

                const pastries: Pastries[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Pastries, "id">),
                }));

                console.log("Fetched pasta:", pastries);
                setPastries(pastries);
            } catch (err) {
                //console.error("Error fetching pasta:", err);
            }
        };

        fetchPastries();
    }, []);

    return { servingPastries };
};

export default usePastries;
