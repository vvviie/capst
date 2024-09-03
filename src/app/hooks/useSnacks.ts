import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed
import { Snacks } from "../data"; // Import the Drinks type

const useSnacks = () => {
  const [servingSnacks, setSnacks] = useState<Snacks[]>([]);

  useEffect(() => {
    const fetchSnacks = async () => {
      try {
        const SnacksRef = collection(db, "snacks");
        const q = query(SnacksRef, where("prodCategory", "==", "snacksMenu"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No matching documents.");
          setSnacks([]);
          return;
        }

        const snacks: Snacks[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Snacks, "id">),
        }));

        console.log("Fetched Snacks:", snacks);
        setSnacks(snacks);
      } catch (err) {
        console.error("Error fetching Snacks:", err);
      }
    };

    fetchSnacks();
  }, []);

  return { servingSnacks };
};

export default useSnacks;
