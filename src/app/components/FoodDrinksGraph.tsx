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
import { doc, getDoc, onSnapshot, DocumentData } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FoodDrinkSalesGraphProps {
  timeFrame: string; // Assuming timeFrame is a string, change it if necessary
}

interface FoodDrinkSalesData {
  Foods: {
    data: Record<string, number>; // Date as key, sales as value
  };
  Drinks: {
    data: Record<string, number>; // Date as key, sales as value
  };
}

interface WeeklyData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    borderColor: string;
    data: number[];
  }[];
  additionalLabel?: string; // Optional field, only for week
}

interface YearlyData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    borderColor: string;
    data: number[];
  }[];
  totalFoodSales: number;
  totalDrinkSales: number;
}

type ChartData = WeeklyData | YearlyData | { labels: string[]; datasets: { label: string; backgroundColor: string; borderColor: string; data: number[] }[] } | null;

const FoodDrinkSalesGraph: React.FC<FoodDrinkSalesGraphProps> = ({ timeFrame }) => {
  const [foodDrinkSalesData, setFoodDrinkSalesData] = useState<DocumentData | null>(null);
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
          display: false,
          text: "Amount (PHP)", // Customize text
        },
      },
    },
  };


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

  const getLatestData = (data: FoodDrinkSalesData) => {
    if (!data) return null;

    const today = new Date().toLocaleDateString();
    const foodDates = Object.keys(data.Foods.data);
    const drinkDates = Object.keys(data.Drinks.data);

    // Sort dates in descending order
    foodDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    drinkDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

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

  const getWeeklyData = (data: FoodDrinkSalesData): WeeklyData => {
    const today = new Date();
    const datesOfWeek = [];
    const weeklyFoodSales = [];
    const weeklyDrinkSales = [];
  
    const foodSales = data.Foods.data;
    const drinkSales = data.Drinks.data;
  
    const todayFormatted = today.toLocaleDateString();
    datesOfWeek.push(todayFormatted);
    weeklyFoodSales.push(foodSales[todayFormatted] || 0);
    weeklyDrinkSales.push(drinkSales[todayFormatted] || 0);
  
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
    for (let i = 1; i <= 6; i++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() - i);
  
      const formattedDate = currentDay.toLocaleDateString();
      datesOfWeek.unshift(formattedDate);
      weeklyFoodSales.unshift(foodSales[formattedDate] || 0);
      weeklyDrinkSales.unshift(drinkSales[formattedDate] || 0);
    }
  
    const dayLabels = datesOfWeek.map((date) => {
      const dayIndex = new Date(date).getDay();
      const dayName = dayNames[dayIndex];
      return `${dayName}\n(${date})`;
    });
  
    const additionalLabel = `Weekly Report: ${dayLabels[0]} to ${dayLabels[6]}`;
  
    return {
      labels: dayLabels,
      datasets: [
        {
          label: "Food Sales",
          backgroundColor: "#60A66F",
          borderColor: "#60A66F",
          data: [...weeklyFoodSales],
        },
        {
          label: "Drink Sales",
          backgroundColor: "#F0565F",
          borderColor: "#F0565F",
          data: [...weeklyDrinkSales],
        },
      ],
      additionalLabel, // Add this property to the returned object
    };
  };

  const getYearlyData = (data: FoodDrinkSalesData) => {
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

  const chartData: ChartData =
  timeFrame === "today" && foodDrinkSalesData
    ? getLatestData(foodDrinkSalesData as FoodDrinkSalesData)
    : timeFrame === "week" && foodDrinkSalesData
    ? getWeeklyData(foodDrinkSalesData as FoodDrinkSalesData)
    : timeFrame === "year" && foodDrinkSalesData
    ? getYearlyData(foodDrinkSalesData as FoodDrinkSalesData)
    : null;

  return (
    <>
      {chartData && (
        <>
          {timeFrame === "year" && 'totalFoodSales' in chartData && 'totalDrinkSales' in chartData && (
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

          {timeFrame === "week" && chartData && 'additionalLabel' in chartData && chartData.additionalLabel && (
            <div className="text-center font-bold mb-2">
              {chartData.additionalLabel}
            </div>
          )}

          <Bar options={options} data={chartData} />
        </>
      )}
    </>
  );
};

export default FoodDrinkSalesGraph;