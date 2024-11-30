"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

const AddPromoPage = () => {
    const [validity, setValidity] = useState(false);
    const [limitUse, setLimitUse] = useState(false);
    const [thresholdUse, setThresholdUse] = useState(false);
    const [thresholdCondition, setThresholdCondition] = useState<number | "">(0);

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [promoID, setPromoID] = useState(""); // State variable for promo ID
    const [availability, setAvailability] = useState(true); // Availability state
    const [promoName, setPromoName] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [deductionType, setDeductionType] = useState("minus");
    const [deductionValue, setDeductionValue] = useState<number | "">(1);
    const [validityType, setValidityType] = useState("perpetual");
    const [validityDate, setValidityDate] = useState("");
    const today = new Date().toISOString().split("T")[0];
    const [usageLimitType, setUsageLimitType] = useState("unlimited");
    const [usageLimit, setUsageLimit] = useState<number | "">(0);
    const [numberOfUses, setNumberOfUses] = useState<string | number>(1);
    const [description, setDescription] = useState("");

    const promoIDRef = useRef<HTMLInputElement>(null);
    const promoNameRef = useRef<HTMLInputElement>(null);
    const promoCodeRef = useRef<HTMLInputElement>(null);
    const promoDeductionValueRef = useRef<HTMLInputElement>(null);
    const promoValidityDateRef = useRef<HTMLInputElement>(null);
    const promoNumberOfUsesRef = useRef<HTMLInputElement>(null);
    const promoDescriptionRef = useRef<HTMLTextAreaElement>(null);
    const promoThresholdValueRef = useRef<HTMLInputElement>(null);

    const toCamelCase = (str: string) => {
        return str
            .toLowerCase() // Convert the whole string to lowercase
            .split(' ') // Split the string into words
            .map((word, index) => {
                // Capitalize the first letter of each word except for the first one
                if (index === 0) return word; // Keep the first word lowercase
                return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize first letter
            })
            .join(''); // Join all words without spaces
    };

    const handleSubmit = async () => {
        if (promoID.trim() === "") {
            promoIDRef.current?.focus();
            return;
        }

        if (promoName === "") {
            promoNameRef.current?.focus();
            return;
        }

        if (promoCode === "") {
            promoCodeRef.current?.focus();
            return;
        }

        if (deductionValue === "") {
            promoDeductionValueRef.current?.focus();
            return;
        }

        if (validityType === "expiration" && validityDate === "") {
            promoValidityDateRef.current?.focus();
            return;
        }

        if (usageLimitType === "limited" && numberOfUses === "") {
            promoNumberOfUsesRef.current?.focus();
            return;
        }

        if (description === "") {
            promoDescriptionRef.current?.focus();
            return;
        }

        if (thresholdUse === true && thresholdCondition === "") {
            promoThresholdValueRef.current?.focus();
            return;
        }

        const db = getFirestore();
        const camelCasePromoName = toCamelCase(promoName);

        // Prepare the promo deduction as a number
        const promoDeduction = deductionType === "percent" ? deductionValue / 100 : deductionValue;

        // Create a promo object to store, conditionally including numberOfUses
        const promoData = {
            promoID,
            promoName,
            promoCode,
            promoDescription: description,
            available: availability,
            deductionType,
            promoDeduction, // Stores as a number
            validityType,
            ...(validityType === "expiration" && { validityDate }),
            usageLimitType,
            ...(usageLimitType === "limited" && numberOfUses ? { numberOfUses } : {}),
            thresholdUse,
            ...(thresholdUse && { thresholdCondition }) // Include thresholdCondition only if thresholdUse is true
        };

        try {
            await setDoc(doc(db, "promoCodes", camelCasePromoName), promoData);
            console.log("Promo successfully saved!");

            setIsPopupVisible(true);
            setTimeout(() => {
                setIsPopupVisible(false);
            }, 750);
        } catch (error) {
            console.error("Error saving promo:", error);
        }
    };

    const handleDeductionTypeChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedType = event.target.value;
        setDeductionType(selectedType);
        console.log("Deduction Type:", selectedType); // Log the selected deduction type
    };

    const handleValidityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setValidityType(selectedValue); // Store the validity type
        setValidity(selectedValue === "expiration");
        console.log("Validity Type:", selectedValue); // Log the validity type
    };

    const handleValidityDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = new Date(event.target.value);
        const formattedDate = formatDate(selectedDate);
        setValidityDate(formattedDate);
        console.log("Validity Date:", formattedDate); // Log the formatted date
    };

    const formatDate = (date: Date): string => {
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(date.getDate()).padStart(2, '0');
        const yy = String(date.getFullYear()).slice(-2); // Get last two digits of the year
        return `${mm}/${dd}/${yy}`;
    };

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setUsageLimitType(selectedValue);

        if (selectedValue === "unlimited") {
            setLimitUse(false); // Disable limit input for unlimited
            setUsageLimit(0); // Reset to 0 for unlimited
        } else {
            setLimitUse(true); // Enable limit input for limited
        }

        console.log("Limit Use:", selectedValue === "unlimited");
        console.log("Usage Limit Type:", selectedValue); // Log the selected value directly
    };

    const handlePromoIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value; // Get the new value from the input
        setPromoID(newValue); // Update the promo ID state
        console.log("Promo ID:", newValue); // Log the updated promo ID
    };

    const handleAvailabilityChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedValue = event.target.value;
        const isAvailable = selectedValue === "available";
        setAvailability(isAvailable);
        console.log("Availability:", isAvailable); // Log availability
    };

    // Function to handle input change
    const handlePromoNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setPromoName(newValue);
        console.log("Promo Name:", newValue); // Log the updated promo name
    };

    const Promo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setPromoCode(newValue);
        console.log("Promo Code:", newValue); // Log the updated promo name
    };

    const handleDeductionValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value === "" ? "" : Number(event.target.value); // Allow empty input
        setDeductionValue(value); // Update deduction value
        console.log("Deduction Value:", value); // Log the entered value
    };

    const handleUsageLimitInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNumberOfUses(value ? Number(value) : ""); // Allow empty input or number
    };

    const handleThresholdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const isConditionBased = selectedValue === "condition";
        setThresholdUse(isConditionBased); // Update thresholdUse based on selection

        // Log threshold state
        console.log(`Condition-based: ${isConditionBased}`);
    };

    const handleThresholdValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const numericValue = value === "" ? "" : Number(value); // Allow empty string or convert to number
        setThresholdCondition(numericValue); // Update thresholdCondition

        // Log threshold state and value
        console.log(`Threshold Value: ${numericValue}`);
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value); // Update description state
        console.log("Promo Description:", event.target.value); // Log the entered description
    };

    // Effect to enforce min/max values
    useEffect(() => {
        if (deductionValue === "") return;

        if (deductionType === 'percent' && deductionValue > 50) {
            setDeductionValue(50); // Reset to max value for percentage
        } else if (deductionType === 'minus' && deductionValue > 100) {
            setDeductionValue(100); // Reset to max value for amount
        }
    }, [deductionValue, deductionType]);

    useEffect(() => {
        if (usageLimit === "") return; // Skip if value is empty

        if (usageLimit < 1) {
            setUsageLimit(1); // Reset to min value
        } else if (usageLimit > 1000) {
            setUsageLimit(1000); // Reset to max value for usage limit
        }
    }, [usageLimit]);

    // useEffect to manage the input behavior
    useEffect(() => {
        if (thresholdCondition === "") return; // Ignore empty state
        if (thresholdCondition > 10000) {
            setThresholdCondition(10000); // Reset to max value for threshold
            console.log(`Threshold Value exceeded. Reset to: 10000`);
        }
    }, [thresholdCondition]);

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[640px] flex flex-col gap-4">
                {/* HEADER CONTAINER */}
                <div className="flex justify-start items-center gap-2">
                    {/* LINK BACK TO PRODUCTS */}
                    <Link
                        href={"/fkstllvouchers"}
                        className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
                    >
                        Promos List
                    </Link>
                    <div className="text-xl sm:text-2xl font-bold text-orange-950 space-x-2 flex items-center">
                        <i className="fa fa-angle-right" aria-hidden="true"></i>
                        <span>Add Promo</span>
                    </div>
                </div>
                {/* Promo FORM */}
                <div
                    className="bg-white border-2 border-gray-100 rounded-md shadow-lg px-4 pt-4
        pb-3 flex flex-col gap-4"
                >
                    {/* Promo ICON */}
                    <i className="fa-solid fa-ticket text-orange-950 text-7xl text-center"></i>
                    {/* ID AND AVAILABILITY */}
                    <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        {/* Promo ID */}
                        <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="promoID"
                            >
                                <span>ID</span>
                            </label>
                            <input
                                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                name="promoID"
                                id="inputPromoID"
                                type="text"
                                placeholder="Promo ID"
                                required
                                value={promoID} // Bind the input value to the state
                                onChange={handlePromoIDChange} // Use the existing method to handle changes
                                ref={promoIDRef}
                            />
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
                          h-10 w-full text-center"
                                value={availability ? "available" : "unavailable"} // Set the value based on availability
                                onChange={handleAvailabilityChange} // Call the handler here
                            >
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                    </div>
                    {/* Promo NAME */}
                    <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="promoName"
                        >
                            <span>Name</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                            name="promoName"
                            id="inputPromoName"
                            type="text"
                            placeholder="Promo Name"
                            required
                            value={promoName} // Bind input to promoName state
                            onChange={handlePromoNameChange} // Update state on change
                            ref={promoNameRef}
                        />
                    </div>

                    {/* Promo CODE */}
                    <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="promoCode"
                        >
                            <span>Code</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                            name="promoCode"
                            id="inputPromoCode"
                            type="text"
                            placeholder="Promo Code"
                            required
                            value={promoCode} // Bind input to promoName state
                            onChange={Promo} // Update state on change
                            ref={promoCodeRef}
                        />
                    </div>

                    {/* TYPE AND DEDUCTION */}
                    <div className="w-full flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-2">
                        {/* DEDUCTION INPUT */}
                        <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="deductionInput"
                            >
                                <span>{deductionType === "minus" ? "Amount" : "Percentage"}</span>
                            </label>
                            <input
                                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                name="deductionInput"
                                id="deductionInput"
                                type="number"
                                placeholder={deductionType === "minus" ? "Amount" : "Percentage"}
                                required
                                value={deductionValue} // Bind value to deductionValue state
                                onChange={handleDeductionValueChange} // Handle value change
                                min={1}
                                max={deductionType === 'percent' ? 50 : 100}
                                ref={promoDeductionValueRef}
                            />
                        </div>
                        {/* DEDUCTION TYPE */}
                        <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="promoType"
                            >
                                <span>Deduction Type</span>
                            </label>
                            <select
                                name="promoType"
                                id="promoType"
                                className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                                value={deductionType} // Set value based on deductionType state
                                onChange={handleDeductionTypeChange} // Use the updated handler
                            >
                                <option value="minus" className="cursor-pointer">
                                    Amount
                                </option>
                                <option value="percent" className="cursor-pointer">
                                    Percentage
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* VALIDITY AND VALIDITY DATE */}
                    <div className="w-full flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-2">
                        {validity && (
                            // VALIDITY DATE
                            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                                <label
                                    className="text-orange-950 text-sm w-full text-left space-x-1"
                                    htmlFor="inputValidityDate"
                                >
                                    <span>Valid Until</span>
                                </label>
                                <input
                                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                    name="inputValidityDate"
                                    id="inputValidityDate"
                                    type="date"
                                    required
                                    min={today}  // Restrict to today and future dates
                                    onChange={handleValidityDateChange}
                                    ref={promoValidityDateRef}
                                />
                            </div>
                        )}
                        {/* VALIDITY */}
                        <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="validity"
                            >
                                <span>Validity Period</span>
                            </label>
                            <select
                                name="validity"
                                id="validity"
                                className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                                onChange={handleValidityChange}
                                value={validityType} // Bind the select to validityType state
                            >
                                <option value="perpetual" className="cursor-pointer">
                                    Perpetual
                                </option>
                                <option value="expiration" className="cursor-pointer">
                                    Expiration
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* ACTIVATION AND LIMIT */}
                    <div className="w-full flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-2">
                        {/* ACTIVATION LIMIT */}
                        {limitUse && (
                            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                                <label
                                    className="text-orange-950 text-sm w-full text-left space-x-1"
                                    htmlFor="inputActivationLimit"
                                >
                                    <span>Number of Use</span>
                                </label>
                                <input
                                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                    name="inputActivationLimit"
                                    id="inputActivationLimit"
                                    type="number"
                                    required={usageLimitType === "limit"} // Use usageLimitType for required
                                    min={1}
                                    max={1000}
                                    placeholder={usageLimitType === "limit" ? "Enter usage limit" : "N/A"}
                                    value={limitUse ? numberOfUses : ""} // Bind to numberOfUses state
                                    onChange={handleUsageLimitInputChange} // Handle changes to input
                                    ref={promoNumberOfUsesRef}
                                />
                            </div>
                        )}

                        {/* ACTIVATION */}
                        <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="limitOfUse"
                            >
                                <span>Limit</span>
                            </label>
                            <select
                                name="limitOfUse"
                                id="limitOfUse"
                                className="rounded-md shadow-sm border-2 border-gray-100 text-lg text-gray-600 font-semibold bg-white cursor-pointer h-10 w-full text-center"
                                onChange={handleLimitChange} // Update based on selected value
                            >
                                <option value="unlimited" className="cursor-pointer">
                                    Unlimited Use
                                </option>
                                <option value="limited" className="cursor-pointer">
                                    Limited Use
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* THRESHOLD & CONDITION TO BE MET */}
                    <div className="w-full flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-2">
                        {thresholdUse && ( // Render threshold input if thresholdUse is true
                            // THRESHOLD VALUE
                            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                                <label
                                    className="text-orange-950 text-sm w-full text-left space-x-1"
                                    htmlFor="thresholdValue"
                                >
                                    <span>Threshold Value</span>
                                </label>
                                <input
                                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                    name="thresholdValue"
                                    id="thresholdValue"
                                    type="number"
                                    required
                                    min={1}
                                    max={10000} // Maintain max constraint for the input
                                    onChange={handleThresholdValueChange} // Update thresholdCondition on input change
                                    value={thresholdCondition !== "" ? thresholdCondition : ""} // Allow empty input
                                    ref={promoThresholdValueRef}
                                />
                            </div>
                        )}
                        {/* THRESHOLD */}
                        <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="threshold"
                            >
                                <span>Threshold</span>
                            </label>
                            <select
                                name="threshold"
                                id="threshold"
                                className="rounded-md shadow-sm border-2 border-gray-100
                text-lg text-gray-600 font-semibold bg-white cursor-pointer
                h-10 w-full text-center"
                                onChange={handleThresholdChange} // Use the handleThresholdChange method
                                defaultValue="nocondition"
                            >
                                <option value="condition" className="cursor-pointer">
                                    Condition-based
                                </option>
                                <option value="nocondition" className="cursor-pointer">
                                    Not condition-based
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Promo DESCRIPTION */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="promoDescription"
                        >
                            <span>Description</span>
                        </label>
                        <textarea
                            className="border-2 border-solid border-orange-900 w-full pl-4 rounded-md 
                bg-orange-50 pt-1.5"
                            name="promoDescription"
                            id="inputPromoDescription"
                            placeholder="Promo Description"
                            rows={2}
                            style={{ resize: "none" }}
                            required
                            value={description} // Bind value to description state
                            onChange={handleDescriptionChange} // Handle value change
                            ref={promoDescriptionRef}
                        />
                    </div>
                    <button
                        className="w-full bg-orange-950 font-bold text-xl text-white p-2 rounded-md mt-2
          shadow-md hover:scale-[1.02] duration-200 hover:bg-orange-900"
                        onClick={() => {
                            handleSubmit();
                        }}
                    >
                        Create Promo
                    </button>
                    {/* PRODUCT CREATED POP UP */}
                    {isPopupVisible && <CheckoutPopup message="Promo Created!" />}
                </div>
            </div>
        </div>
    );
};

export default AddPromoPage;
