"use client";
import AddAllergens from "@/app/components/AddAllergens";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { mainCourseMenu } from "@/app/data";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/app/firebase";
import { doc, setDoc } from "firebase/firestore";
import { collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from "firebase/storage";
import useMenuCategories from "@/app/hooks/useMenuCategories";
import { useRouter } from "next/navigation";

// MENU CATEGORY
type Category = {
    id: number;
    prodCat: string;
    title: string;
};

// Define the menuCategory array
const menuCategory: Category[] = [
    { id: 1, prodCat: "drinks", title: "Drinks" },
    { id: 2, prodCat: "mainCourseMenu", title: "Main Course" },
    { id: 3, prodCat: "snacksMenu", title: "Snacks" },
    { id: 4, prodCat: "pastriesMenu", title: "Pastries" },
    { id: 5, prodCat: "sandwichesMenu", title: "Sandwiches" },
    { id: 6, prodCat: "pastaMenu", title: "Pasta" }
];

// TYPES PER CATEGORY
//let drinkTypes = ["Coffee", "Non-Coffee"];
//let pastaTypes = ["Pesto", "Non-Pesto"];
//let snackTypes = ["Fries", "Nachos", "Seafood", "Chicken"];
//let sandwichTypes = ["Sandwich"];
//let mainCourseTypes = ["Meat", "Seafood", "Veggie"];
//let pastryTypes = ["Cake", "Cookie", "Tart"];

// ALLERGENS GALING SA ALLERGIESFILTER


// DAPAT NAKA-SMALL LETTERS TAPOS PLURAL
//let selectedCat = "drinks";
// KAPAG SINELECT NI USER ANG YES SA UPSIZE
//let upsize = true;
// EXAMPLE LANG SA CHOSEN ALLERGENS
let mayroongNapilingAllergen = true;

const AddProductPage = () => {
    //   PARA LANG SA POP-UP KAPAG NAG-ADD PRODUCT BUTTON
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    // Menu Category
    const [selectedCat, setSelectedCat] = useState("drinks");
    const [extractedCategory, setExtractedCategory] = useState("drinks");

    const [menuCategories, setMenuCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    // Availability
    const [selectedAvailability, setSelectedAvailability] = useState("available");

    // For Image
    const [imageUrl, setImageUrl] = useState("");

    // For Image's File Name
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // For Product IDs
    const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>("Iced Drinks");

    const [newProdID, setNewProdID] = useState("");

    // For Item's Calorie
    const [calorie, setCalorie] = useState("low");

    // For Item's Name
    const [itemName, setItemName] = useState("");

    // For Item's Price
    const [itemPrice, setItemPrice] = useState<number | "">("");

    // For DRINKS ONLY - Drink's Category
    const [passableSelectedDrinkType, setPassableSelectedDrinkType] = useState<string | null>(null);

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
    const sandwichTypes = ["Meat", "Fish", "Veggie"];
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

    // SET ALLERGIES
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

    const selectRef = useRef<HTMLSelectElement>(null);
    const getSelectedValue = () => {
        if (selectRef.current) {
            const selectedValue = selectRef.current.value;
            console.log("Selected value from dropdown:", selectedValue);
            return selectedValue;
        }
    };

    // Item's Description
    const [desc, setDesc] = useState("");

    const [existingIDs, setExistingIDs] = useState<string[]>([]); // Initialize existing IDs
    const existingIDsRef = useRef<string[]>([]); // Create a ref to store existing IDs
    const itemNameRef = useRef<HTMLInputElement | null>(null);
    const itemPriceRef = useRef<HTMLInputElement | null>(null);
    const drinkSizeRef = useRef<HTMLInputElement | null>(null);
    const drinkUpsizeRef = useRef<HTMLInputElement | null>(null);
    const drinkUpsizePriceRef = useRef<HTMLInputElement | null>(null);
    const descriptionRef = useRef<HTMLTextAreaElement | null>(null); // Update the type

    const router = useRouter(); // Initialize useRouter

    const generateNewID = useCallback((ids: string[], drinkType: keyof typeof drinkTypePrefixes | null) => {

        const drinkTypePrefixes = {
            drink: "drink", // Use 'drink' as the universal prefix
        };

        const prefix = selectedCat === "drinks" ? drinkTypePrefixes.drink : `${extractedCategory}`;
    
        if (!prefix) {
            console.error("Cannot generate ID: invalid prefix", { selectedCat, drinkType });
            return;
        }
    
        const newID = ids.length === 0
            ? `${prefix}1`
            : `${prefix}${Math.max(...ids.map(id => parseInt(id.replace(new RegExp(`^${prefix}`, "i"), ""), 10) || 0)) + 1}`;
    
        setNewProdID(newID);
        console.log("Generated new product ID:", newID);
    }, [selectedCat, extractedCategory]);
    
    useEffect(() => {
        let drinkType: "drink" | null = null;
        if (selectedCat === "drinks") {
            drinkType = selectedDrinkType === "drink" ? "drink" : null;
        } else {
            drinkType = passableSelectedDrinkType === "drink" ? "drink" : null;
        }
    
        generateNewID(existingIDsRef.current, drinkType);
    }, [generateNewID, passableSelectedDrinkType, selectedCat, selectedDrinkType, existingIDsRef]);
    
    useEffect(() => {
        // Get all cookies as an array
        const cookies = document.cookie ? document.cookie.split(';').map(cookie => cookie.trim()) : [];
    
        // Check if no cookies exist
        if (cookies.length === 0) {
          // Redirect if no cookies exist
        router.push('/');
        return;
        }
    
        // Check if the 'user' cookie exists
        const userCookie = cookies.find(cookie => cookie.startsWith('user='));
    
        if (userCookie) {
          // Redirect if the 'user' cookie exists
        router.push('/');
        }
    }, [router]);

    // Effect to update extractedCategory when selectedCat changes
    useEffect(() => {
        const category = selectedCat.replace("Menu", "");
        setExtractedCategory(category);
    }, [selectedCat]);

    useEffect(() => {
        const firstCategory = menuCategories.length > 0 ? menuCategories[0] : null;

        const categoryTypesMap: Record<string, string[]> = {
            drinks: ["Coffee", "Non-Coffee"],
            pastaMenu: ["Pesto", "Non-Pesto"],
            snacksMenu: ["Fries", "Nachos", "Seafood", "Chicken"],
            sandwichesMenu: ["Sandwich"],
            pastriesMenu: ["Cake", "Cookie", "Tart"],
            mainCourseMenu: ["Meat", "Seafood", "Veggie"],
        };

        // Determine the second category based on the selected category
        let secondCategory = null;
        if (firstCategory && categoryTypesMap[selectedCat]) {
            // If there's a valid firstCategory and it's in the categoryTypesMap
            secondCategory = categoryTypesMap[selectedCat][0]; // Set to the first option in the respective category
        }

        if (selectedCat === "drinks" || ["pastaMenu", "snacksMenu", "sandwichesMenu", "pastriesMenu", "mainCourseMenu"].includes(selectedCat)) {
            console.log(`Switching to category: ${selectedCat}`);
            setSelectedDrinkType(secondCategory);
            setPassableSelectedDrinkType(firstCategory);
            setUpsize(selectedCat === "drinks"); // Only enable upsize for drinks
        } else {
            // Reset to null for unhandled categories
            setSelectedDrinkType(null);
            setPassableSelectedDrinkType(null);
            setUpsize(false);
        }
    }, [selectedCat, menuCategories]);

    useEffect(() => {
        if (selectedCat !== "drinks") {
            setUpsize(false); // Set upsize to false if the category is not drinks
        }
    }, [selectedCat]);

    // Effect to fetch IDs and set product ID when drink type changes
    useEffect(() => {
        const drinkType = selectedCat === "drinks" ? selectedDrinkType : passableSelectedDrinkType;
        if (drinkType) {
            fetchExistingIDs(extractedCategory, drinkType);
        }
    }, [extractedCategory, selectedDrinkType, selectedCat, passableSelectedDrinkType]);

    // Effect to generate a new ID based on existing IDs
    useEffect(() => {
        let drinkType: "drink" | null = null;
        if (selectedCat === "drinks") {
            drinkType = selectedDrinkType === "drink" ? "drink" : null;
        } else {
            drinkType = passableSelectedDrinkType === "drink" ? "drink" : null;
        }
    
        generateNewID(existingIDsRef.current, drinkType);
    }, [generateNewID, passableSelectedDrinkType, selectedCat, selectedDrinkType]);

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

    // Effect to set default drink type to "Coffee" if "drinks" is selected
    useEffect(() => {
        if (selectedCat === "drinks" && !selectedDrinkType) {
            setSelectedDrinkType("Coffee");
        }
    }, [selectedCat, selectedDrinkType]);

    const handleDrinkTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setSelectedDrinkType(selectedValue); // Update the state with the new selection
        console.log("Selected type:", selectedValue); // Log the selected type for debugging
    };

    // Function to fetch existing IDs based on the selected category
    const fetchExistingIDs = async (category: string, drinkType: string | null) => {
        try {
            console.log("Fetching IDs from collection:", category);
            const q = query(collection(db, category)); // Use category for the collection name
            const querySnapshot = await getDocs(q);

            // Extract the prodID from each document
            const ids = querySnapshot.docs.map(doc => doc.data().prodID);

            // Update the existingIDs state and ref
            setExistingIDs(ids);
            existingIDsRef.current = ids; // Store in ref for ID generation
        } catch (error) {
            console.error("Error fetching existing IDs: ", error);
        }
    };

    const handleAvailabilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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
        console.log("Selected Drink Type:", passableSelectedDrinkType);
    }, [passableSelectedDrinkType]); // Runs when passableSelectedDrinkType changes

    const handleUploadClick = () => {
    if (fileInputRef.current) {
        // Trigger the file input click
        fileInputRef.current.click();
        }
    };

    // Handler for input change
    const handleItemPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setUpsize(selectedValue === "true"); // Update upsize state based on selected value
        console.log("Upsize selected:", selectedValue === "true"); // Log the updated value
    };

    const handleUpsizeSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const sizeValue = event.target.value; // Get the input value
        const formattedSize = sizeValue ? `${sizeValue}oz` : null; // Format the size with "oz", or set to null
        console.log("Selected Upsize Size:", formattedSize); // Log the formatted size
        setUpsizeSize(formattedSize); // Update the state
    };

    const handleUpsizePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const priceValue = event.target.value; // Get the input value
        const formattedPrice = priceValue ? parseFloat(priceValue) : null; // Parse the value as a float

        // Check if the price exceeds the maximum allowed value (100)
        const cappedPrice = formattedPrice !== null && formattedPrice > 100 ? 100 : formattedPrice;

        console.log("Selected Upsize Price:", cappedPrice); // Log the capped price
        setUpsizePrice(cappedPrice); // Update the state
    };

    // Handle category change
    const handleCategoryChange = (value: string) => {
        setSelectedCat(value); // Update the selected category
        setSelectedAllergens([]); // Reset allergens
        console.log(value); // Log the selected value
    };

    const handleAllergenAdd = (allergens: string[]) => {
        setSelectedAllergens(allergens); // Update selected allergens
        console.log("Selected allergens:", allergens); // Log or handle the selected allergens as needed
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Get the uploaded file
        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
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
                if (e.target) { // Check if e.target is not null
                    imgElement.src = e.target.result as string;
                } else {
                    reject(new Error("FileReader target is null."));
                }
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
    const uploadImageToStorage = async (file: File): Promise<string | null> => {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${file.name.split('.').slice(0, -1).join('.')}.webp`); // Update path to WebP
    
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
            await uploadBytes(storageRef, webpBlob, { contentType: 'image/webp' });
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
    
        // Null check to ensure fileInputRef.current is not null
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
    };

    const fetchPlaceholderImageUrl = async () => {
        const storage = getStorage();
        const storageRef = ref(storage); // Root directory or specify folder if needed
        const files = await listAll(storageRef);
        const placeholderFile = files.items.find(item => item.name === "placeholder-photo.webp");

        if (placeholderFile) {
            return await getDownloadURL(placeholderFile); // Get the download URL
        } else {
            console.warn("Placeholder image not found in storage.");
            return null;
        }
    };

    //   PARA LANG SA POP-UP KAPAG NAG-ADD PRODUCT BUTTON
    const handleSubmit = async () => {
        // Validate required fields
        if (!itemName) {
            if (itemNameRef.current) {
                itemNameRef.current.focus(); // Set focus back to item name
            }
            return; // Exit the function if validation fails
        }
    
        if (!itemPrice) {
            if (itemPriceRef.current) {
                itemPriceRef.current.focus(); // Set focus back to item price
            }
            return; // Exit if item price is not provided
        }

        if (selectedCat === "drinks") {
            if (!drinkSize) {
                if (drinkSizeRef.current) {
                    drinkSizeRef.current.focus();
                }
                return; // Exit if drink size is not provided
            }
            if (upsize && !upsizeSize) {
                if (drinkUpsizeRef.current) {
                    drinkUpsizeRef.current.focus();
                }
                return; // Exit if upsize size is not provided
            }
            if (upsize && !upsizePrice) {
                if (drinkUpsizePriceRef.current) {
                    drinkUpsizePriceRef.current.focus();
                }
                return; // Exit if upsize price is not provided
            }
        }
    
        if (!desc) {
            if (descriptionRef.current) {
                descriptionRef.current.focus();
            }
            return; // Exit if description is not provided
        }

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

            if (toCamelCase(passableSelectedDrinkType || "") === "icedDrinks") {
                addVanilla = 25;
            }
        } else if (selectedCat === "mainCourseMenu") {
            serveMashedPotato = false;
            serveRice = false;
        }

        // Document name from item title
        const documentName = itemName.toLowerCase().replace(/\s+/g, "-");

        // Upload the image if it exists
        let finalImageUrl;
        if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
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
            finalImageUrl = await fetchPlaceholderImageUrl(); // Fallback if no file is uploaded
        }

        function toCamelCase(str: string) {
            return str
                .toLowerCase() // Convert the entire string to lowercase
                .split(" ") // Split the string by spaces
                .map((word, index) =>
                    index === 0
                        ? word // Keep the first word lowercase
                        : word.charAt(0).toUpperCase() + word.slice(1) // Capitalize the first letter of subsequent words
                )
                .join(""); // Join the words back together
        }

        // Prepare data object with individual fields
        const documentData = {
            availability: selectedAvailability,
            calorie: calorie,
            desc: desc,
            img: finalImageUrl,
            price: itemPrice,
            prodCategory: toCamelCase(passableSelectedDrinkType || ""), // Logic for prodCategory
            prodID: newProdID,
            title: itemName,
            type: selectedDrinkType || "",
            contains: selectedAllergens.length > 0 ? selectedAllergens : [""], // Allergens only

            // Optional drink fields
            ...(selectedCat === "drinks" && {
                addEspresso,
                addSyrup,
                milkOat,
                milkAlmond,
                addVanilla,
                currSize: drinkSize || "",
                upsizable: upsize,
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

        // Add to Firestore
        try {
            await setDoc(doc(db, extractedCategory, documentName), documentData);
            console.log("Document successfully written!");

            // Reload the page after a delay
            setTimeout(() => {
                window.location.reload();
            }, 1000); // Adjust the delay as needed
        } catch (error) {
            console.error("Error writing document:", error);
        }
    };

    // Fetch categories from the database based on selected main category
    const fetchCategoriesFromDB = useCallback(async (mainCategory: string) => {
        try {
            // Reference to the menuCategories collection
            const menuCategoriesRef = collection(db, "menuCategories");
    
            // Determine the document based on the selected main category
            let categoriesDoc = null;
            switch (mainCategory) {
                case "drinks":
                    categoriesDoc = doc(menuCategoriesRef, "drinksCategories");
                    break;
                case "mainCourseMenu":
                    categoriesDoc = doc(menuCategoriesRef, "mainCourseCategories");
                    break;
                case "pastriesMenu":
                    categoriesDoc = doc(menuCategoriesRef, "pastriesCategories");
                    break;
                case "snacksMenu":
                    categoriesDoc = doc(menuCategoriesRef, "snacksCategories");
                    break;
                case "sandwichesMenu":
                    categoriesDoc = doc(menuCategoriesRef, "sandwichesCategories");
                    break;
                case "pastaMenu":
                    categoriesDoc = doc(menuCategoriesRef, "pastaCategories");
                    break;
                default:
                    categoriesDoc = null; // Default case, in case no main category is selected
                    break;
            }
    
            console.log("Categories document reference:", categoriesDoc);
    
            if (!categoriesDoc) return;
    
            // Get the document snapshot
            const docSnapshot = await getDoc(categoriesDoc);
    
            console.log("Document snapshot:", docSnapshot);
    
            // If the document exists, extract the categories
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                console.log("Document data:", data);
    
                let allCategories: string[] = [];
                if (data.categories && Array.isArray(data.categories)) {
                    // Extract categories from the document
                    allCategories = data.categories
                        .filter((item) => item.category) // Filter out any items without a category
                        .map((item) => item.category); // Extract the category names
                }
    
                console.log("All categories:", allCategories);
    
                // Format categories for display: Convert category names to a human-readable format
                const formattedCategories = allCategories.map((category) =>
                    category.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
                );
    
                console.log("Formatted categories:", formattedCategories);
    
                setMenuCategories(formattedCategories);
    
                // Reset selectedCategory if it's not a valid option
                if (!selectedCategory || !formattedCategories.includes(selectedCategory)) {
                    setSelectedCategory(formattedCategories[0] || "defaultCategory"); // Use default category if no match
                }
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error fetching categories from database:", error);
        }
    }, [selectedCategory]); // Add selectedCategory as a dependency
    
    // Call the function inside useEffect
    useEffect(() => {
        fetchCategoriesFromDB(selectedCat);
    }, [selectedCat, fetchCategoriesFromDB]);

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
                        <span>Add Product</span>
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
                                {imageUrl && (
                                    <div className="relative group w-52 aspect-square rounded-md border-2 border-gray-100 text-xs mt-2">
                                        {/* Image */}
                                        <Image
                                            src={imageUrl} // Use the preview URL
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
                                )}
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
                                        text-lg text-gray-600 font-semibold bg-white cursor-pointer
                                        h-9 w-full"
                                        onChange={(e) => {
                                            handleCategoryChange(e.target.value);
                                            console.log(e.target.value); // Log the selected value
                                        }}
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
                                        onChange={handleAvailabilityChange} // Handle change event
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
                                    value={fileName} // Set the value to the file name
                                    readOnly // Make the input read-only
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
                                    style={{ display: 'none' }} // Hide the input
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
                                    value={newProdID}
                                    readOnly
                                    required
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
                                    value={calorie} // Bind the selected value to state
                                    onChange={handleCalorieChange} // Attach the change handler
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
                            {/*EDITEDITEDIT*/}
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
                                    className="rounded-md shadow-sm border-2 border-gray-100 text-lg text-gray-600 font-semibold bg-white cursor-pointer py-[5px] w-full text-center"
                                    value={passableSelectedDrinkType || ""} // Use passableSelectedDrinkType as default
                                    onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        setPassableSelectedDrinkType(selectedValue); // Set passableSelectedDrinkType
                                        setSelectedDrinkType(selectedValue); // Set selectedDrinkType
                                    }}
                                >
                                    {menuCategories.length > 0 ? (
                                        menuCategories.map((category, index) => (
                                            <option key={index} value={category}>
                                                {category}
                                            </option>
                                        ))
                                    ) : (
                                        <option>No categories available</option>
                                    )}
                                </select>
                            </div>
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
                                    ref={selectRef}
                                    name="menuItemType"
                                    id="menuItemType"
                                    value={selectedDrinkType ? selectedDrinkType : ""}
                                    onChange={handleDrinkTypeChange}
                                    className="rounded-md shadow-sm border-2 border-gray-100 text-lg text-gray-600 font-semibold bg-white cursor-pointer h-10 w-full"
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
                                    selectedAllergens={selectedAllergens} // Pass the current selected allergens
                                    onAdd={handleAllergenAdd} // Handle adding allergens
                                />
                            </div>
                        </div>

                        {/* DISPLAY CHOSEN ALLERGENS */}
                        {mayroongNapilingAllergen && selectedAllergens.length > 0 && (
                            <div className="w-full flex flex-col gap-1 items-center justify-center">
                                <label className="text-orange-950 text-sm w-full text-left space-x-1" htmlFor="menuItemDescription">
                                    <span>Contains these allergens:</span>
                                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                                        {selectedAllergens.map((allergen, index) => (
                                            <span key={index} className="rounded-full bg-orange-400 py-1.5 text-center font-semibold text-orange-50">
                                                {allergen}
                                            </span>
                                        ))}
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
                                value={desc} // Bind the textarea value to desc state
                                onChange={(e) => setDesc(e.target.value)} // Update desc on change
                                ref={descriptionRef}
                            />
                        </div>
                    </div>
                    <button
                        className="w-full bg-orange-950 font-bold text-xl text-white p-2 rounded-md mt-2
                        shadow-md hover:scale-[1.02] duration-200 hover:bg-orange-900"
                        onClick={() => {
                            handleSubmit();
                        }}
                    >
                        Create Item
                    </button>
                    {/* PRODUCT CREATED POP UP */}
                    {isPopupVisible && <CheckoutPopup message="Product Created!" />}
                </div>
            </div>
        </div>
    );
};

export default AddProductPage;