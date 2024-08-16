"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWhVssqbS2QQ7NkI1CwiOHTq6sN31gsVg",
  authDomain: "testingcapstonejg.firebaseapp.com",
  databaseURL: "https://testingcapstonejg-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testingcapstonejg",
  storageBucket: "testingcapstonejg.appspot.com",
  messagingSenderId: "1006906116033",
  appId: "1:1006906116033:web:825eeeeeed8c4221a71140"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LoginPage = () => {
  const [message, setMessage] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage({ text: "Successfully logged in!", type: "success" });
    } catch (error) {
      setMessage({ text: "Invalid username or password.", type: "error" });
    }

    // Remove message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // User is signed in.
      const user = result.user;
      // ... (Check if the user exists in your database and handle accordingly)
      setMessage({ text: "Successfully logged in!", type: "success" });
    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      setMessage({ text: "Error signing in with Google.", type: "error" });

    // Remove message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
    }
  };

  return (
    <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 xl:flex-row xl:px-56">
      {/* IMAGE CONTAINER */}
      <div className="relative w-full aspect-square mb-2 xl:mb-0 xl:w-1/2">
        <Image src={"/coffee.png"} alt="" fill className="object-contain" />
      </div>
      {/* LOG-IN FORM */}
      <form
        onSubmit={handleLogin}
        className="w-full flex flex-1 items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
            Hello, there! Welcome back!
          </h1>
          {/* ERROR/SUCCESS MESSAGE */}
          {message && (
            <span className={`font-bold mt-[-20px] ${message.type === "success" ? "text-green-500" : "text-red-500"} text-xl`}>
              {message.text}
            </span>
          )}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center space-x-2 border-solid border-2 border-gray-50 w-full h-10 rounded-md
          shadow-md"
          >
            <i
              className="fa-brands fa-google text-sm"
              style={{ color: "#431407" }}
            ></i>
            <span className="font-bold text-md text-orange-950">
              Google Sign-in
            </span>
          </button>
          <div className="flex items-center gap-4 justify-center w-full">
            <span className="w-20 h-[1px] bg-slate-400"></span>
            <span>or</span>
            <span className="w-20 h-[1px] bg-slate-400"></span>
          </div>
          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor="inputEmail"
            >
              <i className="fa-solid fa-user text-gray-700"></i>
              <span>Username</span>
            </label>
            <input
              className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
              name="email"
              id="inputEmail"
              type="text"
              placeholder="ex. juandelacruz@gmail.com"
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
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 w-full h-10 rounded-md
          shadow-md text-white bg-orange-950"
          >
            <i className="fa fa-sign-in text-sm"></i>
            <span className="font-bold text-md">Username Login</span>
          </button>
          {/* CREATE AN ACCOUNT BUTTON */}
          <Link
            href={"/signup"}
            className="flex items-center justify-center space-x-2 border-solid border-2 border-gray-50 w-full h-10 rounded-md
          shadow-md text-orange-950"
          >
            <i className="fa fa-user-plus text-sm"></i>
            <span className="font-bold text-md">Create an account</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
