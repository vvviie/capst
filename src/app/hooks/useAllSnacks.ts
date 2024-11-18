import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Snacks } from '../data'; // Import the Snacks type

const useAllSnacks = () => {
  const [snacksByCategory, setSnacksByCategory] = useState<Record<string, Snacks[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnacks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch categories from the "menuCategories" collection
        const categoriesDocRef = doc(db, 'menuCategories', 'snacksCategories');
        const categoriesDoc = await getDoc(categoriesDocRef);

        if (!categoriesDoc.exists()) {
          setError('Snacks categories document does not exist.');
          setSnacksByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: { category: string; available: boolean }[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid snacks categories format.');
          setSnacksByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Filter out categories where available = false
        const availableCategories = categories.filter((category) => category.available);

        // Step 3: Fetch snacks for each available category
        const snacksData: Record<string, Snacks[]> = {};
        for (const category of availableCategories) {
          const snacksRef = collection(db, 'snacks');
          const snacksQuery = query(snacksRef, where('prodCategory', '==', category.category));
          const querySnapshot = await getDocs(snacksQuery);

          snacksData[category.category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Snacks[];
        }

        setSnacksByCategory(snacksData);
      } catch (err) {
        console.error('Error fetching snacks:', err);
        setError('Failed to fetch snacks.');
      } finally {
        setLoading(false);
      }
    };

    fetchSnacks();
  }, []); // Empty array to run only once when component mounts

  return { snacksByCategory, loading, error };
};

export default useAllSnacks;
