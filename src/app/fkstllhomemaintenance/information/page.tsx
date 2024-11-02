"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { db } from "@/app/firebase"; // Adjust the import based on your file structure
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AboutUs from "@/app/components/AboutUs";

const images = [
  { id: 1, img: "/fikaplace/1.jpg" },
  { id: 2, img: "/fikaplace/2.jpg" },
  { id: 3, img: "/fikaplace/3.jpg" },
  { id: 4, img: "/fikaplace/4.jpg" },
  { id: 5, img: "/fikaplace/5.jpg" },
  { id: 6, img: "/fikaplace/6.jpg" },
];

const AdminLandingPageMaintenance = () => {
  const [editTabOpen, setEditTabOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [aboutUsText, setAboutUsText] = useState("");
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [operatingDays, setOperatingDays] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [accessibility, setAccessibility] = useState("");
  const maxCharacters = 360;

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "webContent", "landing_infoSection");
      const docSnap = await getDoc(docRef);
      console.log("Document Reference:", docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        setData(docSnap.data());
        setAboutUsText(docSnap.data()["aboutUs"] || ""); // Set initial About Us text
        setLocation(docSnap.data()["location"] || ""); // Set initial Location
        setOperatingDays(docSnap.data()["operatingDays"] || ""); // Set initial Operating Days
        setOpenHours(docSnap.data()["openHours"] || ""); // Set initial Open Hours
        setAccessibility(docSnap.data()["accessibility"] || ""); // Set initial Accessibility
      } else {
        console.log("No such document!");
      }
    };

    fetchData();
  }, []);

  const handleAboutUsChange = (e) => {
    setAboutUsText(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleOperatingDaysChange = (e) => {
    setOperatingDays(e.target.value);
  };

  const handleOpenHoursChange = (e) => {
    setOpenHours(e.target.value);
  };

  const handleAccessibilityChange = (e) => {
    setAccessibility(e.target.value);
  };

  const handleSubmit = async () => {
    const docRef = doc(db, "webContent", "landing_infoSection"); // Reference to the document
    // Check if the document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error("No such document!");
      return; // Exit if the document does not exist
    }

    // Log the values to be submitted
    console.log("Submitting the following data to Firestore:", {
      aboutUs: aboutUsText,
      location: location,
      operatingDays: operatingDays,
      openHours: openHours,
      accessibility: accessibility,
    });

    try {
      // Update the Firestore document with the new values
      await updateDoc(docRef, {
        aboutUs: aboutUsText, // Use hyphenated field names
        location: location,
        operatingDays: operatingDays,
        openHours: openHours,
        accessibility: accessibility,
      });

      // Show the popup after successful update
      setIsPopupVisible(true);
      setTimeout(() => {
        setIsPopupVisible(false);
      }, 750);
      // Reload the page after hiding the popup
      window.location.reload();
    } catch (error) {
      console.error("Error updating document: ", error.message);
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center">
      <div className="w-full flex flex-col gap- 2 max-w-[680px]">
        <div className="flex justify-start items-center gap-2">
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
        <div className="bg-white border-2 border-gray-100 rounded-md shadow-md px-4 pt-2 pb-6 flex flex-col gap-2">
          {!editTabOpen ? (
            <>
              <h1 className="w-full text-start text-xl font-bold text-orange-950 md:mb-[-14px]">
                Images
              </h1>
              <div className="sm:hidden relative flex justify-center items-center">
                <div className="aspect-square w-full md:w-96 relative flex items-center">
                  <button
                    onClick={prevImage}
                    className="absolute left-2 z-10 h-8 aspect-square pr-0.5 text-sm bg-orange-950 text-white rounded-full hover:bg-orange-900"
                  >
                    &#9664;
                  </button>
                  <Image
                    src={images[currentImage].img}
                    alt={`Image ${currentImage + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                  <button
                    onClick={nextImage}
                    className="absolute right-2 z-10 h-8 aspect-square pl-0.5 text-sm bg-orange-950 text-white rounded-full hover:bg-orange-900"
                  >
                    &#9654;
                  </button>
                </div>
              </div>
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
              <div className="w-full flex flex-col gap-4">
                <h1 className="w-full text-start text-xl font-bold text-orange-950">
                  Information
                </h1>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm text-gray-500">About Us</h1>
                    <p className="font-semibold text-gray-900">
                      {data["aboutUs"]}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm text-gray-500">Location</h1>
                    <p className="font-semibold text-gray-900">
                      {data["location"]}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm text-gray-500">Operating Days</h1>
                    <p className="font-semibold text-gray-900">
                      {data["operatingDays"]}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm text-gray-500">Open Hours</h1>
                    <p className="font-semibold text-gray-900">
                      {data["openHours"]}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm text-gray-500">Accessibility</h1>
                    <p className="font-semibold text-gray-900">
                      {data["accessibility"]}
                    </p>
                  </div>
                  <button
                    className="shadow-md rounded-md  bg-orange-950 h-10 font-bold text-white hover:bg-orange-900 hover:scale-[1.02] duration-200 text-center"
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
                  {images.length} / 10
                </span>
              </h1>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 mt-4">
                <button className="shadow-md rounded-md aspect-square border-2 border-gray-100 flex flex-col justify-center items-center gap-1">
                  <i className="fa-solid fa-circle-plus text-gray-300 text-3xl md:text-6xl group-hover:text-gray-400"></i>
                  <span className="text-xs md:text-lg text-gray-300 font-bold group-hover:text-gray-400">
                    Add photo
                  </span>
                </button>
                {images.map((img) => (
                  <div key={img.id} className="aspect-square relative">
                    <button className="w-6 h-6 rounded-full bg-orange-950 shadow-md absolute top-[-5px] right-[-5px] text-white z-20 flex items-center justify-center">
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
              <div className="w-full flex flex-col gap-4">
                <h1 className="w-full text-start text-xl font-bold text-orange-950 mt-4 mb-[-8px]">
                  Information
                </h1>
                <div className="w-full flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="inputAboutUs "
                  >
                    <span>About Us</span>
                  </label>
                  <textarea
                    className="border-2 border-solid border-orange-900 w-full pl-2 rounded-md bg-orange-50 pt-1.5"
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
                <div className="w-full flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="inputLocation"
                  >
                    <span>Location</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                    name="inputLocation"
                    id="inputLocation"
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={handleLocationChange}
                    required
                  />
                </div>
                <div className="w-full flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="inputOperatingDays"
                  >
                    <span>Operating Days</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                    name="inputOperatingDays"
                    id="inputOperatingDays"
                    type="text"
                    placeholder="Enter operating days"
                    value={operatingDays}
                    onChange={handleOperatingDaysChange}
                    required
                  />
                </div>
                <div className="w-full flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="inputOpenHours"
                  >
                    <span>Open Hours</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                    name="inputOpenHours"
                    id="inputOpenHours"
                    type="text"
                    placeholder="Enter open hours"
                    value={openHours}
                    onChange={handleOpenHoursChange}
                    required
                  />
                </div>
                <div className="w-full flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="inputAccessibility"
                  >
                    <span>Accessibility</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                    name="inputAccessibility"
                    id="inputAccessibility"
                    type="text"
                    placeholder="Enter accessibility information"
                    value={accessibility}
                    onChange={handleAccessibilityChange}
                    required
                  />
                </div>
                <div className="w-full flex items-center gap-2 mt-4">
                  <button
                    className="w-2/3 border-2 border-orange-950 bg-orange-950 font-bold text-white hover:border-orange-900 hover:bg-orange-900 hover:scale-[1.02] duration-200 rounded-md shadow-md h-10"
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
                    className="w-1/3 border-2 border-gray-100 bg-white font-bold text-gray-500 hover:bg-gray-50 hover:scale-[1.02] duration-200 rounded-md shadow-md h-10"
                    onClick={() => setEditTabOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
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
