import React, { useState, useEffect } from "react";
import ChangesMadePopup from "./ChangeMadePopup";
import { auth, db } from "../firebase"; // Import your Firebase config
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Import updateDoc

const EditProfile = ({
  onProfileUpdate,
}: {
  onProfileUpdate: (firstName: string, lastName: string) => void;
}) => {
  // State to manage popup visibility
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  // State to store user details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  // State to manage edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);

  // Update the handleSubmit function to show the confirmation popup
  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      onAuthStateChanged(auth, async (authUser) => {
        if (authUser && authUser.emailVerified) {
          const userDocRef = doc(db, "users", authUser.email ?? "");
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName || "");
            setLastName(userData.lastName || "");
            setPhoneNumber(userData.phoneNumber || "");
            setAddress(userData.address || "");
          }
        }
      });
    };

    fetchUserData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show the confirmation popup
    setIsConfirmingUpdate(true);
  };

  // Add a new function to handle the confirmation popup
  const handleConfirmUpdate = async () => {
    // Update Firebase with new user data
    try {
      const authUser = auth.currentUser;
      if (authUser && authUser.email) {
        const userDocRef = doc(db, "users", authUser.email);
        await updateDoc(userDocRef, {
          firstName,
          lastName,
          phoneNumber,
          address,
        });

        // Notify parent component about the update
        onProfileUpdate(firstName, lastName);

        console.log("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
    }

    // Hide the confirmation popup
    setIsConfirmingUpdate(false);

    // Show the changes made popup
    setIsPopupVisible(true);

    // Hide the changes made popup after 0.75 seconds
    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };

  // Add a new function to handle the cancellation of the update
  const handleCancelUpdate = () => {
    setIsConfirmingUpdate(false);
  };

  // Toggle edit mode
  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <>
      {/* PROFILE DETAILS */}
      <div className="flex justify-between mb-2">
        <h1 className="text-2xl font-bold text-orange-900">
          Your Personal Details
        </h1>

        <button
          type="button"
          className={`bg-${isEditMode ? "gray-500" : "orange-950"} hover:bg-${
            isEditMode ? "gray-600" : "orange-900"
          } text-${
            isEditMode ? "white" : "white"
          } font-bold py-2 px-4 rounded transition duration-300 ease-in-out`}
          onClick={handleEditMode}
        >
          {isEditMode ? "Cancel" : "Edit Info"}
        </button>
      </div>
      {/* PROFILE INFO */}
      {isEditMode ? (
        <form onSubmit={handleSubmit}>
          {/* INPUT ELEMENTS CONTAINER */}
          <div className="space-y-2">
            {/* FIRST NAME INPUT */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-500">First Name</span>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50 transition duration-300 ease-in-out"
                name="firstName"
                id="editFirstName"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            {/* LAST NAME INPUT */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-500">Last Name</span>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50 transition duration-300 ease-in-out"
                name="lastName"
                id="editLastName"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            {/* PHONE NUMBER INPUT */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-500">Phone Number</span>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50 transition duration-300 ease-in-out"
                name="phoneNumber"
                id="editPhoneNumber"
                type="number"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            {/* ADDRESS INPUT */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-500">Address</span>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50 transition duration-300 ease-in-out"
                name="address"
                id="editAddress"
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
          {/* UPDATE PROFILE BUTTON */}
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
            hover:bg-orange-900 transition duration-300 ease-in-out mt-6"
          >
            <span className="font-bold text-md">Update Info</span>
          </button>
        </form>
      ) : (
        <div className="space-y-2">
          {/* FIRST NAME */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500">First Name</span>
            <p className="text-lg">{firstName}</p>
          </div>
          {/* LAST NAME */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500">Last Name</span>
            <p className="text-lg">{lastName}</p>
          </div>
          {/* PHONE NUMBER */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500">Phone Number</span>
            <p className="text-lg">{phoneNumber}</p>
          </div>
          {/* ADDRESS */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500">Address</span>
            <p className="text-lg">{address}</p>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP */}
      {isConfirmingUpdate && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-4 w-1/2 max-w-md md:w-1/2">
            <h2 className="text-lg font-bold mb-2">Confirm Update</h2>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to update your personal details?
            </p>
            <div className="flex flex-col md:flex-row justify-center md:justify-between">
              <button
                className="bg-orange-950 hover:bg-orange-900 text-white font-bold py-1.5 px-3 rounded text-sm mb-2 md:mb-0 md:mr-2 transition duration-300 ease-in-out"
                onClick={handleConfirmUpdate}
              >
                Yes, Update
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 px-3 rounded text-sm transition duration-300 ease-in-out"
                onClick={handleCancelUpdate}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGES MADE POP UP */}
      {isPopupVisible && <ChangesMadePopup />}
    </>
  );
};

export default EditProfile;