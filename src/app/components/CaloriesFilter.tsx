import React from "react";
import { usePathname } from "next/navigation";

const Calories = ["Low", "Medium", "High"];

const CaloriesFilter = () => {
const pathname = usePathname();
const slug = pathname.split("/").pop();
return (
    <>
    <h1
        className={`text-2xl text-center font-semibold text-orange-950 ${
        slug === "pastries" && "sandwiches" && "snacks"
            ? "mt-[-20px]"
            : "mt-0"
        }`}
    >
        Calories
    </h1>
    <hr />
    <div className="flex justify-around items-center">
    {Calories.map((items) => (
        <div className="flex items-center justify-start space-x-2 mx-1 my-3">
            <input
            type="radio"
            name="caloriecount"
            id={`checkbox${items}`}
            className="w-4 h-4"
            />
            <span className="text-lg">{items}</span>
        </div>
        ))}
    </div>
    </>
);
};

export default CaloriesFilter;
