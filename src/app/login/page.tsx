import React from "react";
import Image from "next/image";
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="relative h-[calc(100vh-56px)] mt-14 flex flex-col-reverse px-10 items-center gap-4 xl:flex-row xl:px-56">
      {/* IMAGE CONTAINER */}
      <div className="relative w-full aspect-square mb-2 xl:mb-0 xl:w-1/2">
        <Image src={"/coffee.png"} alt="" fill className="object-contain" />
      </div>
      {/* LOG-IN FORM */}
      <form
        action=""
        className="w-full flex flex-1 items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-orange-950 text-center my-4">
            Hello, there! Welcome back!
          </h1>
          <button
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
              htmlFor="password"
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
              htmlFor="password"
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
