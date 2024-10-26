"use client";
import Link from "next/link";
import React, { useState } from "react";
import CheckoutPopup from "@/app/components/CheckoutPopup";

const EditVoucherPage = () => {
  const [deduction, setDeduction] = useState("minus");
  const [validity, setValidity] = useState(false);
  const [limitUse, setLimitUse] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleSubmit = () => {
    setIsPopupVisible(true);

    setTimeout(() => {
      setIsPopupVisible(false);
    }, 750);
  };

  const handleDeductionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDeduction(event.target.value);
  };

  const handleValidityChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    setValidity(selectedValue === "untilDate");
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setLimitUse(selectedValue === "limit");
  };

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[640px] flex flex-col gap-4">
        {/* HEADER CONTAINER */}
        <div className="flex justify-start items-center gap-2">
          {/* LINK BACK TO PRODUCTS */}
          <Link
            href={"/fkstllvouchers"}
            className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
          >
            Vouchers List
          </Link>
          <div className="text-xl sm:text-2xl font-bold text-orange-950 space-x-2 flex items-center">
            <i className="fa fa-angle-right" aria-hidden="true"></i>
            <span>Edit Voucher</span>
          </div>
        </div>
        {/* VOUCHER FORM */}
        <div
          className="bg-white border-2 border-gray-100 rounded-md shadow-lg px-4 pt-4
        pb-3 flex flex-col gap-4"
        >
          {/* VOUCHER ICON */}
          <i className="fa-solid fa-ticket text-orange-950 text-7xl text-center"></i>
          {/* ID AND AVAILABILITY */}
          <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            {/* VOUCHER ID */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="voucherID"
              >
                <span>ID</span>
              </label>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                name="voucherID"
                id="inputVoucherID"
                type="text"
                placeholder="Voucher ID"
                required
              />
            </div>
            {/* AVAILABILITY */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="menuItemPrice"
              >
                <span>Availability</span>
              </label>
              <select
                name="menuAvailability"
                id="menuCatAvailability"
                className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
          {/* VOUCHER NAME */}
          <div className="flex-1 flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor="voucherName"
            >
              <span>Name</span>
            </label>
            <input
              className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
              name="voucherName"
              id="inputVoucherName"
              type="text"
              placeholder="Voucher Name"
              required
            />
          </div>

          {/* TYPE AND DEDUCTION */}
          <div className="w-full flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-2">
            {/* DEDUCTION INPUT */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="deductionInput"
              >
                <span>{deduction === "minus" ? "Amount" : "Percentage"}</span>
              </label>
              <input
                className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                name="deductionInput"
                id="deductionInput"
                type="number"
                placeholder={deduction === "minus" ? "Amount" : "Percentage"}
                required
              />
            </div>
            {/* DEDUCTION TYPE */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="voucherType"
              >
                <span>Deduction Type</span>
              </label>
              <select
                name="voucherType"
                id="voucherType"
                className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                onChange={handleDeductionChange}
              >
                <option value="minus" className="cursor-pointer">
                  Amount
                </option>
                <option value="percent" className="cursor-pointer">
                  Percentage
                </option>
              </select>
            </div>
          </div>

          {/* VALIDITY AND VALIDITY DATE */}
          <div className="w-full flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-2">
            {validity && (
              // VALIDITY DATE
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputValidityDate"
                >
                  <span>Valid until</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="inputValidityDate"
                  id="inputValidityDate"
                  type="date"
                  required
                />
              </div>
            )}
            {/* VALIDITY */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="validity"
              >
                <span>Validity Period</span>
              </label>
              <select
                name="validity"
                id="validity"
                className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                onChange={handleValidityChange}
              >
                <option value="forever" className="cursor-pointer">
                  Perpetual
                </option>
                <option value="untilDate" className="cursor-pointer">
                  Expiration
                </option>
              </select>
            </div>
          </div>

          {/* ACTIVATION AND LIMIT */}
          <div className="w-full flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-2">
            {limitUse && (
              // ACTIVATION LIMIT
              <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                <label
                  className="text-orange-950 text-sm w-full text-left space-x-1"
                  htmlFor="inputActivationLimit"
                >
                  <span>Number of Use</span>
                </label>
                <input
                  className="border-2 border-solid border-orange-900 w-full h-10 pl-4 rounded-md bg-orange-50"
                  name="inputActivationLimit"
                  id="inputActivationLimit"
                  type="number"
                  required
                />
              </div>
            )}
            {/* ACTIVATION */}
            <div className="flex-1 flex flex-col gap-1 items-center justify-center w-full">
              <label
                className="text-orange-950 text-sm w-full text-left space-x-1"
                htmlFor="limitOfUse"
              >
                <span>Limit</span>
              </label>
              <select
                name="limitOfUse"
                id="limitOfUse"
                className="rounded-md shadow-sm border-2 border-gray-100
            text-lg text-gray-600 font-semibold bg-white cursor-pointer
            h-10 w-full text-center"
                onChange={handleLimitChange}
              >
                <option value="unli" className="cursor-pointer">
                  Unlimited Use
                </option>
                <option value="limit" className="cursor-pointer">
                  Limited Use
                </option>
              </select>
            </div>
          </div>

          {/* VOUCHER DESCRIPTION */}
          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <label
              className="text-orange-950 text-sm w-full text-left space-x-1"
              htmlFor="voucherDescription"
            >
              <span>Description</span>
            </label>
            <textarea
              className="border-2 border-solid border-orange-900 w-full pl-4 rounded-md 
                bg-orange-50 pt-1.5"
              name="voucherDescription"
              id="inputVoucherDescription"
              placeholder="Voucher Description"
              rows={2}
              style={{ resize: "none" }}
              required
            />
          </div>
          {/* SUBMIT BUTTON */}
          <button
            className="w-full bg-orange-950 font-bold text-xl text-white p-2 rounded-md mt-2
          shadow-md hover:scale-[1.02] duration-200 hover:bg-orange-900"
            onClick={() => {
              handleSubmit();
            }}
          >
            Update Voucher
          </button>
          {/* PRODUCT CREATED POP UP */}
          {isPopupVisible && <CheckoutPopup message="Voucher Updated!" />}
        </div>
      </div>
    </div>
  );
};

export default EditVoucherPage;
