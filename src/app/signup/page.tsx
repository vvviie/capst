"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import classNames from "classnames";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import Link from "next/link";

// Import Firebase modules from npm
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWhVssqbS2QQ7NkI1CwiOHTq6sN31gsVg",
  authDomain: "testingcapstonejg.firebaseapp.com",
  databaseURL:
    "https://testingcapstonejg-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testingcapstonejg",
  storageBucket: "testingcapstonejg.appspot.com",
  messagingSenderId: "1006906116033",
  appId: "1:1006906116033:web:825eeeeeed8c4221a71140",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SignupPage: React.FC = () => {
  const router = useRouter(); // Initialize useRouter
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
      address,
    } = formData;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageColor("red");
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      setMessage("Verification email sent. Please verify your email.");
      setMessageColor("green");

      // Wait for email verification
      const verificationTimeout = setTimeout(() => {
        setMessage("Email verification timed out. Please try again.");
        setMessageColor("red");
      }, 30000); // 30 seconds timeout

      const verified = await new Promise<boolean>((resolve) => {
        const interval = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            resolve(true);
            clearInterval(interval);
          }
        }, 1000); // Check every 1 second
      });

      if (!verified) {
        setMessage("Email verification failed. Please try again.");
        setMessageColor("red");
        return;
      }

      clearTimeout(verificationTimeout);

      // Fetch the first-time voucher from the vouchers collection
      const firstTimeVoucherRef = doc(db, "vouchers", "firstTimeVoucher");
      const voucherSnap = await getDoc(firstTimeVoucherRef);

      if (voucherSnap.exists()) {
        const firstTimeVoucher = voucherSnap.data();

        // Get current date and time
        const now = new Date();
        const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
          now.getDate()
        ).padStart(2, "0")}/${now.getFullYear()}`;
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;

        // Save user data to Firestore with email as the document ID after verification
        await setDoc(doc(db, "users", email), {
          username: email,
          firstName,
          lastName,
          address,
          phoneNumber,
          role: "user", // Add role to user document
          vouchers: {
            firstTimeVoucher: {
              available: firstTimeVoucher.available,
              voucherDeduction: firstTimeVoucher.voucherDeduction,
              voucherDescription: firstTimeVoucher.voucherDescription,
              voucherID: firstTimeVoucher.voucherID,
              voucherType: firstTimeVoucher.voucherType,
              used: false,
              isRead: false,
              isNotifDeleted: false,
              dateCreated: date,
              timeCreated: time,
            },
          },
        });

        setMessage("User created successfully!");
        setMessageColor("green");

        // Navigate to login page after successful account creation
        setTimeout(() => {
          router.push("/login"); // Navigate to the login page
        }, 3000); // Optional: delay before redirecting
      } else {
        setMessage("Voucher not found.");
        setMessageColor("red");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("auth/weak-password")) {
          setMessage("Password should be at least 6 characters.");
        } else if (error.message.includes("auth/email-already-in-use")) {
          setMessage("Email is already in use.");
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage("An unexpected error occurred");
      }
      setMessageColor("red");
    }
  };

  return (
    <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 lg:flex-row xl:px-56">
      {/* IMAGE CONTAINER */}
      <div className="relative w-full aspect-square mb-2 lg:mb-0 lg:w-1/2">
        <Image src={"/coffee.png"} alt="" fill className="object-contain" />
      </div>
      {/* CREATE ACCOUNT FORM */}
      <form
        className="w-full flex flex-1 items-center justify-center"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
            Fikaställe Membership Sign-up
          </h1>

          {/* ERROR/SUCCESS MESSAGE */}
          {message && (
            <span
              className={classNames("font-bold mt-[-20px] text-xl", {
                "text-red-500": messageColor === "red",
                "text-green-500": messageColor === "green",
              })}
            >
              {message}
            </span>
          )}

          {/* MULTI-STEP FORM */}
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputEmail"
                >
                  <i className="fa-solid fa-user text-gray-700"></i>
                  <span>Username / Email Address</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="email"
                  id="inputEmail"
                  type="text"
                  placeholder="ex. juandelacruz@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputPassword"
                >
                  <i className="fa-solid fa-lock text-gray-700"></i>
                  <span>Password</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="password"
                  id="inputPassword"
                  type="password"
                  placeholder="●●●●●●●●●●"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputConfirmPassword"
                >
                  <i className="fa-solid fa-lock text-gray-700"></i>
                  <span>Confirm Password</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="confirmPassword"
                  id="inputConfirmPassword"
                  type="password"
                  placeholder="●●●●●●●●●●"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
                hover:bg-orange-900 duration-300 hover:scale-[1.02]"
              >
                <span className="font-bold text-md">Next</span>
              </button>

              <Link
                    href={"/login"}
                    className="flex items-center justify-center space-x-2 border-solid border-2 border-gray-50 w-full h-10 rounded-md
                        shadow-md text-orange-950
                        hover:bg-gray-50 duration-300 hover:scale-[1.02]"
                    >
                        <span className="font-bold text-md">Back</span>
              </Link>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputFirstName"
                >
                  <i className="fa-solid fa-user text-gray-700"></i>
                  <span>First Name</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="firstName"
                  id="inputFirstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputLastName"
                >
                  <i className="fa-solid fa-user text-gray-700"></i>
                  <span>Last Name</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="lastName"
                  id="inputLastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-gray-500 bg-white
                  hover:bg-gray-50 duration-300 hover:scale-[1.02] border-gray-50 border-2"
                >
                  <span className="font-bold text-md">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
                  hover:bg-orange-900 duration-300 hover:scale-[1.02]"
                >
                  <span className="font-bold text-md">Next</span>
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputPhoneNumber"
                >
                  <i className="fa-solid fa-phone text-gray-700"></i>
                  <span>Phone Number</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="phoneNumber"
                  id="inputPhoneNumber"
                  type="text"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputAddress"
                >
                  <i className="fa-solid fa-house text-gray-700"></i>
                  <span>Address</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="address"
                  id="inputAddress"
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-gray-500 bg-white
                  hover:bg-gray-50 duration-300 hover:scale-[1.02] border-gray-50 border-2"
                >
                  <span className="font-bold text-md">Previous</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
                  hover:bg-orange-900 duration-300 hover:scale-[1.02]"
                >
                  <span className="font-bold text-md">Submit</span>
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
