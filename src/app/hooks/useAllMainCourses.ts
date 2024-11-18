import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { MainCourse } from '../data';

const useAllMainCourses = () => {
  const [mainCoursesByCategory, setMainCoursesByCategory] = useState<Record<string, MainCourse[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch categories from the "menuCategories" collection
        const categoriesDocRef = doc(db, 'menuCategories', 'mainCourseCategories');
        const categoriesDoc = await getDoc(categoriesDocRef);

        if (!categoriesDoc.exists()) {
          setError('Main course categories document does not exist.');
          setMainCoursesByCategory({});
          setLoading(false);
          return;
        }

        const { categories } = categoriesDoc.data() as { categories: string[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid pasta categories format.');
          setMainCoursesByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Fetch pastas for each category
        const mainCourseData: Record<string, MainCourse[]> = {};
        for (const category of categories) {
          const pastaRef = collection(db, 'mainCourse');
          const pastaQuery = query(pastaRef, where('prodCategory', '==', category));
          const querySnapshot = await getDocs(pastaQuery);

          mainCourseData[category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MainCourse[];
        }

        setMainCoursesByCategory(mainCourseData);
      } catch (err) {
        console.error('Error fetching pastas:', err);
        setError('Failed to fetch pastas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMainCourses();
  }, []);

  return { mainCoursesByCategory, loading, error };
};

export default useAllMainCourses;
