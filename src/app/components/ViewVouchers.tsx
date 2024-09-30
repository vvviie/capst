import Link from "next/link";
import React, { useState } from "react";

type vouch = {
  id: string;
  title: string;
  desc: string;
};

type vouchs = vouch[];

// SAMPLE VOUCHERS
const vouchers = [
  {
    id: "1",
    title: "FIKSTALLVCHR",
    desc: "Get P20 off when ordering a drink",
  },
  {
    id: "2",
    title: "ASDASDAS",
    desc: "Get P20 off when ordering a drink",
  },
  {
    id: "3",
    title: "NNNNNNNN",
    desc: "Get P20 off when ordering a drink",
  },
  {
    id: "4",
    title: "TTTTTTTTTT",
    desc: "Get P20 off when ordering a drink",
  },
  {
    id: "5",
    title: "AAAAAAAAAAAA",
    desc: "Get P20 off when ordering a drink",
  },
  {
    id: "6",
    title: "VVVVVVVVVVVV",
    desc: "Get P20 off when ordering a drink",
  },
];

const ViewVouchers = () => {
  // STATE FOR CURRENT VOUCHER SELECTED
  const [selectedVoucher, setSelectedVoucher] = useState<vouch>(vouchers[0]);

  return (
    <div className="flex flex-col">
      {/* VOUCHER INFO DISPLAY HEADER */}
      <h1 className="text-lg font-bold text-orange-900 text-center">
        Selected Voucher
      </h1>
      {/* VOUCHER INFO DISPLAY CONTAINER */}
      <div className="flex flex-col items-center">
        {/* ICON */}
        <i className="fa-solid fa-ticket text-orange-950 text-7xl"></i>
        {/* VOUCHER TITLE */}
        <h1 className="font-bold text-orange-950 text-xl">
          {selectedVoucher.title}
        </h1>
        {/* VOUCHER DESCRIPTION */}
        <p className="text-sm">{selectedVoucher.desc}</p>
        {/* LINK TO MENU BUTTON */}
        <Link
          href="/menu"
          className="flex items-center justify-center space-x-2 px-6 h-10 rounded-md shadow-md text-white bg-orange-950
          hover:bg-orange-900 duration-100 mt-2"
        >
          <span className="font-bold text-md">Order Now</span>
        </Link>
      </div>
      <hr className="my-4" />
      {/* SELECT VOUCHER HEADER */}
      <h1 className="text-lg font-bold text-orange-900 text-center mb-4">
        Select a voucher
      </h1>
      {/* VOUCHERS CONTAINER */}
      <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-auto lg:grid-cols-3">
        {vouchers.map((vouch) => (
          // VOUCHERS
          <span
            key={vouch.id}
            onClick={() => setSelectedVoucher(vouch)}
            className={`${
              selectedVoucher.id === vouch.id
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }  font-bold text-center
            rounded-md shadow-sm border-gray-50 border-2 py-2 cursor-pointer`}
          >
            {vouch.title}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ViewVouchers;
