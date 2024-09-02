// src/app/hooks/useHotDrinks.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Drinks } from '../data'; // Import the Drinks type

const useBlendedDrinks = () => {
  const [blendedDrinks, setBlendedDrinks] = useState<Drinks[]>([]);

  useEffect(() => {
    const fetchBlendedDrinks = async () => {
      try {
        // Using the modular API for Firestore v9+
        const drinksRef = collection(db, 'drinks');
        const q = query(drinksRef, where('prodCategory', '==', 'blendedDrinks'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('No matching documents.');
          setBlendedDrinks([]);
          return;
        }

        const drinks: Drinks[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Omit<Drinks, 'id'>,
        }));

        console.log('Fetched drinks:', drinks);
        setBlendedDrinks(drinks);
      } catch (err) {
        console.error('Error fetching hot drinks:', err);
      }
    };

    fetchBlendedDrinks();
  }, []);

  return { blendedDrinks };
};

export default useBlendedDrinks;
