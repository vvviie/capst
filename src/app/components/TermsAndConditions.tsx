import React from "react";
import {
  conclusion,
  conclusion2,
  conditions,
  introduction,
  terms,
} from "../data";

const TermsAndConditions = ({ onClose }) => {
  return (
    <div
      className="bg-white border-2 border-gray-100 shadow-md rounded-md w-full max-w-[500px]
      md:max-w-[600px] flex flex-col gap-4 px-6 pt-4 pb-6 h-[70%] max-h-[800px] overflow-auto"
    >
      <div className="flex flex-col gap-1 w-full">
        <h1 className="font-bold text-gray-900 text-xl text-center">
          {introduction.header}
        </h1>
        <p className="font-light text-gray-500 text-xs text-justify px-2">
          {introduction.desc}
        </p>
      </div>

      <h1 className="font-semibold text-gray-700">
        1. General Terms and Conditions
      </h1>
      {conditions.map((con, index) => (
      <div className="w-full pl-4 pr-2 text-justify" key={`condition-${index}`}>
        <h1 className="text-sm font-medium text-gray-600">
          1.{`${index + 1} ${con.header}`}
        </h1>

        {con.desc.map((desc, subIndex) => (
          <div
            className="flex items-start text-gray-500 pl-2 my-1"
            key={`condition-desc-${index}-${subIndex}`}
          >
            <span className="text-xs">● </span>
            <span className="text-xs font-light pl-2">{desc}</span>
          </div>
        ))}
      </div>
    ))}

    <h1 className="font-semibold text-gray-700">2. Definition of Terms</h1>
    {terms.map((term, index) => (
      <div className="w-full pl-4 pr-2 text-justify" key={`term-${index}`}>
        <h1 className="text-sm font-medium text-gray-600">
          2.{`${index + 1} ${term.header}`}
        </h1>

        {term.desc.map((desc, subIndex) => (
          <div
            className="flex items-start text-gray-500 pl-2 my-1"
            key={`term-desc-${index}-${subIndex}`}
          >
            <span className="text-xs">● </span>
            <span className="text-xs font-light pl-2">{desc}</span>
          </div>
        ))}
      </div>
    ))}
      <p className="font-light text-gray-500 text-xs text-justify px-2">
        {conclusion}
      </p>
      <p className="font-light text-gray-500 text-xs text-justify px-2">
        {conclusion2}
      </p>
      <button
        className="border-gray-100 border-2 bg-white font-bold text-gray-500 h-10 duration-200
        rounded-md shadow-md flex items-center justify-center py-4 hover:bg-gray-50 hover:scale-[1.02]"
        onClick={onClose}
      >
        <span>Close</span>
      </button>
    </div>
  );
};

export default TermsAndConditions;
