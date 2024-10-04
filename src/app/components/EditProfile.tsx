import React, { useState } from "react";
import ChangesMadePopup from "./ChangeMadePopup";

const EditProfile = () => {
    // State to manage popup visibility
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Show the popup when the form is submitted
        setIsPopupVisible(true);

        // Hide the popup after 1.5 seconds
        setTimeout(() => {
            setIsPopupVisible(false);
        }, 750);
    };

    return (
        <>
            {/* EDIT PROFILE FORM */}
            <form onSubmit={handleSubmit} className="">
                {/* HEADER */}
                <h1 className="text-2xl font-bold mb-2 text-orange-900">
                    Edit Profile
                </h1>
                {/* INPUT ELEMENTS CONTAINER */}
                <div className="space-y-2">
                    {/* FIRST NAME INPUT */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-500">First Name</span>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
                            name="firstName"
                            id="editFirstName"
                            type="text"
                            placeholder="Juan"
                            value={"Juan"}
                            required
                        />
                    </div>
                    {/* LAST NAME INPUT */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-500">Last Name</span>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
                            name="lastName"
                            id="editLastName"
                            type="text"
                            placeholder="Dela Cruz"
                            value={"Dela Cruz"}
                            required
                        />
                    </div>
                    {/* PHONE NUMBER INPUT */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-500">Phone Number</span>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
                            name="phoneNumber"
                            id="editPhoneNumber"
                            type="number"
                            placeholder="Phone Number"
                            value={"09123456789"}
                            required
                        />
                    </div>
                    {/* ADDRESS INPUT */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-500">Address</span>
                        <input
                            className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
                            name="address"
                            id="editAddress"
                            type="text"
                            placeholder="Address"
                            value={"246 Magnolia St., Fiore"}
                            required
                        />
                    </div>
                </div>
                {/* UPDATE PROFILE BUTTON */}
                <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
            hover:bg-orange-900 duration-100 mt-6"
                >
                    <span className="font-bold text-md">Update Profile</span>
                </button>
            </form>

            {/* CHANGES MADE POP UP */}
            {isPopupVisible && <ChangesMadePopup />}
        </>
    );
};

export default EditProfile;