"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

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
const firestore = getFirestore(app);

const urlEncode = (str: string) => encodeURIComponent(str);

const LoginPage = () => {
  const [isEyeOpen, setIsEyeOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in by checking cookies
    const userSession = Cookies.get("user");
    if (userSession) {
      router.push("/"); // Redirect to homepage if user is already logged in
    }
  }, [router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleIcon = () => {
    setIsEyeOpen(!isEyeOpen); // Toggle between true and false
  };

  const fetchUserDetails = async (email) => {
    try {
      const isStaff = email.endsWith("@fikastallestaff.com");
      const collectionName = isStaff ? "staff" : "users";
      const roleField = isStaff ? "staffRole" : "role";

      console.log(
        `Fetching from collection: ${collectionName} with email: ${email}`
      );

      const userRef = doc(firestore, collectionName, email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        console.log("Document exists in Firestore.");

        const userData = userDoc.data();
        const role = userData[roleField];
        const isVerified = userData.verified;

        console.log(`Fetched role: ${role}, verified: ${isVerified}`);

        if (!role) {
          setMessage({
            text: `Role field '${roleField}' not found in document.`,
            type: "error",
          });
        }

        // Return role and verified status
        return { role, isVerified };
      } else {
        setMessage({
          text: `No user details found in Firestore for email: ${email} in collection: ${collectionName}.`,
          type: "error",
        });
        console.log(`Document does not exist for email: ${email}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setMessage({
        text: `Error fetching user details: ${error.message}`,
        type: "error",
      });
      return null;
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Determine if the email belongs to staff
      const isStaff = email.endsWith("@fikastallestaff.com");

      // If the user is not staff, check if the user has been verified either through email or Firestore
      if (!isStaff) {
        const userDetails = await fetchUserDetails(email);

        if (userDetails) {
          const { role, isVerified } = userDetails;

          // If verified field is true, allow login
          if (isVerified) {
            console.log("User is verified via Firestore.");
          } else if (!user.emailVerified) {
            // If the Firestore "verified" field is false and email is not verified, prompt verification
            setMessage({ text: "Please verify your email.", type: "error" });
            await signOut(auth); // Sign out if email is not verified
            return;
          }
        } else {
          // If user details are not found, sign them out
          await signOut(auth); // Sign out if no user details are found
          return;
        }
      }

      // Fetch user role from Firestore (using destructuring from the above check)
      const userDetails = await fetchUserDetails(email);

      if (userDetails) {
        const { role } = userDetails;

        // Now use the role to redirect the user
        if (role === "admin") {
          Cookies.set("admin", user.refreshToken);
          router.push("/adminhome");
        } else if (role === "bar") {
          Cookies.set("bar", user.refreshToken);
          router.push("/fkstllorders");
        } else if (role === "kitchen") {
          Cookies.set("kitchen", user.refreshToken);
          router.push("/fkstllorders");
        } else {
          Cookies.set("user", user.refreshToken);
          router.push("/");
        }
      } else {
        // Handle case where role is undefined or not fetched
        await signOut(auth); // Sign out if no role is found
      }
    } catch (error) {
      setMessage({ text: `Invalid username or password.`, type: "error" });
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 xl:flex-row xl:px-56">
      <div className="relative w-full aspect-square mb-2 xl:mb-0 xl:w-1/2">
        <Image src={"/coffee.png"} alt="" fill className="object-contain" />
      </div>

      <form
        onSubmit={handleLogin}
        className="w-full flex flex-1 items-center justify-center mt-10 xl:mt-0"
      >
        <div className="w-full max-w-[500px] flex flex-col items-center justify-center gap-4">
          <div className="w-full flex gap-4 items-center">
            <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
            <span className="text-2xl text-center font-bold text-orange-900">
              Welcome back!
            </span>
            <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          </div>

          {message && (
            <span
              className={`font-bold mt-[-20px] ${
                message.type === "success" ? "text-green-500" : "text-red-500"
              } text-xl`}
            >
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
              required // Added required attribute for better UX
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

            {/* Parent div for input and icon */}
            <div className="relative w-full">
              {" "}
              {/* Make this relative for positioning */}
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 pr-12 rounded-md bg-orange-50"
                name="password"
                id="inputPassword"
                type={showPassword ? "text" : "password"} // Correctly handle password visibility
                placeholder="●●●●●●●●●●"
                required
                autoComplete="off"
              />
              {/* Custom Eye Icon */}
              <i
                className={`absolute right-3 top-3 fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } text-gray-300 cursor-pointer hover:text-gray-500 hover:duration-100`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
          </div>
          <p
            className="text-sm font-semibold text-gray-600 underline-offset-2 underline
          hover:text-gray-400 cursor-pointer duration-300 hover:scale-[1.02]"
          >
            <Link href="/forgot-password">Forgot your password?</Link>
          </p>
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 w-full h-10 rounded-md
          shadow-md text-white bg-orange-950
          hover:bg-orange-900 duration-300 hover:scale-[1.02]"
          >
            <i className="fa fa-sign-in text-sm"></i>
            <span className="font-bold text-md">Username Login</span>
          </button>

          <Link
            href={"/signup"}
            className="flex items-center justify-center space-x-2 border-solid border-2 border-gray-50 w-full h-10 rounded-md
          shadow-md text-gray-500
          hover:bg-gray-50 duration-300 hover:scale-[1.02]"
          >
            <i className="fa  fa-user-plus text-sm"></i>
            <span className="font-bold text-md">Create an account</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
