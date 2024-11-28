"use client";

import React, { useState, useEffect, useRef } from "react";
import CheckoutPopup from "./CheckoutPopup";

type voucher = {
  id: string;
  name: string;
  code: string;
  desc: string;
};

type vouchers = voucher[];

// Define types for the component props
interface AccGiveVoucherFormProps {
  isOpen: boolean; // isOpen should be a boolean value
  toggleForm: () => void; // toggleForm should be a function with no parameters and no return value
}

const voucherList: vouchers = [
  {
    id: "FKSTALLE1KORDR",
    name: "1000 Hit Order",
    code: "1000HitOrder",
    desc: "Get 10% off your total order for purchasing P1000 worth of products.",
  },
  {
    id: "FKSTALLE10KORDR",
    name: "10000 Hit Order",
    code: "10000HitOrder",
    desc: "Get 15% off your total order for purchasing P1000 worth of products.",
  },
  {
    id: "FKSTALLE20KORDR",
    name: "20000 Hit Order",
    code: "20000HitOrder",
    desc: "Get 20% off your total order for purchasing P1000 worth of products.",
  },
  {
    id: "FKSTALLE20KORDR1",
    name: "20000 Hit Order",
    code: "20000HitOrder",
    desc: "Get 20% off your total order for purchasing P1000 worth of products.",
  },
  {
    id: "FKSTALLE20KORDR2",
    name: "20000 Hit Order",
    code: "20000HitOrder",
    desc: "Get 20% off your total order for purchasing P1000 worth of products.",
  },
  {
    id: "FKSTALLE20KORDR3",
    name: "20000 Hit Order",
    code: "20000HitOrder",
    desc: "Get 20% off your total order for purchasing P1000 worth of products.",
  },
];

const AccGiveVoucherForm: React.FC<AccGiveVoucherFormProps> = ({ isOpen, toggleForm }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(voucherList[0]);

  const handlePopUp = async (id: string) => {
    setIsPopUpVisible(true);
    setTimeout(() => {
      setIsPopUpVisible(false);
    }, 750);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      toggleForm();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleVoucherClick = (voucher: voucher) => {  // Change to `voucher` type
    setSelectedVoucher(voucher);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed left-0 top-14 w-full h-[100vh] flex justify-center items-center z-10 px-4"
      style={{ background: "rgba(0, 0, 0, 0.85)" }}
    >
      <form
        action=""
        ref={formRef}
        className="bg-white px-4 py-2 rounded shadow-lg flex-1 max-w-[300px] sm:max-w-[420px]
        flex flex-col gap-4 mt-[-6rem]"
      >
        <div className="flex gap-2 items-center justify-between">
          <h1 className="font-semibold text-gray-700 text-xl text-center w-full mt-1">
            Send Voucher to User
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex-1 flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor="inputSearchVouchers"
            >
              <span>Filter Vouchers</span>
            </label>
            <input
              type="text"
              name="inputSearchVouchers"
              id="inputSearchVouchers"
              placeholder="Voucher Name"
              className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
            />
          </div>
          <label
            className="text-orange-950 text-sm w-full text-left space-x-1 mb-[-4px] mt-2"
            htmlFor=""
          >
            <span>Selected Voucher</span>
          </label>
          <hr />
          <div className="w-full flex flex-col gap-1 items-center">
            <i className="fa-solid fa-ticket text-orange-950 text-7xl"></i>
            <h1 className="text-center text-orange-950 lg:text-lg font-semibold md:text-xl px-6">
              {selectedVoucher.name}
            </h1>
            <p className="w-2/3 text-center text-gray-600 text-xs lg:text-sm mt-[-6px]">
              {selectedVoucher.desc}
            </p>
          </div>
          <hr />
          <div className="grid grid-cols-2 gap-1 w-full max-h-[300px] overflow-auto pb-2">
            {voucherList.map((voucher) => (
              <div
                key={voucher.id}
                className={`h-10 cursor-pointer ${
                  voucher.id === selectedVoucher.id
                    ? "bg-orange-50 text-orange-500"
                    : "bg-white border-2 border-gray-100 text-gray-500"
                } rounded-md shadow-md text-xs md:text-sm flex items-center justify-center font-semibold`}
                onClick={() => handleVoucherClick(voucher)}
              >
                <span>{voucher.id}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          className="w-full bg-orange-950 h-10 font-bold text-white rounded-md shadow-md
    hover:bg-orange-900 hover:scale-[1.02] duration-200 mb-1"
          type="button"
          onClick={() => {
            setIsPopUpVisible(true);
            setTimeout(() => {
              setIsPopUpVisible(false);
              toggleForm();
            }, 750);
          }}
        >
          Send Voucher
        </button>
      </form>
      {isPopUpVisible && <CheckoutPopup message={`Voucher sent!`} />}
    </div>
  );
};

export default AccGiveVoucherForm;
