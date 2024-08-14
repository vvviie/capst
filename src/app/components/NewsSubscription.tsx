import React from "react";
import Image from "next/image";

const NewsSubscription = () => {
  return (
    <div className="bg-orange-50 relative flex flex-col h-[calc(100vh-56px)] lg:flex-row lg:px-24 xl:px-56 xl:gap-10">
      {/* FORM CONTAINER */}
      <form
        action=""
        className="flex-1 px-10 flex flex-col gap-4 justify-center items-center md:px-20 lg:px-0 xl:w-[600px] xl:flex-none"
      >
        <h1 className="text-3xl text-orange-950 font-bold text-center md:text-5xl">
          Subscribe to our Newsletter for promos and updates!
        </h1>
        <p className="text-xm text-center md:text-xl">
          Enter your email to receive updates.
        </p>
        <input
          type="email"
          name=""
          id=""
          placeholder="ex. juandelacruz@gmail.com"
          className=" border-orange-900 border-solid border-2 rounded-md pl-4 w-full h-10 bg-white"
        />
        <button className="bg-orange-950 w-full text-white text-xl font-bold py-2 rounded-md">
          Subscribe
        </button>
      </form>
      {/* IMAGE CONTAINER */}
      <div className="relative flex-1">
        <Image src="/mail.png" alt="envelope" fill className="object-contain" />
      </div>
    </div>
  );
};

export default NewsSubscription;
