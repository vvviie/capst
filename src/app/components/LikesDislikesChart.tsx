"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

ChartJS.register(ArcElement, Tooltip, Legend);

const LikesDislikesChart = () => {
  const [chartData, setChartData] = useState({
    labels: ["Likes", "Dislikes"],
    datasets: [
      {
        label: "Ratio",
        data: [0, 0], // Initial placeholder values
        backgroundColor: ["#60A66F", "#F0565F"],
        hoverOffset: 4,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "customerFeedbacks", "feedbackRating");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { likeTally, dislikeTally } = docSnap.data();

        setChartData((prevData) => ({
          ...prevData,
          datasets: [
            {
              ...prevData.datasets[0],
              data: [likeTally || 0, dislikeTally || 0],
            },
          ],
        }));
      } else {
        console.error("No such document!");
      }
    };

    fetchData();
  }, []);

  const options = {};

  return (
    <Pie options={options} data={chartData} />
  );
};

export default LikesDislikesChart;
