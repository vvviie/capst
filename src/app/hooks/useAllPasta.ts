import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Pasta } from '../data'; // Import the Pasta type

const useAllPastas = () => {
  const [pastasByCategory, setPastasByCategory] = useState<Record<string, Pasta[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPastas = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch categories from the "menuCategories" collection
        const categoriesDocRef = doc(db, 'menuCategories', 'pastaCategories');
        const categoriesDoc = await getDoc(categoriesDocRef);

        if (!categoriesDoc.exists()) {
          setError('Pasta categories document does not exist.');
          setPastasByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: { category: string; available: boolean }[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid pasta categories format.');
          setPastasByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Filter out categories where available = false
        const availableCategories = categories.filter((category) => category.available);

        // Step 3: Fetch pastas for each available category
        const pastaData: Record<string, Pasta[]> = {};
        for (const category of availableCategories) {
          const pastaRef = collection(db, 'pasta');
          const pastaQuery = query(pastaRef, where('prodCategory', '==', category.category));
          const querySnapshot = await getDocs(pastaQuery);

          pastaData[category.category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Pasta[];
        }

        setPastasByCategory(pastaData);
      } catch (err) {
        console.error('Error fetching pastas:', err);
        setError('Failed to fetch pastas.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastas();
  }, []); // Empty array to run only once when component mounts

  return { pastasByCategory, loading, error };
};

export default useAllPastas;
