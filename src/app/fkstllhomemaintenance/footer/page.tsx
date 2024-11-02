"use client";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React, { useState } from "react";

let tel = "(046)1234567";

let socials = [
<<<<<<< HEAD
  {
    name: "Facebook",
    active: true,
    icon: "fa-brands fa-facebook-f",
    url: "https://www.facebook.com/fikastalle/",
  },
  {
    name: "Messenger",
    active: true,
    icon: "fab fa-facebook-messenger",
    url: "https://www.facebook.com/fikastalle/",
  },
  {
    name: "Instagram",
    active: true,
    icon: "fa-brands fa-instagram",
    url: "https://www.instagram.com/fikastalle.fikakafe/",
  },
  {
    name: "Tiktok",
    active: true,
    icon: "fa-brands fa-tiktok",
    url: "https://www.tiktok.com/@fikastalle",
  },
  {
    name: "Email",
    active: true,
    icon: "fa-solid fa-envelope",
    url: "mailto:emailaddressngfikastalle@gmail.com",
  },
];

const FooterMaintenancePage = () => {
  const [open, setOpen] = useState(false);

  //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
  const handleSubmit = () => {
    setIsPopupVisible(true);

    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[500px]">
        {/* HEADER CONTAINER */}
        <div className="flex justify-start items-center gap-2 mb-2">
          {/* LINK BACK TO PRODUCTS */}
          <Link
            href={"/fkstllhomemaintenance"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
          >
            Maintenance
          </Link>
          <div className="text-xl sm:text-2xl font-bold text-orange-950 space-x-2 flex items-center">
            <i className="fa fa-angle-right" aria-hidden="true"></i>
            <span>Footer Section</span>
          </div>
        </div>
        {/* FORM CONTAINER */}
        <div
          className="bg-white border-2 border-gray-100 rounded-md shadow-md px-4 pt-2 pb-6
        flex flex-col gap-2"
        >
          {!open ? (
            // INITIAL DISPLAY
            <div className="w-full flex flex-col gap-2 items-center">
              <h1 className="w-full text-start text-xl font-bold text-orange-950">
                Footer Information
              </h1>
              {/* DETAIL CONTAINER */}
              <div className="w-full flex flex-col gap-2 items-start md:px-2">
                {/* TELEPHONE */}
                <div className="flex flex-col gap-0.5 w-full">
                  <div className="mt-2 w-full flex gap-2 items-center">
                    <i className={`fa fa-phone text-sm text-gray-500`}></i>
                    <h1 className="text-sm text-gray-500">Telephone</h1>
                  </div>
                  <p
                    className="font-semibold text-gray-900 mb-2"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {tel}
                  </p>
                </div>
                {/* SOCIALS */}
                {socials.map((soc) => (
                  <div className="flex flex-col gap-0.5 w-full" key={soc.name}>
                    <hr />
                    <div className="mt-2 w-full flex gap-2 items-center">
                      <i className={`${soc.icon} text-sm text-gray-500`}></i>
                      <h1 className="text-sm text-gray-500">{soc.name}</h1>
                    </div>
                    <p
                      className="font-semibold text-gray-900 mb-2"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {soc.url}
                    </p>
                    <select
                      name="active"
                      id="selectActive"
                      className="border-2 border-gray-100 rounded-md shadow-md text-center w-1/2 mb-4 h-10 font-bold
                      bg-white text-gray-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                ))}
                <button
                  className="w-full bg-orange-950 font-bold text-white h-10 rounded-md shadow-md
                hover:bg-orange-900 hover:scale-[1.02] duration-200"
                  onClick={() => setOpen(true)}
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            // EDIT FOOTER
            <div className="w-full flex flex-col gap-2 items-center">
              <h1 className="w-full text-start text-xl mb-2 font-bold text-orange-950">
                Update Footer
              </h1>
              <div className="w-full flex flex-col gap-2 items-start md:px-2">
                {/* TELEPHONE */}
                <div className="flex flex-col gap-2 w-full mb-4">
                  <label
                    className="text-orange-950 text-sm w-full text-left space-x-1"
                    htmlFor={`inputTel`}
                  >
                    <i className={`fa fa-phone`}></i>
                    <span className="">Telephone</span>
                  </label>
                  <input
                    className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                    name={`inputTel`}
                    id={`inputTel`}
                    type="text"
                    placeholder={`Telephone No.`}
                    required
                  />
                </div>
                {socials.map((soc) => (
                  <div
                    key={soc.name}
                    className="w-full flex flex-col gap-2 items-start justify-center"
                  >
                    <hr />
                    <label
                      className="text-orange-950 text-sm w-full text-left space-x-1"
                      htmlFor={`input${soc.name}`}
                    >
                      <i className={soc.icon}></i>
                      <span>{soc.name}</span>
                    </label>
                    <input
                      className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                      name={`input${soc.name}`}
                      id={`input${soc.name}`}
                      type="text"
                      placeholder={`${soc.name} URL`}
                      required
                    />
                    <div className="w-full flex justify-end">
                      <select
                        name="active"
                        id="selectActive"
                        className="border-2 border-gray-100 rounded-md shadow-md text-center w-1/2 mb-4 h-10 font-bold
                      bg-white text-gray-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* BUTTONS CONTAINER */}
              <div className="w-full flex gap-2">
                <button
                  className="w-2/3 bg-orange-950 font-bold text-white h-10 rounded-md shadow-md
                hover:bg-orange-900 hover:scale-[1.02] duration-200"
                  onClick={() => {
                    handleSubmit();
                    setTimeout(() => {
                      setOpen(false);
                    }, 900);
                  }}
                >
                  Update
                </button>
                <button
                  className="w-1/3 bg-white font-bold text-gray-500 h-10 rounded-md shadow-md
                border-2 border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* PRODUCT CREATED POP UP */}
      {isPopupVisible && <CheckoutPopup message={`Footer Updated!`} />}
    </div>
  );
};

export default FooterMaintenancePage;
=======
    {
        name: "Facebook",
        active: true,
        icon: "fa-brands fa-facebook-f",
        url: "https://www.facebook.com/fikastalle/",
    },
    {
        name: "Messenger",
        active: true,
        icon: "fab fa-facebook-messenger",
        url: "https://www.facebook.com/fikastalle/",
    },
    {
        name: "Instagram",
        active: true,
        icon: "fa-brands fa-instagram",
        url: "https://www.instagram.com/fikastalle.fikakafe/",
    },
    {
        name: "Tiktok",
        active: true,
        icon: "fa-brands fa-tiktok",
        url: "https://www.tiktok.com/@fikastalle",
    },
    {
        name: "Email",
        active: true,
        icon: "fa-solid fa-envelope",
        url: "mailto:emailaddressngfikastalle@gmail.com",
    },
];

const FooterMaintenancePage = () => {
    const [open, setOpen] = useState(false);

    //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    //   PARA LANG SA POP-UP KAPAG NAG-UPDATE BUTTON
    const handleSubmit = () => {
        setIsPopupVisible(true);

        setTimeout(() => {
            setIsPopupVisible(false);
        }, 750);
    };

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[500px]">
                {/* HEADER CONTAINER */}
                <div className="flex justify-start items-center gap-2 mb-2">
                    {/* LINK BACK TO PRODUCTS */}
                    <Link
                        href={"/fkstllhomemaintenance"}
                        className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
                    >
                        Maintenance
                    </Link>
                    <div className="text-xl sm:text-2xl font-bold text-orange-950 space-x-2 flex items-center">
                        <i className="fa fa-angle-right" aria-hidden="true"></i>
                        <span>Footer Section</span>
                    </div>
                </div>
                {/* FORM CONTAINER */}
                <div
                    className="bg-white border-2 border-gray-100 rounded-md shadow-md px-4 pt-2 pb-6
        flex flex-col gap-2"
                >
                    {!open ? (
                        // INITIAL DISPLAY
                        <div className="w-full flex flex-col gap-2 items-center">
                            <h1 className="w-full text-start text-xl font-bold text-orange-950">
                                Footer Information
                            </h1>
                            {/* DETAIL CONTAINER */}
                            <div className="w-full flex flex-col gap-2 items-start md:px-2">
                                {/* TELEPHONE */}
                                <div className="flex flex-col gap-0.5 w-full">
                                    <div className="mt-2 w-full flex gap-2 items-center">
                                        <i className={`fa fa-phone text-sm text-gray-500`}></i>
                                        <h1 className="text-sm text-gray-500">Telephone</h1>
                                    </div>
                                    <p
                                        className="font-semibold text-gray-900 mb-2"
                                        style={{ overflowWrap: "anywhere" }}
                                    >
                                        {tel}
                                    </p>
                                </div>
                                {/* SOCIALS */}
                                {socials.map((soc) => (
                                    <div className="flex flex-col gap-0.5 w-full" key={soc.name}>
                                        <hr />
                                        <div className="mt-2 w-full flex gap-2 items-center">
                                            <i className={`${soc.icon} text-sm text-gray-500`}></i>
                                            <h1 className="text-sm text-gray-500">{soc.name}</h1>
                                        </div>
                                        <p
                                            className="font-semibold text-gray-900 mb-2"
                                            style={{ overflowWrap: "anywhere" }}
                                        >
                                            {soc.url}
                                        </p>
                                        <select
                                            name="active"
                                            id="selectActive"
                                            className="border-2 border-gray-100 rounded-md shadow-md text-center w-1/2 mb-4 h-10 font-bold
                      bg-white text-gray-500"
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                ))}
                                <button
                                    className="w-full bg-orange-950 font-bold text-white h-10 rounded-md shadow-md
                hover:bg-orange-900 hover:scale-[1.02] duration-200"
                                    onClick={() => setOpen(true)}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ) : (
                        // EDIT FOOTER
                        <div className="w-full flex flex-col gap-2 items-center">
                            <h1 className="w-full text-start text-xl mb-2 font-bold text-orange-950">
                                Update Footer
                            </h1>
                            <div className="w-full flex flex-col gap-2 items-start md:px-2">
                                {/* TELEPHONE */}
                                <div className="flex flex-col gap-2 w-full mb-4">
                                    <label
                                        className="text-orange-950 text-sm w-full text-left space-x-1"
                                        htmlFor={`inputTel`}
                                    >
                                        <i className={`fa fa-phone`}></i>
                                        <span className="">Telephone</span>
                                    </label>
                                    <input
                                        className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                                        name={`inputTel`}
                                        id={`inputTel`}
                                        type="text"
                                        placeholder={`Telephone No.`}
                                        required
                                    />
                                </div>
                                {socials.map((soc) => (
                                    <div
                                        key={soc.name}
                                        className="w-full flex flex-col gap-2 items-start justify-center"
                                    >
                                        <hr />
                                        <label
                                            className="text-orange-950 text-sm w-full text-left space-x-1"
                                            htmlFor={`input${soc.name}`}
                                        >
                                            <i className={soc.icon}></i>
                                            <span>{soc.name}</span>
                                        </label>
                                        <input
                                            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                                            name={`input${soc.name}`}
                                            id={`input${soc.name}`}
                                            type="text"
                                            placeholder={`${soc.name} URL`}
                                            required
                                        />
                                        <div className="w-full flex justify-end">
                                            <select
                                                name="active"
                                                id="selectActive"
                                                className="border-2 border-gray-100 rounded-md shadow-md text-center w-1/2 mb-4 h-10 font-bold
                      bg-white text-gray-500"
                                            >
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* BUTTONS CONTAINER */}
                            <div className="w-full flex gap-2">
                                <button
                                    className="w-2/3 bg-orange-950 font-bold text-white h-10 rounded-md shadow-md
                hover:bg-orange-900 hover:scale-[1.02] duration-200"
                                    onClick={() => {
                                        handleSubmit();
                                        setTimeout(() => {
                                            setOpen(false);
                                        }, 900);
                                    }}
                                >
                                    Update
                                </button>
                                <button
                                    className="w-1/3 bg-white font-bold text-gray-500 h-10 rounded-md shadow-md
                border-2 border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* PRODUCT CREATED POP UP */}
            {isPopupVisible && <CheckoutPopup message={`Footer Updated!`} />}
        </div>
    );
};

export default FooterMaintenancePage;
>>>>>>> 8ff37b8651210cf028a425e13b307c96087ce439
