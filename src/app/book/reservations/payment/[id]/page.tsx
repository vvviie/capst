"use client";

import CheckoutPopup from "@/app/components/CheckoutPopup";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

type BuffetItem = {
  category: string;
  foods: string[];
};

type Order = {
  id: string;
  type: string;
  price: number;
  pax: number;
  date: string;
  time: string;
  dateReq: string;
  timeReq: string;
  package: string;
  paymentType: string;
  remarks: string;
  buffetChosen: BuffetItem[];
  reservedBy: string;
  balance: number;
  downpayment: number;
  payment: string;
  receiptImage: string;
  status: string;
};

const PaymentPage = () => {
  const pathname = usePathname(); // Get the current path
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [expandImage, setExpandImage] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false); // used by "table" & "event"
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [eventReq, setEventReq] = useState(false);

  // For Image
  const [imageUrl, setImageUrl] = useState("");

  // For Image's File Name
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // For Firebase Image URL
  const [firebaseImageUrl, setFirebaseImageUrl] = useState("");
  //#endregion

  //#region Global EffectHooks

  useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        const loggedIn = !!authUser && authUser.emailVerified;
        setIsLoggedIn(loggedIn);
        setUserEmail(authUser?.email || null);
      });
  
      return () => unsubscribe();
    }, []);

    useEffect(() => {
      const authToken = Cookies.get("authToken");
  
      if (authToken) {
        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
          if (authUser && authUser.emailVerified) {
            setIsLoggedIn(true);
          }
        });
  
        return () => unsubscribeAuth();
      }
    }, [router]);

    useEffect(() => {
      if (!pathname) return;
    
      const fetchOrder = async () => {
        const pathArray = pathname.split("/");
        const reservationId = pathArray[pathArray.length - 1]; // Extract the reservation ID
    
        if (!reservationId) return;
    
        // Helper function to convert time to AM/PM format
        const convertToAmPm = (time: string) => {
          const [hours, minutes] = time.split(":").map(Number);
          const suffix = hours >= 12 ? "PM" : "AM";
          const formattedHours = hours % 12 || 12;
          return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
        };
    
        try {
          const docRef = doc(db, "tableReservations", reservationId); // Replace with your collection name
          const docSnap = await getDoc(docRef);
    
          if (docSnap.exists()) {
            const data = docSnap.data();
    
            // Logging received data for debugging
            console.log("Received Data:", data);
    
            // Check if buffetChosen is an object (not an array or Map)
            let transformedBuffetChosen: { category: string; foods: string[] }[] = [];
    
            if (data.buffetChosen && typeof data.buffetChosen === 'object' && !Array.isArray(data.buffetChosen)) {
              // If it's an object (not an array or Map), iterate over the keys
              transformedBuffetChosen = Object.keys(data.buffetChosen).map((category) => ({
                category,
                foods: data.buffetChosen[category]
                  .split(",")
                  .map((food: string) => food.trim()),
              }));
            } else {
              // If it's an array (or any other type), handle it as fallback (this should not happen in this case)
              console.warn("buffetChosen is neither an object nor a Map, it's an array:", data.buffetChosen);
            }
    
            // Log the transformed buffetChosen data
            console.log("Transformed Buffet Chosen:", transformedBuffetChosen);
    
            // Construct the fetched order object
            const fetchedOrder = {
              id: docSnap.id,
              type: data.type || "N/A",
              price: data.totalPrice || 0,
              pax: data.numberOfPersons || 1,
              date: data.dateReserved || "N/A",
              time: data.timeReserved ? convertToAmPm(data.timeReserved) : "N/A",
              dateReq: data.dateToBeReserved || "N/A",
              timeReq: data.timeToBeReserved || "N/A",
              package: data.packageOffer || "N/A",
              paymentType: data.paymentType || "N/A",
              remarks: data.remarks || "None",
              buffetChosen: transformedBuffetChosen, // Add the transformed buffetChosen
            };
    
            // Set state variables
            setOrder(fetchedOrder);
            setEventReq(data.type === "Event"); // Set eventReq based on type
          } else {
            console.warn("No order found for the given ID.");
            setOrder(null);
            setEventReq(false); // Ensure eventReq is reset
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          setOrder(null);
          setEventReq(false); // Ensure eventReq is reset
        }
      };
    
      fetchOrder();
    }, [pathname]);
      
    
  const handleUploadClick = () => {
    // Trigger the file input click
    fileInputRef.current?.click();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form default submission behavior
  
    if (!order?.id) {
      console.error("Order ID not found.");
      return;
    }
  
    // Check if fileName is empty
    if (!fileName) {
      setError(true);
      setErrorMessage("Please upload the image of your transaction.");
      setTimeout(() => setError(false), 5000);
      return;
    }
  
    setIsPopupVisible(true);
  
    try {
      // Reference the Firestore document based on order.id
      const orderDocRef = doc(db, "tableReservations", order.id);
  
      // Update the document with the receipt image URL
      await updateDoc(orderDocRef, {
        receiptImage: firebaseImageUrl,
        status: "PAYMENT POSTED"
      });
  
      console.log("Receipt image added successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
    } finally {
      // Hide the popup and redirect after a few seconds
      setTimeout(() => {
        router.push("/book/reservations");
        setIsPopupVisible(false);
      }, 2000);
    }
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
        {order && (
        <>
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
            <span>{order.type + " - Reservation #" + order.id}</span>
            <span className="">{order.pax} PAX</span>
          </div>
          {/* DATE AND TIME */}
          <div className="flex items-center justify-between gap-2 font-semibold text-gray-400 mt-[-10px]">
            <span>{order.date}</span>
            <span className="">{order.time}</span>
          </div>

          {eventReq && order && (
            <div className="flex flex-col gap-2 w-full">
              <hr />
              <div className="flex gap-2 items-center justify-between text-sm text-gray-400">
                <span className="">Event Package</span>
                <span className="font-bold text-white py-0.5 px-2 bg-gray-400 rounded-full">
                  {order.package}
                </span>
              </div>
              {order.buffetChosen.map((item: { category: string; foods: string[] }) => (
                <div className="w-full flex flex-col gap-1 mb-2 text-sm" key={item.category}>
                  <span className="font-semibold text-orange-500">{item.category}</span>
                  <div className="flex flex-wrap gap-1">
                    {item.foods.map((food: string, index: number) => (
                      <span
                        key={`${item.category}-${index}`}
                        className="py-[1px] px-2 bg-white border-2 border-gray-50 text-sm text-gray-500 rounded-full shadow-md font-semibold"
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

          {error &&
              <p className="text-xs text-red-500 font-semibold mb-[-20px] text-center">
                <span className="block">{errorMessage}</span>
              </p>
          }

          <button
            className="w-full bg-orange-950 font-bold text-white shadow-md rounded-md
          h-10 mb-[-10px] mt-4"
            onClick={handleSubmit}
          >
            Submit Payment
          </button>

        </div>
        </>
        )}
      </div>
      {/* BOOKING MADE POP UP */}
      {isPopupVisible && <CheckoutPopup message="Payment Submitted!" />}
    </div>
  );
};

export default PaymentPage;