"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore"; // Import Firestore methods
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { db } from "@/app/firebase";

type Vouch = {
    id: string;
    title: string;
    desc: string;
    deduction?: number;
    type?: string;
};

// SAMPLE VOUCHERS TYPE
type Vouchs = Vouch[];

const ViewVouchers = () => {
    const [vouchers, setVouchers] = useState<Vouchs>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Vouch | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // Fetch vouchers from Firestore based on userEmail
    useEffect(() => {
        let unsubscribe: () => void; // Declare unsubscribe function

        if (userEmail) {
            const userDocRef = doc(db, 'users', userEmail);
            // Use onSnapshot for real-time updates
            unsubscribe = onSnapshot(userDocRef, (userDoc) => {
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userVouchers = userData.vouchers;

                    const formattedVouchers: Vouch[] = Object.entries(userVouchers)
                        .filter(([key, value]: any) => value.used === false) // Filter out used vouchers
                        .map(([key, value]: any) => ({
                            id: value.voucherID,
                            title: value.voucherID,
                            desc: value.voucherDescription,
                            deduction: value.voucherDeduction,
                            type: value.voucherType
                        }));

                    setVouchers(formattedVouchers);
                } else {
                    setVouchers([]); // Clear vouchers if document does not exist
                }
            });
        }

        // Cleanup subscription on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [userEmail]);

    // Check if the user is logged in
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser && authUser.emailVerified) {
                setIsLoggedIn(true);
                setUserEmail(authUser.email); 
            } else {
                setIsLoggedIn(false);
                setUserEmail(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex flex-col">
            {/* VOUCHER INFO DISPLAY HEADER */}
            <h1 className="text-lg font-bold text-orange-900 text-center">
                {selectedVoucher ? "Selected Voucher" : vouchers.length > 0 ? "Available Vouchers" : "No Available Vouchers"}
            </h1>
            {/* VOUCHER INFO DISPLAY CONTAINER */}
            <div className="flex flex-col items-center">
                {/* ICON */}
                <i className="fa-solid fa-ticket text-orange-950 text-7xl"></i>

                {selectedVoucher ? (
                    <>
                        {/* VOUCHER TITLE */}
                        <h1 className="font-bold text-orange-950 text-xl">
                            {selectedVoucher.title}
                        </h1>
                        {/* VOUCHER DESCRIPTION */}
                        <p className="text-sm">{selectedVoucher.desc}</p>
                        {/* LINK TO MENU BUTTON */}
                        <Link
                            href="/menu"
                            className="flex items-center justify-center space-x-2 px-6 h-10 rounded-md shadow-md text-white bg-orange-950
                            hover:bg-orange-900 duration-100 mt-2"
                        >
                            <span className="font-bold text-md">Order Now</span>
                        </Link>
                    </>
                ) : (
                    <p className="text-sm mt-8">
                        {vouchers.length > 0 ? "" : "No available vouchers to display."}
                    </p>
                )}
            </div>
            
            {/* Conditionally display the "Select a Voucher" section only if there are vouchers */}
            {vouchers.length > 0 && (
                <>
                    <hr className="my-4" />
                    {/* SELECT VOUCHER HEADER */}
                    <h1 className="text-lg font-bold text-orange-900 text-center mb-4">
                        Select a voucher
                    </h1>
                    {/* VOUCHERS CONTAINER */}
                    <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-auto lg:grid-cols-3">
                        {vouchers.map((vouch) => (
                            // VOUCHERS
                            <span
                                key={vouch.id}
                                onClick={() => setSelectedVoucher(vouch)}
                                className={`${selectedVoucher?.id === vouch.id
                                    ? "bg-orange-100 text-orange-900 hover:bg-gray-200" // color
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                                } font-bold text-center
                                rounded-md shadow-sm border-gray-50 border-2 py-2 cursor-pointer`}
                            >
                                {vouch.title}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ViewVouchers;
