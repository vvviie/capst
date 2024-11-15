"use client";

import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ordersAveragePerDay } from "../data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type whatIsIt = string;

const AverageOrdersGraph = () => {
  const options = {};

  const data = {};

  return (
    <>
      <Line options={options} data={ordersAveragePerDay} />
    </>
  );
};

export default AverageOrdersGraph;
