"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { soldToday, soldWeek, soldYear } from "../data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type whatIsIt = string;

const FoodDrinksGraph = ({ timeFrame }) => {
  const options = {};

  const data = {};

  return (
    <>
      {timeFrame === "today" ? (
        <Bar options={options} data={soldToday} />
      ) : timeFrame === "week" ? (
        <Bar options={options} data={soldWeek} />
      ) : (
        <Bar options={options} data={soldYear} />
      )}
    </>
  );
};

export default FoodDrinksGraph;
