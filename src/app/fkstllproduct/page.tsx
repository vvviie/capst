"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import {
    menuCategory,
    Availability,
    Drinks,
    MainCourse,
    Pastries,
    Pasta,
    Snacks,
    Sandwiches
} from "../data";

import { db } from "../firebase";
import { collection, getDocs, query, where } from 'firebase/firestore';

const CRUDProductPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("icedDrinks");
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [drinks, setDrinks] = useState<Drinks[]>([]);
    const [mainCourses, setMainCourses] = useState<MainCourse[]>([]);
    const [pastas, setPasta] = useState<Pasta[]>([]);
    const [pastries, setPastries] = useState<Pastries[]>([]);
    const [snacks, setSnacks] = useState<Snacks[]>([]);
    const [sandwiches, setSandwiches] = useState<Sandwiches[]>([]);

    const handleItemClick = (id: string) => {
        setActiveItem(activeItem === id ? null : id);
    };

    const handleOptionsClick = () => {
        setActiveItem(null);
    };

    // Fetch drinks based on the selected category
    useEffect(() => {
        const fetchDrinks = async () => {
            try {
                const drinksRef = collection(db, "drinks");
                const q = query(drinksRef, where("prodCategory", "==", selectedCategory));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setDrinks([]);
                    return;
                }

                const fetchedDrinks: Drinks[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<Drinks, "id">,
                }));

                setDrinks(fetchedDrinks);
            } catch (err) {
                console.error("Error fetching drinks:", err);
            }
        };

        fetchDrinks();
    }, [selectedCategory]);

    // Fetch main courses based on the selected category
    useEffect(() => {
        const fetchMainCourses = async () => {
            try {
                const mainCourseRef = collection(db, "mainCourse");
                const q = query(mainCourseRef, where("prodCategory", "==", selectedCategory));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setMainCourses([]);
                    return;
                }

                const fetchedMainCourses: MainCourse[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<MainCourse, "id">,
                }));

                setMainCourses(fetchedMainCourses);
            } catch (err) {
                console.error("Error fetching main courses:", err);
            }
        };

        fetchMainCourses();
    }, [selectedCategory]);

    useEffect(() => {
        const fetchPastas = async () => {
            try {
                const pastaRef = collection(db, "pasta");
                const q = query(pastaRef, where("prodCategory", "==", selectedCategory));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setPasta([]);
                    return;
                }

                const fetchedPastas: Pasta[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<Pasta, "id">,
                }));

                setPasta(fetchedPastas);
            } catch (err) {
                console.error("Error fetching main courses:", err);
            }
        };

        fetchPastas();
    }, [selectedCategory]);

    useEffect(() => {
        const fetchPastries = async () => {
            try {
                const pastriesRef = collection(db, "pastries");
                const q = query(pastriesRef, where("prodCategory", "==", selectedCategory));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setPastries([]);
                    return;
                }

                const fetchedPastries: Pastries[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<Pastries, "id">,
                }));

                setPastries(fetchedPastries);
            } catch (err) {
                console.error("Error fetching main courses:", err);
            }
        };

        fetchPastries();
    }, [selectedCategory]);

    useEffect(() => {
        const fetchSnacks = async () => {
            try {
                const snacksRef = collection(db, "snacks");
                const q = query(snacksRef, where("prodCategory", "==", selectedCategory));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setSnacks([]);
                    return;
                }

                const fetchedSnacks: Snacks[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<Snacks, "id">,
                }));

                setSnacks(fetchedSnacks);
            } catch (err) {
                console.error("Error fetching main courses:", err);
            }
        };

        fetchSnacks();
    }, [selectedCategory]);

    useEffect(() => {
        const fetchSandwiches = async () => {
            try {
                const sandwichesRef = collection(db, "sandwiches");
                const q = query(sandwichesRef, where("prodCategory", "==", selectedCategory));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setSandwiches([]);
                    return;
                }

                const fetchedSandwiches: Sandwiches[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<Sandwiches, "id">,
                }));

                setSandwiches(fetchedSandwiches);
            } catch (err) {
                console.error("Error fetching main courses:", err);
            }
        };

        fetchSandwiches();
    }, [selectedCategory]);

    // Handle category change
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        console.log(`Selected category: ${newCategory}`);
    };

    const filteredDrinks = useMemo(() => {
        return drinks; 
    }, [drinks]);

    const filteredMainCourses = useMemo(() => {
        return mainCourses; 
    }, [mainCourses]);

    const filteredPastas = useMemo(() => {
        return pastas; 
    }, [pastas]);

    const filteredPastries = useMemo(() => {
        return pastries; 
    }, [pastries]);

    const filteredSnacks = useMemo(() => {
        return snacks; 
    }, [snacks]);

    const filteredSandwiches = useMemo(() => {
        return sandwiches; 
    }, [sandwiches]);

    return (
        <div className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full flex justify-center">
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[1480px]">
                {/* HEADER, MENU CAT, AND SEARCH BAR CONTAINER */}
                <div className="flex flex-col gap-4">
                    {/* HEADER */}
                    <h1 className="text-2xl font-bold text-orange-950">Product Listings</h1>
                    {/* CREATE AND SEARCH CONTAINER */}
                    <div className="flex justify-between items-center gap-4">
                        {/* SELECT MENU CATEGORY */}
                        <select
                            name="menuCategory"
                            id="menuCat"
                            onChange={handleCategoryChange}
                            className="rounded-md shadow-sm border-2 border-gray-100 text-sm sm:text-lg text-gray-600 font-semibold bg-white cursor-pointer h-9"
                        >
                            {menuCategory.map((cats) => (
                                <option value={cats.prodCat} key={cats.id} className="text-center">
                                    {cats.title}
                                </option>
                            ))}
                        </select>
                        {/* SEARCH BAR */}
                        <input
                            type="text"
                            id="inputSearch"
                            placeholder="Search menu..."
                            className="border-2 border-solid border-gray-200 text-xs sm:text-base md:text-lg h-9 pl-2 rounded-md bg-gray-50 w-full"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                    Tap or hover on the item to set availability, edit, or delete.
                </p>
                {/* PRODUCTS */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* ADD PRODUCT BUTTON */}
                    <Link
                        href={"/fkstllproduct/addproduct"}
                        className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer py-4 aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-200 justify-center items-center hover:bg-gray-100 group"
                    >
                        <i className="fa-solid fa-circle-plus text-gray-300 text-7xl md:text-9xl group-hover:text-gray-400"></i>
                        <span className="text-xs md:text-lg text-gray-300 font-bold group-hover:text-gray-400">
                            Add an item
                        </span>
                    </Link>
                    {/* MENU ITEMS */}
                    {filteredDrinks.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => setActiveItem(item.id)}
                            onMouseLeave={() => setActiveItem(null)}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="h-4/5 w-full relative">
                                <Image
                                    src={item.img}
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {/* PRODUCT TITLE */}
                            <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                                {item.title}
                            </h1>
                            {/* AVAILABILITY */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${item.availability === "available" ? "bg-green-600" : "bg-gray-500"}`}
                            ></span>
                            {/* CALORIE CONTENT */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                                    item.calorie === "high"
                                        ? "bg-red-500"
                                        : item.calorie === "med"
                                            ? "bg-orange-400"
                                            : "bg-green-400"
                                }`}
                            ></span>
                            {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
                            {activeItem === item.id && (
                                <div
                                    className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                                    style={{ background: "rgba(0, 0, 0, 0.6)" }}
                                    onClick={handleOptionsClick}
                                >
                                    <button className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10">
                                        Feature
                                    </button>
                                    <select
                                        name=""
                                        id=""
                                        className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Availability.map((availability) => (
                                            <option
                                                key={availability.id}
                                                value={availability.value}
                                                className={`${availability.value === "Available" ? "text-green-600" : "text-gray-500"} font-bold`}
                                            >
                                                {availability.value}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={`/fkstllproduct/editproduct/${item.id}`}
                                        className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredMainCourses.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => setActiveItem(item.id)}
                            onMouseLeave={() => setActiveItem(null)}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="h-4/5 w-full relative">
                                <Image
                                    src={item.img}
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {/* PRODUCT TITLE */}
                            <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                                {item.title}
                            </h1>
                            {/* AVAILABILITY */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${item.availability === "available" ? "bg-green-600" : "bg-gray-500"}`}
                            ></span>
                            {/* CALORIE CONTENT */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                                    item.calorie === "high"
                                        ? "bg-red-500"
                                        : item.calorie === "med"
                                            ? "bg-orange-400"
                                            : "bg-green-400"
                                }`}
                            ></span>
                            {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
                            {activeItem === item.id && (
                                <div
                                    className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                                    style={{ background: "rgba(0, 0, 0, 0.6)" }}
                                    onClick={handleOptionsClick}
                                >
                                    <button className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10">
                                        Feature
                                    </button>
                                    <select
                                        name=""
                                        id=""
                                        className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Availability.map((availability) => (
                                            <option
                                                key={availability.id}
                                                value={availability.value}
                                                className={`${availability.value === "Available" ? "text-green-600" : "text-gray-500"} font-bold`}
                                            >
                                                {availability.value}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={`/fkstllproduct/editproduct/${item.id}`}
                                        className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredPastas.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => setActiveItem(item.id)}
                            onMouseLeave={() => setActiveItem(null)}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="h-4/5 w-full relative">
                                <Image
                                    src={item.img}
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {/* PRODUCT TITLE */}
                            <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                                {item.title}
                            </h1>
                            {/* AVAILABILITY */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${item.availability === "available" ? "bg-green-600" : "bg-gray-500"}`}
                            ></span>
                            {/* CALORIE CONTENT */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                                    item.calorie === "high"
                                        ? "bg-red-500"
                                        : item.calorie === "med"
                                            ? "bg-orange-400"
                                            : "bg-green-400"
                                }`}
                            ></span>
                            {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
                            {activeItem === item.id && (
                                <div
                                    className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                                    style={{ background: "rgba(0, 0, 0, 0.6)" }}
                                    onClick={handleOptionsClick}
                                >
                                    <button className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10">
                                        Feature
                                    </button>
                                    <select
                                        name=""
                                        id=""
                                        className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Availability.map((availability) => (
                                            <option
                                                key={availability.id}
                                                value={availability.value}
                                                className={`${availability.value === "Available" ? "text-green-600" : "text-gray-500"} font-bold`}
                                            >
                                                {availability.value}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={`/fkstllproduct/editproduct/${item.id}`}
                                        className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredPastries.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => setActiveItem(item.id)}
                            onMouseLeave={() => setActiveItem(null)}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="h-4/5 w-full relative">
                                <Image
                                    src={item.img}
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {/* PRODUCT TITLE */}
                            <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                                {item.title}
                            </h1>
                            {/* AVAILABILITY */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${item.availability === "available" ? "bg-green-600" : "bg-gray-500"}`}
                            ></span>
                            {/* CALORIE CONTENT */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                                    item.calorie === "high"
                                        ? "bg-red-500"
                                        : item.calorie === "med"
                                            ? "bg-orange-400"
                                            : "bg-green-400"
                                }`}
                            ></span>
                            {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
                            {activeItem === item.id && (
                                <div
                                    className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                                    style={{ background: "rgba(0, 0, 0, 0.6)" }}
                                    onClick={handleOptionsClick}
                                >
                                    <button className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10">
                                        Feature
                                    </button>
                                    <select
                                        name=""
                                        id=""
                                        className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Availability.map((availability) => (
                                            <option
                                                key={availability.id}
                                                value={availability.value}
                                                className={`${availability.value === "Available" ? "text-green-600" : "text-gray-500"} font-bold`}
                                            >
                                                {availability.value}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={`/fkstllproduct/editproduct/${item.id}`}
                                        className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredSnacks.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => setActiveItem(item.id)}
                            onMouseLeave={() => setActiveItem(null)}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="h-4/5 w-full relative">
                                <Image
                                    src={item.img}
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {/* PRODUCT TITLE */}
                            <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                                {item.title}
                            </h1>
                            {/* AVAILABILITY */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${item.availability === "available" ? "bg-green-600" : "bg-gray-500"}`}
                            ></span>
                            {/* CALORIE CONTENT */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                                    item.calorie === "high"
                                        ? "bg-red-500"
                                        : item.calorie === "med"
                                            ? "bg-orange-400"
                                            : "bg-green-400"
                                }`}
                            ></span>
                            {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
                            {activeItem === item.id && (
                                <div
                                    className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                                    style={{ background: "rgba(0, 0, 0, 0.6)" }}
                                    onClick={handleOptionsClick}
                                >
                                    <button className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10">
                                        Feature
                                    </button>
                                    <select
                                        name=""
                                        id=""
                                        className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Availability.map((availability) => (
                                            <option
                                                key={availability.id}
                                                value={availability.value}
                                                className={`${availability.value === "Available" ? "text-green-600" : "text-gray-500"} font-bold`}
                                            >
                                                {availability.value}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={`/fkstllproduct/editproduct/${item.id}`}
                                        className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredSandwiches.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border-gray-100 border-2 shadow-lg cursor-pointer aspect-square rounded-md flex flex-col gap-1 relative overflow-clip duration-300"
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => setActiveItem(item.id)}
                            onMouseLeave={() => setActiveItem(null)}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="h-4/5 w-full relative">
                                <Image
                                    src={item.img}
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {/* PRODUCT TITLE */}
                            <h1 className="text-center text-orange-950 text-xs font-semibold md:text-lg">
                                {item.title}
                            </h1>
                            {/* AVAILABILITY */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-4 rounded-full ${item.availability === "available" ? "bg-green-600" : "bg-gray-500"}`}
                            ></span>
                            {/* CALORIE CONTENT */}
                            <span
                                className={`w-4 h-4 absolute top-4 left-10 rounded-full ${
                                    item.calorie === "high"
                                        ? "bg-red-500"
                                        : item.calorie === "med"
                                            ? "bg-orange-400"
                                            : "bg-green-400"
                                }`}
                            ></span>
                            {/* OPTIONS TO SET AVAILABILITY, UPDATE, AND DELETE */}
                            {activeItem === item.id && (
                                <div
                                    className="absolute w-full h-full flex flex-col gap-2 justify-center items-center"
                                    style={{ background: "rgba(0, 0, 0, 0.6)" }}
                                    onClick={handleOptionsClick}
                                >
                                    <button className="rounded-sm shadow-md bg-orange-400 w-2/3 text-center font-semibold text-orange-900 hover:bg-orange-300 hover:scale-[.98] duration-200 text-sm min-h-10">
                                        Feature
                                    </button>
                                    <select
                                        name=""
                                        id=""
                                        className="rounded-sm text-center shadow-md w-2/3 border-2 border-gray-100 cursor-pointer text-sm font-semibold text-gray-600 min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Availability.map((availability) => (
                                            <option
                                                key={availability.id}
                                                value={availability.value}
                                                className={`${availability.value === "Available" ? "text-green-600" : "text-gray-500"} font-bold`}
                                            >
                                                {availability.value}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={`/fkstllproduct/editproduct/${item.id}`}
                                        className="rounded-sm shadow-md border-gray-100 border-2 bg-white w-2/3 text-center font-semibold text-gray-600 hover:bg-gray-100 hover:scale-[.98] duration-200 text-sm min-h-10 pt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="rounded-sm shadow-md border-red-500 border-2 bg-red-500 hover:border-red-400 w-2/3 text-center font-semibold text-orange-50 hover:bg-red-400 hover:scale-[.98] duration-200 hover:text-orange-100 text-sm min-h-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CRUDProductPage;
