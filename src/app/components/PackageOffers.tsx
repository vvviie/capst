"use client";

import React, { useState, useEffect, useRef } from "react";
import { Buffet } from "../data";

const PackageOffers = ({ selectedPackage }) => {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // CLOSE FORM WHEN CLICK OUTSIDE
  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const getPastaCount = () => {
    return selectedPackage === "C" ? 2 : 1;
  };

  const getMainsCount = () => {
    return selectedPackage === "A" ? 2 : 3;
  };

  const getDessertCount = () => {
    return selectedPackage === "C" ? 2 : 1;
  };

  return (
    <div className="w-1/2 cursor-pointer z-10">
      <button
        type="button"
        className="flex items-center justify-center space-x-1 w-full h-10 rounded-md shadow-md text-gray-700 bg-white
            hover:bg-gray-100 border-2 border-gray-50 hover:scale-[1.02] duration-300"
        onClick={() => setOpen(true)}
      >
        <i className="fas fa-utensil-spoon text-sm"></i>
        <span className="font-bold text-md">Buffet Contents</span>
      </button>
      {open && (
        <div
          className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <form
            ref={formRef}
            id="drinksFilter"
            className="bg-white rounded-md shadow-xl p-8 flex flex-col gap-2 min-w-96 mx-10
            max-h-[720px] overflow-auto border-2 border-gray-100"
          >
            {Buffet.map((item) => (
              <div key={item.title}>
                <h1
                  className={`text-xl text-left font-semibold text-orange-950 my-1`}
                >
                  {item.title}
                </h1>
                <hr />
                <p className="text-xs text-left text-gray-400 mt-2">
                  Choose{" "}
                  {item.title === "Veggies"
                    ? 1
                    : item.title === "Pasta"
                    ? getPastaCount()
                    : item.title === "Mains"
                    ? getMainsCount()
                    : getDessertCount()}{" "}
                  {item.title}:
                </p>
                <div className="grid grid-cols-2">
                  {item.items.map((food) => (
                    <div
                      className="flex items-center justify-start space-x-2 mx-1 my-3"
                      key={food}
                    >
                      <input
                        type="checkbox"
                        name="allergens"
                        id={`checkbox${food}`}
                        className="w-5 h-5"
                      />
                      <span className="text-sm w-4/5">{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="w-full text-white font-bold text-xl bg-orange-950 px-4 py-2 rounded-md shadow-md mt-4
              hover:bg-orange-900 hover:scale-[1.02] duration-300"
              onClick={() => setOpen(false)}
            >
              Set Buffet
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PackageOffers;