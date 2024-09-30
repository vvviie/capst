import React from "react";

const ChangesMadePopup = () => {
  return (
    <div
      className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-start justify-center z-20"
      style={{ background: "rgba(0, 0, 0, 0.3)" }}
    >
      <div
        className="bg-white rounded-lg shadow-md px-8 py-6 flex flex-col items-center gap-4 mt-44"
        style={{ background: "rgba(0, 0, 0, 0.8)" }}
      >
        <i className="far fa-check-circle text-[150px] text-gray-100"></i>
        <h1 className="font-bold text-2xl text-gray-100">Changes made!</h1>
      </div>
    </div>
  );
};

export default ChangesMadePopup;
