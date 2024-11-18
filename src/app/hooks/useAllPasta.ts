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

        const { categories } = categoriesDoc.data() as { categories: string[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid pasta categories format.');
          setPastasByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Fetch pastas for each category
        const pastaData: Record<string, Pasta[]> = {};
        for (const category of categories) {
          const pastaRef = collection(db, 'pasta');
          const pastaQuery = query(pastaRef, where('prodCategory', '==', category));
          const querySnapshot = await getDocs(pastaQuery);

          pastaData[category] = querySnapshot.docs.map((doc) => ({
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
  }, []);

  return { pastasByCategory, loading, error };
};

export default useAllPastas;
