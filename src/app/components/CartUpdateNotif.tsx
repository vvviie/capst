import React from "react";

interface CartUpdateNotifProps {
  isUpdate?: boolean;
}

const CartUpdateNotif: React.FC<CartUpdateNotifProps> = ({ isUpdate }) => {
  return (
    <div
      className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-center justify-center z-20"
      style={{ background: "rgba(0, 0, 0, 0.3)" }}
    >
      <div
        className="bg-white rounded-lg shadow-md px-8 py-6 flex flex-col items-center gap-4"
        style={{ background: "rgba(0, 0, 0, 0.8)" }}
      >
        <i className="far fa-check-circle text-[150px] text-gray-100"></i>
        <h1 className="font-bold text-2xl text-gray-100">
          {isUpdate ? "Item updated in cart!" : "Item added to cart!"}
        </h1>
      </div>
    </div>
  );
};

export default CartUpdateNotif;