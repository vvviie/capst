import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed
import { MainCourse } from "../data"; // Import the Drinks type

const useMainCourse = () => {
  const [servingMainCourse, setMainCourse] = useState<MainCourse[]>([]);

  useEffect(() => {
    const fetchMainCourse = async () => {
      try {
        const mainCourseRef = collection(db, "mainCourse");
        const q = query(mainCourseRef, where("prodCategory", "==", "mainCourseMenu"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          //console.log("No matching documents.");
          setMainCourse([]);
          return;
        }

        const mainCourses: MainCourse[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MainCourse, "id">),
        }));

        //console.log("Fetched main courses:", mainCourses);
        setMainCourse(mainCourses);
      } catch (err) {
        //console.error("Error fetching main courses:", err);
      }
    };

    fetchMainCourse();
  }, []);

  return { servingMainCourse };
};

export default useMainCourse;
