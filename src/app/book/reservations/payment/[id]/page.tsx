import React from "react";

const PaymentPage = () => {
  return (
    <div className="min-h-[calc(100vh-56px)] gap-6 mt-14 px-10 py-8 flex flex-col items-center md:px-24 lg:gap-8 lg:flex-row-reverse lg:items-start lg:justify-center xl:px-56">
      {/* BACKGROUND */}
      <div className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1] lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"></div>
      {/* MAIN CONTAINER */}
      <div
        className="pt-4 pb-6 px-4 bg-white border-gray-100 border-2 shadow-md rounded-md w-full flex flex-col gap-2
     max-w-720px"
      >
        <h1></h1>
      </div>
    </div>
  );
};

export default PaymentPage;
