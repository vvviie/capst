"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React from "react";
import { useState } from "react";

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

const AddStaffAccountPage = () => {
    //   PARA LANG SA POP-UP KAPAG NAG-ADD BUTTON
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    //   PARA LANG SA POP-UP KAPAG NAG-ADD BUTTON
    const handleSubmit = () => {
        setIsPopupVisible(true);

        setTimeout(() => {
            setIsPopupVisible(false);
        }, 750);
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
                            placeholder="Email Address"
                            required
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
                            >
                                {status.map((stat) => (
                                    <option value={stat.value} key={stat.id}>
                                        {stat.value}
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
                            >
                                {roles.map((stat) => (
                                    <option value={stat.value} key={stat.id}>
                                        {stat.value}
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