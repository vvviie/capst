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

const FoodDrinkSalesGraph = ({ timeFrame }) => {
  const [foodDrinkSalesData, setFoodDrinkSalesData] = useState(null);
  const options = {};

  useEffect(() => {
    const docRef = doc(db, "salesData", "foodDrinkSold");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched data:", data); // Log the fetched data
          setFoodDrinkSalesData(data);
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

  const getLatestData = (data) => {
    if (!data) return null;

    const today = new Date().toLocaleDateString();
    const foodDates = Object.keys(data.Foods.data);
    const drinkDates = Object.keys(data.Drinks.data);

    // Sort dates in descending order
    foodDates.sort((a, b) => new Date(b) - new Date(a));
    drinkDates.sort((a, b) => new Date(b) - new Date(a));

    // Check for today's data
    const latestFoodSales = data.Foods.data[today] || 0; // Default to 0 if no data for today
    const latestDrinkSales = data.Drinks.data[today] || 0; // Default to 0 if no data for today

    // Prepare the chart data
    return {
      labels: [`${today} - Today's Report`],
      datasets: [
        {
          backgroundColor: "#60A66F",
          borderColor: "#60A66F",
          data: [latestFoodSales],
          label: "Food Sales",
        },
        {
          backgroundColor: "#F0565F",
          borderColor: "#F0565F",
          data: [latestDrinkSales],
          label: "Drink Sales",
        },
      ],
    };
  };

  const getWeeklyData = (data) => {
    const today = new Date();
    const datesOfWeek = []; // To store the corresponding dates
    const weeklyFoodSales = []; // Create array for food sales data
    const weeklyDrinkSales = []; // Create array for drink sales data

    // Fetch food and drink sales data from the existing document
    const foodSales = data.Foods.data;
    const drinkSales = data.Drinks.data;

    // Add today's data first
    const todayFormatted = today.toLocaleDateString();
    datesOfWeek.push(todayFormatted); // Add today's date
    weeklyFoodSales.push(foodSales[todayFormatted] || 0); // Push today's food sales data or 0 if no data
    weeklyDrinkSales.push(drinkSales[todayFormatted] || 0); // Push today's drink sales data or 0 if no data

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

    // Loop to get the last 6 days excluding today
    for (let i = 1; i <= 6; i++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() - i); // Move back one day for each iteration

      const formattedDate = currentDay.toLocaleDateString(); // Format date for comparison
      datesOfWeek.unshift(formattedDate); // Add the date at the beginning for ascending order
      weeklyFoodSales.unshift(foodSales[formattedDate] || 0); // Push food sales data or 0 if no data at the beginning
      weeklyDrinkSales.unshift(drinkSales[formattedDate] || 0); // Push drink sales data or 0 if no data at the beginning
    }

    // Get the day names for the labels with the corresponding date
    const dayLabels = datesOfWeek.map((date) => {
      const dayIndex = new Date(date).getDay(); // Get day index (0-6)
      const dayName = dayNames[dayIndex]; // Map to day names
      return `${dayName}\n(${date})`; // Format as "Day\n(MM/DD/YYYY)"
    });

    return {
      labels: dayLabels, // Use the formatted day names and dates as labels
      datasets: [
        {
          label: "Food Sales",
          backgroundColor: "#60A66F",
          borderColor: "#60A66F",
          data: [...weeklyFoodSales], // Keep the food sales data in the same order
        },
        {
          label: "Drink Sales",
          backgroundColor: "#F0565F",
          borderColor: "#F0565F",
          data: [...weeklyDrinkSales], // Keep the drink sales data in the same order
        },
      ],
    };
  };

  const getYearlyData = (data) => {
    const monthlyFoodSales = new Array(12).fill(0); // Array to hold food sales totals for each month
    const monthlyDrinkSales = new Array(12).fill(0); // Array to hold drink sales totals for each month
    let totalFoodSales = 0; // Initialize total food sales
    let totalDrinkSales = 0; // Initialize total drink sales

    // Loop through food sales data and aggregate by month
    for (const [dateString, sales] of Object.entries(data.Foods.data)) {
      const date = new Date(dateString);
      const month = date.getMonth(); // Get month (0-11)

      if (!isNaN(month)) {
        monthlyFoodSales[month] += sales; // Sum sales for the month
        totalFoodSales += sales; // Add to total food sales
      }
    }

    // Loop through drink sales data and aggregate by month
    for (const [dateString, sales] of Object.entries(data.Drinks.data)) {
      const date = new Date(dateString);
      const month = date.getMonth(); // Get month (0-11)

      if (!isNaN(month)) {
        monthlyDrinkSales[month] += sales; // Sum sales for the month
        totalDrinkSales += sales; // Add to total drink sales
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
          label: "Food Sales",
          backgroundColor: "#60A66F",
          borderColor: "#60A66F",
          data: monthlyFoodSales,
        },
        {
          label: "Drink Sales",
          backgroundColor: "#F0565F",
          borderColor: "#F0565F",
          data: monthlyDrinkSales,
        },
      ],
      totalFoodSales, // Include total food sales
      totalDrinkSales, // Include total drink sales
    };
  };

  const chartData =
    timeFrame === "today" && foodDrinkSalesData
      ? getLatestData(foodDrinkSalesData)
      : timeFrame === "week" && foodDrinkSalesData
      ? getWeeklyData(foodDrinkSalesData)
      : timeFrame === "year" && foodDrinkSalesData
      ? getYearlyData(foodDrinkSalesData)
      : null;

  return (
    <>
      {chartData && (
        <>
          {timeFrame === "year" && (
            <div className="flex items-center">
              <span className="text-[#60A66F] font-bold">Total Food Sold:</span>
              <span className="ml-2">
                {chartData.totalFoodSales.toLocaleString()}
              </span>
              <span className="mx-2">|</span>
              <span className="text-[#F0565F] font-bold">
                Total Drink Sold:
              </span>
              <span className="ml-2">
                {chartData.totalDrinkSales.toLocaleString()}
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

export default FoodDrinkSalesGraph;