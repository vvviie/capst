"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
import { db } from "../firebase"; // Adjust the path as necessary
import { collection, getDocs, onSnapshot } from "firebase/firestore";

// Define the types for chart data
interface ChartDataset {
  label: string;
  data: number[];
  fill: boolean;
  backgroundColor: string;
  borderColor: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AverageOrdersGraph = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "dataAverageOrders"),
      (querySnapshot) => {
        const ordersData = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData[doc.id] = data; // Store the data using the document ID as the key
        });

        // Get the current date
        const currentDate = new Date();
        const todayString = currentDate.toLocaleDateString();

        // Prepare data for the chart, filtering out future dates
        const filteredOrdersData = Object.keys(ordersData)
          .map((date) => ({
            ...ordersData[date],
            date: new Date(ordersData[date].date), // Convert to Date object for comparison
          }))
          .filter((order) => order.date <= currentDate); // Keep only orders with dates up to the current date

        // Check if there's data for today
        const hasTodayData = filteredOrdersData.some(
          (order) => order.date.toLocaleDateString() === todayString
        );

        // If there's no data for today, add a placeholder
        if (!hasTodayData) {
          filteredOrdersData.push({
            date: currentDate,
            totalOrders: 0,
          });
        }

        const labels = filteredOrdersData.map((order) =>
          order.date.toLocaleDateString()
        );
        const totalOrders = filteredOrdersData.map(
          (order) => order.totalOrders
        );

        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Total Orders",
              data: totalOrders,
              fill: false,
              backgroundColor: "#60A66F",
              borderColor: "#60A66F",
            },
          ],
        });
      },
      (error) => {
        console.error("Error fetching documents: ", error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Average Orders Per Day",
      },
    },
  };

  return (
    <>
      <Line options={options} data={chartData} />
    </>
  );
};

export default AverageOrdersGraph;
