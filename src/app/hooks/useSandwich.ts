import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed
import { Sandwiches } from "../data"; // Import the Drinks type

const useSandwich = () => {
  const [servingSandwich, setSandwich] = useState<Sandwiches[]>([]);

  useEffect(() => {
    const fetchSandwich = async () => {
      try {
        const sandwichRef = collection(db, "sandwiches");
        const q = query(sandwichRef, where("prodCategory", "==", "sandwichMenu"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No matching documents.");
          setSandwich([]);
          return;
        }

        const sandwiches: Sandwiches[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Sandwiches, "id">),
        }));

        console.log("Fetched sandwiches:", sandwiches);
        setSandwich(sandwiches);
      } catch (err) {
        console.error("Error fetching sandwiches:", err);
      }
    };

    fetchSandwich();
  }, []);

  return { servingSandwich };
};

export default useSandwich;
