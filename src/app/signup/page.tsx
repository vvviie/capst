"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SignupPage = () => {
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

  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 xl:flex-row xl:px-14">
      {/* IMAGE CONTAINER */}
      <div className="relative w-full aspect-square mb-2 xl:mb-0 xl:w-1/2">
        <Image src={"/coffee.png"} alt="" fill className="object-contain" />
      </div>
      {/* CREATE ACCOUNT FORM */}
      <form
        action=""
        className="w-full flex flex-1 items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
            Hello, there! Join us now!
          </h1>
          {step === 1 && (
            <>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left"
                  htmlFor="email"
                >
                  Email/Username
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="email"
                  id="inputEmail"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ex. juandelacruz@gmail.com"
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="password"
                  id="inputPassword"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="●●●●●●●●●●"
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="confirmPassword"
                  id="inputConfirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="●●●●●●●●●●"
                />
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950"
              >
                <span className="font-bold text-md">Next</span>
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="firstName"
                  id="inputFirstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="lastName"
                  id="inputLastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950"
                >
                  <span className="font-bold text-md">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950"
                >
                  <span className="font-bold text-md">Next</span>
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left"
                  htmlFor="phoneNumber"
                >
                  Phone Number
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="phoneNumber"
                  id="inputPhoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
              </div>
              <div className="w-full flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left"
                  htmlFor="address"
                >
                  Address
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="address"
                  id="inputAddress"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950"
                >
                  <span className="font-bold text-md">Previous</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950"
                >
                  <span className="font-bold text-md">Create Account</span>
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
