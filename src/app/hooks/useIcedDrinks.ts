import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Drinks } from '../data'; // Import the Drinks type

const useIcedDrinks = () => {
  const [icedDrinks, setIcedDrinks] = useState<Drinks[]>([]);

  useEffect(() => {
    const fetchIcedDrinks = async () => {
      try {
        // Using the modular API for Firestore v9+
        const drinksRef = collection(db, 'drinks');
        const q = query(drinksRef, where('prodCategory', '==', 'icedDrinks'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('No matching documents.');
          setIcedDrinks([]);
          return;
        }

        const drinks: Drinks[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Omit<Drinks, 'id'>,
        }));

        console.log('Fetched drinks:', drinks);
        setIcedDrinks(drinks);
      } catch (err) {
        console.error('Error fetching iced drinks:', err);
      }
    };

    fetchIcedDrinks();
  }, []);

  return { icedDrinks };
};

export default useIcedDrinks;