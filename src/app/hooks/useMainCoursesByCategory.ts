import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { MainCourse } from "../data"; // Adjust path as needed

const useMainCoursesByCategory = (mainCategory: string, selectedCategory: string | null) => {
  const [mainCourses, setMainCourses] = useState<MainCourse[]>([]);

  useEffect(() => {
    // If the mainCategory is "Main Course" and selectedCategory is "All", fetch all main courses
    if (mainCategory === "Main Course" && selectedCategory === "All") {
      const mainCourseRef = collection(db, "mainCourse");
      const mainCourseQuery = query(mainCourseRef); // No filtering by category

      const unsubscribe = onSnapshot(
        mainCourseQuery,
        (querySnapshot) => {
          const fetchedMainCourses: MainCourse[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<MainCourse, "id">),
          }));

          setMainCourses(fetchedMainCourses);
        },
        (err) => {
          console.error("Error fetching main courses:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If a specific category is selected, filter by that category
    if (selectedCategory) {
      const mainCourseRef = collection(db, "mainCourse");
      const mainCourseQuery = query(mainCourseRef, where("prodCategory", "==", selectedCategory));

      const unsubscribe = onSnapshot(
        mainCourseQuery,
        (querySnapshot) => {
          const fetchedMainCourses: MainCourse[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<MainCourse, "id">),
          }));

          setMainCourses(fetchedMainCourses);
        },
        (err) => {
          console.error("Error fetching main courses:", err);
        }
      );

      // Cleanup listener on unmount or when mainCategory/selectedCategory changes
      return () => unsubscribe();
    }

    // If no category is selected, clear the main course state
    setMainCourses([]);
  }, [mainCategory, selectedCategory]); // Dependency array ensures updates on changes

  return mainCourses;
};

export default useMainCoursesByCategory;
