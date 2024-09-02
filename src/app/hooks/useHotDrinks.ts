// src/app/hooks/useHotDrinks.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Drinks } from '../data'; // Import the Drinks type

const useHotDrinks = () => {
  const [hotDrinks, setHotDrinks] = useState<Drinks[]>([]);

  useEffect(() => {
    const fetchHotDrinks = async () => {
      try {
        // Using the modular API for Firestore v9+
        const drinksRef = collection(db, 'drinks');
        const q = query(drinksRef, where('prodCategory', '==', 'hotDrinks'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('No matching documents.');
          setHotDrinks([]);
          return;
        }

        const drinks: Drinks[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Omit<Drinks, 'id'>,
        }));

        console.log('Fetched drinks:', drinks);
        setHotDrinks(drinks);
      } catch (err) {
        console.error('Error fetching hot drinks:', err);
      }
    };

    fetchHotDrinks();
  }, []);

  return { hotDrinks };
};

export default useHotDrinks;
