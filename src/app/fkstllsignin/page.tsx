import React from "react";

const AdminAndStaffLoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-56px)] mt-14 px-10">
      <form className="w-full flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
            Serve coffee one cup at a time.
          </h1>
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
              placeholder="Username"
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
            <input
              className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
              name="password"
              id="inputPassword"
              type="password"
              placeholder="●●●●●●●●●●"
              required // Added required attribute for better UX
            />
          </div>
          <p
            className="text-sm font-semibold text-gray-600 underline-offset-2 underline
          hover:text-gray-400 cursor-pointer duration-300 hover:scale-[1.02]"
          ></p>
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 w-full h-10 rounded-md
          shadow-md text-white bg-orange-950
          hover:bg-orange-900 duration-300 hover:scale-[1.02]"
          >
            <i className="fa fa-sign-in text-sm"></i>
            <span className="font-bold text-md">Login</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAndStaffLoginPage;
