"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


const AdminHomeMaintenancePage = () => {
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    // Check if the cookie 'user' exists
    const userCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='));

    if (userCookie || !userCookie) {
      // Redirect to '/' if the cookie 'user' exists or doesn't exist
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
