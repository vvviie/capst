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
import {
  salesExpensesToday,
  salesExpensesWeek,
  salesExpensesYear,
} from "../data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type whatIsIt = string;

const NetSalesExpensesGraph = ({ timeFrame }) => {
  const options = {};

  const data = {};

  return (
    <>
      {timeFrame === "today" ? (
        <Bar options={options} data={salesExpensesToday} />
      ) : timeFrame === "week" ? (
        <Bar options={options} data={salesExpensesWeek} />
      ) : (
        <Bar options={options} data={salesExpensesYear} />
      )}
    </>
  );
};

export default NetSalesExpensesGraph;
