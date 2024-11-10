import React from "react";
import Image from "next/image";
import Link from "next/link";

const NewsSubscription = () => {
  return (
    <div className="bg-orange-50 relative flex flex-col lg:min-h-[69vh] lg:flex-row lg:px-24 xl:px-56 xl:gap-10">
      {/* FORM CONTAINER */}
      <div className="flex-1 px-10 flex flex-col py-16 gap-8 justify-center items-center md:px-20 lg:px-0 xl:max-w-[600px] xl:flex-none">
        <h1 className="text-4xl text-orange-950 font-bold text-center md:text-5xl">
          Sign-up now to receive notifications for promos and updates!
        </h1>
        <Link
          href={`signup`}
          className="bg-orange-950 w-3/5 md:w-4/5 text-white text-xl font-bold h-10 pt-1 rounded-md
                  hover:bg-orange-900 duration-300 hover:scale-[1.02] text-center"
        >
          Sign up!
        </Link>
      </div>
      {/* IMAGE CONTAINER */}
      <div className="relative flex-1 aspect-square">
        <Image src="/mail.png" alt="envelope" fill className="object-contain" />
      </div>
    </div>
  );
};

export default NewsSubscription;