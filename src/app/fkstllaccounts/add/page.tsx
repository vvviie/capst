"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React from "react";
import { initializeApp } from "firebase/app";
import { useState, useEffect, useRef } from "react";
import { getAuth, createUserWithEmailAndPassword} from "firebase/auth";
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

const status = [
    {
        id: 1,
        value: "activated",
        name: "Activated"
    },
    {
        id: 2,
        value: "deactivated",
        name: "Deactivated"
    },
];

const roles = [
    {
        id: 1,
        value: "bar",
        name: "Bar"
    },
    {
        id: 2,
        value: "kitchen",
        name: "Kitchen"
    },
];

const AddStaffAccountPage = () => {
    //   PARA LANG SA POP-UP KAPAG NAG-ADD BUTTON
    const router = useRouter(); // Initialize useRouter
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [staffStatus, setStaffStatus] = useState("activated");
    const [staffRole, setStaffRole] = useState("bar");
    const [errorMessage, setErrorMessage] = useState("");

    const usernameRef = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setUsername(value);
        console.log(`Username: ${value}`);
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStatus = event.target.value;
        setStaffStatus(selectedStatus);
        console.log("Selected status:", selectedStatus); // Console log the selected status
    };

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStatus = event.target.value;
        setStaffRole(selectedStatus);
        console.log("Selected status:", selectedStatus); // Console log the selected status
    };

    const displayError = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage("");
        }, 3000);
    };

    const handleSubmit = async () => {
        setErrorMessage("");
    
        if (!username || !firstName || !lastName || !password || !confirmPassword || !staffStatus || !staffRole) {
            displayError("All fields must be filled up.");
            return;
        }
    
        if (username.includes("@")) {
            displayError("Username must not contain '@'.");
            return;
        }
    
        const formattedUsername = `${username}@fikastallestaff.com`;
    
        if (password.length < 6) {
            displayError("Password must be at least 6 characters long.");
            return;
        }
    
        if (password !== confirmPassword) {
            displayError("Passwords do not match!");
            return;
        }
    
        try {
            // Call the API to create the user
            const response = await fetch('/api/createNewUser', { // Ensure this path matches your API route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formattedUsername,
                    password: password,
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Save additional user info in Firestore under 'staff' collection
                await setDoc(doc(db, "staff", formattedUsername), {
                    firstName,
                    lastName,
                    staffStatus,
                    staffRole,
                    username: formattedUsername,
                    uid: data.uid, // Store user UID from the API response
                });
    
                console.log("User created with Document ID:", formattedUsername);
                setIsPopupVisible(true);
                setTimeout(() => {
                    setIsPopupVisible(false);
                }, 750);
    
                setTimeout(() => {
                    router.push("/fkstllaccounts");    
                }, 3000); // Optional: delay before redirecting
            } else {
                displayError(data.error || "Error creating account. Please try again.");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            displayError("Error creating account. Please try again.");
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
                        Staff Accounts
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
                        New Account
                    </h1>

                    {errorMessage && (
                        <p className="text-red-500 text-1xl text-center">{errorMessage}</p>
                    )}

                    {/* EMAIL */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor={`inputEmail`}
                        >
                            <i className="fa-solid fa-user text-gray-700"></i>
                            <span>Username</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                            name={`inputEmail`}
                            id={`inputEmail`}
                            type="text"
                            placeholder="Username"
                            required
                            value={username}
                            onChange={handleUsernameChange}
                            ref={usernameRef}
                        />
                    </div>
                    {/* FIRST NAME */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor={`inputFirstName`}
                        >
                            <i className="fa-solid fa-user text-gray-700"></i>
                            <span>First Name</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                            name={`inputFirstName`}
                            id={`inputFirstName`}
                            type="text"
                            placeholder="First Name"
                            required
                            value={firstName}
                            onChange={handleFirstNameChange}
                            ref={firstNameRef}
                        />
                    </div>
                    {/* LAST NAME */}
                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                        <label
                            className="text-orange-950 text-sm w-full text-left space-x-1"
                            htmlFor={`inputLastName`}
                        >
                            <i className="fa-solid fa-user text-gray-700"></i>
                            <span>Last Name</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                            name={`inputLastName`}
                            id={`inputLastName`}
                            type="text"
                            placeholder="Last Name"
                            required
                            value={lastName}
                            onChange={handleLastNameChange}
                            ref={lastNameRef}
                        />
                    </div>
                    {/* PASSWORD */}
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
                    {/* CONFIRM PASSWORD */}
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
                    {/* ACTIVE AND ROLE CONTAINER */}
                    <div className="w-full flex flex-col justify-center items-center gap-2 md:flex-row">
                        {/* ACTIVE OR NOT */}
                        <div className="w-full flex flex-col gap-1 items-center justify-center">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="activateOptions"
                            >
                                <span>Status</span>
                            </label>
                            <select
                                name="activateOptions"
                                id="selectActivation"
                                className="h-10 bg-white border-2 rounded-md shadow-md border-gray-100 font-semibold
                                text-gray-500 text-center w-full"
                                onChange={handleStatusChange}
                                value={staffStatus}
                            >
                                {status.map((stat) => (
                                    <option value={stat.value} key={stat.id}>
                                        {stat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* ROLE */}
                        <div className="w-full flex flex-col gap-1 items-center justify-center">
                            <label
                                className="text-orange-950 text-sm w-full text-left space-x-1"
                                htmlFor="roleOptions"
                            >
                                <span>Role</span>
                            </label>
                            <select
                                name="roleOptions"
                                id="selectRole"
                                className="h-10 bg-white border-2 rounded-md shadow-md border-gray-100 font-semibold
                                text-gray-500 text-center w-full"
                                onChange={handleRoleChange}
                                value={staffRole}
                            >
                                {roles.map((stat) => (
                                    <option value={stat.value} key={stat.id}>
                                        {stat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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

export default AddStaffAccountPage;