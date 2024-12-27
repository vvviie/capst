"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


const AdminHomeMaintenancePage = () => {
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    // Get all cookies as an array
    const cookies = document.cookie ? document.cookie.split(';').map(cookie => cookie.trim()) : [];
  
    // Check if no cookies exist
    if (cookies.length === 0) {
      // Redirect if no cookies exist
      router.push('/');
      return;
    }
  
    // Check if the 'user' cookie exists
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));
  
    if (userCookie) {
      // Redirect if the 'user' cookie exists
      router.push('/');
    }
  }, [router]);
  
  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex justify-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      <div></div>
    </div>
  );
};

export default AdminHomeMaintenancePage;
