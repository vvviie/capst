"use client";
import AddAllergens from "@/app/components/AddAllergens";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { mainCourseMenu } from "@/app/data";
import Image from "next/image";
import Link from "next/link";
import React, { useRef ,useState, useEffect } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs, query, where } from 'firebase/firestore';


// MENU CATEGORY
export const menuCategory = [
    {
        id: 1,
        prodCat: "drinks",
        title: "Drinks",
    },
    {
        id: 2,
        prodCat: "mainCourseMenu",
        title: "Main Course",
    },
    {
        id: 3,
        prodCat: "snacksMenu",
        title: "Snacks",
    },
    {
        id: 4,
        prodCat: "pastriesMenu",
        title: "Pastries",
    },
    {
        id: 5,
        prodCat: "sandwichesMenu",
        title: "Sandwiches",
    },
    {
        id: 6,
        prodCat: "pastaMenu",
        title: "Pasta",
    },
];

// TYPES PER CATEGORY
let drinkTypes = ["Coffee", "Non-Coffee"];
let pastaTypes = ["Pesto", "Non-Pesto"];
let snackTypes = ["Fries", "Nachos", "Seafood", "Chicken"];
let sandwichTypes = ["Sandwich"];
let mainCourseTypes = ["Meat", "Seafood", "Veggie"];
let pastryTypes = ["Cake", "Cookie", "Tart"];

// ALLERGENS GALING SA ALLERGIESFILTER
const allergensByCategory: { [key: string]: string[] } = {
    default: ["Peanut", "Fish", "Chicken", "Almond", "Shrimp"],
    pastries: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
    drinks: ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Wheat", "Soy"],
};

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
    
    // Availability
    const [selectedAvailability, setSelectedAvailability] = useState("available");

    // For Image
    const [imageUrl, setImageUrl] = useState("");

    // For Image's File Name
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef(null);

    // For Product IDs
    const [selectedDrinkType, setSelectedDrinkType] = useState("hotDrinks");

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

     // Effect to update extractedCategory when selectedCat changes
    useEffect(() => {
        const category = selectedCat.replace("Menu", "");
        setExtractedCategory(category);
    }, [selectedCat]);

    // Effect to fetch existing IDs whenever extractedCategory changes
    useEffect(() => {
        if (selectedCat === "drinks") {
            setSelectedDrinkType("hotDrinks");
            // If the selected category is drinks, pass the drink type
            fetchExistingIDs(extractedCategory, selectedDrinkType);
        } else {
            // For other categories, just pass the category
            fetchExistingIDs(extractedCategory, null);
        }
    }, [extractedCategory, selectedDrinkType]);

    // Function to fetch existing IDs based on the selected category
    const fetchExistingIDs = async (category, drinkType) => {
    try {
        console.log("Fetching IDs from collection:", category);
        const q = query(collection(db, category)); // Use category for the collection name
        const querySnapshot = await getDocs(q);
        
        // Extract the prodID from each document
        const ids = querySnapshot.docs.map(doc => doc.data().prodID);
    
        // Log the gathered prodIDs
        //console.log("Gathered prodIDs:", ids);
    
        generateNewID(ids, drinkType); // Generate a new ID based on the existing ones and drink type
    } catch (error) {
        console.error("Error fetching existing IDs: ", error);
    }
};

    // Function to generate a new product ID
    const generateNewID = (ids: string[], drinkType: keyof typeof drinkTypePrefixes | null) => {
        // Get prefix for drinks, or use the extracted category for non-drinks
        const prefix = drinkType ? drinkTypePrefixes[drinkType] : `${extractedCategory}`;

        if (ids.length === 0) {
            const newID = `${prefix}1`; // Start with prefix + 1 if no IDs exist
            setNewProdID(newID);
            return;
        }

        const regex = new RegExp(`^${prefix}`, "i");
        const numericIDs = ids.map(id => {
            const numPart = id.replace(regex, ""); // Remove the prefix
            return parseInt(numPart, 10); // Convert to integer
        }).filter(num => !isNaN(num)); // Filter out NaN values

        const maxID = numericIDs.length > 0 ? Math.max(...numericIDs) : 0; // Find the maximum ID
        const newID = `${prefix}${maxID + 1}`; // Generate new ID
        setNewProdID(newID);
    };

    const handleAvailabilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        console.log("Selected Availability:", selectedValue); // Log the selected value
        setSelectedAvailability(selectedValue); // Update the state
    };

    const handleItemNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setItemName(newValue); // Update the state
    };

    useEffect(() => {
        console.log("Selected Drink Type:", passableSelectedDrinkType);
    }, [passableSelectedDrinkType]); // Runs when passableSelectedDrinkType changes

    const handleUploadClick = () => {
        // Trigger the file input click
        fileInputRef.current.click();
    };

    // Handler for input change
    const handleItemPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setItemPrice(newValue === "" ? "" : parseFloat(newValue)); // Convert to number or set to empty string
    };

    // Method to handle size input change
    const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const sizeValue = event.target.value;
        const formattedSize = sizeValue ? `${sizeValue} oz` : null; // Combine number with "oz", or set to null
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
        const formattedSize = sizeValue ? `${sizeValue} oz` : null; // Format the size with "oz", or set to null
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

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Get the uploaded file
        if (file) {
            setFileName(file.name); // Update the file name in state
            const imageUrl = URL.createObjectURL(file); // Create a local URL for preview
            setImageUrl(imageUrl); // Update the image preview state
        }
    };

    const handleRemoveImage = () => {
        setImageUrl(""); // Remove the image preview
        setFileName(""); // Clear the file name
        fileInputRef.current.value = ""; // Clear the file input
    };

    // Handle the file input change and set the image URL
    const handleImageUpload = (e) => {
    const file = e.target.files[0]; // Get the uploaded file
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a URL for the file
      setImageUrl(imageUrl); // Update the state with the image URL
    }
    };

    //   PARA LANG SA POP-UP KAPAG NAG-ADD PRODUCT BUTTON
    const handleSubmit = () => {
        setIsPopupVisible(true);

        setTimeout(() => {
            setIsPopupVisible(false);
        }, 750);
    };

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
                                            setSelectedCat(e.target.value);
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
                                />
                            </div>
                            {/* PRODUCT CATEGORY - KAPAG HINDI DRINK, AUTOMATIC NA KUNG ANO ANG MENU CATEGORY NILA*/}
                            {selectedCat === "drinks" && (
                            // PRODUCT CATEGORY FOR DRINKS
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
                                    value={passableSelectedDrinkType || ""}// Use passableSelectedDrinkType
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
                                        value={drinkSize ? drinkSize.replace(" oz", "") : ""}
                                        onChange={handleSizeChange}
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
                                        min="1" // Optional: Set minimum value
                                        max="30" // Optional: Set maximum value
                                        value={upsizeSize ? upsizeSize.replace(" oz", "") : ""} // Display only the number in the input
                                        onChange={handleUpsizeSizeChange} // Attach the change handler
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
                                <AddAllergens selectedCat={selectedCat} />
                            </div>
                        </div>

                        {/* DISPLAY CHOSEN ALLERGENS */}
                        {mayroongNapilingAllergen && (
                            <div className="w-full flex flex-col gap-1 items-center justify-center">
                                <label
                                    className="text-orange-950 text-sm w-full text-left space-x-1"
                                    htmlFor="menuItemDescription"
                                >
                                    <span>Contains these allergens:</span>
                                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                                        {/* EXAMPLE LANG */}
                                        {allergensByCategory.drinks.map((allergen, index) => (
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