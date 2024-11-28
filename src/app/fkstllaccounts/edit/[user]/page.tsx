"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from "@/app/firebase";

const status = [
    { id: 1, name: "Activated", value: "activated" },
    { id: 2, name: "Deactivated", value: "deactivated" },
];

const roles = [
    { id: 1, name: "Bar", value: "bar" },
    { id: 2, name: "Kitchen", value: "kitchen" },
];

const EditStaffAccountPage = () => {
    //   PARA LANG SA POP-UP KAPAG NAG-ADD BUTTON
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const pathname = usePathname();
    const email: string = pathname ? pathname.split("/").pop() ?? "" : "";
    const [errorMessage, setErrorMessage] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(status[0].value); // Rename this state
    const [selectedRole, setSelectedRole] = useState(roles[0].value);      // Rename this state

    const [staffData, setStaffData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        status: status[0].value,
        role: roles[0].value,
    });

    // Fetch staff account data based on email
    useEffect(() => {
        const fetchStaffData = async () => {
            if (email) {
                const staffDocRef = doc(db, "staff", email); // Adjust the collection name as necessary
                const staffDoc = await getDoc(staffDocRef);
                if (staffDoc.exists()) {
                    const fetchedData = staffDoc.data();
                    setStaffData({
                        email, // Include the email
                        firstName: fetchedData.firstName || '', // Default to empty string if not present
                        lastName: fetchedData.lastName || '',
                        status: fetchedData.staffStatus || status[0].value, // Default to the first status if not present
                        role: fetchedData.staffRole || roles[0].value, // Default to the first role if not present
                    });
                } else {
                    //console.log("No such document!");
                }
            }
        };
    
        fetchStaffData();
    }, [email]);

    // Handle First Name Input Change
    const handleFirstNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target; // Use the correctly typed 'event' variable
        setStaffData((prevData) => ({
            ...prevData,
            firstName: value, // Update firstName in staffData state
        }));
    };

    // Handle Last Name Input Change
    const handleLastNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setStaffData((prevData) => ({
            ...prevData,
            lastName: value, // Update lastName in staffData state
        }));
    };

    // Handle Status Change
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.target;
        setStaffData((prevData) => ({
            ...prevData,
            status: value, // Update status in staffData state
        }));
    };

    // Handle Role Change
    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.target;
        setStaffData((prevData) => ({
            ...prevData,
            role: value,
        }));
    };

    const handleSubmit = async () => {
        if (!staffData.firstName || !staffData.lastName) {
            setErrorMessage("All fields must be filled.");
            setTimeout(() => {
                setErrorMessage(''); // Clear error message after 3 seconds
            }, 3000);
            return; // Exit the function if validation fails
        }

        const staffDocRef = doc(db, "staff", staffData.email);
        try {
            await updateDoc(staffDocRef, {
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                staffStatus: staffData.status,
                staffRole: staffData.role,
            });
            setIsPopupVisible(true);
            setTimeout(() => {
                setIsPopupVisible(false);
            }, 750);
        } catch (error) {
            console.error("Error updating document: ", error);
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
                        <span>Edit</span>
                    </div>
                </div>
                {/* FORM CONTAINER */}
                <div
                    className="border-2 bg-white w-full border-gray-100 shadow-md rounded-md p-2
                        flex flex-col gap-2 justify-center"
                >
                    <h1 className="w-full text-start text-xl font-bold text-orange-950">
                        Update Account
                    </h1>

                    {/* Error message conditionally displayed */}
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
                            <span>Email Address</span>
                        </label>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                            name={`inputEmail`}
                            id={`inputEmail`}
                            type="email"
                            value={staffData.email}
                            placeholder="Email Address"
                            required
                            readOnly // Prevent editing email
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
                            onChange={handleFirstNameInputChange}
                            required
                            value={staffData.firstName}
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
                            onChange={handleLastNameInputChange}
                            required
                            value={staffData.lastName}
                        />
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
                                value={staffData.status}
                                onChange={handleStatusChange}
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
                                value={staffData.role}
                                onChange={handleRoleChange}
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
                        Update Account
                    </button>
                </div>
            </div>
            {/* PRODUCT UPDATED POP UP */}
            {isPopupVisible && <CheckoutPopup message="Account Updated!" />}
        </div>
    );
};

export default EditStaffAccountPage;