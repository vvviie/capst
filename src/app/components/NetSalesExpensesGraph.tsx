"use client";

import React, { useEffect, useState, useRef } from "react";
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
  salesExpensesWeek, // temporary
  salesExpensesYear, // temporary
} from "../data";

import { db } from "../firebase"; // Adjust the path as necessary
import { doc, getDoc, onSnapshot } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface NetSalesExpensesGraphProps {
  timeFrame: string;
  onExportImage?: (image: string) => void; // Add a callback to pass the chart image
}

interface SalesData {
  NetSales: {
    data: { [key: string]: number }; // Dates as keys and numeric values
    color?: string;
    labels?: string;
  };
  Expenses: {
    data: { [key: string]: number }; // Dates as keys and numeric values
    color?: string;
    labels?: string;
  };
}

interface WeeklyChartData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    borderColor: string;
    data: number[];
  }[];
  additionalLabel?: string; // Optional property for the week timeframe
}

interface YearlyChartData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    borderColor: string;
    data: number[];
  }[];
  totalSales: number; // Ensure totalSales is part of the return type
  totalExpenses: number; // Ensure totalExpenses is part of the return type
}

const NetSalesExpensesGraph: React.FC<NetSalesExpensesGraphProps> = ({
  timeFrame,
  onExportImage,
}) => {
  const chartRef = useRef<any>(null);
  const [salesExpensesToday, setSalesExpensesToday] = useState<any>(null);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // Valid position
      },
      tooltip: {
        mode: "index" as const, // Cast to a valid mode type
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: "Time Frame", // Customize text
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount (PHP)", // Customize text
        },
      },
    },
  };

  useEffect(() => {
    const docRef = doc(db, "salesData", "salesExpensesToday");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(data); // Log the fetched data to the console
          setSalesExpensesToday(data);
        } else {
          console.log("No such document!");
        }
      },
      (error) => {
        console.error("Error fetching document: ", error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const getLatestData = (data: SalesData | null) => {
    if (!data) return null;

    const today = new Date().toLocaleDateString(); // Format today's date
    const dates = Object.keys(data.NetSales.data);

    // Sort dates in descending order
    dates.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime(); // Use getTime() to compare numeric values
    });

    // Check for today's data
    const latestNetSales = data.NetSales.data[today] || 0; // Default to 0 if no data for today
    const latestExpenses = data.Expenses.data[today] || 0; // Default to 0 if no data for today

    // Prepare the label for today's report
    const label = `${today} - Today's Report`;

    return {
      labels: [label], // Use the formatted label
      datasets: [
        {
          backgroundColor: data.NetSales.color || "#60A66F", // Fallback color if not found
          borderColor: data.NetSales.color || "#60A66F", // Fallback color if not found
          data: [latestNetSales], // Use 0 if no data
          label: data.NetSales.labels || "Net Sales", // Use the fetched label for Net Sales
        },
        {
          backgroundColor: data.Expenses.color || "#F0565F", // Fallback color if not found
          borderColor: data.Expenses.color || "#F0565F", // Fallback color if not found
          data: [latestExpenses], // Use 0 if no data
          label: data.Expenses.labels || "Expenses", // Use the fetched label for Expenses
        },
      ],
    };
  };

  const getWeeklyData = (salesData: SalesData): WeeklyChartData => {
    const today = new Date();
    const datesOfWeek = [];
    const weeklySales = [];
    const weeklyExpenses = [];

    const sales = salesData.NetSales.data;
    const expenses = salesData.Expenses.data;

    const todayFormatted = today.toLocaleDateString();
    datesOfWeek.push(todayFormatted);
    weeklySales.push(sales[todayFormatted] || 0);
    weeklyExpenses.push(expenses[todayFormatted] || 0);

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 1; i <= 6; i++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() - i);
      const formattedDate = currentDay.toLocaleDateString();
      datesOfWeek.unshift(formattedDate);
      weeklySales.unshift(sales[formattedDate] || 0);
      weeklyExpenses.unshift(expenses[formattedDate] || 0);
    }

    const dayLabels = datesOfWeek.map((date) => {
      const dayIndex = new Date(date).getDay();
      const dayName = dayNames[dayIndex];
      return `${dayName}\n(${date})`;
    });

    const dayOfWeek = today.getDay();

    // Set additionalLabel based on the week context
    let additionalLabel = "";
    if (dayOfWeek === 0) {
      additionalLabel = "It’s Sunday! Start your week strong!";
    } else if (dayOfWeek === 6) {
      additionalLabel = "It’s Saturday! Wrap up your week!";
    }

    return {
      labels: dayLabels,
      datasets: [
        {
          label: "Net Sales",
          backgroundColor: "#60A66F",
          borderColor: "#60A66F",
          data: [...weeklySales],
        },
        {
          label: "Expenses",
          backgroundColor: "#F0565F",
          borderColor: "#F0565F",
          data: [...weeklyExpenses],
        },
      ],
      additionalLabel, // Include additionalLabel in the returned object
    };
  };

  const getYearlyData = (salesData: SalesData): YearlyChartData => {
    const monthlySales = new Array(12).fill(0); // Array to hold sales totals for each month
    const monthlyExpenses = new Array(12).fill(0); // Array to hold expenses totals for each month
    let totalSales = 0; // Initialize total sales
    let totalExpenses = 0; // Initialize total expenses

    // Loop through Net Sales data and aggregate by month
    for (const [dateString, sales] of Object.entries(salesData.NetSales.data)) {
      const date = new Date(dateString);
      const month = date.getMonth(); // Get month (0-11)

      if (!isNaN(month)) {
        monthlySales[month] += sales; // Sum sales for the month
        totalSales += sales; // Add to total sales
      }
    }

    // Loop through Expenses data and aggregate by month
    for (const [dateString, expenses] of Object.entries(
      salesData.Expenses.data
    )) {
      const date = new Date(dateString);
      const month = date.getMonth(); // Get month (0-11)

      if (!isNaN(month)) {
        monthlyExpenses[month] += expenses; // Sum expenses for the month
        totalExpenses += expenses; // Add to total expenses
      }
    }

    // Prepare the chart data
    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Net Sales",
          backgroundColor: "#60A66F",
          borderColor: "#60A66F",
          data: monthlySales,
        },
        {
          label: "Expenses",
          backgroundColor: "#F0565F",
          borderColor: "#F0565F",
          data: monthlyExpenses,
        },
      ],
      totalSales, // Include total sales
      totalExpenses, // Include total expenses
    };
  };

  const chartData =
    timeFrame === "today" && salesExpensesToday
      ? getLatestData(salesExpensesToday)
      : timeFrame === "week" && salesExpensesToday
      ? getWeeklyData(salesExpensesToday)
      : timeFrame === "year" && salesExpensesToday
      ? getYearlyData(salesExpensesToday) // Ensure this function is being used for yearly data
      : salesExpensesYear;

  // Type assertion to ensure the data conforms to the expected type
  const yearlyChartData = chartData as YearlyChartData;
  const weeklyChartData = chartData as WeeklyChartData;

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
              <title>Print Chart</title>
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
                <h3>${
                  timeFrame === "today"
                    ? "Today's Sales and Expenses"
                    : timeFrame === "week"
                    ? "Weekly Sales and Expenses"
                    : "Yearly Sales and Expenses"
                }</h3>
  
                ${
                  timeFrame === "today"
                    ? `<p>Sales: PHP ${chartData?.datasets[0]?.data[0]
                        .toFixed(2)
                        .replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )} | Expenses: PHP ${chartData?.datasets[1]?.data[0]
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>`
                    : timeFrame === "week"
                    ? `<p>Total Weekly Sales: PHP ${weeklyChartData.datasets[0].data
                        .reduce((a, b) => a + b, 0)
                        .toFixed(2)
                        .replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )} | Total Weekly Expenses: PHP ${weeklyChartData.datasets[1].data
                        .reduce((a, b) => a + b, 0)
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>`
                    : timeFrame === "year"
                    ? `<p>Total Sales: PHP ${yearlyChartData.totalSales
                        .toFixed(2)
                        .replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )} | Total Expenses: PHP ${yearlyChartData.totalExpenses
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>`
                    : ""
                }
                ${
                  timeFrame === "week" && weeklyChartData.additionalLabel
                    ? `<p>${weeklyChartData.additionalLabel}</p>`
                    : ""
                }
              </div>
  
              <img src="${chartImage}" alt="Sales and Expenses Chart" />
              <hr />
              <table>
                <thead>
                  <tr>
                    <th>${
                      timeFrame === "today"
                        ? "Day"
                        : timeFrame === "week"
                        ? "Day"
                        : "Month"
                    }</th>
                    <th>Sales (PHP)</th>
                    <th>Expenses (PHP)</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    timeFrame === "today"
                      ? `<tr>
                          <td>Today</td>
                          <td>${chartData?.datasets[0]?.data[0]
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                          <td>${chartData?.datasets[1]?.data[0]
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                        </tr>`
                      : timeFrame === "week"
                      ? weeklyChartData.datasets[0].data
                          .map(
                            (sales, index) => `
                          <tr>
                            <td>Day ${index + 1}</td>
                            <td>${sales
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>${weeklyChartData.datasets[1].data[index]
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                          </tr>
                        `
                          )
                          .join("")
                      : yearlyChartData.labels
                          .map(
                            (month, index) => `
                          <tr>
                            <td>${month}</td>
                            <td>${yearlyChartData.datasets[0].data[index]
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>${yearlyChartData.datasets[1].data[index]
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                          </tr>
                        `
                          )
                          .join("")
                  }
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

  const chartInstance = chartRef.current;

  return (
    <>
      {chartData && (
        <>
          {timeFrame === "today" && salesExpensesToday && (
            <div className="flex flex-col items-center">
              {/* Print button for today */}
              <button
                onClick={handlePrint}
                className="font-bold h-10 bg-[#7C2D12] max-w-[180px] w-full text-white duration-200
          rounded-md shadow-md text-sm sm:text-base sm:max-w-[200px] hover:scale-[1.02] py-2 px-4"
              >
                Print Chart Data
              </button>
            </div>
          )}

          {timeFrame === "year" && (
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <span className="text-[#60A66F] font-bold">
                  Total Net Sales:
                </span>
                <span className="ml-2">
                  PHP{" "}
                  {yearlyChartData.totalSales
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
                <span className="mx-2">|</span>
                <span className="text-[#F0565F] font-bold">
                  Total Expenses:
                </span>
                <span className="ml-2">
                  PHP{" "}
                  {yearlyChartData.totalExpenses
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>

              {/* Print button for year */}
              <button
                onClick={handlePrint}
                className="font-bold h-10 bg-[#7C2D12] max-w-[180px] w-full text-white duration-200
          rounded-md shadow-md text-sm sm:text-base sm:max-w-[200px] hover:scale-[1.02] py-2 px-4"
              >
                Print Chart Data
              </button>
            </div>
          )}

          {timeFrame === "week" && (
            <div className="flex flex-col items-center">
              {weeklyChartData.additionalLabel && (
                <div className="text-center font-bold mb-2">
                  {weeklyChartData.additionalLabel}
                </div>
              )}
              <div className="flex items-center mb-4">
                <span className="text-[#60A66F] font-bold">Weekly Sales:</span>
                <span className="ml-2">
                  PHP{" "}
                  {weeklyChartData.datasets[0].data
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
                <span className="mx-2">|</span>
                <span className="text-[#F0565F] font-bold">
                  Weekly Expenses:
                </span>
                <span className="ml-2">
                  PHP{" "}
                  {weeklyChartData.datasets[1].data
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>

              {/* Print button for week */}
              <button
                onClick={handlePrint}
                className="font-bold h-10 bg-[#7C2D12] max-w-[180px] w-full text-white duration-200
          rounded-md shadow-md text-sm sm:text-base sm:max-w-[200px] hover:scale-[1.02] py-2 px-4"
              >
                Print Chart Data
              </button>
            </div>
          )}

          <Bar ref={chartRef} options={options} data={chartData} />
        </>
      )}
    </>
  );
};

export default NetSalesExpensesGraph;