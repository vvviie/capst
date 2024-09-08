"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Use the correct router import for Next.js app directory structure
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
const firestore = getFirestore(app); 

const LoginPage = () => {
  const [message, setMessage] = useState(null);
  const [isMounted, setIsMounted] = useState(false); // State to track if component is mounted
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    setIsMounted(true); // Set the state to true when the component mounts
  }, []);

  const fetchUserDetails = async (email) => {
    try {
      const userRef = doc(firestore, "users", email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User details: ", userData);
      } else {
        console.log("No such user in Firestore!");
        setMessage({ text: "No user details found in Firestore.", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching user details: ", error);
      setMessage({ text: "Error fetching user details.", type: "error" });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage({ text: "Successfully logged in!", type: "success" });

      await fetchUserDetails(userCredential.user.email);
      
      if (isMounted) {
        router.push('/'); // Ensure router.push runs only on client-side
      }
    } catch (error) {
      console.error("Authentication error: ", error.message);
      setMessage({ text: "Invalid username or password.", type: "error" });
    }

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setMessage({ text: "Successfully logged in!", type: "success" });

      await fetchUserDetails(user.email);

      if (isMounted) {
        router.push('/home'); // Ensure router.push runs only on client-side
      }
    } catch (error) {
      console.error("Google Sign-in error: ", error.message);
      setMessage({ text: "Error signing in with Google.", type: "error" });

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 xl:flex-row xl:px-56">
      <div className="relative w-full aspect-square mb-2 xl:mb-0 xl:w-1/2">
        <Image src={"/coffee.png"} alt="" fill className="object-contain" />
      </div>

      <form
        onSubmit={handleLogin}
        className="w-full flex flex-1 items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
            Hello, there! Welcome back!
          </h1>

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
