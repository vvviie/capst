import { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Drinks, Pastries, Pasta, Sandwiches, MainCourse, Snacks } from "../data";

interface Product {
  title: string;
  price: number;
  desc: string;
  availability: string;
  calorie: string;
  addEspresso?: number;
  addSyrup?: number;
  milkAlmond?: number;
  milkOat?: number;
  img?: string;
  prodCategory?: string;
  prodID?: string;
}

type ProductType =
  | Drinks
  | Pastries
  | Pasta
  | Sandwiches
  | MainCourse
  | Snacks;

  const useProduct = (slug: string, type: string) => {
    const [product, setProduct] = useState<Product | null>(null);
  
    useEffect(() => {
      const fetchProduct = async () => {
        try {
          console.log('Fetching product:', slug, type);
  
          if (!db) {
            console.error('Firebase db instance is null or undefined');
            return;
          }
  
          let collectionRef;
          switch (type) {
            case "drinks":
              collectionRef = collection(db, "drinks");
              break;
            case "pastries":
              collectionRef = collection(db, "pastries");
              break;
            case "pasta":
              collectionRef = collection(db, "pasta");
              break;
            case "sandwiches":
              collectionRef = collection(db, "sandwiches");
              break;
            case "mainCourse":
              collectionRef = collection(db, "mainCourse");
              break;
            case "snacks":
              collectionRef = collection(db, "snacks");
              break;
            default:
              console.error("Invalid product type:", type);
              return;
          }
  
          const productDocRef = doc(collectionRef, slug);
          const productSnapshot = await getDoc(productDocRef);
  
          console.log(slug);
          console.log(type);
          
          if (!productSnapshot.exists()) {
            console.log("No matching document.");
            setProduct(null);
            return;
          }
  
          const productData = productSnapshot.data() as Product;
          const { title, price, desc, availability, calorie, addEspresso, addSyrup, milkAlmond, milkOat, img, prodCategory, prodID } = productData;
          setProduct({ title, price, desc, availability, calorie, addEspresso, addSyrup, milkAlmond, milkOat, img, prodCategory, prodID });
        } catch (err) {
          console.error("Error fetching Product:", err);
        }
      };
  
      fetchProduct();
    }, [slug, type]);
  
    return { product };
  };
  
  export default useProduct;