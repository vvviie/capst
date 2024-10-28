"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const data = [
    {
        id: 1,
        title: "Enjoy gourmet meals and coffee at our cozy café and restaurant.",
        desc: "Enjoy gourmet meals and coffee at our cozy café and restaurant.",
        img: "/coffee.png",
    },
    {
        id: 2,
        title:
            "Experience culinary delights and warm ambiance at our charming eatery.",
        desc: "Experience culinary delights and warm ambiance at our charming eatery.",
        img: "/cwfood.jpg",
    },
];

const AdminLandingPageMaintenance = () => {
    const [addSlideClicked, setAddSlideClicked] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
    const handleSubmit = () => {
        setIsPopupVisible(true);

        setTimeout(() => {
            setIsPopupVisible(false);
        }, 750);
    };

    const handleAddClick = () => {
        setIsEditMode(false);
        setAddSlideClicked(true);
    };

    const handleEditClick = () => {
        setIsEditMode(true);
        setAddSlideClicked(true);
    };

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div
                className={`w-full flex flex-col gap-2 max-w-[${!addSlideClicked ? "640" : "900"
                    }px] justify-center`}
            >
                {/* HEADER CONTAINER */}
                <div className="flex justify-start items-center gap-2">
                    {/* LINK BACK TO PRODUCTS */}
                    <Link
                        href={"/fkstllhomemaintenance"}
                        className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
                    >
                        Maintenance
                    </Link>
                    <div className="text-xl sm:text-2xl font-bold text-orange-950 space-x-2 flex items-center">
                        <i className="fa fa-angle-right" aria-hidden="true"></i>
                        <span>Landing Section</span>
                    </div>
                </div>
                <div
                    className="bg-white border-2 border-gray-100 shadow-md w-full flex flex-col gap-4 px-4
        rounded-md pt-2 pb-6 max-w-[900px]"
                >
                    {!addSlideClicked && (
                        // EXISTING SLIDES
                        <div className="w-full flex flex-col gap-4 items-center justify-center">
                            <h1 className="w-full text-start text-xl font-bold text-orange-950">
                                Existing Slides
                            </h1>
                            {data.map((slide) => (
                                <div className="w-full space-y-2" key={slide.id}>
                                    {/* IMAGE AND TEXTS */}
                                    <div className="w-full flex items-start">
                                        {/* IMAGE CONTAINER */}
                                        <div className="relative aspect-square w-1/3">
                                            <Image
                                                src={slide.img}
                                                alt=""
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        {/* HEADER AND DESC */}
                                        <div className="flex flex-col gap-2 w-2/3 px-2">
                                            {/* HEADER */}
                                            <div className="md:text-lg font-bold text-orange-950">
                                                {slide.title}
                                            </div>
                                            {/* DESC */}
                                            <div className="text-xs text-gray-500">{slide.desc}</div>
                                        </div>
                                    </div>
                                    {/* BUTTONS */}
                                    <div className="w-full flex gap-1.5">
                                        {/* EDIT BUTTON */}
                                        <button
                                            className="bg-white border-2 border-gray-100 shadow-md
                    rounded-md text-gray-500 w-2/3 font-bold h-10
                    hover:bg-gray-50 hover:scale-[1.02] duration-200"
                                            onClick={handleEditClick}
                                        >
                                            Edit
                                        </button>
                                        {/* DELETE BUTTON */}
                                        <button
                                            className="bg-red-500 border-2 border-red-500 shadow-md
                    rounded-md text-white w-1/3 font-bold h-10
                    hover:bg-red-400 hover:border-red-400 hover:scale-[1.02] duration-200"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="h-1"></div>
                                    <hr />
                                </div>
                            ))}
                            <div className="w-full flex justify-end">
                                <button
                                    className="w-full bg-orange-950 shadow-md rounded-md text-white font-bold h-10 gap-1
                flex items-center justify-center hover:bg-orange-900 hover:scale-[1.02] duration-200"
                                    onClick={handleAddClick}
                                >
                                    <i
                                        className="fa-solid fa-circle-plus text-white text-md md:text-lg md:mt-0.5
            group-hover:text-gray-400"
                                    ></i>
                                    <span>Add a slide</span>
                                </button>
                            </div>
                        </div>
                    )}
                    {/* EDIT LANDING PAGE FORM */}
                    {addSlideClicked && (
                        // HEADER
                        <form className="w-full flex flex-col gap-2 items-center justify-center lg:flex-row">
                            {/* IMAGE CONTAINER */}
                            <div className="flex-1 flex flex-col lg:justify-between lg:h-full">
                                {/* HEADER */}
                                <h1 className="w-full text-start text-xl font-bold text-orange-950 lg:max-w-72">
                                    Image
                                </h1>
                                {/* IMAGE CONTAINER */}
                                <div className="relative w-full lg:w-72 aspect-square rounded-md overflow-clip">
                                    <Image src={""} alt={""} fill className="object-contain" />
                                </div>
                                {/* NOTE */}
                                <div className="w-auto flex items-center gap-2 text-center lg:max-w-72">
                                    <div className="text-sm text-gray-500">
                                        <div className="h-4 w-4 rounded-full text-center inline-block bg-gray-500 text-xs text-white">
                                            <span>i</span>
                                        </div>
                                        <span className="pl-2 lg:text-xs">
                                            Must have white or transparent background to compliment
                                            with the layout.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ADD IMAGE, HEADER, AND DESC CONTAINER */}
                            <div className="w-full lg:w-full flex flex-col gap-2 lg:justify-between h-full lg:pl-4">
                                {/* ADD IMAGE */}
                                <div className="flex flex-col gap-2 justify-center">
                                    {/* HEADER */}
                                    <h1 className="w-full text-start text-xl font-bold text-orange-950 hidden lg:block">
                                        Image Upload
                                    </h1>
                                    {/* UPLOAD IMAGE*/}
                                    <div className="w-full flex flex-col gap-1.5 items-center justify-center mb-4">
                                        <label
                                            className="text-orange-950 text-sm w-full text-left space-x-1"
                                            htmlFor="prodID"
                                        >
                                            <span>Image</span>
                                        </label>
                                        <div className="flex flex-col w-full items-end gap-2 lg:flex-row">
                                            <input
                                                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                                name="prodImg"
                                                id="inputProdImg"
                                                type="text"
                                                placeholder="File Name"
                                            />
                                            {/* UPLOAD BUTTON */}
                                            <button
                                                className="h-10 w-1/2 font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md
                hover:bg-gray-50 hover:scale-[1.02] duration-200"
                                            >
                                                Upload
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* ADD HEADER AND DESC */}
                                <div className="flex flex-col gap-2 justify-center">
                                    <h1 className="w-full text-start text-xl font-bold mb-0 text-orange-950">
                                        Header and Body
                                    </h1>
                                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                                        <label
                                            className="text-orange-950 text-sm w-full text-left space-x-1"
                                            htmlFor="landingHeader"
                                        >
                                            <span>Header Text</span>
                                        </label>
                                        <input
                                            className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                                            name="landingHeader"
                                            id="landingHeader"
                                            type="text"
                                            placeholder="Header Text"
                                            required
                                        />
                                    </div>
                                    <div className="w-full flex flex-col gap-1 items-center justify-center">
                                        <label
                                            className="text-orange-950 text-sm w-full text-left space-x-1"
                                            htmlFor="inputBodyText"
                                        >
                                            <span>Body Text</span>
                                        </label>
                                        <textarea
                                            className="border-2 border-solid border-orange-900 w-full pl-4 rounded-md 
                                            bg-orange-50 pt-1.5"
                                            name="inputBodyText"
                                            id="inputBodyText"
                                            placeholder="Body Text"
                                            rows={3}
                                            style={{ resize: "none" }}
                                            required
                                        />
                                    </div>
                                    <div className="w-full flex items-center gap-2 mt-4">
                                        <button
                                            className="w-2/3 border-2 border-orange-950 bg-orange-950 font-bold
                                            text-white hover:border-orange-900 hover:bg-orange-900 hover:scale-[1.02]
                                                duration-200 rounded-md shadow-md h-10"
                                            type="button"
                                            onClick={() => {
                                                handleSubmit();
                                                setTimeout(() => {
                                                    setAddSlideClicked(false);
                                                }, 900);
                                            }}
                                        >
                                            {isEditMode ? "Update" : "Add"}
                                        </button>
                                        <button
                                            className="w-1/3 border-2 border-gray-100 bg-white font-bold
                  text-gray-500 hover:bg-gray-50 hover:scale-[1.02]
                  duration-200 rounded-md shadow-md h-10"
                                            onClick={() => setAddSlideClicked(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {/* PRODUCT CREATED POP UP */}
                                    {isPopupVisible && (
                                        <CheckoutPopup
                                            message={`"Slide ${isEditMode ? "Updated" : "Created"}!"`}
                                        />
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLandingPageMaintenance;