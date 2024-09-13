import React, { useState, useEffect } from "react";

interface MainCourseOptionsProps {
  onOptionChange: (option: string) => void; // Callback to notify the parent about the selected option
}

const MainCourseOptions: React.FC<MainCourseOptionsProps> = ({
  onOptionChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("Rice");

  useEffect(() => {
    onOptionChange(selectedOption);
  }, [selectedOption, onOptionChange]);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <hr />
      {/* OPTIONS */}
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-500">Serve with</h1>
        {/* RICE OR MASHED POTATO CHOICES */}
        <div className="flex flex-col">
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedOption === "Rice" ? "bg-orange-50" : "bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="mainCourseOption"
              id="rice"
              className="w-5 h-5 cursor-pointer"
              checked={selectedOption === "Rice"}
              onChange={() => handleOptionChange("Rice")}
            />
            <span className="ml-4 font-semibold">Rice</span>
          </div>
          <div
            className={`flex items-center text-orange-900 text-lg px-4 border-solid border-2 border-gray-50 py-2 ${
              selectedOption === "Mashed Potato" ? "bg-orange-50" : "bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="mainCourseOption"
              id="mashed"
              className="w-5 h-5 cursor-pointer"
              checked={selectedOption === "Mashed Potato"}
              onChange={() => handleOptionChange("Mashed Potato")}
            />
            <span className="ml-4 font-semibold">Mashed Potato</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCourseOptions;
