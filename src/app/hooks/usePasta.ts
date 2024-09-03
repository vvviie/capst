import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed
import { Pasta } from "../data"; // Import the Drinks type

const usePasta = () => {
  const [servingPasta, setPasta] = useState<Pasta[]>([]);

  useEffect(() => {
    const fetchPasta = async () => {
      try {
        const pastaRef = collection(db, "pasta");
        const q = query(pastaRef, where("prodCategory", "==", "pastaMenu"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No matching documents.");
          setPasta([]);
          return;
        }

        const pastas: Pasta[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Pasta, "id">),
        }));

        console.log("Fetched pasta:", pastas);
        setPasta(pastas);
      } catch (err) {
        console.error("Error fetching pasta:", err);
      }
    };

    fetchPasta();
  }, []);

  return { servingPasta };
};

export default usePasta;
