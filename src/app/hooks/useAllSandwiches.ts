import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Sandwiches } from '../data'; // Import the Sandwiches type

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
          setError('Sandwiches categories document does not exist.');
          setSandwichesByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: { category: string; available: boolean }[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid sandwiches categories format.');
          setSandwichesByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Filter out categories where available = false
        const availableCategories = categories.filter((category) => category.available);

        // Step 3: Fetch sandwiches for each available category
        const sandwichesData: Record<string, Sandwiches[]> = {};
        for (const category of availableCategories) {
          const sandwichesRef = collection(db, 'sandwiches');
          const sandwichesQuery = query(sandwichesRef, where('prodCategory', '==', category.category));
          const querySnapshot = await getDocs(sandwichesQuery);

          sandwichesData[category.category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Sandwiches[];
        }

        setSandwichesByCategory(sandwichesData);
      } catch (err) {
        console.error('Error fetching sandwiches:', err);
        setError('Failed to fetch sandwiches.');
      } finally {
        setLoading(false);
      }
    };

    fetchSandwiches();
  }, []); // Empty array to run only once when component mounts

  return { sandwichesByCategory, loading, error };
};

export default useAllSandwiches;
