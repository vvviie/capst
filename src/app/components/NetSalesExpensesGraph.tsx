"use client";

import React, { useEffect, useState } from "react";
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
import { doc, getDoc } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const NetSalesExpensesGraph = ({ timeFrame }) => {
  const [salesExpensesToday, setSalesExpensesToday] = useState(null);
  const options = {};

  useEffect(() => {
    const fetchSalesExpensesToday = async () => {
      try {
        const docRef = doc(db, "salesData", "salesExpensesToday");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(data); // Log the fetched data to the console
          setSalesExpensesToday(data);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    fetchSalesExpensesToday();
  }, []);

  const getLatestData = (data) => {
    if (!data) return null;

    const today = new Date().toLocaleDateString(); // Format today's date
    const dates = Object.keys(data.NetSales.data);

    // Sort dates in descending order
    dates.sort((a, b) => new Date(b) - new Date(a));

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
  const getWeeklyData = (salesData) => {
    const today = new Date();
    const datesOfWeek = []; // To store the corresponding dates
    const weeklySales = []; // Create array for sales data
    const weeklyExpenses = []; // Create array for expenses data

    // Fetch sales and expenses data from the existing document
    const sales = salesData.NetSales.data;
    const expenses = salesData.Expenses.data;

    // Add today's data first
    const todayFormatted = today.toLocaleDateString();
    datesOfWeek.push(todayFormatted); // Add today's date
    weeklySales.push(sales[todayFormatted] || 0); // Push today's sales data or 0 if no data
    weeklyExpenses.push(expenses[todayFormatted] || 0); // Push today's expenses data or 0 if no data

    // Array of day names
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Loop to get the last 3 days excluding today
    for (let i = 1; i <= 6; i++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() - i); // Move back one day for each iteration

      const formattedDate = currentDay.toLocaleDateString(); // Format date for comparison
      datesOfWeek.unshift(formattedDate); // Add the date at the beginning for ascending order
      weeklySales.unshift(sales[formattedDate] || 0); // Push sales data or 0 if no data at the beginning
      weeklyExpenses.unshift(expenses[formattedDate] || 0); // Push expenses data or 0 if no data at the beginning
    }

    // Get the day names for the labels with the corresponding date
    const dayLabels = datesOfWeek.map((date) => {
      const dayIndex = new Date(date).getDay(); // Get day index (0-6)
      const dayName = dayNames[dayIndex]; // Map to day names
      return `${dayName}\n(${date})`; // Format as "Day\n(MM/DD/YYYY)"
    });

    // Determine if today is Monday or Thursday
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday


    return {
      labels: dayLabels, // Use the formatted day names and dates as labels
      datasets: [
        {
          label: "Net Sales",
          backgroundColor: "#60A66F",
          borderColor: "#60A66F",
          data: [...weeklySales], // Keep the sales data in the same order
        },
        {
          label: "Expenses",
          backgroundColor: "#F0565F",
          borderColor: "#F0565F",
          data: [...weeklyExpenses], // Keep the expenses data in the same order
        },
      ],
    };
  };

  const getYearlyData = (salesData) => {
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
      ? getWeeklyData(salesExpensesToday) // Use the new function to get weekly data
      : timeFrame === "year" && salesExpensesToday
      ? getYearlyData(salesExpensesToday)
      : salesExpensesYear;

  return (
    <>
      {chartData && (
        <>
          {timeFrame === "year" && (
            <div className="flex items-center">
              <span className="text-[#60A66F] font-bold">Total Net Sales:</span>
              <span className="ml-2">
                PHP {chartData.totalSales.toLocaleString()}
              </span>
              <span className="mx-2">|</span>
              <span className="text-[#F0565F] font-bold">Total Expenses:</span>
              <span className="ml-2">
                PHP {chartData.totalExpenses.toLocaleString()}
              </span>
            </div>
          )}

          {timeFrame === "week" && (
            <>
              {chartData.additionalLabel && (
                <div className="text-center font-bold mb-2">
                  {chartData.additionalLabel}
                </div>
              )}
              {/* No total sales or expenses displayed for week */}
            </>
          )}

          <Bar options={options} data={chartData} />
        </>
      )}
    </>
  );
};

export default NetSalesExpensesGraph;
