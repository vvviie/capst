import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Drinks } from '../data'; // Import the Drinks type

const useAllDrinks = () => {
  const [drinksByCategory, setDrinksByCategory] = useState<Record<string, Drinks[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch categories from the "menuCategories" collection
        const categoriesDocRef = doc(db, 'menuCategories', 'drinksCategories');
        const categoriesDoc = await getDoc(categoriesDocRef);

        if (!categoriesDoc.exists()) {
          setError('Categories document does not exist.');
          setDrinksByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: string[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid categories format.');
          setDrinksByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Fetch drinks for each category
        const drinksData: Record<string, Drinks[]> = {};
        for (const category of categories) {
          const drinksRef = collection(db, 'drinks');
          const drinksQuery = query(drinksRef, where('prodCategory', '==', category));
          const querySnapshot = await getDocs(drinksQuery);

          drinksData[category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Drinks[];
        }

        setDrinksByCategory(drinksData);
      } catch (err) {
        console.error('Error fetching drinks:', err);
        setError('Failed to fetch drinks.');
      } finally {
        setLoading(false);
      }
    };

    fetchDrinks();
  }, []);

  return { drinksByCategory, loading, error };
};

export default useAllDrinks;