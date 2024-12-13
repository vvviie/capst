"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const category = [
    {
        id: 1,
        title: "Landing Section",
        desc: "Update the landing section of your website.",
        img: "/coffee.png",
        src: "landing",
    },
    {
        id: 2,
        title: "Information Section",
        desc: "Update the information about your café",
        img: "/cwfood.jpg",
        src: "information",
    },
    {
        id: 3,
        title: "Footer Section",
        desc: "Update the footer section of your website.",
        img: "/coffee.png",
        src: "footer",
    },
];

const AdminHomeMaintenancePage = () => {
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        // Get all cookies as an array
        const cookies = document.cookie ? document.cookie.split(';').map(cookie => cookie.trim()) : [];
    
        // Check if no cookies exist
        if (cookies.length === 0) {
          // Redirect if no cookies exist
        router.push('/');
        return;
        }
    
        // Check if the 'user' cookie exists
        const userCookie = cookies.find(cookie => cookie.startsWith('user='));
    
        if (userCookie) {
          // Redirect if the 'user' cookie exists
        router.push('/');
        }
    }, [router]);

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
                justify-center items-center
                lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[1080px]">
                <div className="w-full flex gap-2 sm:gap-4 items-center">
                    <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                    <span className="text-xl sm:text-2xl text-center font-bold text-orange-900">
                        Home Maintenance
                    </span>
                    <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                <p className="font-light text-xs text-center text-gray-500 mt-1 mb-4">
                    Click or tap a category to view.
                </p>
                {/* CATEGORY CONTAINER */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.map((cat) => (
                        <Link
                            href={`/fkstllhomemaintenance/${cat.src}`}
                            className="sm:relative h-auto w-full rounded-md overflow-hidden bg-white flex sm:flex-col gap-2 sm:justify-end sm:items-center
            shadow-xl hover:bg-gray-50 xl:max-w-[330px] border-2 border-gray-100 justify-center items-center sm:aspect-square"
                            key={cat.id}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="relative sm:absolute sm:top-0 sm:left-0 w-1/3 sm:w-full aspect-square">
                                <Image
                                    src={cat.img}
                                    alt={cat.img}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* TITLE AND DESC */}
                            <div
                                className="w-2/3 flex flex-col pr-5 sm:gap-2 z-10 sm:bg-white sm:pt-2 sm:pb-4 sm:w-full sm:bg-opacity-85
                                    sm:px-10 lg:px-5"
                            >
                                <h1
                                    className="text-left text-lg sm:text-xl font-bold text-orange-900 sm:text-center opacity-100
                                    sm:text-orange-950"
                                >
                                    {cat.title}
                                </h1>
                                <span
                                    className="text-justify text-xs text-gray-500 sm:text-center opacity-100
                                    sm:text-gray-900 sm:font-semibold"
                                >
                                    {cat.desc}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminHomeMaintenancePage;