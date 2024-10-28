"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CheckoutPopup from "@/app/components/CheckoutPopup";

const images = [
    { id: 1, img: "/fikaplace/1.jpg" },
    { id: 2, img: "/fikaplace/2.jpg" },
    { id: 3, img: "/fikaplace/3.jpg" },
    { id: 4, img: "/fikaplace/4.jpg" },
    { id: 5, img: "/fikaplace/5.jpg" },
    { id: 6, img: "/fikaplace/6.jpg" },
];

const data = [
    {
        id: 0,
        title: "About Us",
        desc: "Fikastalle by Fika Kafe is a charming café that offers a cozy and inviting atmosphere, perfect for enjoying a relaxing coffee break. The menu boasts a variety of specialty coffees, teas, and delicious pastries, along with a selection of hearty meals and snacks. Whether you're looking for a quiet spot to work, a place to catch up with friends, or simply to savor a quality cup of coffee, Fikastalle by Fika Kafe provides a delightful experience.",
    },
    {
        id: 1,
        title: "Location",
        desc: "Brgy. Iba, Silang, Cavite, 4118",
    },
    {
        id: 2,
        title: "Operating Days",
        desc: "Tuesday to Sunday",
    },
    {
        id: 3,
        title: "Open Hours",
        desc: "12pm to 10pm",
    },
    {
        id: 4,
        title: "Accessibility",
        desc: "The restaurant is PWD and pet friendly!",
    },
];

const AdminLandingPageMaintenance = () => {
    const [editTabOpen, setEditTabOpen] = useState(false);

    const [currentImage, setCurrentImage] = useState(0);

    //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const [aboutUsText, setAboutUsText] = useState("");
    const maxCharacters = 360;

    const handleAboutUsChange = (e) => {
        setAboutUsText(e.target.value);
    };

    //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
    const handleSubmit = () => {
        setIsPopupVisible(true);

        setTimeout(() => {
            setIsPopupVisible(false);
        }, 750);
    };

    const nextImage = () => {
        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const maxPhotos = 10;

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div className="w-full flex flex-col gap-2 max-w-[680px]">
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
                        <span>Information Section</span>
                    </div>
                </div>
                {/* FORM CONTAINER */}
                <div
                    className="bg-white border-2 border-gray-100 rounded-md shadow-md px-4 pt-2 pb-6
        flex flex-col gap-2"
                >
                    {!editTabOpen ? (
                        <>
                            <h1 className="w-full text-start text-xl font-bold text-orange-950 md:mb-[-14px]">
                                Images
                            </h1>
                            {/* IMAGE DISPLAY */}
                            <div className="sm:hidden relative flex justify-center items-center">
                                {/* Image Display for Carousel on small to medium screens */}
                                <div className="aspect-square w-full md:w-96 relative flex items-center">
                                    {/* Arrow Button - Left */}
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 z-10 h-8 aspect-square pr-0.5 text-sm bg-orange-950 text-white 
                rounded-full hover:bg-orange-900"
                                    >
                                        &#9664;
                                    </button>
                                    <Image
                                        src={images[currentImage].img}
                                        alt={`Image ${currentImage + 1}`}
                                        fill
                                        className="object-cover rounded-md"
                                    />
                                    {/* Arrow Button - Right */}
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 z-10 h-8 aspect-square pl-0.5 text-sm bg-orange-950 text-white 
                rounded-full hover:bg-orange-900"
                                    >
                                        &#9654;
                                    </button>
                                </div>
                            </div>

                            {/* Grid Display for large screens */}
                            <div className="hidden sm:grid sm:gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-2 mt-4">
                                {images.map((img) => (
                                    <div key={img.id} className="aspect-square relative">
                                        <Image
                                            src={img.img}
                                            alt={`Image ${img.id}`}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* INFORMATION CONTAINER */}
                            <div className="w-full flex flex-col gap-4">
                                <h1 className="w-full text-start text-xl font-bold text-orange-950">
                                    Information
                                </h1>
                                <div className="grid grid-cols-1 gap-4">
                                    {data.map((det) => (
                                        <div className="flex flex-col gap-0.5" key={det.id}>
                                            <h1 className="text-sm text-gray-500">{det.title}</h1>
                                            <p className="font-semibold text-gray-900">{det.desc}</p>
                                        </div>
                                    ))}

                                    {/* EDIT BUTTON */}
                                    <button
                                        className="shadow-md rounded-md  bg-orange-950 h-10 font-bold
                    text-white hover:bg-orange-900 hover:scale-[1.02] duration-200 text-center"
                                        onClick={() => setEditTabOpen(true)}
                                    >
                                        Edit Information
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="w-full text-start text-xl font-bold text-orange-950 md:mb-[-14px]">
                                Images -{" "}
                                <span className="text-gray-600 font-semibold">
                                    {images.length} / {maxPhotos}
                                </span>
                            </h1>
                            {/* IMAGES CONTAINER */}
                            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 mt-4">
                                <button
                                    className="shadow-md rounded-md aspect-square border-2 border-gray-100
                flex flex-col justify-center items-center gap-1"
                                >
                                    <i
                                        className="fa-solid fa-circle-plus text-gray-300 text-3xl md:text-6xl
            group-hover:text-gray-400"
                                    ></i>
                                    <span className="text-xs md:text-lg text-gray-300 font-bold group-hover:text-gray-400">
                                        Add photo
                                    </span>
                                </button>
                                {images.map((img) => (
                                    <div key={img.id} className="aspect-square relative">
                                        <button
                                            className="w-6 h-6 rounded-full bg-orange-950 shadow-md absolute top-[-5px]
                    right-[-5px] text-white z-20 flex items-center justify-center"
                                        >
                                            <span className="mb-1">x</span>
                                        </button>
                                        <Image
                                            src={img.img}
                                            alt={`Image ${img.id}`}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* INFORMATION CONTAINER */}
                            <div className="w-full flex flex-col gap-4">
                                <h1 className="w-full text-start text-xl font-bold text-orange-950 mt-4 mb-[-8px]">
                                    Information
                                </h1>
                                {/* MENU ITEM DESCRIPTION */}
                                <div className="w-full flex flex-col gap-1 items-center justify-center">
                                    <label
                                        className="text-orange-950 text-sm w-full text-left space-x-1"
                                        htmlFor="inputAboutUs"
                                    >
                                        <span>About Us</span>
                                    </label>
                                    <textarea
                                        className="border-2 border-solid border-orange-900 w-full pl-2 rounded-md 
                bg-orange-50 pt-1.5"
                                        name="inputAboutUs"
                                        id="inputAboutUs"
                                        placeholder="Describe your business establishment."
                                        rows={4}
                                        maxLength={maxCharacters}
                                        value={aboutUsText}
                                        onChange={handleAboutUsChange}
                                        style={{ resize: "none" }}
                                        required
                                    />
                                    <div className="w-full text-right text-xs text-gray-500">
                                        {aboutUsText.length}/{maxCharacters} characters
                                    </div>
                                </div>
                                <div className="w-full flex flex-col items-center gap-4">
                                    {data
                                        .filter((det) => det.title !== "About Us") // Exclude "About Us" from map
                                        .map((det) => (
                                            <div
                                                key={det.id}
                                                className="w-full flex flex-col gap-1 items-center justify-center"
                                            >
                                                <label
                                                    className="text-orange-950 text-sm w-full text-left space-x-1"
                                                    htmlFor={`input${det.title}`}
                                                >
                                                    <span>{det.title}</span>
                                                </label>
                                                <input
                                                    className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                                                    name={`input${det.title}`}
                                                    id={`input${det.title}`}
                                                    type="text"
                                                    placeholder={det.title}
                                                    required
                                                />
                                            </div>
                                        ))}

                                    {/* EDIT AND CANCEL BUTTON */}
                                    <div className="w-full flex items-center gap-2 mt-4">
                                        <button
                                            className="w-2/3 border-2 border-orange-950 bg-orange-950 font-bold
                                            text-white hover:border-orange-900 hover:bg-orange-900 hover:scale-[1.02]
                                            duration-200 rounded-md shadow-md h-10"
                                            onClick={() => {
                                                handleSubmit();
                                                setTimeout(() => {
                                                    setEditTabOpen(false);
                                                }, 900);
                                            }}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className="w-1/3 border-2 border-gray-100 bg-white font-bold
                                            text-gray-500 hover:bg-gray-50 hover:scale-[1.02]
                                            duration-200 rounded-md shadow-md h-10"
                                            onClick={() => setEditTabOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* PRODUCT CREATED POP UP */}
                            {isPopupVisible && (
                                <CheckoutPopup message="Information Updated!" />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLandingPageMaintenance;