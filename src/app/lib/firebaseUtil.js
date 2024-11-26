// src/app/lib/firebaseUtils.js
import { db } from "@/app/firebase"; // Adjust the import based on your file structure
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

// Fetch featured items
export const fetchFeaturedItems = async () => {
  return new Promise((resolve, reject) => {
    const items = [];
    const unsubscribe = onSnapshot(
      collection(db, "featuredItems"),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        resolve(items);
        unsubscribe(); // Stop listening after fetching
      },
      (error) => {
        console.error("Error fetching featured items:", error);
        reject(error);
      }
    );
  });
};

// Fetch footer data
export const fetchFooterData = async () => {
  const docRef = doc(db, "webContent", "footerSection");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null; // Or return a default value
  }
};