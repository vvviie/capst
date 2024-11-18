import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Sandwiches } from '../data';

const useAllSandwiches = () => {
  const [sandwichesByCategory, setSandwichesByCategory] = useState<Record<string, Sandwiches[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSandwiches = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch categories from the "menuCategories" collection
        const categoriesDocRef = doc(db, 'menuCategories', 'sandwichesCategories');
        const categoriesDoc = await getDoc(categoriesDocRef);

        if (!categoriesDoc.exists()) {
          setError('Main course categories document does not exist.');
          setSandwichesByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: string[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid pasta categories format.');
          setSandwichesByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Fetch pastas for each category
        const sandwichesData: Record<string, Sandwiches[]> = {};
        for (const category of categories) {
          const pastaRef = collection(db, 'sandwiches');
          const pastaQuery = query(pastaRef, where('prodCategory', '==', category));
          const querySnapshot = await getDocs(pastaQuery);

          sandwichesData[category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Sandwiches[];
        }

        setSandwichesByCategory(sandwichesData);
      } catch (err) {
        console.error('Error fetching pastas:', err);
        setError('Failed to fetch pastas.');
      } finally {
        setLoading(false);
      }
    };

    fetchSandwiches();
  }, []);

  return { sandwichesByCategory, loading, error };
};

export default useAllSandwiches;
