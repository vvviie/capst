// src/app/lib/firebaseUtils.js
import { db } from "@/app/firebase"; // Adjust the import based on your file structure
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { FooterData, FeaturedItem, Item } from "../hooks/types";

// Fetch featured items and map them to Item type
export const fetchFeaturedItems = async (): Promise<Item[]> => {
  return new Promise((resolve, reject) => {
    const items: Item[] = [];
    const unsubscribe = onSnapshot(
      collection(db, "featuredItems"),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Map Firestore data to the Item interface
          const item: Item = {
            id: doc.id,            // Ensure you are including the id
            title: data.name,      // Example: Firestore 'name' maps to 'title'
            desc: data.description, // Map description
            img: data.imgUrl ? data.imgUrl : "", 
            fromDB: data.fromDB,           // Flag to indicate it's from the DB
            price: data.price,     // Ensure price is mapped correctly
          };
          items.push(item);
        });
        resolve(items);
        unsubscribe(); // Stop listening after fetching
      },
      (error) => {
        console.error("Error fetching featured items:", error);
        reject(error);
        unsubscribe(); // Ensure the listener is unsubscribed in case of an error
      }
    );
  });
};

// Fetch footer data
export const fetchFooterData = async (): Promise<FooterData> => {
  const docRef = doc(db, "webContent", "footerSection");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as FooterData; // Assert the data type
  } else {
    console.log("No such document! Returning default data.");
    // Return default values to match the expected structure
    return {
      aboutUs: "",
      location: "",
      operatingDays: "",
      openHours: "",
      accessibility: "",
      img: [],
    };
  }
};
