import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Pastries } from '../data'; // Import the Pastries type

const useAllPastries = () => {
  const [pastriesByCategory, setPastriesByCategory] = useState<Record<string, Pastries[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPastries = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch categories from the "menuCategories" collection
        const categoriesDocRef = doc(db, 'menuCategories', 'pastriesCategories');
        const categoriesDoc = await getDoc(categoriesDocRef);

        if (!categoriesDoc.exists()) {
          setError('Pastries categories document does not exist.');
          setPastriesByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: { category: string; available: boolean }[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid pastries categories format.');
          setPastriesByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Filter out categories where available = false
        const availableCategories = categories.filter((category) => category.available);

        // Step 3: Fetch pastries for each available category
        const pastriesData: Record<string, Pastries[]> = {};
        for (const category of availableCategories) {
          const pastriesRef = collection(db, 'pastries');
          const pastriesQuery = query(pastriesRef, where('prodCategory', '==', category.category));
          const querySnapshot = await getDocs(pastriesQuery);

          pastriesData[category.category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Pastries[];
        }

        setPastriesByCategory(pastriesData);
      } catch (err) {
        console.error('Error fetching pastries:', err);
        setError('Failed to fetch pastries.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastries();
  }, []); // Empty array to run only once when component mounts

  return { pastriesByCategory, loading, error };
};

export default useAllPastries;
