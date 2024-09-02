import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Drinks } from '../data'; // Import the Drinks type

const useAffogatoDrinks = () => {
  const [affogatoDrinks, setAffogatoDrinks] = useState<Drinks[]>([]);

  useEffect(() => {
    const fetchAffogatoDrinks = async () => {
      try {
        // Using the modular API for Firestore v9+
        const drinksRef = collection(db, 'drinks');
        const q = query(drinksRef, where('prodCategory', '==', 'affogatoDrinks'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('No matching documents.');
          setAffogatoDrinks([]);
          return;
        }

        const drinks: Drinks[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Omit<Drinks, 'id'>,
        }));

        console.log('Fetched drinks:', drinks);
        setAffogatoDrinks(drinks);
      } catch (err) {
        console.error('Error fetching iced drinks:', err);
      }
    };

    fetchAffogatoDrinks();
  }, []);

  return { affogatoDrinks };
};

export default useAffogatoDrinks;