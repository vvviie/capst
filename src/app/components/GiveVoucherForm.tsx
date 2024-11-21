"use client";

import React, { useState, useRef, useEffect } from "react";
import CheckoutPopup from "./CheckoutPopup";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  getDocs,
  collection,
} from "firebase/firestore"; // Import Firestore functions

type tier = {
  id: number;
  value: string;
};

type tiers = tier[];

const tierList: tiers = [
  {
    id: 1,
    value: "Regular",
  },
  {
    id: 2,
    value: "Bronze",
  },
  {
    id: 3,
    value: "Silver",
  },
  {
    id: 4,
    value: "Gold",
  },
  {
    id: 5,
    value: "Diamond",
  },
];

const GiveVoucherForm = ({ isOpen, toggleForm, selectedVoucher }) => {
  const formRef = useRef(null);
  const [type, setType] = useState("user"); // Set the initial value to match the first option
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [error, setError] = useState("");
  const [tierError, setTierError] = useState("");
  const db = getFirestore();

  // Log selected voucher when the component renders or when it opens
  const handlePopUp = async (id: string) => {
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      toggleForm();
      setEmail("");
      setRecipients([]);
    }
  };
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const validateEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkUserExists = async (email) => {
    if (!validateEmail(email)) {
      setError("Please enter a valid username"); // Set error message for invalid email
      return;
    }
    const userDocRef = doc(db, "users", email); // Reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (userDoc.exists()) {
      const userData = userDoc.data(); // Get the data of the document
      if (userData.role === "user") {
        if (!recipients.includes(email)) {
          console.log("User exists with role 'user':", email);
          setRecipients((prevRecipients) => [...prevRecipients, email]); // Add the email to the recipients array
          setError("");
        } else {
          console.log("User already added to recipients:", email);
          setError("");
        }
      } else {
        console.log("User  exists but does not have role 'user':", email);
        setError("This Username exist but is not a 'User'.");
      }
    } else {
      console.log("User  does not exist:", email);
      setError("User does not exist."); // Set error message if user does not exist
    }
  };

  const handleAddUser = () => {
    if (email.trim() === "") {
      setError("Please input a username."); // Set error for empty username
      return;
    }
    checkUserExists(email);

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  const handleRemoveRecipient = (emailToRemove) => {
    setRecipients((prevRecipients) =>
      prevRecipients.filter((recipient) => recipient !== emailToRemove)
    ); // Remove the recipient from the array
    setActiveRecipient(null); // Close the action menu
  };

  const handleRecipientClick = (email) => {
    setActiveRecipient(activeRecipient === email ? null : email);
  };

  useEffect(() => {
    if (isOpen && selectedVoucher) {
      console.log("Selected Voucher:", selectedVoucher);
    }
  }, [isOpen, selectedVoucher]);

  const sendVoucherToRecipients = async () => {
    if (type === "user") {
      // Handle sending voucher to users

      // Check if recipients are empty
      if (recipients.length === 0) {
        setError("Please add a recipient.");
        setTimeout(() => {
          setError("");
        }, 4000);
        return; // Exit the function if there are no recipients
      }
      // if (!validateEmail(email)) {
      //   setError("Please add a recipient.");
      //   setTimeout(() => {
      //     setError("");
      //   }, 4000);
      //   return;
      // }
      try {
        for (const recipient of recipients) {

          // Get the current date and time
          const now = new Date();
        
          // Format date as MM/DD/YYYY
          const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
        
          // Format time as HH:MM (without seconds and milliseconds)
          const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

          const userDocRef = doc(db, "users", recipient);
          const userDoc = await getDoc(userDocRef); // Fetch the user document
          const userData = userDoc.data();
          const userVouchers = userData.vouchers || {}; // Fetch existing vouchers or initialize as empty object

          const voucherKey = selectedVoucher.id; // Use the existing id as the key

          // Log the selected voucher to check its properties
          console.log("Selected Voucher Key:", voucherKey);

          // Check if the required properties are defined
          if (!selectedVoucher || !voucherKey || !selectedVoucher.voucherName) {
            console.error("Selected voucher is missing required properties.");
            setError("Selected voucher is missing required properties.");
            continue; // Skip this recipient if the voucher is invalid
          }

          // Fetch the latest voucher details from the Firestore collection
          const voucherDoc = await getDoc(doc(db, "vouchers", voucherKey)); // Reference to the vouchers collection
          const voucherData = voucherDoc.data();

          if (!voucherData) {
            console.error(`Voucher with key ${voucherKey} does not exist.`);
            setError(`Voucher not found: ${voucherKey}`);
            continue; // Skip if voucher data is not found
          }

          // Prepare the voucher object to assign
          const voucherToAssign = {
            used: false,
            isRead: false,
            isNotifDeleted: false,
            dateCreated: date,
            timeCreated: time,
            available: voucherData.available,
            deductionType: voucherData.deductionType,
            thresholdCondition: voucherData.thresholdCondition || null, // Assign null if undefined
            thresholdUse: voucherData.thresholdUse,
            usageLimitType: voucherData.usageLimitType,
            validityType: voucherData.validityType,
            voucherDeduction: voucherData.voucherDeduction,
            voucherDescription: voucherData.voucherDescription,
            voucherID: voucherData.voucherID,
            voucherName: voucherData.voucherName,
          };

          // Check if the voucher has already been assigned to the user
          if (!userVouchers[voucherKey]) {
            // Assign the voucher to the user
            userVouchers[voucherKey] = voucherToAssign;

            // Update Firestore with the new voucher data for the user
            await updateDoc(userDocRef, { vouchers: userVouchers });
            console.log(`Voucher assigned to ${recipient}`);
          } else {
            console.log(`Voucher already assigned to ${recipient}`);
          }
        }

        setIsPopUpVisible(true);
        setTimeout(() => {
          setIsPopUpVisible(false);
          toggleForm();
        }, 750);

        // Reset the inputted username and recipients
        setEmail(""); // Assuming setEmail is the function to update the username state
        setRecipients([]); // Assuming setRecipients is the function to update the recipients state
      } catch (error) {
        console.error("Error sending voucher:", error);
        setError("Failed to send voucher. Please try again.");
      }
    } else if (type === "tier") {
      // Check if at least one tier is selected
      const selectedTiers = tierList.filter((tier) => {
        const checkbox = document.getElementById(`input${tier.value}`);
        return checkbox && checkbox.checked;
      });

      if (selectedTiers.length === 0) {
        setTierError("Please select at least one tier.");
        return; // Prevent further execution if no tier is selected
      } else {
        setTierError(""); // Clear error if at least one tier is selected
      }
      // Handle sending voucher to tiers
      console.log("Sending voucher to tiers...");
      try {
        const usersSnapshot = await getDocs(collection(db, "users")); // Fetch all users
        const users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); // Get user data

        const selectedTiers = tierList.filter((tier) => {
          const checkbox = document.getElementById(`input${tier.value}`);
          return checkbox && checkbox.checked;
        });

        for (const tier of selectedTiers) {
          for (const user of users) {
            let shouldSendVoucher = false;

            // Determine if the user qualifies for the selected tier
            switch (tier.value) {
              case "Regular":
                if (user.totalPaid < 1000) shouldSendVoucher = true;
                break;
              case "Bronze":
                if (user.totalPaid >= 1000 && user.totalPaid < 5000)
                  shouldSendVoucher = true;
                break;
              case "Silver":
                if (user.totalPaid >= 5000 && user.totalPaid < 10000)
                  shouldSendVoucher = true;
                break;
              case "Gold":
                if (user.totalPaid >= 10000 && user.totalPaid < 20000)
                  shouldSendVoucher = true;
                break;
              case "Diamond":
                if (user.totalPaid >= 20000) shouldSendVoucher = true;
                break;
              default:
                break;
            }

            // If the user qualifies for the tier, send the voucher
            if (shouldSendVoucher) {
              const userDocRef = doc(db, "users", user.id);
              const userVouchers = user.vouchers || {};

              const voucherKey = selectedVoucher.id;

              if (
                !selectedVoucher ||
                !voucherKey ||
                !selectedVoucher.voucherName
              ) {
                console.error(
                  "Selected voucher is missing required properties."
                );
                continue;
              }

              const voucherDoc = await getDoc(doc(db, "vouchers", voucherKey));
              const voucherData = voucherDoc.data();

              if (!voucherData) {
                console.error(`Voucher with key ${voucherKey} does not exist.`);
                continue;
              }

              const voucherToAssign = {
                used: false,
                isRead: false,
                isNotifDeleted: false,
                dateCreated: new Date().toLocaleDateString(),
                timeCreated: new Date().toLocaleTimeString(),
                available: voucherData.available,
                deductionType: voucherData.deductionType,
                thresholdCondition: voucherData.thresholdCondition || null,
                thresholdUse: voucherData.thresholdUse,
                usageLimitType: voucherData.usageLimitType,
                validityType: voucherData.validityType,
                voucherDeduction: voucherData.voucherDeduction,
                voucherDescription: voucherData.voucherDescription,
                voucherID: voucherData.voucherID,
                voucherName: voucherData.voucherName,
              };

              if (!userVouchers[voucherKey]) {
                userVouchers[voucherKey] = voucherToAssign;
                await updateDoc(userDocRef, { vouchers: userVouchers });
                console.log(
                  `Voucher assigned to ${user.id} for tier ${tier.value}`
                );
              } else {
                console.log(`Voucher already assigned to ${user.id}`);
              }
            }
          }
        }

        setIsPopUpVisible(true);
        setTimeout(() => {
          setIsPopUpVisible(false);
          toggleForm();
        }, 750);
      } catch (error) {
        console.error("Error sending vouchers to tiers:", error);
        setError("Failed to send vouchers to tiers. Please try again.");
      }
    }
  };

  //
  if (!isOpen) return null; // Only render if form is open

  return (
    <div
      className="fixed left-0 top-14 w-full h-[100vh] flex justify-center items-center z-10 px-4"
      style={{ background: "rgba(0, 0, 0, 0.85)" }}
    >
      <form
        action=""
        ref={formRef}
        className="bg-white px-4 py-2 rounded shadow-lg flex-1 max-w-[300px] sm:max-w-[420px] md:max-w-[500px]
        flex flex-col gap-4"
      >
        {/* HEADER */}
        <div className="flex gap-2 items-center justify-between">
          <h1 className="font-semibold text-gray-700 text-lg">
            Send Voucher To
          </h1>
          <select
            name="type"
            id="type"
            value={type} // Set the value to match the state
            onChange={handleTypeChange} // Update the state on change
            className="rounded-md border-2 border-gray-100 shadow-md px-2 py-1 w-1/2 h-10 text-center
          text-gray-500 font-bold"
          >
            <option value="user">User</option>
            <option value="tier">Tier</option>
          </select>
        </div>
        {type === "user" ? (
          <div className="flex flex-col gap-2">
            {/* INPUT AND BUTTON CONTAINER */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="inputUser"
              >
                <span>Username of recipient</span>
              </label>
              <input
                type="text"
                name="inputUser"
                id="inputUser"
                placeholder="youremail@email.com"
                value={email} // Bind the input value to the state
                onChange={handleEmailChange} // Handle email input change
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
              />
              <div className="flex items-center w-full">
                <div className="flex-grow flex items-center">
                  {error && (
                    <span className="text-red-600 text-sm mr-2">{error}</span> // Display error message
                  )}
                </div>
                <button
                  className="bg-white border-2 border-gray-100 shadow-md rounded-md
      font-bold h-10 hover:scale-[1.02] hover:bg-gray-50 duration-200 text-gray-500 w-1/2" // Fixed width for button
                  type="button"
                  onClick={handleAddUser} // Call the function to check if the user exists
                >
                  Add User
                </button>
              </div>
            </div>
            {recipients.length > 0 && (
              <>
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1 mb-[-4px] mt-1"
                  htmlFor="recipients"
                >
                  <span>Recipients</span>
                </label>
                <hr />
                <div className="w-full flex flex-wrap gap-1">
                  {recipients.map((user) => (
                    <div key={user} className="relative flex items-center">
                      {activeRecipient === user ? (
                        <span className="flex items-center py-1 px-2 bg-orange-300 text-white rounded-full text-sm cursor-pointer">
                          <button
                            className="bg-transparent text-white rounded-full text-sm cursor-pointer hover:bg-orange-400 transition duration-200 ease-in-out py-1 px-2"
                            onClick={() => handleRemoveRecipient(user)} // Call the remove function
                          >
                            Remove
                          </button>
                          <span className="mx-2 text-white">|</span>{" "}
                          {/* Vertical separator */}
                          <button
                            className="bg-transparent text-white rounded-full text-sm cursor-pointer hover:bg-orange-400 transition duration-200 ease-in-out py-1 px-2"
                            onClick={() => setActiveRecipient(null)} // Close the action menu
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span
                          className="py-1 px-2 bg-orange-300 text-white rounded-full text-sm cursor-pointer"
                          onClick={() => handleRecipientClick(user)} // Toggle action menu on click
                        >
                          {user}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <hr />
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {tierError && (
              <span className="text-red-600 text-sm mb-2">{tierError}</span>
            )}
            {tierList.map((tier) => (
              <div
                className={`w-full flex items-center justify-start h-10 pl-3
                ${
                  tier.value === "Regular"
                    ? "bg-neutral-400"
                    : tier.value === "Bronze"
                    ? "bg-orange-900"
                    : tier.value === "Silver"
                    ? "bg-gray-300"
                    : tier.value === "Gold"
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                } rounded-md`}
              >
                <input
                  type="checkbox"
                  name="inputTier"
                  id={`input${tier.value}`}
                  className={`h-5 w-5`}
                />
                <span className="pl-3 text-white">{tier.value} Members</span>
              </div>
            ))}
          </div>
        )}
        <button
          className="w-full bg-orange-950 h-10 font-bold text-white rounded-md shadow-md
          hover:bg-orange-900 hover:scale-[1.02] duration-200 mb-1"
          type="button"
          onClick={sendVoucherToRecipients}
          /*onClick={() => {
            setIsPopUpVisible(true);
            sendVoucherToRecipients();  // Call this function immediately
          
            setTimeout(() => {
              setIsPopUpVisible(false);
              toggleForm();
            }, 750);
          }}*/
        >
          Send Voucher
        </button>
      </form>
      {isPopUpVisible && <CheckoutPopup message={`Voucher sent!`} />}
    </div>
  );
};

export default GiveVoucherForm;