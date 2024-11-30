import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fikastalle by Fika Kafe - Order Online in Silang, Cavite",
  description:
    "Fikastalle by Fika Kafe is a cozy restaurant located in Silang, Cavite, offering a delightful selection of meals, pastries, and beverages. Explore our menu and conveniently place your orders online through our website for pickup or dine in.",
  keywords:
    "Fikastalle, Fika Kafe, Silang restaurant, Tagaytay restaurant, Swedish fika, order online, pastries, coffee, meals in Cavite, Fikastalle online orders, Fikastalle menu, restaurants in Silang, Cavite cafes, food delivery Cavite, restaurants in Tagaytay, restaurants in Cavite,",
};

const safeContent = (content: any): string => {
  if (Array.isArray(content)) {
    return content.join(", "); // Join array elements into a single string if content is an array
  }
  return content || ''; // Default to an empty string if content is null or undefined
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.ico" />
        <meta name="description" content={safeContent(metadata.description)} />
        <meta name="keywords" content={safeContent(metadata.keywords)} />
        <meta name="author" content="Fikastalle by Fika Kafe" />
        <meta property="og:title" content={safeContent(metadata.title)} />
        <meta property="og:description" content={safeContent(metadata.description)} />
        <meta property="og:image" content="/path-to-image.jpg" />
        <meta property="og:url" content="" />
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
