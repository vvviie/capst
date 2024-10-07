import React, { useState } from "react";
import ChangesMadePopup from "./ChangeMadePopup";

const ChangePassword = () => {
  // State to manage popup visibility
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Show the popup when the form is submitted
    setIsPopupVisible(true);

    // Hide the popup after 750ms
    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };

  return (
    <form onSubmit={handleSubmit} className="">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2 text-orange-900">
        Change Password
      </h1>
      {/* INPUT ELEMENTS CONTAINER */}
      <div className="space-y-2">
        {/* OLD PASSWORD INPUT */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-500">Old Password</span>
          <input
            className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
            name="oldPassword"
            id="inputOldPassword"
            type="password"
            placeholder="●●●●●●●●●●"
            required
          />
        </div>
        {/* NEW PASSWORD INPUT */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-500">New Password</span>
          <input
            className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
            name="newPassword"
            id="inputNewPassword"
            type="password"
            placeholder="●●●●●●●●●●"
            required
          />
        </div>
        {/* CONFIRM NEW PASSWORD INPUT */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-500">Confirm New Password</span>
          <input
            className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50"
            name="confirmNewPassword"
            id="inputConfirmNewPassword"
            type="password"
            placeholder="●●●●●●●●●●"
            required
          />
        </div>
      </div>
      {/* UPDATE PASSWORD BUTTON */}
      <button
        type="submit"
        className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
                    hover:bg-orange-900 duration-100 mt-6"
      >
        <span className="font-bold text-md">Update Password</span>
      </button>

      {/* CHANGES MADE POP UP */}
      {isPopupVisible && <ChangesMadePopup />}
    </form>
  );
};

export default ChangePassword;
