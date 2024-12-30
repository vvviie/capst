"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { db } from "@/app/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { usePathname } from 'next/navigation';
import { useRouter } from "next/navigation";

type Promo = {
    promoID: string;
    promoName: string;
    available: boolean;
    deductionType: string;
    thresholdUse: boolean;
    thresholdCondition: number;
    usageLimitType: string;
    validityType: string;
    validityDate: string;
    promoDeduction: number;
    promoDescription: string;
    numberOfUses: number;
    promoCode: string;
};

const EditPromoPage = () => {
    const router = useRouter();
    const [validity, setValidity] = useState(false);
    const [limitUse, setLimitUse] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [thresholdUse, setThresholdUse] = useState(false);
    const [thresholdCondition, setThresholdCondition] = useState<number | "">(0);
    const [availability, setAvailability] = useState(true);
    const [validityType, setValidityType] = useState("");
    const [deductionValue, setDeductionValue] = useState<number | "">("");
    const [promoName, setPromoName] = useState("");
    const [promoDeduction, setPromoDeduction] = useState<number | "">(0);
    const [promoData, setPromoData] = useState<Promo | null>(null);
    const [deductionType, setDeductionType] = useState("");
    const [formattedValue, setFormattedValue] = useState<string>("");
    const [validityDate, setValidityDate] = useState("");
    const [promoCode, setPromoCode] = useState<string>("");
    const [formattedValidityDate, setFormattedValidityDate] = useState("");
    const [numberOfUses, setNumberOfUses] = useState<number | "">("");
    const [promoDescription, setPromoDescription] = useState("");
    const today = new Date().toISOString().split("T")[0];
    const pathname = usePathname();
    const promoId = pathname ? pathname.split("/").pop() : null;
    const [showMessage, setShowMessage] = useState(false);

    const promoDeductionValueRef = useRef<HTMLInputElement>(null);
    const promoValidityDateRef = useRef<HTMLInputElement>(null);
    const promoNumberOfUsesRef = useRef<HTMLInputElement>(null);
    const promoDescriptionRef = useRef<HTMLTextAreaElement>(null);
    const promoThresholdValueRef = useRef<HTMLInputElement>(null);
    const promoCodeRef = useRef<HTMLInputElement>(null);

    const formatDate = (dateString: string): string => {
        const parts = dateString.split('/');
        const mm = parts[0];
        const dd = parts[1];
        const yyyy = parts[2];
        return `${yyyy}-${mm}-${dd}`; // Convert from 'MM/DD/YYYY' to 'YYYY-MM-DD'
    };

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

    useEffect(() => {
        const fetchPromo = async () => {
            if (promoId) {
                const promosRef = collection(db, "promoCodes");
                const q = query(promosRef, where("promoID", "==", promoId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const promo = querySnapshot.docs[0].data() as Promo; // Cast to Promo type
                    setPromoData(promo);

                    // Set default values for edit form
                    setDeductionType(promo.deductionType);
                    setPromoCode(promo.promoCode);
                    console.log(promoCode);
                    setValidityType(promo.validityType === "expiration" ? "expiration" : "perpetual");
                    setLimitUse(promo.usageLimitType === "limited");
                    setThresholdUse(promo.thresholdUse);
                    setThresholdCondition(promo.thresholdCondition || 0);
                    setAvailability(promo.available);
                    setPromoName(promo.promoName);
                    setPromoDeduction(promo.promoDeduction);
                    setPromoDescription(promo.promoDescription);
                    // Set validity date
                    if (promo.validityDate) {
                        const validityDateFormatted = formatDate(promo.validityDate); // Format for display
                        setValidityDate(validityDateFormatted); // Store as 'MM/DD/YYYY'
                        setFormattedValidityDate(validityDateFormatted); // Store for display
                        console.log("Validity Date set to:", validityDateFormatted); // Log right after setting
                    } else {
                        setValidityDate(""); // Reset if no date
                        setFormattedValidityDate(""); // Reset if no date
                    }

                    // Set number of uses correctly
                    if (promo.numberOfUses !== undefined) { // Check if exists
                        setNumberOfUses(promo.numberOfUses); // Set to the value from promo
                        console.log("Number of Uses set to:", promo.numberOfUses); // Log the new value
                    }

                    console.log("Retrieved Deduction Type:", promo.deductionType);
                }
            }
        };

        fetchPromo();
    }, [promoId, promoCode]);

    useEffect(() => {
        console.log("deductionValue updated:", deductionValue); // Log changes to deductionValue

        // Exit if value is empty to allow for deletion
        if (deductionValue === "") return;

        if (deductionType === "percent" && deductionValue > 50) {
            setDeductionValue(50); // Reset to max value for percentage
        } else if (deductionType === "minus" && deductionValue > 100) {
            setDeductionValue(100); // Reset to max value for amount
        }
    }, [deductionValue, deductionType]);

    // Log changes to promoDeduction
    useEffect(() => {
        console.log("promoDeduction updated:", promoDeduction);
    }, [promoDeduction]);

    useEffect(() => {
        console.log("Promo Description Updated:", promoDescription);
    }, [promoDescription]);

    useEffect(() => {
        // Update formatted value based on deductionType
        if (deductionType === "percent") {
            setFormattedValue(promoDeduction === "" ? "" : (promoDeduction * 100).toString());
        } else {
            setFormattedValue(promoDeduction === "" ? "" : promoDeduction.toString());
        }
    }, [promoDeduction, deductionType]);

    // Set the initial state for thresholdCondition based on thresholdUse
    useEffect(() => {
        if (!thresholdUse) {
            setThresholdCondition(""); // Reset thresholdCondition if thresholdUse is false
        }
    }, [thresholdUse]);

    useEffect(() => {
        if (numberOfUses === "") return;

        if (numberOfUses > 1000) {
            setNumberOfUses(1000); // Reset to maximum value
            console.log(`Number of Uses reverted to maximum: 1000`); // Log the reset action
        }
    }, [numberOfUses]); // Dependency array

    useEffect(() => {
        if (thresholdCondition === "") return;

        if (thresholdCondition > 10000) {
            setThresholdCondition(10000); // Reset to maximum value
            console.log(`Threshold Condition reverted to maximum: 10000`); // Log the reset action
        }
    }, [thresholdCondition]); // Dependency array

    const Promo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setPromoCode(newValue);
        console.log("Promo Code:", newValue); // Log the updated promo code
    };

    const handlePromoDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPromoDescription(event.target.value);
    };

    const handleDeductionTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = event.target.value;
    
        // Ensure promoDeduction is a number before performing arithmetic operations
        const currentDeduction = typeof promoDeduction === 'number' ? promoDeduction : 0;
    
        // Avoid altering the underlying value on type switch
        if (selectedType === "percent" && deductionType === "minus") {
            // Convert to percent display format when switching to "percent"
            setPromoDeduction(currentDeduction / 100);
        } else if (selectedType === "minus" && deductionType === "percent") {
            // Keep promoDeduction as is when switching to "minus"
            setPromoDeduction(currentDeduction); // Ensures no change
        }
    
        setDeductionType(selectedType); // Update the deduction type
    };

    const handleDeductionValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value === "" ? "" : Number(event.target.value);

        // Handle changes based on deduction type
        if (value !== "") {
            if (deductionType === "percent") {
                // Limit for percentage (0 to 50)
                const percentValue = value > 50 ? 50 : value;
                setPromoDeduction(percentValue / 100); // Store as fraction (0-1 range)
            } else {
                // Limit for amount (0 to 100)
                const amountValue = value > 100 ? 100 : value;
                setPromoDeduction(amountValue); // Store amount directly
            }
        } else {
            setPromoDeduction(""); // Allow clearing input
        }
    };

    const handleNumberOfUsesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : Number(e.target.value); // Allow empty string or convert to number
        setNumberOfUses(value); // Update state
        console.log("Number of Uses set to:", value); // Log the value
    };

    // Update the input's value to use the correct format for <input type="date">
    const handleValidityDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = event.target.value; // This will be in 'YYYY-MM-DD'
        setValidityDate(selectedDate); // Store it as 'YYYY-MM-DD'
        setFormattedValidityDate(formatDate(selectedDate)); // Update formatted date for display
        console.log("Validity Date:", selectedDate); // Log the selected date
    };

    const handleValidityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setValidityType(selectedValue); // Store the validity type
        setValidity(selectedValue === "expiration"); // Adjust validity state based on selection
        console.log("Validity Type:", selectedValue); // Log the validity type
    };

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value === "limited";
        setLimitUse(value);
        console.log("Usage Limit Type:", value ? "limited" : "unlimited"); // Log the limit type
    };

    const handleThresholdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value === "condition";
        setThresholdUse(value);
        console.log("Threshold Use:", value); // Log the threshold use
    };

    const handleThresholdValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const numberValue = value === "" ? "" : Number(value);
        setThresholdCondition(numberValue);
        console.log("Threshold Condition Value:", numberValue); // Log the threshold condition value
    };

    const handleAvailabilityChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedValue = event.target.value;
        const isAvailable = selectedValue === "available";
        setAvailability(isAvailable);
        console.log("Availability:", isAvailable); // Log availability
    };

    const handlePromoDeductionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (deductionType === "minus") {
            setPromoDeduction(value === "" ? 0 : Number(value)); // Handle deduction value as is
        } else if (deductionType === "percent") {
            const percentValue = value === "" ? 0 : Number(value) / 100; // Convert percentage to decimal
            setPromoDeduction(percentValue); // Store as a decimal
        }
    };

    const formattedDate = (date: Date): string => {
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(date.getDate()).padStart(2, '0');
        const yy = String(date.getFullYear());
        return `${mm}/${dd}/${yy}`;
    };


    const handleSubmit = async () => {
        if (promoData) {

            if (promoDeduction === "" || promoDeduction === 0) {
                promoDeductionValueRef.current?.focus();
                return;
            }

            if (validityType === "expiration" && validityDate === "") {
                promoValidityDateRef.current?.focus();
                return;
            }

            if (promoCode === "") {
                promoCodeRef.current?.focus();
                return;
            }

            if (limitUse && numberOfUses === "" || limitUse && numberOfUses === 0) {
                promoNumberOfUsesRef.current?.focus();
                return;
            }

            if (promoDescription === "") {
                promoDescriptionRef.current?.focus();
                return;
            }

            if (thresholdUse === true && thresholdCondition === "" || thresholdUse === true && thresholdCondition === 0) {
                promoThresholdValueRef.current?.focus();
                return;
            }

            const adjustedPromoDeduction = deductionType === "percentage" && typeof promoDeduction === "number"
                ? promoDeduction / 100 // Convert to decimal if percentage
                : promoDeduction || 0; // Use 0 if promoDeduction is empty

            const formattedValidityDate = validityType === "expiration" && validityDate
                ? formattedDate(new Date(validityDate))
                : null;

            const updatedPromo = {
                promoID: promoId,
                promoName,
                promoCode,
                promoDescription: promoDescription || "",
                available: availability,
                deductionType,
                promoDeduction: adjustedPromoDeduction, // Use adjusted deduction
                validityType,
                ...(validityType === "expiration" && formattedValidityDate ? { validityDate: formattedValidityDate } : {}),
                usageLimitType: limitUse ? "limited" : "unlimited",
                ...(limitUse && numberOfUses ? { numberOfUses } : {}),
                thresholdUse,
                ...(thresholdUse && thresholdCondition ? { thresholdCondition } : {})
            };

            // Log the filtered `updatedPromo` object before updating in Firestore
            console.log("Updated Promo Data:", updatedPromo);

            // Query to find the document with the matching promoID field
            const promosCollectionRef = collection(db, "promoCodes");
            const q = query(promosCollectionRef, where("promoID", "==", promoId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.error(`No document found with promoID: ${promoId}`);
                setShowMessage(true); // Show a message that no document exists
                setTimeout(() => {
                    setShowMessage(false);
                }, 3000);
                return; // Exit the function since there's no document to update
            }

            // Assuming that promoId is unique and there will be one matching document
            const promoDocRef = querySnapshot.docs[0].ref;

            // Proceed to update the document if it exists
            await updateDoc(promoDocRef, updatedPromo);
            setIsPopupVisible(true);
            setTimeout(() => {
                setIsPopupVisible(false);
            }, 750);
        }
    };

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
                        <span>Edit Promo</span>
                    </div>
                </div>
                {/* VOUCHER FORM */}
                <div
                    className="bg-white border-2 border-gray-100 rounded-md shadow-lg px-4 pt-4
        pb-3 flex flex-col gap-4"
                >
                    {/* VOUCHER ICON */}
                    <i className="fa-solid fa-ticket text-orange-950 text-7xl text-center"></i>
                    {showMessage && ( // Conditional rendering based on showMessage state
                        <p className="flex items-center justify-center font-bold text-red-600 text-lg mt-0">
                            No changes detected!
                        </p>
                    )}
                    {/* ID AND AVAILABILITY */}
                    <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        {/* VOUCHER ID */}
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
                                value={promoData?.promoID || ""}
                                readOnly
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
                                value={availability ? "available" : "unavailable"} // Convert boolean to string
                                onChange={handleAvailabilityChange}
                            >
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                    </div>
                    {/* VOUCHER NAME */}
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
                            value={promoName} // Bind to state
                            readOnly
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
                                <span>{deductionType === "minus" ? "Amount" : "Percentage"}</span> {/* Use deductionType here */}
                            </label>
                            <input
                                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                name="deductionInput"
                                id="deductionInput"
                                type="number"
                                placeholder={deductionType === "minus" ? "Amount" : "Percentage"}
                                required
                                min={0}
                                max={deductionType === "percent" ? 50 : 100}
                                value={deductionType === "percent" ? (typeof promoDeduction === "number" ? (promoDeduction * 100) : "") : (typeof promoDeduction === "number" ? promoDeduction : "")} // Convert for display only if it's a number
                                onChange={handleDeductionValueChange} // Handle input changes
                                aria-label={deductionType === "minus" ? "Deduction Amount" : "Deduction Percentage"}
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
                                value={deductionType}
                                onChange={handleDeductionTypeChange}
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
                        {/* Render Validity Date input if validityType is 'expiration' */}
                        {validityType === "expiration" && (
                            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                                <label
                                    className="text-orange-950 text-sm w-full text-left space-x-1"
                                    htmlFor="inputValidityDate"
                                >
                                    <span>Valid until</span>
                                </label>
                                <input
                                    className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                    name="inputValidityDate"
                                    id="inputValidityDate"
                                    type="date"
                                    required
                                    value={validityDate} // Ensure this is in 'YYYY-MM-DD' format
                                    min={today} // Restrict to today and future dates
                                    onChange={handleValidityDateChange} // Update validity date
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
                                value={validityType} // Set the value of the select to validityType
                                onChange={handleValidityChange}
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
                        {limitUse && (
                            // ACTIVATION LIMIT
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
                                    required
                                    min={1}
                                    max={1000}
                                    value={numberOfUses} // Bind the value to numberOfUses
                                    onChange={handleNumberOfUsesChange} // Use the separate change handler
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
                                className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                                value={limitUse ? "limited" : "unlimited"} // Reflect the correct state
                                onChange={handleLimitChange}
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
                                value={thresholdUse ? "condition" : "nocondition"} // Default to "nocondition" when thresholdUse is false
                                onChange={handleThresholdChange} // Use the handleThresholdChange method
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

                    {/* VOUCHER DESCRIPTION */}
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
                            value={promoDescription}
                            onChange={handlePromoDescriptionChange} // Add onChange handler
                            ref={promoDescriptionRef}
                        />
                    </div>
                    {/* SUBMIT BUTTON */}
                    <button
                        className="w-full bg-orange-950 font-bold text-xl text-white p-2 rounded-md mt-2
                            shadow-md hover:scale-[1.02] duration-200 hover:bg-orange-900"
                        onClick={() => {
                            handleSubmit();
                        }}
                    >
                        Update Promo
                    </button>
                    {/* PRODUCT CREATED POP UP */}
                    {isPopupVisible && <CheckoutPopup message="Promo Updated!" />}
                </div>
            </div>
        </div>
    );
};

export default EditPromoPage;
