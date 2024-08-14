import React from "react";
import Image from "next/image";
import Link from "next/link";

const data = [
  {
    id: 1,
    title: "Food Item",
    desc: "hadoinfaosdnfosdanfdosahadoinfaosdnfosdanfdosahadoinfaosdnfosdanfdosahadoinfaosdnfosdanfdosa",
    img: "/cwfood.jpg",
  },
  {
    id: 2,
    title: "Food Item",
    desc: "hadoinfaosdnfosdanfdosa",
    img: "/cwfood.jpg",
  },
  {
    id: 3,
    title: "Food Item",
    desc: "hadoinfaosdnfosdanfdosa",
    img: "/cwfood.jpg",
  },
];

const FeaturedItems = () => {
  return (
    <div
      className="relative h-[calc(100vh-56px)] w-full flex flex-col items-center justify-between py-6 bg-orange-50 gap-2
 lg:justify-center lg:items-center lg:gap-0 xl:px-56 xl:gap-2 lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      <h1 className="text-3xl mb-0 md:text-4xl lg:text-5xl font-bold text-orange-950">
        Featured Items
      </h1>

      {/* ITEMS CONTAINER */}
      <div
        className="relative w-full flex flex-col items-center justify-between py-6 gap-2 lg:w-[90vw]
      lg:flex-row lg:justify-center lg:rounded-2xl lg:h-[50vh] md:px-10 xl:px-40 xl:gap-4"
      >
        {/* ITEMS */}
        {data.map((item) => (
          <div
            className="flex flex-col gap-1 relative w-[95vw] h-[26.5vh] bg-white justify-end items-center shadow-xl py-4 border-none rounded-lg overflow-hidden
        lg:h-[45vh] lg:w-[33%] 2xl:w-80"
          >
            {/* IMAGE CONTAINER */}
            <div className="absolute w-full h-2/3 top-0 lg:h-2/3">
              <Image src={item.img} alt="" fill className="object-cover" />
            </div>
            {/* TEXT AND BUTTON */}
            <div className="absolute h-1/3 flex flex-col gap-0 justify-around items-center bottom-0 lg:py-6 lg:justify-between lg:h-1/3 w-[95%]">
              {/* TEXT CONTAINER */}
              <div className="flex flex-col justify-center items-center gap-0 md:gap-2">
                <h1 className="font-bold text-xl m-0 text-orange-950 md:text-2xl">
                  {item.title}
                </h1>
              </div>
              <Link
                href="/"
                className="bg-amber-950 w-full mb-1 md:w-[90%] text-white py-1 px-3 text-lg lg:px-4 lg:py-2 rounded-lg hover:bg-amber-900
        lg:hover:scale-[1.02] duration-[0.3s] font-bold shadow-md text-center"
              >
                Order Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedItems;
