"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { LikesDislikes } from "../data";

ChartJS.register(ArcElement, Tooltip, Legend);

type whatIsIt = string;

const LikesDislikesChart = () => {
  const options = {};

  const data = {};

  return (
    <>
      <Pie options={options} data={LikesDislikes} />
    </>
  );
};

export default LikesDislikesChart;
