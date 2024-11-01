"use client";
import { useParams, useRouter } from "next/navigation";
import AddAllergens from "@/app/components/AddAllergens";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { mainCourseMenu, MenuItem } from "@/app/data";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { db } from "@/app/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";

type ProductType = {
  name: string; // The name of the product
  category: string; // The main category of the product (e.g., drinks, pastries, etc.)
  availability: boolean; // Indicates if the product is available
  imageUrl: string; // URL of the product image
  itemDescription: string; // Description of the product
  itemId: string; // Unique identifier for the product
  calorieLevel: string; // Caloric value of the product
  price: number; // Price of the product
  itemCategory: string; // Subcategory (e.g., hotDrinks, blendedDrinks, rice, etc.)
  size: number; // Size of the product (if applicable)
  isUpsize: boolean; // Indicates if the product can be up-sized
  upsizePrice: number; // Optional price for the upsize
  upsizeSize: number; // Optional size for the upsize
  type: string; // Type of the product (e.g., beverage, food)
  allergens: string[]; // List of allergens related to the product
} | null;

// MENU CATEGORY
export const menuCategory = [
  { id: 1, prodCat: "drinks", title: "Drinks" },
  { id: 2, prodCat: "mainCourseMenu", title: "Main Course" },
  { id: 3, prodCat: "snacksMenu", title: "Snacks" },
  { id: 4, prodCat: "pastriesMenu", title: "Pastries" },
  { id: 5, prodCat: "sandwichMenu", title: "Sandwiches" },
  { id: 6, prodCat: "pastaMenu", title: "Pasta" },
];

const EditProductPage = () => {
  const router = useRouter();
  const { id } = useParams(); // Use `useParams` to retrieve the dynamic route parameter
  const [product, setProduct] = useState<ProductType>(null);
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [category, setCategory] = useState("drinks"); // Default category Collection

  //#region variables

  const handleUpdateClick = () => {
    setIsModalVisible(true); // Show the modal when "Update Item" is clicked
  };

  const handleConfirmUpdate = () => {
    setIsModalVisible(false); // Hide the modal
    handleSubmit(); // Call the update function
  };

  const handleCancelUpdate = () => {
    setIsModalVisible(false); // Hide the modal without submitting
  };

  // Menu Category
  const [selectedCat, setSelectedCat] = useState("drinks");
  const [extractedCategory, setExtractedCategory] = useState("drinks");

  // Availability
  const [selectedAvailability, setSelectedAvailability] = useState("available");

  // For Image
  const [imageUrl, setImageUrl] = useState("");

  // For Image's File Name
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // // For Product IDs
  // const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(
  //   "hotDrinks"
  // );
  const [prodID, setProdID] = useState("");

  const drinkTypePrefixes: {
    hotDrinks: string;
    icedDrinks: string;
    blendedDrinks: string;
    affogatoDrinks: string;
  } = {
    hotDrinks: "hd",
    icedDrinks: "id",
    blendedDrinks: "bd",
    affogatoDrinks: "ad",
  };

  const [newProdID, setNewProdID] = useState("");

  // For Item's Calorie
  const [calorie, setCalorie] = useState("low");

  // For Item's Name
  const [itemName, setItemName] = useState("");

  // For Item's Price
  const [itemPrice, setItemPrice] = useState<number | "">("");

  // For DRINKS ONLY - Drink's Category
  /*const [passableSelectedDrinkType, setPassableSelectedDrinkType] =
    useState("hotDrinks");*/
  const [passableSelectedDrinkType, setPassableSelectedDrinkType] = useState<
    string | null
  >(null);

  // For DRINKS ONLY - Drink's Size
  const [drinkSize, setDrinkSize] = useState<string | null>(null);

  // For DRINKS ONLY - Drink's Upsize CHOICE
  const [upsize, setUpsize] = useState<boolean>(true);

  // For DRINKS ONLY - Drink's Upsize SIZE
  const [upsizeSize, setUpsizeSize] = useState<string | null>(null);

  // For DRINKS ONLY - Drink's Upsize PRICE
  const [upsizePrice, setUpsizePrice] = useState<number | null>(null);

  // CATEGORY OF TYPES
  const drinkTypes = ["Coffee", "Non-Coffee"];
  const pastaTypes = ["Pesto", "Non-Pesto"];
  const snackTypes = ["Fries", "Nachos", "Seafood", "Chicken"];
  const sandwichTypes = ["Sandwich"];
  const mainCourseTypes = ["Meat", "Seafood", "Veggie"];
  const pastryTypes = ["Cake", "Cookie", "Tart"];

  // ALLERGIES
  const allergensByCategory: { [key: string]: string[] } = {
    default: ["Peanut", "Fish", "Chicken", "Almond", "Shrimp"],
    pastries: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
    drinks: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
  };

  const allergenOptions =
    selectedCat === "drinks"
      ? allergensByCategory.drinks
      : selectedCat === "pastriesMenu"
      ? allergensByCategory.pastries
      : allergensByCategory.default;

  const [selectedDrinkType, setSelectedDrinkType] = useState("hotDrinks");

  // SET ALLERGIES
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]); //

  const selectRef = useRef<HTMLSelectElement>(null);
  const getSelectedValue = () => {
    if (selectRef.current) {
      const selectedValue = selectRef.current.value;
      console.log("Selected value from dropdown:", selectedValue);
      return selectedValue;
    }
  };

  // Item's Description
  const [itemDescription, setDesc] = useState("");

  const [existingIDs, setExistingIDs] = useState<string[]>([]); // Initialize existing IDs
  const existingIDsRef = useRef<string[]>([]); // Create a ref to store existing IDs
  const itemNameRef = useRef(null);
  const itemPriceRef = useRef(null);
  const drinkSizeRef = useRef(null);
  const drinkUpsizeRef = useRef(null);
  const drinkUpsizePriceRef = useRef(null);
  const descriptionRef = useRef(null);

  // Effect to update extractedCategory when selectedCat changes
  useEffect(() => {
    const category = selectedCat.replace("Menu", "");
    setExtractedCategory(category);
  }, [selectedCat]);

  useEffect(() => {
    const drinkType =
      selectedCat === "drinks" ? selectedDrinkType : passableSelectedDrinkType;
    if (drinkType) {
      //fetchExistingIDs(extractedCategory, drinkType);
    }
  }, [
    extractedCategory,
    selectedDrinkType,
    selectedCat,
    passableSelectedDrinkType,
  ]);

  // Effect to generate a new ID based on existing IDs //
  useEffect(() => {
    const drinkType =
      selectedCat === "drinks" ? selectedDrinkType : passableSelectedDrinkType;
    generateNewID(existingIDsRef.current, drinkType); // Call with the current value of existing IDs
  }, [existingIDs]);

  useEffect(() => {
    // Handle drinkSize bounds
    if (drinkSize !== null && drinkSize !== "") {
      const sizeAsNumber = parseInt(drinkSize);

      if (!isNaN(sizeAsNumber)) {
        if (sizeAsNumber < 1) {
          setDrinkSize("1");
        } else if (sizeAsNumber > 30) {
          setDrinkSize("30");
        }
      }
    }

    // Handle upsizeSize bounds
    if (upsizeSize !== null && upsizeSize !== "") {
      const sizeAsNumber = parseInt(upsizeSize);

      if (!isNaN(sizeAsNumber)) {
        if (sizeAsNumber < 1) {
          setUpsizeSize("1");
        } else if (sizeAsNumber > 30) {
          setUpsizeSize("30");
        }
      }
    }
  }, [drinkSize, upsizeSize]);

  const handleDrinkTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedDrinkType(selectedValue); // Update the state with the new selection
    console.log("Selected type:", selectedValue); // Log the selected type for debugging
  };

  // Function to generate a new product ID
  const generateNewID = (
    ids: string[],
    drinkType: keyof typeof drinkTypePrefixes | null
  ) => {
    const prefix =
      selectedCat === "drinks" && drinkType
        ? drinkTypePrefixes[drinkType]
        : `${extractedCategory}`;

    if (!prefix) {
      console.error("Cannot generate ID: invalid prefix", {
        selectedCat,
        drinkType,
      });
      return; // Early return if no prefix is available
    }

    // Generate the new ID
    const newID =
      ids.length === 0
        ? `${prefix}1`
        : `${prefix}${
            Math.max(
              ...ids.map(
                (id) =>
                  parseInt(id.replace(new RegExp(`^${prefix}`, "i"), ""), 10) ||
                  0
              )
            ) + 1
          }`;

    setNewProdID(newID);
    console.log("Generated new product ID:", newID);
  };

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    console.log("Selected Availability:", selectedValue); // Log the selected value
    setSelectedAvailability(selectedValue); // Update the state
  };

  const handleCalorieChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value; // Get the selected value
    console.log("Selected Calorie Level:", selectedValue); // Log the selected value
    setCalorie(selectedValue); // Update the state
  };

  const handleItemNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setItemName(newValue); // Update the state
  };

  useEffect(() => {
    //console.log("Selected Drink Type:", passableSelectedDrinkType);
  }, [passableSelectedDrinkType]); // Runs when passableSelectedDrinkType changes

  const handleUploadClick = () => {
    // Trigger the file input click
    fileInputRef.current.click();
  };

  // Handler for input change
  const handleItemPriceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    setItemPrice(newValue === "" ? "" : parseFloat(newValue)); // Convert to number or set to empty string
  };

  // Method to handle size input change
  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sizeValue = event.target.value;
    const formattedSize = sizeValue ? `${sizeValue}oz` : null; // Combine number with "oz", or set to null
    console.log("Selected Drink Size:", formattedSize); // Log the formatted size
    setDrinkSize(formattedSize); // Update the state
  };

  const handleUpsizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value; // Get the selected value from the dropdown
    const isUpsize = selectedValue === "true"; // Determine if upsize is selected
    setUpsize(isUpsize); // Update upsize state based on selected value

    if (!isUpsize) {
      setUpsizeSize("0"); // Set upsizeSize to 0 if upsize is false
      setUpsizePrice(0); // Set upsizePrice to 0 if upsize is false
    }

    console.log("Upsize selected:", isUpsize); // Log the updated value
  };

  const handleUpsizeSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const sizeValue = event.target.value; // Get the input value
    const formattedSize = sizeValue ? `${sizeValue}oz` : null; // Format the size with "oz", or set to null
    console.log("Selected Upsize Size:", formattedSize); // Log the formatted size
    setUpsizeSize(formattedSize); // Update the state
  };

  const handleUpsizePriceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const priceValue = event.target.value; // Get the input value
    const formattedPrice = priceValue ? parseFloat(priceValue) : null; // Parse the value as a float

    // Check if the price exceeds the maximum allowed value (100)
    const cappedPrice =
      formattedPrice !== null && formattedPrice > 100 ? 100 : formattedPrice;

    console.log("Selected Upsize Price:", cappedPrice); // Log the capped price
    setUpsizePrice(cappedPrice); // Update the state
  };

  const selectedCatRef = useRef(selectedCat);
  useEffect(() => {
    selectedCatRef.current = selectedCat; // Update the ref whenever selectedCat changes
  }, [selectedCat]);

  useEffect(() => {
    const category = selectedCat.replace("Menu", "");
    setExtractedCategory(category);
  }, [selectedCat]);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCat(value); // Update the selected category
    setSelectedAllergens([]); // Reset allergens
    console.log(value); // Log the selected value
  };

  // When you want to set the selectedCat on visit
  useEffect(() => {
    // Set the initial value of selectedCat when the component mounts
    setSelectedCat(selectedCatRef.current);
  }, []); // Empty dependency array to run only on mount

  const handleAllergenAdd = (newAllergens: string[]) => {
    // Filter out any empty strings before updating state
    const filteredAllergens = newAllergens.filter(
      (allergen) => allergen !== ""
    );
    setSelectedAllergens(filteredAllergens); // Update selected allergens
  };

  //#region Image Hooks

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Get the uploaded file
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        console.error("Invalid file type. Please upload a PNG or JPEG.");
        return;
      }
      setFileName(file.name); // Update the file name in state
      const previewUrl = URL.createObjectURL(file); // Create a local URL for preview
      setImageUrl(previewUrl); // Update the image preview state

      try {
        // Convert and upload the image immediately
        const webpUrl = await uploadImageToStorage(file); // Upload the image and get the URL
        console.log("Uploaded image URL:", webpUrl);
      } catch (error) {
        console.error("Error during image processing:", error);
      }
    }
  };

  // Function to convert image to WebP using canvas
  const convertImageToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const imgElement = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        imgElement.src = e.target.result as string;
      };

      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgElement, 0, 0);

          // Convert to WebP format
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Conversion to WebP failed."));
            }
          }, "image/webp");
        } else {
          reject(new Error("Canvas context is null."));
        }
      };

      imgElement.onerror = (err) => {
        reject(err);
      };

      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsDataURL(file); // Read the file as Data URL
    });
  };

  // Function to upload image to Firebase Storage
  const uploadImageToStorage = async (file) => {
    const storage = getStorage();
    const storageRef = ref(
      storage,
      `images/${file.name.split(".").slice(0, -1).join(".")}.webp`
    ); // Update path to WebP

    try {
      // Convert the image to WebP format
      const webpBlob = await convertImageToWebP(file);
      console.log("WebP Blob size:", webpBlob.size); // Log size for debugging
      console.log("WebP Blob type:", webpBlob.type); // Should be 'image/webp'

      // Create URL for the WebP Blob to preview
      const webpUrl = URL.createObjectURL(webpBlob);
      console.log("Converted to WebP:", webpUrl); // Log the WebP URL
      setImageUrl(webpUrl); // Set this URL for preview, if needed

      // Upload the WebP file
      await uploadBytes(storageRef, webpBlob, { contentType: "image/webp" });
      const downloadUrl = await getDownloadURL(storageRef); // Get the download URL
      return downloadUrl; // Return the URL
    } catch (error) {
      console.error("Error uploading image:", error);
      return null; // Return null if there's an error
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(""); // Remove the image preview
    setFileName(""); // Clear the file name
    fileInputRef.current.value = ""; // Clear the file input
  };

  const fetchPlaceholderImageUrl = async () => {
    const storage = getStorage();
    const storageRef = ref(storage); // Root directory or specify folder if needed
    const files = await listAll(storageRef);
    const placeholderFile = files.items.find(
      (item) => item.name === "placeholder-photo.webp"
    );

    if (placeholderFile) {
      return await getDownloadURL(placeholderFile); // Get the download URL
    } else {
      console.warn("Placeholder image not found in storage.");
      return null;
    }
  };
  //#endregion

  // Fetch product from Firestore
  const fetchProduct = async (collectionRef) => {
    if (typeof id === "string") {
      const docRef = doc(db, collectionRef, id);
      console.log(`Document ID: ${id}`);
      console.log(`Document Reference: ${docRef.path}`);

      try {
        const docSnap = await getDoc(docRef);
        console.log(
          "Document Snapshot:",
          docSnap.exists() ? "Exists" : "Does not exist"
        );

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Extract allergens and ensure it's an array
          const fetchedAllergens = Array.isArray(data.contains)
            ? data.contains
            : [];

          console.log("Product Data:", data);

          // Extract the size and convert it to a number
          const sizeWithUnit = data.currSize || "0oz"; // Fallback to '0oz' if undefined
          const sizeValue = parseFloat(sizeWithUnit); // Extract numeric part
          const upsizeWithUnit = data.upsizeSize || "0oz"; // Fallback to '0oz' if undefined
          const upsizeValue = parseFloat(upsizeWithUnit); // Extract numeric part for display

          // Ensure the data matches the ProductType structure
          const fetchedProduct: ProductType = {
            name: data.title,
            category: data.prodCategory,
            availability: data.availability,
            imageUrl: data.img,
            itemDescription: data.desc,
            itemId: data.prodID,
            calorieLevel: data.calorie,
            price: data.price,
            itemCategory: data.prodCategory,
            size: sizeValue,
            isUpsize: data.upsize,
            upsizePrice: data.upsizePrice,
            upsizeSize: upsizeValue,
            type: data.type,
            allergens: fetchedAllergens,
          };

          // Extract the filename from the imageUrl
          const imageUrl = fetchedProduct.imageUrl;
          const imageFilename = imageUrl.split("/").pop().split("?")[0];

          // Set the state with the fetched product data
          setProduct(fetchedProduct);
          setImageUrl(fetchedProduct.imageUrl);
          setFileName(imageFilename);
          setSelectedAvailability(fetchedProduct.availability);
          setProdID(fetchedProduct.itemId);
          setItemName(fetchedProduct.name);
          setCalorie(fetchedProduct.calorieLevel);
          setItemPrice(fetchedProduct.price);
          setPassableSelectedDrinkType(fetchedProduct.itemCategory);
          setDrinkSize(`${fetchedProduct.size}oz`);
          setUpsize(fetchedProduct.isUpsize);
          console.log(fetchedProduct.isUpsize);
          setUpsizeSize(`${fetchedProduct.upsizeSize}oz`);
          setUpsizePrice(fetchedProduct.upsizePrice);
          setSelectedDrinkType(fetchedProduct.type);
          setSelectedAllergens(
            fetchedAllergens.filter((allergen) => allergen !== "")
          );
          setDesc(fetchedProduct.itemDescription);

          // Set the selected category based on fetched product data
          //setSelectedCat(fetchedProduct.category); // Set the selected category here
          // Validate the fetched category against valid categories
          const validCategories = menuCategory.map((cat) => cat.prodCat); // Assuming menuCategory is an array of valid categories
          if (validCategories.includes(fetchedProduct.category)) {
            setSelectedCat(fetchedProduct.category); // Set the selected category here
          } else {
            setSelectedCat("drinks"); // Default to "drinks" if the fetched category is invalid
          }
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Invalid document ID");
      setLoading(false);
    }
  };

  // Fetching all collections
  useEffect(() => {
    fetchProduct("drinks");
  }, [id]);

  useEffect(() => {
    fetchProduct("mainCourse");
  }, [id]);

  useEffect(() => {
    fetchProduct("snacks");
  }, [id]);

  useEffect(() => {
    fetchProduct("pastries");
  }, [id]);

  useEffect(() => {
    fetchProduct("sandwiches");
  }, [id]);

  useEffect(() => {
    fetchProduct("pasta");
  }, [id]);

  const passableSelectedDrinkTypeRef = useRef(passableSelectedDrinkType);
  useEffect(() => {
    passableSelectedDrinkTypeRef.current = passableSelectedDrinkType;
  }, [passableSelectedDrinkType]);

  const selectedDrinkTypeRef = useRef(selectedDrinkType);
  useEffect(() => {
    selectedDrinkTypeRef.current = selectedDrinkType; // Update the ref whenever selectedDrinkType changes
  }, [selectedDrinkType]);
  // When you want to set the selectedDrinkType on visit
  useEffect(() => {
    // Set the initial value of selectedDrinkType when the component mounts
    setSelectedDrinkType(selectedDrinkTypeRef.current);
  }, []); // Empty dependency array to run only on mount

  const handleSubmit = async () => {
    // Optional ingredients with default values of null
    let addEspresso = null;
    let addSyrup = null;
    let milkOat = null;
    let milkAlmond = null;
    let addVanilla = null;
    let serveMashedPotato = null;
    let serveRice = null;

    // Assign values conditionally based on selected category
    if (selectedCat === "drinks") {
      addEspresso = 30;
      addSyrup = 30;
      milkOat = 40;
      milkAlmond = 30;

      const currentDrinkType = passableSelectedDrinkTypeRef.current;
      if (currentDrinkType === "icedDrinks") {
        addVanilla = 25;
      }
    } else if (selectedCat === "mainCourseMenu") {
      serveMashedPotato = false;
      serveRice = false;
    }

    // Upload the image if it exists
    let finalImageUrl;
    if (fileInputRef.current.files[0]) {
      const file = fileInputRef.current.files[0]; // Get the uploaded file
      try {
        finalImageUrl = await uploadImageToStorage(file); // Upload the image and get the URL
        if (!finalImageUrl) {
          console.error("Image upload failed, using placeholder.");
          finalImageUrl = await fetchPlaceholderImageUrl(); // Use placeholder if upload fails
        }
      } catch (error) {
        console.error("Error during image processing:", error);
        finalImageUrl = await fetchPlaceholderImageUrl(); // Fallback if there's an error
      }
    } else {
      //  If no image is uploaded method

      // Fetch the existing document to get the current image if no new file is uploaded
      let existingDocumentData = {};
      try {
        const docRef = doc(db, extractedCategory, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          existingDocumentData = docSnap.data();
          finalImageUrl = existingDocumentData.img; // Use existing image URL
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }

      // If still no image URL, use placeholder
      if (!finalImageUrl) {
        finalImageUrl = await fetchPlaceholderImageUrl(); // Fallback if no image is found
      }
    }

    const documentData = {
      prodCategory:
        selectedCat === "drinks" ? passableSelectedDrinkType : selectedCat,
      img: finalImageUrl,
      availability: selectedAvailability,
      calorie: calorie,
      title: itemName,
      prodID: prodID,
      price: itemPrice,
      upsize,
      type: selectedDrinkType,
      contains: selectedAllergens,
      desc: itemDescription,

      // Optional drink fields
      ...(selectedCat === "drinks" && {
        addEspresso,
        addSyrup,
        milkOat,
        milkAlmond,
        addVanilla,
        currSize: drinkSize || "",
        ...(upsize && {
          upsizePrice: upsizePrice || 10,
          upsizeSize: upsizeSize || "12oz",
        }),
      }),

      // Optional main course fields
      ...(selectedCat === "mainCourseMenu" && {
        serveMashedPotato,
        serveRice,
      }),

      // Optional upsize fields, only if upsizable
      ...(upsize && {
        upsizePrice: upsizePrice || 10,
        upsizeSize: upsizeSize || "12oz",
      }),
    };

    // Show popup only after validation passes
    setIsPopupVisible(true);
    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);

    // Filter out undefined values
    const filteredDocumentData = Object.fromEntries(
      Object.entries(documentData).filter(([_, value]) => value !== undefined)
    );

    // Fetch the existing document to compare fields
    let existingDocumentData = {};
    try {
      const docRef = doc(db, extractedCategory, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        existingDocumentData = docSnap.data();
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }

    // Create a new object for the update
    const updateData = { ...filteredDocumentData };

    // Check for fields to remove
    for (const key in existingDocumentData) {
      if (!(key in filteredDocumentData)) {
        updateData[key] = deleteField(); // Mark field for deletion
      }
    }

    try {
      const docRef = doc(db, extractedCategory, id);
      await updateDoc(docRef, updateData);
      console.log("Document successfully updated!");
      setIsPopupVisible(true);
      setTimeout(() => setIsPopupVisible(false), 750);
      router.push("/fkstllproduct");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full flex items-center justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[720px] flex flex-col gap-4">
        {/* HEADER CONTAINER */}
        <div className="flex justify-start items-center gap-2">
          {/* LINK BACK TO PRODUCTS */}
          <Link
            href={"/fkstllproduct"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-2xl text-left hover:text-orange-800 cursor-pointer"
          >
            Product List
          </Link>
          <div className="text-2xl font-bold text-orange-950 space-x-2 flex items-center">
            <i className="fa fa-angle-right" aria-hidden="true"></i>
            <span>Edit Product</span>
          </div>
        </div>
        {/* FORM CONTAINER */}
        <div
          className="bg-white border-2 border-gray-100 rounded-md shadow-lg px-4 pt-4
        pb-3 flex flex-col gap-2"
        >
          {/* UPLOAD IMAGE */}
          <div className="flex flex-col justify-between items-center gap-3">
            <div className="w-full flex justify-between gap-2 items-center">
              {/* IMAGE CONTAINER */}
              <div className="w-52 aspect-square rounded-md relative border-2 border-gray-100 text-xs">
                {/* Display the image preview */}
                <div className="relative group w-52 aspect-square rounded-md border-2 border-gray-100 text-xs mt-2">
                  {/* Image */}
                  <Image
                    src={imageUrl} // Use the preview URL or the product's image URL
                    alt="Product Image"
                    fill
                    className="object-contain rounded-md"
                  />

                  {/* Overlay for dimming effect */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>

                  {/* White "X" button centered */}
                  <button
                    onClick={handleRemoveImage} // Remove the image on click
                    className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    &#x2715; {/* Unicode for the "X" */}
                  </button>
                </div>
              </div>
              {/* MENU CATEGORY AND AVAILABILITY */}
              <div className="w-full flex flex-col justify-between items-center">
                {/* MENU CATEGORY */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemPrice"
                  >
                    <span>Menu Category</span>
                  </label>
                  <select
                    name="menuCategory"
                    id="menuCat"
                    className="rounded-md shadow-sm border-2 border-gray-100
                text-lg text-gray-600 font-semibold bg-white
                h-9 w-full"
                    value={selectedCat} // Use selectedCat instead of product.category
                    disabled // Make the select element read-only
                  >
                    {menuCategory.map((cats) => (
                      <option
                        value={cats.prodCat}
                        key={cats.id}
                        className="text-center"
                      >
                        {cats.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AVAILABILITY */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemPrice"
                  >
                    <span>Availability</span>
                  </label>
                  <select
                    name="menuAvailability"
                    id="menuCatAvailability"
                    className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-9 w-full text-center"
                    value={selectedAvailability} // Bind value to state
                    onChange={handleAvailabilityChange} // Handle change
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>
            {/* UPLOAD BUTTON AND PRODUCT ID */}
            <div className="w-full flex flex-col gap-1.5 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="prodID"
              >
                <span>Image</span>
              </label>
              <div className="flex w-full justify-between gap-2">
                <input
                  className="border-2 border-solid border-orange-900 w-1/2 h-10 pl-4 rounded-md bg-orange-50"
                  name="prodImg"
                  id="inputProdImg"
                  type="text"
                  placeholder="File Name"
                  value={fileName}
                  readOnly
                />
                {/* UPLOAD BUTTON */}
                <button
                  className="h-10 w-1/2 font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md
                                    hover:bg-gray-50 hover:scale-[1.02] duration-200"
                  onClick={handleUploadClick}
                >
                  Upload
                </button>

                <input
                  type="file"
                  accept="image/*" // Accept image files only
                  ref={fileInputRef} // Attach the ref
                  style={{ display: "none" }} // Hide the input
                  onChange={handleFileChange}
                />
              </div>
            </div>
            {/* ID AND CALORIE */}
            <div className="w-full flex justify-between items-center gap-2">
              {/* PRODUCT ID */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="prodID"
                >
                  <span>ID</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="prodID"
                  id="inputProdID"
                  type="text"
                  placeholder="Item ID"
                  required
                  value={prodID} //value={newProdID} if category changed
                  readOnly
                />
              </div>
              {/* CALORIE */}
              <div className="flex flex-col gap-1 items-center justify-center flex-1">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="calorieLevel"
                >
                  <span>Calorie Level</span>
                </label>
                <select
                  name="calorieLevel"
                  id="calorieLevel"
                  className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                  defaultValue={calorie}
                  onChange={handleCalorieChange}
                >
                  <option value="low">Low</option>
                  <option value="med">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {/* MENU ITEM NAME */}
            <div className="w-full flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="menuItemName"
              >
                <span>Name</span>
              </label>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                name="menuItemName"
                id="inputMenuItemName"
                type="text"
                placeholder="Item Name"
                required
                value={itemName} // Bind input value to state
                onChange={handleItemNameChange} // Handle input changes
                ref={itemNameRef} // Attach the ref here
              />
            </div>
            {/* PRICE AND CATEGORY */}
            <div className="w-full flex gap-2 items-center justify-between flex-1">
              {/* MENU ITEM PRICE */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="menuItemPrice"
                >
                  <span>Price</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="menuItemPrice"
                  id="inputMenuItemPrice"
                  type="number"
                  placeholder="Price"
                  required
                  value={itemPrice} // Bind input value to state
                  onChange={handleItemPriceChange} // Handle input changes
                  ref={itemPriceRef}
                />
              </div>
              {/* PRODUCT CATEGORY - KAPAG HINDI DRINK, AUTOMATIC NA KUNG ANO ANG MENU CATEGORY NILA*/}
              {selectedCat === "drinks" && (
                //PRODUCT CATEGORY FOR DRINKS
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="catDrinks"
                  >
                    <span>Item Category</span>
                  </label>
                  <select
                    name="catDrinks"
                    id="catDrinks"
                    className="rounded-md shadow-sm border-2 border-gray-100
                                    text-lg text-gray-600 font-semibold bg-white cursor-pointer
                                    py-[5px] w-full text-center"
                    value={passableSelectedDrinkType || "hotDrinks"} // Use passableSelectedDrinkType as default
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      setPassableSelectedDrinkType(selectedValue); // Set passableSelectedDrinkType
                      setSelectedDrinkType(selectedValue); // Set selectedDrinkType
                    }}
                  >
                    <option value="hotDrinks">Hot Drink</option>
                    <option value="icedDrinks">Iced Drink</option>
                    <option value="blendedDrinks">Blended Drink</option>
                    <option value="affogatoDrinks">Affogato Drink</option>
                  </select>
                </div>
              )}
            </div>

            {selectedCat === "drinks" && (
              <div className="w-full flex gap-2 justify-between items-center">
                {/* CURRENT SIZE */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="currSize"
                  >
                    <span>Size</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                    name="currSize"
                    id="inputCurrSize"
                    type="number"
                    placeholder="Oz"
                    min="1" // Set minimum value
                    max="30" // Set maximum value
                    required
                    value={drinkSize ? drinkSize.replace("oz", "") : ""}
                    onChange={handleSizeChange}
                    ref={drinkSizeRef}
                  />
                </div>
                {/* UPSIZE? */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemType"
                  >
                    <span>Upsize?</span>
                  </label>
                  <select
                    name="menuItemType"
                    id="menuItemType"
                    className="rounded-md shadow-sm border-2 border-gray-100
                                        text-lg text-gray-600 font-semibold bg-white cursor-pointer
                                        h-10 w-full text-center"
                    value={upsize ? "true" : "false"}
                    onChange={handleUpsizeChange}
                  >
                    <option value={"true"}>Yes</option>
                    <option value={"false"}>No</option>
                  </select>
                </div>
              </div>
            )}
            {upsize && (
              <div className="w-full flex gap-2 justify-between items-center">
                {/* UPSIZE SIZE */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="upSize"
                  >
                    <span>Upsize Size</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                    name="upSize"
                    id="inputUpSize"
                    type="number"
                    placeholder="Oz"
                    required
                    min="1" // Set minimum value
                    max="30" // Set maximum value
                    value={upsizeSize ? upsizeSize.replace("oz", "") : ""} // Display only the number in the input
                    onChange={handleUpsizeSizeChange} // Attach the change handler
                    ref={drinkUpsizeRef}
                  />
                </div>
                {/* UPSIZE PRICE */}
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="menuItemType"
                  >
                    <span>Additional Price</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                    name="upSizePrice"
                    id="inputUpsizePrice"
                    type="number"
                    placeholder="Additional"
                    required
                    min="0"
                    max="100"
                    value={upsizePrice !== null ? upsizePrice : ""} // Display the number or an empty string
                    onChange={handleUpsizePriceChange} // Attach the change handler
                    ref={drinkUpsizePriceRef}
                  />
                </div>
              </div>
            )}
            {/* PRODUCT TYPE AND ALLERGEN */}
            <div className="w-full flex justify-between items-center gap-2">
              {/* PRODUCT TYPE */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="menuItemType"
                >
                  <span>Type</span>
                </label>
                <select
                  name="menuItemType"
                  id="menuItemType"
                  className="rounded-md shadow-sm border-2 border-gray-100 text-lg text-gray-600 font-semibold bg-white cursor-pointer h-10 w-full"
                  value={selectedDrinkType || ""}
                  onChange={handleDrinkTypeChange}
                  ref={selectRef}
                >
                  {(selectedCat === "drinks"
                    ? drinkTypes
                    : selectedCat === "snacksMenu"
                    ? snackTypes
                    : selectedCat === "sandwichesMenu"
                    ? sandwichTypes
                    : selectedCat === "pastaMenu"
                    ? pastaTypes
                    : selectedCat === "pastriesMenu"
                    ? pastryTypes
                    : mainCourseTypes
                  ).map((types) => (
                    <option value={types} className="text-center" key={types}>
                      {types}
                    </option>
                  ))}
                </select>
              </div>
              {/* ADD ALLERGEN BUTTON */}
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="btnAllergen"
                >
                  <span>Allergen</span>
                </label>
                <AddAllergens
                  selectedCat={selectedCat}
                  selectedAllergens={selectedAllergens}
                  onAdd={handleAllergenAdd}
                />
              </div>
            </div>

            {/* DISPLAY CHOSEN ALLERGENS */}
            {selectedAllergens.length > 0 ? ( // Check if there are selected allergens
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="menuItemDescription"
                >
                  <span>Contains these allergens:</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {selectedAllergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-orange-400 py-1.5 text-center font-semibold text-orange-50"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </label>
              </div>
            ) : (
              // If no allergens are selected
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="menuItemDescription"
                >
                  <span>Contains these allergens:</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    <span className="text-gray-500">None</span>{" "}
                    {/* Message when no allergens are selected */}
                  </div>
                </label>
              </div>
            )}

            {/* MENU ITEM DESCRIPTION */}
            <div className="w-full flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="menuItemDescription"
              >
                <span>Description</span>
              </label>
              <textarea
                className="border-2 border-solid border-orange-900 w-full pl-4 rounded-md 
                bg-orange-50 pt-1.5"
                name="menuItemDescription"
                id="inputMenuItemDescription"
                placeholder="Item Description"
                rows={3}
                style={{ resize: "none" }}
                required
                value={itemDescription} // Bind the textarea value to desc state
                onChange={(e) => setDesc(e.target.value)} // Update desc on change
                ref={descriptionRef}
              />
            </div>
          </div>
          <button
            className="w-full bg-orange-950 font-bold text-xl text-white p-2 rounded-md mt-2
                        shadow-md hover:scale-[1.02] duration-200 hover:bg-orange-900"
            onClick={() => {
              handleUpdateClick();
            }}
          >
            Update Item
          </button>
          {/* PRODUCT CREATED POP UP */}
          {isPopupVisible && <CheckoutPopup message="Product Updated!" />}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Update</h2>
            <p className="mb-4">
              Are you sure you want to update this product?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md font-semibold text-gray-700 hover:scale-105 duration-200"
                onClick={handleCancelUpdate}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-orange-950 text-white rounded-md font-semibold hover:bg-orange-900 hover:scale-105 duration-200"
                onClick={handleConfirmUpdate}
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductPage;
