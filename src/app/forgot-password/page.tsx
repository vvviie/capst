"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import classNames from "classnames";
import { auth } from "@/app/firebase"; // Add your firebase instance here
import { sendPasswordResetEmail, verifyPasswordResetCode } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";

const ForgotPasswordPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode"); // This will be 'reset' after clicking the email link
    const oobCode = searchParams.get("oobCode"); // Verification code from the email

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [isCodeValid, setIsCodeValid] = useState(false); // New flag to check if the token is valid
    const [disableButton, setDisableButton] = useState(false);
    const [countdown, setCountdown] = useState(20);

    useEffect(() => {
        if (disableButton) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [disableButton]);

    useEffect(() => {
        if (countdown === 0) {
            setDisableButton(false);
        }
    }, [countdown]);

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

        if (disableButton) {
            return;
        }

        setDisableButton(true);
        setCountdown(20);

        try {
            // Send password reset email with a valid continue URL
            const url = `${window.location.origin}/`;
            await sendPasswordResetEmail(auth, email, {
                url,
                handleCodeInApp: true, // Ensures the code is handled within your app
            });

            setMessage("Password reset email sent. Please check your email.");
            setMessageColor("green");
        } catch (error: any) {
            if (error.message.includes("auth/user-not-found")) {
                setMessage("User      not found");
            } else {
                setMessage(error.message);
            }
            setMessageColor("red");
        }
    };

    return (
        <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 lg:flex-row xl:px-56">
            <div className="relative w-full aspect-square mb-2 lg:mb-0 lg:w-1/2">
                <Image src={"/coffee.png"} alt="" fill className="object-contain" />
            </div>
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
                        {disableButton && (
                            <span className="text-orange-950 text-sm">
                                {countdown} (please wait before sending again)
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`bg-orange-950 text-white text-sm font-bold py-2 px-4 rounded-md w-full ${disableButton ? "bg-gray-500" : "bg-orange-950"
                            }`}
                        disabled={disableButton}
                    >
                        {disableButton ? "Waiting..." : "Send Password Reset Email"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;