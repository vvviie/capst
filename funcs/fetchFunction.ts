import { db } from "../src/app/firebase";
import { Drinks } from "@/app/data";  // Adjust the import path accordingly
import { collection, query, where, getDocs } from "firebase/firestore";

export const fetchHotDrinks = async (): Promise<Drinks[]> => {
    try {
        // Get a reference to the 'drinks' collection
        const drinksCollection = collection(db, 'drinks');
        
        // Create a query against the collection
        const q = query(drinksCollection, where('prodCategory', '==', 'hotDrinks'));
        
        // Execute the query
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.log('No matching documents.');
            return [];
        }

        // Map the snapshot documents to the Drinks type
        const drinks: Drinks[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,  // Use doc.id for the document ID
                title: data.title,
                desc: data.desc,
                type: data.type,
                img: data.img,
                price: data.price,
                availability: data.availability,
                calorie: data.calorie,
                options: data.options || [],
                addtionals: data.addtionals || [],
                milk: data.milk || []
            };
        });

        return drinks;
    } catch (error) {
        console.error('Error fetching hot drinks:', error);
        return [];
    }
};