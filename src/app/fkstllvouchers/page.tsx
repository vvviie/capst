"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Ensure this path is correct
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore"; // Import updateDoc and doc
import { Availability } from "../data"; // Adjust import as necessary
import GiveVoucherForm from "../components/GiveVoucherForm";

// Voucher Array
type voucherType = {
  id: string; // Change to string to match Firestore document ID
  title: string;
  value: string;
  available: boolean; // Add available field
  voucherID: string; // Add voucherID field
  voucherDescription: string; // Add voucherDescription field
};

type promoType = {
  id: string; // Change to string to match Firestore document ID
  title: string;
  value: string;
  available: boolean; // Add available field
  promoID: string; // Add voucherID field
  promoDescription: string; // Add voucherDescription field
};

let voucherTypesSelection = [
  {
    id: 1,
    title: "Voucher", // Voucher
    value: "vouchers", // Voucher
  },
  {
    id: 2,
    title: "Promo", // Promo
    value: "promoCodes", // Promo
  },
];

const VoucherListPage = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<voucherType[]>([]); // Updated state type
  const [promos, setPromos] = useState<promoType[]>([]); // Updated state type
  const [searchInput, setSearchInput] = useState<string>(""); // State for search input
  const [selectedType, setSelectedType] = useState<string>("vouchers"); // State for selected type
  const filteredItems = selectedType === "vouchers" ? vouchers : promos;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<voucherType | null>(
    null
  ); // State for selected voucher

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
  };

  const handleItemClick = (id: string) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const handleOptionsClick = () => {
    setActiveItem(null);
  };

  // Function to fetch vouchers based on selected type
  const fetchItems = () => {
    const collectionRef = collection(db, selectedType);

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        available: doc.data().available === true,
      }));

      if (selectedType === "vouchers") {
        setVouchers(itemsData as voucherType[]);
        setPromos([]); // Clear promos if vouchers are selected
      } else if (selectedType === "promoCodes") {
        setPromos(itemsData as promoType[]);
        setVouchers([]); // Clear vouchers if promos are selected
      }
    });

    return unsubscribe; // Return unsubscribe function
  };

  useEffect(() => {
    // Call fetchItems to set up the listener
    const unsubscribe = fetchItems();

    // Cleanup function to unsubscribe from the listener
    return () => {
      unsubscribe(); // Clean up the listener when the component unmounts
    };
  }, [selectedType]); // Add selectedType as a dependency

  // Function to handle availability change
  const handleAvailabilityChange = async (itemId: string, newValue: string) => {
    const isAvailable = newValue === "Available"; // Convert to boolean
    const itemRef = doc(db, selectedType, itemId); // Reference to the specific document

    // Update the document in Firestore
    await updateDoc(itemRef, {
      available: isAvailable,
    });

    // Update the local state for either vouchers or promos
    if (selectedType === "vouchers") {
      setVouchers((prevVouchers) =>
        prevVouchers.map((item) =>
          item.id === itemId ? { ...item, available: isAvailable } : item
        )
      );

      // Update users who have received this voucher
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      // Iterate through each user and update their vouchers
      const userUpdates = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        if (userData.vouchers && userData.vouchers.hasOwnProperty(itemId)) {
          // If the user has this voucher, update the availability
          const existingVoucher = userData.vouchers[itemId]; // Get the existing voucher data

          // Create an updated voucher object with the existing fields and the new availability
          const updatedVoucher = {
            ...existingVoucher,
            available: isAvailable, // Update only the availability
          };

          // Update the user's document with the new vouchers state
          await updateDoc(doc(usersRef, userDoc.id), {
            [`vouchers.${itemId}`]: updatedVoucher, // Update only the specific voucher
          });
        }
      });

      // Wait for all user updates to complete
      await Promise.all(userUpdates);
    } else if (selectedType === "promoCodes") {
      setPromos((prevPromos) =>
        prevPromos.map((item) =>
          item.id === itemId ? { ...item, available: isAvailable } : item
        )
      );
    }
  };

  // Function to handle delete
  const handleDelete = async (itemId: string) => {
    const voucherRef = doc(db, selectedType, itemId); // Reference to the specific voucher document

    // Delete the document in Firestore
    await deleteDoc(voucherRef);
  };

  // Filter vouchers and promos based on search input
  const filteredResults = filteredItems.filter(
    (item) =>
      (selectedType === "vouchers" ? item.voucherID : item.promoID) && // Check if ID exists
      (selectedType === "vouchers" ? item.voucherID : item.promoID)
        .toLowerCase()
        .startsWith(searchInput.toLowerCase())
  );

  // Function to get the appropriate text based on the selected type
  const getActionText = () => {
    return selectedType === "vouchers" ? "Add a Voucher" : "Add a Promo";
  };

  const getInstructionText = () => {
    return selectedType === "vouchers"
      ? "Tap or hover on the voucher to set availability, edit, or delete."
      : "Tap or hover on the promo to set availability, edit, or delete.";
  };

  // Function to fetch vouchers or promos based on selected type
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const collectionRef = collection(db, selectedType);
        const snapshot = await getDocs(collectionRef);

        if (selectedType === "vouchers") {
          const vouchersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            available: doc.data().available === true,
          }));
          setVouchers(vouchersData as voucherType[]);
          setPromos([]); // Clear promos if vouchers are selected
        } else if (selectedType === "promoCodes") {
          const promosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            available: doc.data().available === true,
          }));
          setPromos(promosData as promoType[]);
          setVouchers([]); // Clear vouchers if promos are selected
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [selectedType]);

  return (
    <div className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center">
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1480px]">
        {/* HEADER, MENU CAT, AND SEARCH BAR CONTAINER */}
        <div className="flex flex-col gap-4">
          {/* HEADER*/}
          <h1 className="text-2xl font-bold text-orange-950">
            {selectedType === "vouchers"
              ? "Voucher Listings"
              : "Promo Listings"}
          </h1>
          {/* CREATE AND SEARCH CONTAINER */}
          <div className="flex justify-between items-center gap-4">
            {/* SELECT MENU CATEGORY */}
            <select
              name="menuCategory"
              id="menuCat"
              className="rounded-md shadow-sm border-2 border-gray-100 text-sm sm:text-lg text-gray-600 font-semibold bg-white cursor-pointer h-9 w-1/2 max-w-72"
              value={selectedType} // Set value to selectedType state
              onChange={(e) => setSelectedType(e.target.value)} // Update selectedType state
            >
              {voucherTypesSelection.map((types) => (
                <option
                  value={types.value}
                  key={types.id}
                  className="text-center"
                >
                  {types.title}
                </option>
              ))}
            </select>
            {/* SEARCH BAR */}
            <input
              type="text"
              id="inputSearch"
              placeholder="Search menu..."
              className="border-2 border-solid border-gray-200 text-xs sm:text-base md:text-lg h-9 pl-2 rounded-md bg-gray-50 w-full"
              value={searchInput} // Set value to searchInput state
              onChange={(e) => setSearchInput(e.target.value)} // Update search input state
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          {getInstructionText()}{" "}
          {/* Use the function to get the correct instruction text */}
        </p>
        {/* PRODUCTS */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {/* ADD PRODUCT BUTTON */}
          <Link
            href={
              selectedType === "promoCodes"
                ? "/fkstllvouchers/addpromo"
                : "/fkstllvouchers/addvoucher"
            } // Change the link as needed
            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer py-4 aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-200 justify-center items-center hover:bg-gray-100 group"
          >
            <i className="fa-solid fa-circle-plus text-gray-300 text-7xl md:text-9xl group-hover:text-gray-400"></i>
            <span className="text-xs md:text-lg text-gray-300 font-bold group-hover:text-gray-400">
              {getActionText()}{" "}
              {/* Use the function to get the correct action text */}
            </span>
          </Link>
          {/* MENU ITEMS */}
          {filteredResults.map((items) => (
            <div
              key={items.id}
              className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer items-center px-8 aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300 justify-center"
              onClick={() => handleItemClick(items.id)}
              onMouseEnter={() => setActiveItem(items.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* VOUCHER ICON */}
              <i className="fa-solid fa-ticket text-orange-950 text-7xl"></i>
              {/* PRODUCT TITLE - Changed to display voucherID */}
              <h1 className="text-center text-orange-950 lg:text-lg font-semibold md:text-xl px-6">
                {selectedType === "vouchers" ? items.voucherID : items.promoID}
              </h1>
              {/* VOUCHER DESCRIPTION */}
              <p className="text-center text-gray-600 text-xs lg:text-sm">
                {selectedType === "vouchers"
                  ? items.voucherDescription
                  : items.promoDescription}
              </p>

              {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
              {activeItem === items.id && (
                <div
                  className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                  style={{ background: "rgba(0, 0, 0, 0.6)" }}
                  onClick={handleOptionsClick}
                >
                  <select
                    name=""
                    id=""
                    className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer
                    text-sm font-semibold text-gray-600 min-h-10"
                    onClick={(e) => e.stopPropagation()}
                    value={items.available ? "Available" : "Unavailable"} // Set the dropdown value based on availability
                    onChange={(e) =>
                      handleAvailabilityChange(items.id, e.target.value)
                    } // Handle availability change
                  >
                    <option value="Available" className="text-center">
                      Available
                    </option>
                    <option value="Unavailable" className="text-center">
                      Unavailable
                    </option>
                  </select>
                  {selectedType === "vouchers" && (
                    <button
                      className="rounded-sm shadow-md bg-orange-200 w-2/3 text-center
                    font-semibold text-amber-900 hover:bg-orange-100 hover:scale-[.98] duration-200 text-sm
                    min-h-10"
                      onClick={(e) => {
                        setSelectedVoucher(items); // Set the selected voucher
                        setIsFormOpen(true);
                        e.stopPropagation();
                        //toggleForm();
                      }}
                    >
                      Give to Users
                    </button>
                  )}
                  <Link
                    href={
                      selectedType === "promoCodes"
                        ? `/fkstllvouchers/editpromo/${items.promoID}`
                        : `/fkstllvouchers/editvoucher/${items.voucherID}`
                    }
                    className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center
                    font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm
                    min-h-10 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400
                    w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200
                    hover:text-orange-100 text-sm min-h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(items.id); // Handle delete action
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <GiveVoucherForm
        isOpen={isFormOpen}
        toggleForm={toggleForm}
        selectedVoucher={selectedVoucher}
      />
    </div>
  );
};

export default VoucherListPage;