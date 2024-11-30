"use client";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { collection, addDoc, setDoc, doc, query, where, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/app/firebase";

const MakeAnnouncementPage = () => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isUser, setIsUser] = useState(false);
   // Handle changes in the subject input
// Handle changes in the subject input (textbox)
const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newSubject = e.target.value;
  setSubject(newSubject);
};

  // Handle changes in the body input (textarea)
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBody = e.target.value; // Corrected 'e' to 'event'
    setBody(newBody);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form submission from reloading the page
  
    // Log the inputted information
    console.log("Subject:", subject);
    console.log("Body:", body);
  
    // Get the current date and time
    const now = new Date();
  
    // Format date as MM/DD/YYYY
    const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
  
    // Format time as HH:MM (without seconds and milliseconds)
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  
    // Generate the document ID as 'MM-DD-YYYY_subject_HH-MM-SS'
    const docId = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}_${subject.replace(/\s+/g, "_")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
  
    try {
        // Create a reference to the announcement document with the custom doc ID
        const docRef = doc(db, "notifications", docId);
  
        // Add the announcement document with the required fields
        await setDoc(docRef, {
          subject,
          body,
          dateCreated: date,
          timeCreated: time,
        });
  
        console.log("Notification added with ID:", docRef.id);
  
        // Now, add the notification to the users' "notifications" field (as a map)
        const usersCollectionRef = collection(db, "users");
        const usersQuery = query(usersCollectionRef, where("role", "==", "user"));
  
        const querySnapshot = await getDocs(usersQuery); // Use getDocs to retrieve the filtered users
  
        querySnapshot.forEach(async (userDoc) => {
          const userDocId = userDoc.id;
  
          // Log user document ID to ensure we are targeting the correct user
          console.log("Adding notification to user:", userDocId);
  
          // Reference to the user's document
          const userDocRef = doc(db, "users", userDocId);

          // Get the current notifications (if any)
          const userSnapshot = await getDoc(userDocRef);
          const userData = userSnapshot.data();
          const existingNotifications = userData?.notifications || {};

          // Generate a unique key for the new notification
          const notificationKey = `notif_${Date.now()}`; // Use timestamp for unique key

          // Add the new notification to the existing notifications map
          const newNotification = {
            body,
            dateCreated: date,
            subject,
            timeCreated: time,
            isRead: false,
            isNotifDeleted: false,
          };

          // Update the user's notifications field with the new notification
          await updateDoc(userDocRef, {
            [`notifications.${docId}`]: newNotification, // Add to map
          });

          console.log(`Notification added to user ${userDocId}`);
        });
  
        // Show success popup
        setIsPopUpVisible(true);
        setTimeout(() => {
          setIsPopUpVisible(false);
        }, 750);
  
        // Clear the form inputs
        setSubject("");
        setBody("");
      } catch (error) {
        // Narrowing error to Error type
        if (error instanceof Error) {
          console.error("Error adding notification:", error);
          console.log("Error details:", error.message); // Accessing error.message safely
        } else {
          console.error("Unexpected error:", error);
        }
      }
};

  useEffect(() => {
    const checkUserRole = () => {
      // Get cookies as an array of key-value pairs
      const cookies = document.cookie.split(";");

      // Search for the cookie values "admin", "bar", or "kitchen"
      const roleCookie = cookies.find(cookie => {
        const [key, value] = cookie.trim().split("=");
        return key === "admin" || key === "bar" || key === "kitchen";
      });

      if (roleCookie) {
        const [, role] = roleCookie.split("=");
        
        // If cookie exists and its value is not "user"
        if (role && role !== "user") {
          setIsUser(true); // User has a valid role other than "user"
        } else {
          setIsUser(false); // Role is "user" or not present
        }
      } else {
        setIsUser(false); // No relevant cookies found
      }
    };

    checkUserRole();
  }, []);
  

  return (
    <div className="mt-14 min-h-[57vh] sm:min-h-[80vh] w-full px-10 md:px-24 xl:px-56 flex justify-center items-start">
      {/* BACKGROUND IMAGE CONTAINER */}
      <div
        className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1]
      lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
      ></div>
      {/* MAIN CONTAINER */}
      <div className="max-w-[600px] w-full flex flex-col gap-2 py-4">
        {/* HEADER CONTAINER */}
        <div className="flex items-center gap-1 justify-start">
          <Link
            href={"/adminhome"}
            className="flex items-center space-x-1 font-bold text-orange-950 text-xl text-left
              hover:text-orange-800 cursor-pointer lg:text-2xl"
          >
            <span>Dashboard</span>
            <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
          </Link>
          <h1 className="text-xl text-orange-950 font-bold lg:text-2xl">
            Announcement
          </h1>
        </div>
        {/* ANNOUNCEMENT FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-gray-100 rounded-md shadow-md pt-4 pb-6 px-6
          flex flex-col gap-2"
        >
          <h1 className="flex items-center gap-2 text-gray-900 font-semibold text-xl mb-2">
            <i className="fa fa-bullhorn" aria-hidden="true"></i>
            <span>Make an announcement!</span>
          </h1>
          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor={`inputSubject`}
            >
              <span>Subject</span>
            </label>
            <input
              className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
              name={`inputSubject`}
              id={`inputSubject`}
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => handleSubjectChange(e)}
              required
            />
          </div>

          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor={`inputBody`}
            >
              <span>Body</span>
            </label>
            <textarea
              className="border-2 border-solid border-orange-900 w-full pl-2 
              rounded-md bg-orange-50 h-36"
              name={`inputBody`}
              id={`inputBody`}
              placeholder="Body"
              value={body}
              onChange={(e) => handleBodyChange(e)}
              required
            />
            <button
              type="submit"
              className="w-full bg-orange-950 text-white font-bold h-10 shadow-md
            hover:bg-orange-900 hover:scale-[1.02] duration-200 rounded-md mt-2"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
      {isPopUpVisible && <CheckoutPopup message={"Announcement Published!"} />}
    </div>
  );
};

export default MakeAnnouncementPage;
