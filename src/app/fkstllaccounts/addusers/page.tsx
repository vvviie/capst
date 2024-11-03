"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React from "react";
import { initializeApp } from "firebase/app";
import { useState, useEffect, useRef } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import createNewUser from "@/pages/api/createNewUser";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWhVssqbS2QQ7NkI1CwiOHTq6sN31gsVg",
    authDomain: "testingcapstonejg.firebaseapp.com",
    databaseURL: "https://testingcapstonejg-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "testingcapstonejg",
    storageBucket: "testingcapstonejg.appspot.com",
    messagingSenderId: "1006906116033",
    appId: "1:1006906116033:web:825eeeeeed8c4221a71140",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const AddUsersAccountPage = () => {
    //   PARA LANG SA POP-UP KAPAG NAG-ADD BUTTON
    const router = useRouter(); // Initialize useRouter
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [verificationMessage, setVerificationMessage] = useState("");

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const phoneNumberRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setUsername(value);
        console.log(`Username: ${value}`);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);
        console.log(`Password: ${value}`);
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setConfirmPassword(value);
        console.log(`Confirm Password: ${value}`);
    };

    const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFirstName(value);
        console.log(`First Name: ${value}`);
    };

    const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLastName(value);
        console.log(`Last Name: ${value}`);
    };

    const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPhoneNumber(value);
        console.log(`Phone Number: ${value}`);
    };

    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAddress(value);
        console.log(`Address: ${value}`);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Validation function
    const validateInputs = () => {
        if (!username || !password || !confirmPassword || !firstName || !lastName || !phoneNumber || !address) {
            setErrorMessage("All fields must be filled out.");
            clearErrorAfterDelay();
            return false;
        }
        if (!username.endsWith(".com")) {
            setErrorMessage("Email must be valid.");
            clearErrorAfterDelay();
            return false;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            clearErrorAfterDelay();
            return false;
        }

        if (password.length < 6 || confirmPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            clearErrorAfterDelay();
            return false;
        }

        if (isNaN(Number(phoneNumber))) {
            setErrorMessage("Phone number must be valid.");
            clearErrorAfterDelay();
            return false;
        }
        setErrorMessage(""); // Clear error if all validations pass
        return true;
    };

    const clearErrorAfterDelay = () => {
        setTimeout(() => {
            setErrorMessage("");
        }, 3000); // 3 seconds
    };

    const handleSubmit = async () => {
        if (validateInputs()) {
            try {
                // Create user in Firebase Authentication using Admin SDK
                const response = await fetch("/api/createNewUser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                });
    
                // Check for response errors
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error creating user: ${errorData.error || response.statusText}`);
                }
    
                const { uid } = await response.json(); // Get the UID from the response
    
                // Validate UID
                if (!uid) {
                    throw new Error("UID is undefined. User creation may have failed.");
                }
    
                // Now, handle Firestore insertion
                const now = new Date();
                const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
                const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    
                const firstTimeVoucherRef = doc(db, "vouchers", "firstTimeVoucher");
                const voucherSnap = await getDoc(firstTimeVoucherRef);
                let userData;
    
                if (voucherSnap.exists()) {
                    const firstTimeVoucher = voucherSnap.data();
                    userData = {
                        uid,
                        username,
                        firstName,
                        lastName,
                        address,
                        phoneNumber,
                        role: "user", // or "admin" based on your logic
                        totalPaid: 0,
                        vouchers: {
                            firstTimeVoucher: {
                                available: firstTimeVoucher.available,
                                voucherDeduction: firstTimeVoucher.voucherDeduction,
                                voucherDescription: firstTimeVoucher.voucherDescription,
                                voucherID: firstTimeVoucher.voucherID,
                                voucherType: firstTimeVoucher.deductionType,
                                used: false,
                                isRead: false,
                                isNotifDeleted: false,
                                dateCreated: date,
                                timeCreated: time,
                            },
                        },
                    };
                }
    
                // Log userData for debugging
                console.log("User data to be written to Firestore:", userData);
    
                // Insert user data into Firestore
                try {
                    await setDoc(doc(db, "users", username), userData);
                } catch (firestoreError) {
                    console.error("Error writing document to Firestore:", firestoreError);
                    throw new Error(`Firestore Error: ${firestoreError.message}`);
                }
    
                // Set the verification message
                setVerificationMessage(`The account of ${username} was created successfully.`);
                setTimeout(() => {
                    setVerificationMessage("");
                }, 3000);
    
                // Show popup and redirect
                setIsPopupVisible(true);
                setTimeout(() => {
                    setIsPopupVisible(false);
                }, 3000);
                setTimeout(() => {
                    router.push("/fkstllaccounts");    
                }, 3000); // Optional: delay before redirecting
    
            } catch (error) {
                // Handle different types of errors gracefully
                if (error.message.includes("email already in use")) {
                    setErrorMessage("The email address is already in use. Please try logging in or use a different email.");
                } else {
                    setErrorMessage(`${error.message}`);
                }
                setTimeout(() => {
                    setErrorMessage("");
                }, 5000);
            }
        }
    };

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
                justify-center items-start md:items-center
                lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[600px] flex flex-col gap-2">
                {/* HEADER CONTAINER */}
                <div className="flex justify-start items-center gap-2">
                    {/* LINK BACK TO ACCOUNT LIST */}
                    <Link
                        href={"/fkstllaccounts"}
                        className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
                    >
                        User Accounts
                    </Link>
                    <div className="text-xl sm:text-2xl font-bold text-orange-950 space-x-2 flex items-center">
                        <i className="fa fa-angle-right" aria-hidden="true"></i>
                        <span>Add</span>
                    </div>
                </div>
                {/* FORM CONTAINER */}
                <div
                    className="border-2 bg-white w-full border-gray-100 shadow-md rounded-md p-2
                        flex flex-col gap-2 justify-center"
                >
                    <h1 className="w-full text-start text-xl font-bold text-orange-950">
                        New User Account
                    </h1>
                
                    {/* Error message conditionally displayed */}
                    {errorMessage && (
                        <p className="text-red-500 text-1xl text-center">{errorMessage}</p>
                    )}

                    {verificationMessage && (
                                    <p className="text-green-500 text-1xl text-center">{verificationMessage}</p>
                                )}

                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="inputEmail"
                        >
                            <i className="fa-solid fa-user text-gray-700"></i>
                            <span>Username / Email Address</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                            name="email"
                            id="inputEmail"
                            type="email"
                            placeholder="ex. juandelacruz@gmail.com"
                            required
                            value={username}
                            onChange={handleUsernameChange}
                            ref={usernameRef}
                        />
                    </div>
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="inputPassword"
                        >
                            <i className="fa-solid fa-lock text-gray-700"></i>
                            <span>Password</span>
                        </label>
                        <div
                            className="border-2 border-solid border-orange-900 w-full h-10 rounded-md bg-orange-50
                                overflow-clip relative flex items-center"
                        >
                            <input
                                className="w-full h-10 rounded-md bg-orange-50 pl-4"
                                name="password"
                                id="inputPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="●●●●●●●●●●"
                                required
                                value={password}
                                onChange={handlePasswordChange}
                                ref={passwordRef}
                            />
                            <i
                                className={`absolute right-3 top-2.5 fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"
                                    }
                                text-gray-300 cursor-pointer hover:text-gray-500 hover:duration-100`}
                                onClick={togglePasswordVisibility}
                            ></i>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="inputConfirmPassword"
                        >
                            <i className="fa-solid fa-lock text-gray-700"></i>
                            <span>Confirm Password</span>
                        </label>
                        <div
                            className="border-2 border-solid border-orange-900 w-full h-10 rounded-md bg-orange-50
                                overflow-clip relative flex items-center"
                        >
                            <input
                                className="w-full h-10 rounded-md bg-orange-50 pl-4"
                                name="confirmPassword"
                                id="inputConfirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="●●●●●●●●●●"
                                required
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                ref={confirmPasswordRef}
                            />
                            <i
                                className={`absolute right-3 top-2.5 fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                                    }
                                text-gray-300 cursor-pointer hover:text-gray-500 hover:duration-100`}
                                onClick={toggleConfirmPasswordVisibility}
                            ></i>
                        </div>
                    </div>
                    {/* FIRST NAME */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="inputFirstName"
                        >
                            <i className="fa-solid fa-user text-gray-700"></i>
                            <span>First Name</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                            name="firstName"
                            id="inputFirstName"
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={handleFirstNameChange}
                            ref={firstNameRef}
                        />
                    </div>
                    {/* LAST NAME */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="inputLastName"
                        >
                            <i className="fa-solid fa-user text-gray-700"></i>
                            <span>Last Name</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                            name="lastName"
                            id="inputLastName"
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={handleLastNameChange}
                            ref={lastNameRef}
                        />
                    </div>

                    {/* PHONE NUMBER */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="inputPhoneNumber"
                        >
                            <i className="fa-solid fa-phone text-gray-700"></i>
                            <span>Phone Number</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                            name="phoneNumber"
                            id="inputPhoneNumber"
                            type="text"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            ref={phoneNumberRef}
                        />
                    </div>

                    {/* ADDRESS */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor="inputAddress"
                        >
                            <i className="fa-solid fa-house text-gray-700"></i>
                            <span>Address</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                            name="address"
                            id="inputAddress"
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={handleAddressChange}
                            ref={addressRef}
                        />
                    </div>
                    <button
                        className="h-10 bg-orange-950 font-bold text-white rounded-md shadow-md
                        hover:bg-orange-900 hover:scale-[1.01] duration-200 mt-4"
                        onClick={() => handleSubmit()}
                    >
                        Create Account
                    </button>
                </div>
            </div>
            {/* PRODUCT CREATED POP UP */}
            {isPopupVisible && <CheckoutPopup message="Account Created!" />}
        </div>
    );
};

export default AddUsersAccountPage;