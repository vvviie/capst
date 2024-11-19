import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { MainCourse } from '../data'; // Import the MainCourse type

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

        const { categories } = categoriesDoc.data() as { categories: { category: string; available: boolean }[] };

        if (!categories || !Array.isArray(categories)) {
          setError('Invalid main course categories format.');
          setMainCoursesByCategory({});
          setLoading(false);
          return;
        }

        // Step 2: Filter out categories where available = false
        const availableCategories = categories.filter((category) => category.available);

        // Step 3: Fetch main courses for each available category
        const mainCourseData: Record<string, MainCourse[]> = {};
        for (const category of availableCategories) {
          const mainCourseRef = collection(db, 'mainCourse');
          const mainCourseQuery = query(mainCourseRef, where('prodCategory', '==', category.category));
          const querySnapshot = await getDocs(mainCourseQuery);

          mainCourseData[category.category] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MainCourse[];
        }

        setMainCoursesByCategory(mainCourseData);
      } catch (err) {
        console.error('Error fetching main courses:', err);
        setError('Failed to fetch main courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchMainCourses();
  }, []); // Empty array to run only once when component mounts

  return { mainCoursesByCategory, loading, error };
};

export default useAllMainCourses;
