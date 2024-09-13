import React from "react";

const RemoveItemNotif = () => {
  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 rounded-md shadow-md p-2 px-3 font-semibold text-white text-center"
      style={{
        background: "rgba(239, 68, 68, 1)",
      }}
    >
      Item/s removed from cart!
    </div>
  );
};

export default RemoveItemNotif;
