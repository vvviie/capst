"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import { db } from "@/app/firebase"; // Adjust the import based on your file structure
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AboutUs from "@/app/components/AboutUs";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
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
  const [images, setImages] = useState([]); // State for images
  const [uploadedImages, setUploadedImages] = useState([]); // State for uploaded images
  const maxCharacters = 360;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
  const [limitModalMessage, setLimitModalMessage] = useState("");

  // Function to open the modal
  const openModal = (img) => {
    setImageToDelete(img);
    setIsModalVisible(true);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    if (imageToDelete) {
      await handleRemoveImage(imageToDelete);
    }
    setIsModalVisible(false);
    setImageToDelete(null);
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setIsModalVisible(false);
    setImageToDelete(null);
  };

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
        setImages(docSnap.data()["img"] || []); // Set initial images from Firestore
      } else {
        console.log("No such document!");
      }
    };

    fetchData();
  }, []);

  const convertImageToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const imgElement = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        imgElement.src = e.target.result;
      };

      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgElement, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Conversion to WebP failed."));
            }
          }, "image/webp");
        } else {
          reject(new Error("Canvas context is null."));
        }
      };

      imgElement.onerror = (err) => {
        reject(err);
      };

      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  };

  const uploadImageToStorage = async (file) => {
    const storage = getStorage();
    const storageRef = ref(
      storage,
      `images/landing/${file.name.split(".").slice(0, -1).join(".")}.webp`
    );

    try {
      const webpBlob = await convertImageToWebP(file);
      const downloadUrl = await uploadBytes(storageRef, webpBlob, {
        contentType: "image/webp",
      });
      const url = await getDownloadURL(storageRef);
      return url; // Return the URL
    } catch (error) {
      console.error("Error uploading image:", error);
      return null; // Return null if there's an error
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const totalImages = images.length + uploadedImages.length; // Calculate total images

      // Check if adding new images would exceed the limit
      if (totalImages >= 10) {
        setLimitModalMessage(
          "Maximum number of images reached. Please delete an existing image to upload a new one."
        );
        setIsLimitModalVisible(true); // Show the modal
        return; // Exit if the maximum number of images is reached
      }

      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          if (uploadedImages.length < 10 - images.length) {
            // Check remaining capacity
            const url = await uploadImageToStorage(file);
            return url;
          } else {
            console.log("Maximum number of images reached.");
            return null;
          }
        })
      );

      const filteredUrls = uploadedUrls.filter((url) => url !== null);
      setUploadedImages((prevImages) => [...prevImages, ...filteredUrls]);
    }
  };

  const handleRemoveImage = async (imageUrl) => {
    const storage = getStorage();
    const imageRef = ref(storage, imageUrl);

    try {
      // Check if the image is in uploadedImages
      if (uploadedImages.includes(imageUrl)) {
        // If it's in uploadedImages, just remove it from the state
        setUploadedImages((prevImages) =>
          prevImages.filter((img) => img !== imageUrl)
        );
        console.log("Temporary image removed successfully");
      } else {
        // If it's in images, delete it from storage
        await deleteObject(imageRef);

        // Update Firestore document to remove the image URL
        const docRef = doc(db, "webContent", "landing_infoSection");
        await updateDoc(docRef, {
          img: images.filter((img) => img !== imageUrl), // Filter out the deleted image
        });

        // Update local state
        setImages((prevImages) => prevImages.filter((img) => img !== imageUrl));
        console.log("Image deleted successfully");
      }
    } catch (error) {
      console.error("Error removing image: ", error);
    }
  };

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
        aboutUs: aboutUsText,
        location: location,
        operatingDays: operatingDays,
        openHours: openHours,
        accessibility: accessibility,
        img: [...images, ...uploadedImages],
      });

      setIsPopupVisible(true);
      setTimeout(() => {
        setIsPopupVisible(false);
      }, 750);
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

  const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
        <div className="bg-white p-4 sm:p-6 rounded shadow-md max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4 text-center">{message}</h2>
          <div className="flex flex-col sm:flex-row justify-end">
            <button
              className="mb-2 sm:mb-0 sm:mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={onConfirm}
            >
              Yes, delete
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LimitExceededModal = ({ isVisible, message, onClose }) => {
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"> {/* Added z-50 */}
        <div className="bg-white p-4 sm:p-6 rounded shadow-md max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4 text-center">{message}</h2>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-orange-950 text-white rounded hover:bg-orange-600"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
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
                  {images.length > 0 && (
                    <Image
                      src={images[currentImage]}
                      alt={`Image ${currentImage + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  )}
                  <button
                    onClick={nextImage}
                    className="absolute right-2 z-10 h-8 aspect-square pl-0.5 text-sm bg-orange-950 text-white rounded-full hover:bg-orange-900"
                  >
                    &#9654;
                  </button>
                </div>
              </div>
              <div className="hidden sm:grid sm:gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-2 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="aspect-square relative">
                    <Image
                      src={img}
                      alt={`Image ${index + 1}`}
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
                  {images.length + uploadedImages.length} / 10
                </span>
              </h1>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 mt-4">
                <label className="shadow-md rounded-md aspect-square border-2 border-gray-100 flex flex-col justify-center items-center gap-1 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden" // Hide the input element
                  />
                  <i className="fa-solid fa-circle-plus text-gray-300 text-3xl md:text-6xl group-hover:text-gray-400"></i>
                  <span className="text-xs md:text-lg text-gray-300 font-bold group-hover:text-gray-400">
                    Add photo
                  </span>
                </label>
                {images.map((img, index) => (
                  <div key={index} className="aspect-square relative">
                    <button
                      className="w-6 h-6 rounded-full bg-orange-950 shadow-md absolute top-[-5px] right-[-5px] text-white z-20 flex items-center justify-center"
                      onClick={() => openModal(img)} // Open the confirmation modal
                    >
                      <span className="mb-1">x</span>
                    </button>
                    <Image
                      src={img}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
                <ConfirmationModal
                  isVisible={isModalVisible}
                  message="This image is already uploaded. Are you sure you want to delete it?"
                  onConfirm={confirmDelete}
                  onCancel={cancelDelete}
                />
                {uploadedImages.map((img, index) => (
                  <div key={index} className="aspect-square relative">
                    <button
                      className="w-6 h-6 rounded-full bg-orange-950 shadow-md absolute top-[-5px] right-[-5px] text-white z-20 flex items-center justify-center"
                      onClick={() => handleRemoveImage(img)} // Call the remove function
                    >
                      <span className="mb-1">x</span>
                    </button>
                    <Image
                      src={img}
                      alt={`Uploaded Image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
                <LimitExceededModal
                  isVisible={isLimitModalVisible}
                  message={limitModalMessage}
                  onClose={() => setIsLimitModalVisible(false)}
                />
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
