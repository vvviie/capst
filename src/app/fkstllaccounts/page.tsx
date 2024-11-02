"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import AdminStaffFilter from "../components/AdminStaffFilter";
import UsersFilter from "../components/UsersFilter";
import { auth, db } from "../firebase";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
    getDoc,
    DocumentData,
} from "firebase/firestore";
import {
    onAuthStateChanged,
    getAuth,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser,
} from "firebase/auth"; // Import Firebase Auth methods

//#region Staff Sample Acc
type staff = {
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    dateCreated: string;
    activated: boolean;
};

type listStaff = staff[];

const staffAccounts: listStaff = [
    {
        username: "jorgeangelo@gmail.com",
        firstName: "Jorge Angelo",
        lastName: "Pangilinan",
        role: "Bar",
        dateCreated: "10/28/2024",
        activated: true,
    },
    {
        username: "johanncarl@gmail.com",
        firstName: "Johann Carl",
        lastName: "Fellizar",
        role: "Kitchen",
        dateCreated: "10/28/2024",
        activated: true,
    },
    {
        username: "jericko@gmail.com",
        firstName: "Jericko",
        lastName: "Gomez",
        role: "Kitchen",
        dateCreated: "10/28/2024",
        activated: true,
    },
];

const status = [
    {
        id: 1,
        value: "Activated",
    },
    {
        id: 2,
        value: "Deactivated",
    },
];

const roles = [
    {
        id: 1,
        value: "Bar",
    },
    {
        id: 2,
        value: "Kitchen",
    },
];
//#endregion

//#region Users Sample Acc
type user = {
    username: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    totalPaid: number;
    role: string;
};

type listUser = user[];

//#endregion

const AccountsListPage = () => {
    const [accountType, setAccountType] = useState("users");
    const [userAccounts, setUserAccounts] = useState<listUser>([]);
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
        {}
    );
    const [searchInput, setSearchInput] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [filteredStatus, setFilteredStatus] = useState("All");

    const handleFilterChange = (status) => {
        setFilteredStatus(status);
    };

    const toggleOrder = (id: string) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setAccountType(event.target.value === "users" ? "users" : "staff");
    };

    const handleSearchInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchInput(event.target.value);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const usersCollection = collection(db, "users");
            const q = query(usersCollection, where("role", "==", "user"));
            const userSnapshot = await getDocs(q);
            const users: listUser = userSnapshot.docs.map((doc) => ({
                username: doc.data().username,
                firstName: doc.data().firstName,
                lastName: doc.data().lastName,
                address: doc.data().address,
                phone: doc.data().phoneNumber,
                totalPaid: doc.data().totalPaid,
                role: doc.data().role,
            }));
            setUserAccounts(users);
        };

        fetchUsers();
    }, []);

    const statusInfo = status.find((s) => s.value === filteredStatus); // Move this outside

    const statusOptions = [
        { id: 1, value: "All", min: 0, max: Infinity },
        { id: 2, value: "Regular", min: 0, max: 999 },
        { id: 3, value: "Bronze", min: 1000, max: 4999 },
        { id: 4, value: "Silver", min: 5000, max: 9999 },
        { id: 5, value: "Gold", min: 10000, max: 19999 },
        { id: 6, value: "Diamond", min: 20000, max: Infinity },
    ];
    
    const filteredUserAccounts = userAccounts.filter((user) => {
        const matchesSearch =
        user.firstName.toLowerCase().startsWith(searchInput.toLowerCase()) ||
        user.lastName.toLowerCase().startsWith(searchInput.toLowerCase()) ||
        user.username.toLowerCase().startsWith(searchInput.toLowerCase());
    
        const statusInfo = statusOptions.find((s) => s.value === filteredStatus);
        const matchesStatus = statusInfo
            ? user.totalPaid >= statusInfo.min && user.totalPaid <= statusInfo.max
            : false;
    
        return matchesSearch && (filteredStatus === "All" || matchesStatus);
    });

    const reauthenticateUser = async (email: string, password: string) => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const credential = EmailAuthProvider.credential(email, password);
            return reauthenticateWithCredential(user, credential);
        }
        throw new Error("No user is currently logged in.");
    };

    const handleDeleteUser = async (username: string) => {
        try {
            // Ensure username is provided
            if (!username) {
                alert("Please provide a username to delete.");
                return;
            }

            // Call the delete API with the username
            const response = await fetch("/api/deleteUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }), // Correctly send the username
            });

            const data = await response.json(); // Get the response data
            console.log("Response data:", data); // Log the response data

            if (response.ok) {
                // If the deletion was successful, update the state accordingly
                setUserAccounts((prev) =>
                    prev.filter((user) => user.username !== username)
                );
            } else {
                // Since we've already read the response body, we can use 'data' here
                console.error("Error data:", data); // Log error message
                alert(`Failed to delete user: ${data.error || "Please try again."}`);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user. Please try again.");
        }
    };

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
                justify-center items-start
                lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[600px] flex flex-col gap-2">
                {/* HEADER */}
                <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
                    Accounts
                </h1>
                {/* CREATE BUTTON, SEARCH BAR, ACCOUNT TYPE, AND FILTER CONTAINER*/}
                <div className="flex flex-col-reverse items-center gap-2 w-full mb-2 md:flex-row-reverse">
                    <div className="flex items-center gap-2 justify-between w-full">
                        {/* SEARCH BAR */}
                        <input
                            type="text"
                            id="inputSearch"
                            placeholder="Search accounts..."
                            className="border-2 border-solid border-gray-200 text-sm sm:text-base
                                md:text-lg h-10 pl-2 rounded-md bg-gray-50 w-full font-semibold"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                        />
                        {/* FILTER */}
                        {accountType === "users" ? (
                            <UsersFilter onFilterChange={handleFilterChange} />
                        ) : (
                            <AdminStaffFilter />
                        )}
                    </div>
                    <div className="flex gap-2 items-center justify-between w-full md:w-1/2">
                        {/* SELECT ACCOUNT TYPE */}
                        <select
                            name="selectAccounts"
                            id="selectAccounts"
                            className="w-2/3 rounded-md border-2 border-gray-100 shadow-md h-10 bg-whitep px-4 font-bold text-center
                            text-gray-500"
                            onChange={handleCategoryChange}
                        >
                            <option value="users">Users</option>
                            <option value="staff">Staff</option>
                        </select>
                        {/* CREATE BUTTON */}
                        <Link
                            href={`fkstllaccounts/add${accountType === "users" ? "users" : ""
                                }`}
                            className="bg-orange-950 text-white font-bold h-10 w-1/3 rounded-md shadow-md
                                hover:scale-[1.02] hover:bg-orange-900 duration-200 pt-2 text-center md:w-auto md:px-4"
                        >
                            Create
                        </Link>
                    </div>
                </div>
                {/* ACCOUNTS LIST CONTAINER */}
                {accountType === "users" ? (
                    <div className="w-full flex flex-col justify-center gap-2 max-h-[720px] overflow-y-auto pb-2">
                        {/* USER ACCOUNTS */}
                        {filteredUserAccounts.map((user) => (
                            <div
                                className="w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                                    flex flex-col justify-center gap-2"
                                key={user.username}
                                onClick={() => toggleOrder(user.username)}
                            >
                                {/* USER HEADER CONTAINER */}
                                <div className="flex gap-2 justify-between items-center">
                                    <div className="flex flex-col gap-0">
                                        {/* USER FULL NAME */}
                                        <h1 className="sm:text-lg font-bold text-gray-900 mb-[-4px]">
                                            {user.firstName + " " + user.lastName}
                                        </h1>
                                        {/* USER EMAIL */}
                                        <p className="text-sm font-light text-gray-500">
                                            {user.username}
                                        </p>
                                        <p
                                            className={`text-xs font-bold uppercase text-${user.totalPaid < 1000
                                                    ? "gray-700"
                                                    : user.totalPaid < 5000
                                                        ? "orange-900"
                                                        : user.totalPaid < 10000
                                                            ? "gray-400"
                                                            : user.totalPaid < 20000
                                                                ? "yellow-500"
                                                                : "green-600"
                                                }`}
                                        >{`${user.totalPaid < 1000
                                                ? "REGULAR"
                                                : user.totalPaid < 5000
                                                    ? "BRONZE"
                                                    : user.totalPaid < 10000
                                                        ? "SILVER"
                                                        : user.totalPaid < 20000
                                                            ? "GOLD"
                                                            : "DIAMOND"
                                            } MEMBER`}</p>
                                    </div>

                                    {/* ARROW */}
                                    <span
                                        className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center
                                            mr-4 cursor-pointer"
                                    >
                                        <i
                                            className={`fa ${expandedOrders[user.username]
                                                    ? "fa-caret-down"
                                                    : "fa-caret-right"
                                                } text-gray-300 text-xs`}
                                            aria-hidden="true"
                                        ></i>
                                    </span>
                                </div>
                                {/* EXPANDED DETAILS AND ACTIONS CONTAINER */}
                                {expandedOrders[user.username] && (
                                    <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-1 items-start">
                                        {/* ADDRESS */}
                                        <div className="flex flex-col">
                                            <h1 className="text-xs font-light text-gray-600">
                                                Address
                                            </h1>
                                            <p className="text-sm text-gray-600 font-semibold">
                                                {user.address}
                                            </p>
                                        </div>
                                        {/* PHONE NUMBER */}
                                        <div className="flex flex-col">
                                            <h1 className="text-xs font-light text-gray-600">
                                                Phone Number
                                            </h1>
                                            <p className="text-sm text-gray-600 font-semibold">
                                                {user.phone}
                                            </p>
                                        </div>
                                        {/* ACTIONS */}
                                        <div className="w-full flex gap-2 items-center">
                                            {/* EDIT BUTTON */}
                                            {/* <Link
                        href={`/fkstllaccounts/editusers/${users.username}`}
                        className="h-10 text-center pt-1.5 font-bold text-gray-500 bg-white w-1/2 border-gray-100
                        border-2 shadow-md rounded-md hover:bg-gray-50 hover:scale-[1.02] duration-200"
                      >
                        Edit
                      </Link> */}
                                            {/* DELETE BUTTON */}
                                            <button
                                                className="h-10 w-full bg-red-500 font-bold text-white rounded-md shadow-md
                                                hover:bg-red-400 hover:scale-[1.02] duration-200 mt-2"
                                                onClick={() => handleDeleteUser(user.username)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex flex-col justify-center gap-2">
                        {/* STAFF ACCOUNTS */}
                        {staffAccounts.map((staff) => (
                            <div
                                className="w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                                    flex flex-col justify-center gap-2"
                                key={staff.username}
                            >
                                <div className="flex flex-col gap-0">
                                    {/* STAFF NAME */}
                                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-[-4px]">
                                        {staff.firstName + " " + staff.lastName}
                                    </h1>
                                    <p className="font-light text-gray-500 text-sm">
                                        {staff.username}
                                    </p>
                                </div>
                                {/* STATUS AND ROLE CONTAINER */}
                                <div className="w-full flex items-center gap-1">
                                    {/* ACTIVE OR NOT */}
                                    <div className="w-1/2 flex flex-col gap-1 items-center justify-center">
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
                                        >
                                            {status.map((stat) => (
                                                <option value={stat.value} key={stat.id}>
                                                    {stat.value}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* ROLE */}
                                    <div className="w-1/2 flex flex-col gap-1 items-center justify-center">
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
                                        >
                                            {roles.map((stat) => (
                                                <option value={stat.value} key={stat.id}>
                                                    {stat.value}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* ACTIONS CONTAINER */}
                                <div className="w-full flex justify-end gap-1">
                                    <Link
                                        href={`/fkstllaccounts/edit/${staff.username}`}
                                        className="h-10 bg-white border-2 rounded-md shadow-md border-gray-100 font-semibold
                                        text-gray-500 text-center w-1/4 hover:bg-gray-50 hover:scale-[1.02] duration-200 pt-1.5"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="h-10 bg-red-500 rounded-md shadow-md font-semibold
                                        text-orange-50 text-center w-1/4 hover:bg-red-400 hover:scale-[1.02] duration-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountsListPage;
