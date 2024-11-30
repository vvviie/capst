import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { Drinks } from '../data'; // Adjust the type as needed

const useDynamicCategoryFetch = () => {
  const [menuCategories, setMenuCategories] = useState<
    { category: string; available: boolean; fromDB: string }[]
  >([]);
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, Drinks[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from Firestore
  const fetchCategoriesFromDB = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'menuCategories'));

      const categories = querySnapshot.docs.flatMap((doc) => {
        const data = doc.data();
        if (data.categories && Array.isArray(data.categories)) {
          return data.categories.map((categoryObj: any) => ({
            category: categoryObj.category,
            available: categoryObj.available,
            fromDB: categoryObj.fromDB,
          }));
        }
        return [];
      });

      setMenuCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories.');
    }
  };

  // Memoize fetchItemsForCategories to prevent unnecessary re-renders
  const fetchItemsForCategories = useCallback(async () => {
    try {
      setLoading(true);
      const itemsData: Record<string, Drinks[]> = {};

      for (const { category, available, fromDB } of menuCategories) {
        if (!available || !fromDB) continue; // Skip unavailable categories or those missing `fromDB`

        const itemsRef = collection(db, fromDB);
        const itemsQuery = query(itemsRef, where('prodCategory', '==', category));
        const querySnapshot = await getDocs(itemsQuery);

        itemsData[category] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Drinks[]; // Adjust type if needed
      }

      setItemsByCategory(itemsData);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to fetch items.');
    } finally {
      setLoading(false);
    }
  }, [menuCategories]); // Adding menuCategories as a dependency

  useEffect(() => {
    fetchCategoriesFromDB();
  }, []); // Only fetch categories on mount

  useEffect(() => {
    if (menuCategories.length > 0) {
      fetchItemsForCategories();
    }
  }, [menuCategories, fetchItemsForCategories]); // Adding fetchItemsForCategories to the dependency array

  return { menuCategories, itemsByCategory, loading, error };
};

export default useDynamicCategoryFetch;
