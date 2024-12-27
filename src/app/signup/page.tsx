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
import TermsAndConditions from "../components/TermsAndConditions";

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
  const [isEyeOpen, setIsEyeOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleTermsClick = () => {
    setShowTerms(true);
  };

  const handleCloseTerms = () => {
    setShowTerms(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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

  const toggleIcon = () => {
    setIsEyeOpen(!isEyeOpen); // Toggle between true and false
  };

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
      // Call the API to handle the registration process
      const response = await fetch("/api/createUserAcc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
          address,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        setMessage(data.message || "Verification email sent. Please verify your email.");
        setMessageColor("green");
  
        // Once email is verified, redirect to the login page
        setTimeout(() => {
          window.location.href = "login"; // Navigate and reload the page
        }, 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to create user.");
        setMessageColor("red");
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
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
        <div className="w-full max-w-[500px] flex flex-col items-center justify-center gap-4">
          <div className="w-full flex gap-4 items-center">
            <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
            <span className="text-2xl text-center font-bold text-orange-900">
              Sign Up
            </span>
            <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          </div>

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
                <div
                  className="border-2 border-solid border-orange-900 w-full h-10 rounded-md bg-orange-50
                 overflow-clip relative flex items-center"
                >
                  <input
                    className="w-full h-10 rounded-md bg-orange-50 pl-4"
                    name="password"
                    id="inputPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="●●●●●●●●●●"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <i
                    className={`absolute right-3 top-2.5 fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }
                     text-gray-300 cursor-pointer hover:text-gray-500 hover:duration-100`}
                    onClick={togglePasswordVisibility}
                  ></i>
                </div>
              </div>

              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputConfirmPassword"
                >
                  <i className="fa-solid fa-lock text-gray-700"></i>
                  <span>Confirm Password</span>
                </label>
                <div
                  className="border-2 border-solid border-orange-900 w-full h-10 rounded-md bg-orange-50
                 overflow-clip relative flex items-center"
                >
                  <input
                    className="w-full h-10 rounded-md bg-orange-50 pl-4"
                    name="confirmPassword"
                    id="inputConfirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="●●●●●●●●●●"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <i
                    className={`absolute right-3 top-2.5 fa-solid ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    }
                     text-gray-300 cursor-pointer hover:text-gray-500 hover:duration-100`}
                    onClick={toggleConfirmPasswordVisibility}
                  ></i>
                </div>
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
                className="flex items-center justify-center space-x-2 border-solid border-2 border-gray-100 w-full h-10 rounded-md
                        shadow-md text-gray-500
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
              <div className="w-fulltext-gray-500 font-light text-sm my-2 text-center">
                <span className="">
                  By signing up, I accept the{" "}
                  <span
                    className="text-blue-500 font-semibold underline underline-offset-2
                    cursor-pointer hover:text-blue-400"
                    onClick={handleTermsClick}
                  >
                    terms and conditions
                  </span>{" "}
                  of using this service.
                </span>
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
        {showTerms && (
          <div
            className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] z-20 flex justify-center items-center
      px-10 md:px-24 xl:px-56"
            style={{ background: "rgba(0, 0, 0, 0.85" }}
            onClick={handleCloseTerms}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <TermsAndConditions onClose={handleCloseTerms} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SignupPage;
