import React, { useState, useEffect } from "react";
import ChangesMadePopup from "./ChangeMadePopup";
import { auth, db } from "../firebase"; // Import your Firebase config
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Import updateDoc

const EditProfile = ({ onProfileUpdate }: { onProfileUpdate: (firstName: string, lastName: string) => void }) => {
  // State to manage popup visibility
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  // State to store user details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

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

    // Show the popup when the form is submitted
    setIsPopupVisible(true);

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

    // Hide the popup after 0.75 seconds
    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };

  return (
    <>
      {/* EDIT PROFILE FORM */}
      <form onSubmit={handleSubmit}>
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
              className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
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
              className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
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
              className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
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

