"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

interface Slide {
  // Define the expected fields in the slide data
  title: string;
  desc: string;
  img: string;
  // Add any other fields that may exist in the slide data
}

interface SlideData extends Slide {
  id: number;
}

const AdminLandingPageMaintenance = () => {
  const router = useRouter();
  const [addSlideClicked, setAddSlideClicked] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [newSlide, setNewSlide] = useState<SlideData>({
    id: 0,
    title: "",
    desc: "",
    img: "",
  });
  const [slidesData, setSlidesData] = useState<SlideData[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null); // Store the selected file

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

  useEffect(() => {
    const fetchSlides = async () => {
      const docRef = doc(db, "webContent", "landing_heroSection"); // Reference to the specific document
      const docSnapshot = await getDoc(docRef); // Fetch the document snapshot

      if (docSnapshot.exists()) {
        const data = docSnapshot.data(); // Get the document data
        const slidesList: Slide[] = data.slides || []; // Access the 'slides' field, default to empty array if it doesn't exist
        
        setSlidesData(
          slidesList.map((slide: Slide, index: number) => ({
            id: index + 1, // Optionally generate an ID if not present in the slide data
            ...slide,
          }))
        );
      } else {
        console.log("No such document!");
      }
    };

    fetchSlides();
  }, []);

  //
  const convertImageToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const imgElement = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        // Ensure e.target is not null and that result is a string
        const result = e.target?.result;
        if (typeof result === 'string') {
          imgElement.src = result;  // Set the image source to the data URL
        } else {
          reject(new Error("FileReader result is not a valid string."));
        }
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

      imgElement.onerror = (err) => reject(err);
      reader.onerror = (err) => reject(err);

      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Safely check if files are not null
    const file = event.target.files?.[0];
    
    if (file) {
      setImageFile(file); // Update state with the selected file
      const webpBlob = await convertImageToWebP(file);
      const objectURL = URL.createObjectURL(webpBlob);
      setNewSlide({ ...newSlide, img: objectURL });
    }
  };

  //

  const handleRemoveSlide = async (slideId: number | string) => {
    const updatedSlides = slidesData.filter((slide) => slide.id !== slideId);
    setSlidesData(updatedSlides);
    const docRef = doc(db, "webContent", "landing_heroSection");
    await updateDoc(docRef, {
      slides: updatedSlides,
    });
  };

  const handleSubmit = async () => {
    const docRef = doc(db, "webContent", "landing_heroSection");
    const storage = getStorage();

    try {
      // Handle image upload only if there's a new image file selected
      let imageUrl = newSlide.img;
      if (imageFile) {
        const storageRef = ref(
          storage,
          `images/landing/hero/${imageFile.name
            .split(".")
            .slice(0, -1)
            .join(".")}.webp`
        );

        // Convert image to WebP format and upload it to Firebase Storage
        const webpBlob = await convertImageToWebP(imageFile);
        await uploadBytes(storageRef, webpBlob, { contentType: "image/webp" });
        imageUrl = await getDownloadURL(storageRef); // Get the download URL of the uploaded image
      }

      // Update slide with the uploaded image URL (or keep the existing image URL if in edit mode)
      const slideData = { ...newSlide, img: imageUrl };

      if (isEditMode) {
        // Edit existing slide logic
        const updatedSlides = slidesData.map((slide) =>
          slide.id === newSlide.id ? slideData : slide
        );
        setSlidesData(updatedSlides);

        // Update Firestore document with edited slides array
        await updateDoc(docRef, { slides: updatedSlides });
      } else {
        // Add new slide logic
        const newId = slidesData.length + 1; // Create a new unique ID for the new slide
        const updatedSlides = [...slidesData, { ...slideData, id: newId }];
        setSlidesData(updatedSlides);

        // Update Firestore document with new slides array
        await updateDoc(docRef, { slides: updatedSlides });
      }

      // popup
      setIsPopupVisible(true);
      setTimeout(() => {
        setIsPopupVisible(false);
        setAddSlideClicked(false); // Close the add slide form
      }, 750);
    } catch (error) {
      console.error("Error handling form submission:", error);
    }
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setAddSlideClicked(true);
    setNewSlide({ title: "", desc: "", img: "", id: 0 });  // Default 'id' value
  };

  const handleEditClick = (slide: SlideData) => {
  setIsEditMode(true);
  setAddSlideClicked(true);
  setNewSlide(slide); // Load the slide details into the form for editing
};

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div
        className={`w-full flex flex-col gap-2 max-w-[${
          !addSlideClicked ? "640" : "900"
        }px] justify-center`}
      >
        {/* HEADER CONTAINER */}
        <div className="flex justify-start items-center gap-2">
          {/* LINK BACK TO PRODUCTS */}
          <Link
            href={"/fkstllhomemaintenance"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
          >
            <i className="fa fa-angle-left" aria-hidden="true"></i>
            <span>Maintenance</span>
          </Link>
        </div>
        <div className="w-full flex gap-2 sm:gap-4 items-center mb-4">
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          <span className="text-xl sm:text-2xl text-center font-bold text-orange-900">
            Landing Section
          </span>
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
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
              {slidesData.map((slide) => (
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
                      onClick={() => handleEditClick(slide)} // Pass the slide data to handleEditClick
                    >
                      Edit
                    </button>
                    {/* REMOVE SLIDE BUTTON */}
                    <button
                      className="bg-red-500 border-2 border-red-500 shadow-md
    rounded-md text-white w-1/3 font-bold h-10
    hover:bg-red-400 hover:border-red-400 hover:scale-[1.02] duration-200"
                      onClick={() => handleRemoveSlide(slide.id)} // Pass slide.id to identify the slide to remove
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
                  <Image
                    src={newSlide.img}
                    alt={newSlide.title}
                    fill
                    className="object-contain"
                  />
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
                        value={newSlide.img}
                        onChange={(e) =>
                          setNewSlide({ ...newSlide, img: e.target.value })
                        }
                        readOnly
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden" // Hides the file input
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="h-10 w-1/2 font-bold text-gray-600 bg-white border-2 border-gray-100 shadow-md rounded-md hover:bg-gray-50 hover:scale-[1.02] duration-200 flex items-center justify-center cursor-pointer"
                      >
                        Choose Image
                      </label>
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
                      value={newSlide.title}
                      onChange={(e) =>
                        setNewSlide({ ...newSlide, title: e.target.value })
                      }
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
                      value={newSlide.desc}
                      onChange={(e) =>
                        setNewSlide({ ...newSlide, desc: e.target.value })
                      }
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
      {isPopupVisible && (
        <CheckoutPopup message="Slide updated successfully!" />
      )}
    </div>
  );
};

export default AdminLandingPageMaintenance;
