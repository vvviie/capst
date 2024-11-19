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

        const { categories } = categoriesDoc.data() as { categories: { category: string; available: boolean }[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid categories format.');
          setDrinksByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Filter out categories where available = false
        const availableCategories = categories.filter((category) => category.available);

        // Step 3: Fetch drinks for each available category
        const drinksData: Record<string, Drinks[]> = {};
        for (const category of availableCategories) {
          const drinksRef = collection(db, 'drinks');
          const drinksQuery = query(drinksRef, where('prodCategory', '==', category.category));
          const querySnapshot = await getDocs(drinksQuery);

          drinksData[category.category] = querySnapshot.docs.map((doc) => ({
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
  }, []); // Empty array to run only once when component mounts

  return { drinksByCategory, loading, error };
};

export default useAllDrinks;
