import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Pastries } from '../data';

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
          setError('Main course categories document does not exist.');
          setPastriesByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: string[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid pasta categories format.');
          setPastriesByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Fetch pastas for each category
        const pastriesData: Record<string, Pastries[]> = {};
        for (const category of categories) {
          const pastaRef = collection(db, 'pastries');
          const pastaQuery = query(pastaRef, where('prodCategory', '==', category));
          const querySnapshot = await getDocs(pastaQuery);

          pastriesData[category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Pastries[];
        }

        setPastriesByCategory(pastriesData);
      } catch (err) {
        console.error('Error fetching pastas:', err);
        setError('Failed to fetch pastas.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastries();
  }, []);

  return { pastriesByCategory, loading, error };
};

export default useAllPastries;
