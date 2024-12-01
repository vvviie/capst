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

// Define the structure of each order
interface OrderData {
  date: string; // The date of the order as a string
  totalOrders: number; // The total number of orders for that day
}

// Define the type for the `ordersData` object
interface OrdersData {
  [key: string]: OrderData; // Each key is a string (doc.id), and the value is the order data
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
        const ordersData: OrdersData = {};

        querySnapshot.forEach((doc) => {
          // Cast the document data to OrderData type
          const data = doc.data() as OrderData;
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
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Average Orders Per Day",
      },
      tooltip: {
        mode: "index" as const, // Show tooltip for all datasets at the hovered index
        intersect: false, // Allow tooltip to display even when not intersecting the line
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            return `Orders: ${value}`; // Customize the tooltip label
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Orders",
        },
        suggestedMin: 0, // Ensure the y-axis starts at zero
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
