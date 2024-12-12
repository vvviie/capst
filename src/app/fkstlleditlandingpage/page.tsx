"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


const AdminHomeMaintenancePage = () => {
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    // Get all cookies
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    
    // Check if a cookie named 'user' exists
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));
  
    // Allow access only if the cookie is not 'user' and some other cookie exists
    if (!userCookie && cookies.length === 0) {
      // Redirect to '/' if no cookies exist or if 'user' cookie exists
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
