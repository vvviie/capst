import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed
import { MainCourse } from "../data"; // Adjust path as needed

const useMainCoursesByCategory = (selectedCategory: string | null) => {
    const [mainCourses, setMainCourses] = useState<MainCourse[]>([]);

    useEffect(() => {
        if (!selectedCategory) {
            setMainCourses([]); // Clear main courses if no category is selected
            return;
        }

        // Create a real-time listener with onSnapshot
        const mainCourseRef = collection(db, "mainCourse");
        const mainCourseQuery = query(mainCourseRef, where("prodCategory", "==", selectedCategory));

        const unsubscribe = onSnapshot(mainCourseQuery, (querySnapshot) => {
            const fetchedMainCourses: MainCourse[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<MainCourse, "id">),
            }));

            setMainCourses(fetchedMainCourses);
        }, (err) => {
            console.error("Error fetching main courses:", err);
        });

        // Cleanup listener on unmount or when selectedCategory changes
        return () => unsubscribe();
    }, [selectedCategory]);

    return mainCourses;
};

export default useMainCoursesByCategory;
