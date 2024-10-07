import React, { useState, useEffect, useRef } from "react";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";

const ChangePassword = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Confirm old password, Step 2: Set new password
  const [loading, setLoading] = useState(false); // Loading state for button
  const [alertMessage, setAlertMessage] = useState<string>(""); // Message for the alert container
  const [alertType, setAlertType] = useState<"success" | "error" | "">(""); // Alert type for styling
  const [oldPassword, setOldPassword] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  // Use refs to control form inputs directly
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmNewPasswordRef = useRef<HTMLInputElement>(null);

  // Clear input values when transitioning to Step 2
  useEffect(() => {
    if (step === 2) {
      if (newPasswordRef.current) newPasswordRef.current.value = "";
      if (confirmNewPasswordRef.current)
        confirmNewPasswordRef.current.value = "";
    }
  }, [step]);

  // Handles Step 1, Re-authenticate with old password
  const handleConfirmOldPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true); // Show loading indicator on the button
    setAlertMessage(""); // Clear previous alert messages

    const form = e.target as HTMLFormElement;
    const oldPassword = form.oldPassword.value;

    if (user) {
      const credential = EmailAuthProvider.credential(
        user.email as string,
        oldPassword
      );
      try {
        await reauthenticateWithCredential(user, credential);

        // Password is correct
        setAlertMessage("Password is correct!");
        setAlertType("success");

        // Set a timer to clear the alert message and move to step 2
        setTimeout(() => {
          setAlertMessage("");
          setStep(2); // Proceed to step 2 after showing the message
        }, 1000); // Display the success message for 1 second
      } catch (err: any) {
        // Handle incorrect password
        setAlertMessage("Incorrect password. Please try again.");
        setAlertType("error");
      } finally {
        setLoading(false); // Stop loading spinner
      }
    } else {
      setAlertMessage("No user is currently signed in.");
      setAlertType("error");
      setLoading(false);
    }
  };

  // Handles Step 2, Update password
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const newPassword = form.newPassword.value;
    const confirmNewPassword = form.confirmNewPassword.value;

    if (newPassword !== confirmNewPassword) {
      setAlertMessage("New password and confirmation do not match.");
      setAlertType("error");
      return;
    }

    if (user) {
      try {
        await updatePassword(user, newPassword);

        // Show success message
        setIsPopupVisible(true);
        setAlertMessage("Password successfully updated!");
        setAlertType("success");

        // Hide the alert and go back to step 1 after 1 second
        setTimeout(() => {
          setAlertMessage("");
          setStep(1);

          // Reset the oldPassword state to clear the field
          setOldPassword("");
        }, 1000);
      } catch (err: any) {
        const errorMessage = err.message.replace(/^Firebase: /, "");
        setAlertMessage(errorMessage);
        setAlertType("error");
      }
    } else {
      setAlertMessage("No user is currently signed in.");
      setAlertType("error");
    }
  };

  // Handle Cancel Button Click
  const handleCancel = () => {
    setStep(1);
    setAlertMessage("");

    // Reset the oldPassword state to clear the field
    setOldPassword("");
  };

  return (
    <div>
      {step === 1 ? (
        <form onSubmit={handleConfirmOldPassword} className="">
          {/* HEADER */}
          <h1 className="text-2xl font-bold mb-2 text-orange-900">
            Confirm old password
          </h1>

          {/* OLD PASSWORD INPUT */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500">
              Enter your current password
            </span>
            <input
              className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
              name="oldPassword"
              id="inputOldPassword"
              type="password"
              placeholder="●●●●●●●●●●"
              required
              autoComplete="off" // Prevent browser autofill
              value={oldPassword} // Bind to state
              onChange={(e) => setOldPassword(e.target.value)} // Update state on change
            />
          </div>

          {/* SUBMIT BUTTON WITH LOADING */}
          <button
            type="submit"
            className={`flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white hover:scale-[1.02] ${
              loading ? "bg-gray-400" : "bg-orange-950 hover:bg-orange-900 "
            } duration-300 mt-6`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Checking...</span>
              </div>
            ) : (
              <span className="font-bold text-md">Confirm Old Password</span>
            )}
          </button>

          {/* ALERT MESSAGE BELOW THE BUTTON */}
          {alertMessage && (
            <div
              className={`mt-4 p-3 rounded-md ${
                alertType === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {alertMessage}
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleUpdatePassword} className="">
          {/* HEADER */}
          <h1 className="text-2xl font-bold mb-2 text-orange-900">
            Set New Password
          </h1>

          {/* NEW PASSWORD INPUT */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500">New Password</span>
            <input
              ref={newPasswordRef}
              className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
              name="newPassword"
              id="inputNewPassword"
              type="password"
              placeholder="●●●●●●●●●●"
              required
              autoComplete="new-password" // Prevent autofill for new password
            />
          </div>

          {/* CONFIRM NEW PASSWORD INPUT */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500">Confirm New Password</span>
            <input
              ref={confirmNewPasswordRef}
              className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
              name="confirmNewPassword"
              id="inputConfirmNewPassword"
              type="password"
              placeholder="●●●●●●●●●●"
              required
              autoComplete="new-password" // Prevent autofill for confirm password
            />
          </div>

          {/* BUTTON CONTAINER */}
          <div className="flex justify-between mt-6">
            {/* CANCEL BUTTON */}
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center space-x-2 w-1/2 h-10 rounded-md shadow-md text-gray-500 bg-white
              hover:bg-gray-50 duration-300 hover:scale-[1.02] border-2 border-gray-100"
            >
              <span className="font-bold text-md">Cancel</span>
            </button>

            {/* UPDATE PASSWORD BUTTON */}
            <button
              type="submit"
              className="flex items-center justify-center space-x-2 w-1/2 h-10 rounded-md shadow-md text-white bg-orange-950
              hover:bg-orange-900 duration-300 ml-2 hover:scale-[1.02]"
            >
              <span className="font-bold text-md">Update Password</span>
            </button>
          </div>

          {/* ALERT MESSAGE BELOW THE BUTTON */}
          {alertMessage && (
            <div
              className={`mt-4 p-3 rounded-md ${
                alertType === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {alertMessage}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
