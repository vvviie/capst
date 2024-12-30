"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState } from "react";

const order = {
  type: "Table",
  price: 50,
  pax: 1,
  date: "1/16/2025",
  time: "12:30",
  dateReq: "12/30/2024",
  timeReq: "15:44",
  package: "A",
  paymentType: "downpayment",
  remarks: "Abubulinggit",
};

const buffetChosen = [
  {
    category: "Dessert",
    foods: ["Leche Flan"],
  },
  {
    category: "Veggies",
    foods: ["Chicken Mango Salad"],
  },
  {
    category: "Pasta",
    foods: ["Shrimp Aglio Olio"],
  },
  {
    category: "Mains",
    foods: ["Chicken Saltimbocca", "Tuscan Chicken"],
  },
  {
    category: "Inclusions",
    foods: [
      "1 Rice",
      "Unlimited Iced Tea or Cucumber Lemonade",
      "20% off of Café Drinks",
    ],
  },
];

const eventReq = false;

const PaymentPage = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [expandImage, setExpandImage] = useState(false);

  // For Image
  const [imageUrl, setImageUrl] = useState("");

  // For Image's File Name
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // For Firebase Image URL
  const [firebaseImageUrl, setFirebaseImageUrl] = useState("");
  //#endregion

  //#region Global EffectHooks

  const handleUploadClick = () => {
    // Trigger the file input click
    fileInputRef.current?.click();
  };

  const handleSubmit = (event: React.FormEvent) => {
    setIsPopupVisible(true);
    setTimeout(() => {
      setIsPopupVisible(false); // Hide after a few seconds if desired
    }, 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const validTypes = ["image/jpeg", "image/png"];

      if (!validTypes.includes(file.type)) {
        console.error("Invalid file type. Please upload a PNG or JPEG.");
        return;
      }

      setFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);

      try {
        // Upload the image and get the URL
        const webpUrl: string | null = await uploadImageToStorage(file);
        console.log("Uploaded image URL:", webpUrl);

        // Update Firebase image URL in state (only if it's a valid string)
        if (webpUrl) {
          setFirebaseImageUrl(webpUrl); // set only if webpUrl is a valid string
        } else {
          console.error("Error: webpUrl is null or invalid");
        }
      } catch (error) {
        console.error("Error during image processing:", error);
      }
    } else {
      console.error("No file selected");
    }
  };

  const uploadImageToStorage = async (file: File) => {
    const storage = getStorage();
    const storageRef = ref(
      storage,
      `images/tempImg/${file.name.split(".").slice(0, -1).join(".")}.webp`
    ); // Update path to WebP

    try {
      // Convert the image to WebP format
      const webpBlob = await convertImageToWebP(file);
      console.log("WebP Blob size:", webpBlob.size); // Log size for debugging
      console.log("WebP Blob type:", webpBlob.type); // Should be 'image/webp'

      // Create URL for the WebP Blob to preview
      const webpUrl = URL.createObjectURL(webpBlob);
      console.log("Converted to WebP:", webpUrl); // Log the WebP URL
      setImageUrl(webpUrl); // Set this URL for preview, if needed

      // Upload the WebP file
      await uploadBytes(storageRef, webpBlob, { contentType: "image/webp" });
      const downloadUrl = await getDownloadURL(storageRef); // Get the download URL
      return downloadUrl; // Return the URL
    } catch (error) {
      console.error("Error uploading image:", error);
      return null; // Return null if there's an error
    }
  };

  // Function to convert image to WebP using canvas
  const convertImageToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const imgElement = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target) {
          // Safely access e.target.result if e.target is not null
          imgElement.src = e.target.result as string;
        } else {
          console.error("FileReader onload event target is null");
        }
      };

      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgElement, 0, 0);

          // Convert to WebP format
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

      reader.readAsDataURL(file); // Read the file as Data URL
    });
  };

  const handleRemoveImage = () => {
    setImageUrl(""); // Remove the image preview
    setFileName(""); // Clear the file name

    // Check if fileInputRef.current is not null
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8 lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56">
      {/* BACKGROUND */}
      <div className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1] lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"></div>
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[600px]">
        <Link
          href={"/book/reservations"}
          className="flex items-center space-x-2 font-bold text-orange-950 text-2xl text-left w-full
      max-w-[1000px] lg:min-w-[800px] hover:text-orange-800 cursor-pointer mb-2"
        >
          <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
          <i className="fa fa-book text-lg" aria-hidden="true"></i>
          <span>Reservations</span>
        </Link>
        <div
          className="pt-4 pb-6 px-4 bg-white border-gray-100 border-2 shadow-md rounded-md
        w-full flex flex-col gap-2"
        >
          <h1 className="text-xl font-bold text-orange-800">
            Card Payment for
          </h1>
          <hr />
          {/* RESERVATION TYPE AND PAX */}
          <div className="flex items-center justify-between gap-2 font-semibold text-gray-600">
            <span>{order.type}</span>
            <span className="">{order.pax} PAX</span>
          </div>
          {/* DATE AND TIME */}
          <div className="flex items-center justify-between gap-2 font-semibold text-gray-400 mt-[-10px]">
            <span>{order.date}</span>
            <span className="">{order.time}</span>
          </div>

          {eventReq && (
            <div className="flex flex-col gap-2 w-full">
              <hr />
              <div className="flex gap-2 items-center justify-between text-sm text-gray-400">
                <span className="">Event Package</span>
                <span className="font-bold text-white py-0.5 px-2 bg-gray-400 rounded-full">
                  {order.package}
                </span>
              </div>
              {buffetChosen.map((item) => (
                <div className="w-full flex flex-col gap-1 mb-2 text-sm">
                  <span className="font-semibold text-orange-500">
                    {item.category}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.foods.map((food) => (
                      <span
                        className="py-[1px] px-2 bg-white border-2 border-gray-50
                        text-sm text-gray-500 rounded-full shadow-md font-semibold"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <hr />
            </div>
          )}
          <div className="flex items-center justify-between gap-2 text-gray-400 text-sm">
            <span>Date Requested</span>
            <span className="">{order.dateReq + " - " + order.timeReq}</span>
          </div>
          <div className="flex items-center justify-between gap-2 font-semibold text-gray-400 mt-2">
            <span>Total Fee</span>
            <span className="px-2 py-1 bg-orange-300 text-white rounded-full text-sm">
              PHP {order.price.toFixed(2)}
            </span>
          </div>
          <hr className="my-2" />
          <div className="flex flex-col gap-2 justify-center">
            <h1 className="text-gray-500 mt-2 text-sm mb-2">Scan QR Code</h1>
            {/* INSTAPAY QR IMAGE CONTAINER */}
            <div className="relative aspect-square w-full">
              <Image
                src={`/instapayqr.webp`}
                alt=""
                fill
                className="object-contain cursor-pointer hover:scale-[1.02] duration-200"
                onClick={() => setExpandImage(true)}
              />
            </div>
            {expandImage && (
              <div
                className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center z-20"
                style={{ background: "rgba(0, 0, 0, 0.85)" }}
              >
                <div className="w-full max-w-[620px] aspect-square relative">
                  <div
                    className="bg-black shadow-lg rounded-full h-10 aspect-square text-white
                    absolute top-[8px] right-[8px] flex justify-center items-center z-10
                    hover:bg-gray-950 hover:scale-[1.02] duration-200 cursor-pointer"
                    onClick={() => setExpandImage(false)}
                  >
                    <span className="font-bold">X</span>
                  </div>
                  <Image
                    src={`/instapayqr.webp`}
                    alt="idpic"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <div className="w-full flex flex-col gap-2 items-center mt-4">
              <span className="text-gray-500 text-sm">
                Upload Image of Payment Receipt
              </span>

              {imageUrl && (
                <div className="w-full aspect-square relative border-2 border-gray-100 bg-gray-300 md:max-w-56">
                  <Image
                    src={imageUrl}
                    alt="ID"
                    fill
                    className="object-cover opacity-80 transition duration-300"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-70 text-white text-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    X
                  </button>
                </div>
              )}

              <div className="w-full flex gap-2 items-center">
                <div className="w-full flex flex-col gap-1 items-center justify-center">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor="imageName2"
                  >
                    <span>Image File Name</span>
                  </label>
                  <div className="w-full flex items-center gap-1">
                    <input
                      className="border-2 border-solid border-orange-900 w-2/3 h-10 pl-4 rounded-md bg-orange-50"
                      name="imageName2"
                      id="imageName2"
                      type="text"
                      placeholder="Image Name"
                      value={fileName} // Set the value to the file name
                      readOnly // Make the input read-only
                    />
                    <button
                      className="h-10 w-1/3 bg-white border-2 border-gray-100 shadow-md rounded-md font-bold
                                  text-gray-600"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        handleUploadClick();
                      }}
                    >
                      Upload
                    </button>
                    <input
                      type="file"
                      accept="image/*" // Attach the ref
                      ref={fileInputRef} // Attach the ref
                      style={{ display: "none" }} // Hide the input
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            className="w-full bg-orange-950 font-bold text-white shadow-md rounded-md
          h-10 mb-[-10px] mt-4 max-w-[500px]"
            onClick={handleSubmit}
          >
            Submit Payment
          </button>
        </div>
      </div>
      {/* BOOKING MADE POP UP */}
      {isPopupVisible && <CheckoutPopup message="Payment Submitted!" />}
    </div>
  );
};

export default PaymentPage;
