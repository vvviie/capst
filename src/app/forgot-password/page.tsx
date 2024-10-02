"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import classNames from "classnames";
import { auth, firebaseApp } from "@/app/firebase"; // Add your firebase instance here
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // This will be 'reset' after clicking the email link
  const oobCode = searchParams.get("oobCode"); // Verification code from the email

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [currentStep, setCurrentStep] = useState(mode === "reset" ? 2 : 1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false); // New flag to check if the token is valid

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (oobCode && mode === "reset") {
      // Verify the oobCode when the user reaches the reset page
      verifyPasswordResetCode(auth, oobCode)
        .then(() => {
          setIsCodeValid(true); // Token is valid, allow the user to reset password
        })
        .catch((error) => {
          setMessage("Invalid or expired reset code.");
          setMessageColor("red");
          setIsCodeValid(false); // Token is invalid or expired
        });
    }
  }, [oobCode, mode]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address");
      setMessageColor("red");
      return;
    }

    try {
      // Send password reset email with a valid continue URL
      const url = `${window.location.origin}/forgot-password?mode=reset`;
      await sendPasswordResetEmail(auth, email, {
        url,
        handleCodeInApp: true, // Ensures the code is handled within your app
      });

      setMessage("Password reset email sent. Please check your email.");
      setMessageColor("green");
    } catch (error: any) {
      if (error.message.includes("auth/user-not-found")) {
        setMessage("User not found");
      } else {
        setMessage(error.message);
      }
      setMessageColor("red");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage("Please enter both new password and confirm password");
      setMessageColor("red");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match");
      setMessageColor("red");
      return;
    }

    if (!isCodeValid) {
      setMessage("The reset link is invalid or expired.");
      setMessageColor("red");
      return;
    }

    try {
      // Confirm the password reset with the oobCode from the email link
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setMessage("Password updated successfully!");
      setMessageColor("green");
      setCurrentStep(3);
    } catch (error: any) {
      setMessage(error.message);
      setMessageColor("red");
    }
  };

  return (
    <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 lg:flex-row xl:px-56">
      <div className="relative w-full aspect-square mb-2 lg:mb-0 lg:w-1/2">
        <Image src={"/coffee.png"} alt="" fill className="object-contain" />
      </div>
      {currentStep === 1 && (
        <form
          className="w-full flex flex-1 items-center justify-center"
          onSubmit={handleSendResetEmail}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
              Forgot Password
            </h1>

            <p className="text-gray-600 text-sm text-center mb-4">
              Enter your email address to receive a password reset link.
            </p>

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

            <div className="w-full flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="inputEmail"
              >
                <i className="fa-solid fa-user text-gray-700"></i>
                <span>Email Address</span>
              </label>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                name="email"
                id="inputEmail"
                type="email"
                placeholder="ex. juandelacruz@gmail.com"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-orange-950 text-white text-sm font-bold py-2 px-4 rounded-md w-full"
            >
              Send Password Reset Email
            </button>
          </div>
        </form>
      )}
      {currentStep === 2 && isCodeValid && (
        <form
          className="w-full flex flex-1 items-center justify-center"
          onSubmit={handleResetPassword}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
              Reset Password
            </h1>

            <p className="text-gray-600 text-sm text-center mb-4">
              Enter your new password to reset your password.
            </p>

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

            <div className="w-full flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="inputNewPassword"
              >
                <i className="fa-solid fa-lock text-gray-700"></i>
                <span>New Password</span>
              </label>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                name="newPassword"
                id="inputNewPassword"
                type="password"
                placeholder="ex. P@ssw0rd"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                placeholder="ex. P@ssw0rd"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-orange-950 text-white text-sm font-bold py-2 px-4 rounded-md w-full"
            >
              Reset Password
            </button>
          </div>
        </form>
      )}
      {currentStep === 3 && (
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
            Password Reset Successful
          </h1>

          <p className="text-gray-600 text-sm text-center mb-4">
            Your password has been successfully reset.
          </p>

          <button
            type="button"
            className="bg-orange-950 text-white text-sm font-bold py-2 px-4 rounded-md w-full"
            onClick={() => router.push("/login")}
          >
            Go to Login Page
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;

