"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { initializeApp } from "firebase/app";
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

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

const urlDecode = (str) => decodeURIComponent(str.replace(/\+/g, ' '));
const urlEncode = (str) => encodeURIComponent(str);

const LoginPage = () => {
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // Check if the user is already logged in by checking cookies
    const userSession = Cookies.get("userSession");
    if (userSession) {
      router.push('/'); // Redirect to homepage if user is already logged in
    }
  }, [router]);

  const fetchUserDetails = async (email) => {
    try {
      const userRef = doc(firestore, "users", email);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        return role;
      } else {
        setMessage({ text: "No user details found in Firestore.", type: "error" });
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details: ", error);
      setMessage({ text: "Error fetching user details.", type: "error" });
      return null;
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await user.reload();
      if (!user.emailVerified) {
        setMessage({ text: "Please verify your email.", type: "error" });
        await auth.signOut();
      } else {
        setMessage({ text: "Login successful!", type: "success" });
        await user.getIdToken(true);

        const role = await fetchUserDetails(user.email);
        if (role) {
          const encodedRole = urlEncode(role);
          Cookies.set("userSession", user.refreshToken, { expires: 10 / 1440 });
          Cookies.set("userRole", encodedRole, { expires: 10 / 1440 });
          router.push('/');
        }
      }
    } catch (error) {
      setMessage({ text: "Invalid username or password.", type: "error" });
    }

    // Remove message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
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
