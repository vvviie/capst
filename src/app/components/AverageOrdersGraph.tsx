"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const chartRef = useRef<any>(null); // Create a reference for the chart

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "dataAverageOrders"),
      (querySnapshot) => {
        const ordersData: OrdersData = {};

        querySnapshot.forEach((doc) => {
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

  const handlePrint = () => {
    if (chartRef.current?.toBase64Image) {
      const chartImage = chartRef.current.toBase64Image();

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        // Get the current date and time
        const currentDateTime = new Date().toLocaleString();

        printWindow.document.write(`
              <html>
                <head>
                  <title>Print Average Orders Chart</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      text-align: center;
                    }
                    .labels {
                      margin-top: 20px;
                      margin-bottom: 20px;
                      font-size: 2.2em; /* Larger font size for labels */
                    }
                    img {
                      width: 1000px; /* Adjusted width for the chart image */
                      height: auto; /* Maintain aspect ratio */
                    }
                    hr {
                      margin: 20px 0; /* Add spacing around the horizontal rule */
                    }
                    table {
                      margin: 0 auto;
                      border-collapse: collapse;
                      width: 80%;
                    }
                    th, td {
                      border: 1px solid #ddd;
                      padding: 8px;
                      text-align: center;
                    }
                    th {
                      background-color: #f2f2f2;
                    }
                  </style>
                </head>
                <body>
                  <div class="labels">
                    <h3>Average Orders Per Day</h3>
                    <p>Total Orders: ${chartData?.datasets[0]?.data
                      .reduce((a, b) => a + b, 0)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                  </div>
      
                  <img src="${chartImage}" alt="Average Orders Chart" />
                  <hr />
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Total Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${chartData.labels
                        .map(
                          (label, index) => `
                        <tr>
                          <td>${label}</td>
                          <td>${chartData.datasets[0].data[index]
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
      
                  <p style="font-size: 30px;">Printed on: ${currentDateTime}</p>
                  <script>
                    window.onload = () => { setTimeout(() => window.print(), 500); };
                  </script>
                </body>
              </html>
            `);
        printWindow.document.close();
      }
    } else {
      console.error("Chart reference is null");
    }
  };

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
          text: "List of Dates",
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
      <button
        onClick={handlePrint}
        className="font-bold h-10 bg-[#7C2D12] max-w-[170px] w-full text-white duration-200
          rounded-md shadow-md text-sm sm:text-base sm:max-w-[200px] hover:scale-[1.02] py-2 px-4"
      >
        Print Chart Data
      </button>
      <Line ref={chartRef} options={options} data={chartData} />
    </>
  );
};

export default AverageOrdersGraph;