import Image from "next/image";
import Link from "next/link";
import React from "react";

const category = [
  {
    id: 1,
    title: "Landing Section",
    desc: "Update the landing section of your website.",
    img: "/coffee.png",
    src: "landing",
  },
  {
    id: 2,
    title: "Information Section",
    desc: "Update the information about your café",
    img: "/cwfood.jpg",
    src: "information",
  },
];

const AdminHomeMaintenancePage = () => {
  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[900px] space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
          Home Page Maintenance
        </h1>
        {/* CATEGORY CONTAINER */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {category.map((cat) => (
            <Link
              href={`/fkstllhomemaintenance/${cat.src}`}
              className="border-2 border-gray-100 shadow-md rounded-md bg-white px-4 relative aspect-square
            overflow-clip mb-4 flex flex-col justify-end"
              key={cat.id}
            >
              {/* IMAGE CONTAINER */}
              <div className="absolute top-0 left-0 w-full h-4/5">
                <Image
                  src={cat.img}
                  alt={cat.img}
                  fill
                  className="object-cover"
                />
              </div>
              {/* TITLE AND DESC */}
              <div className="h-1/5 py-4 text-center flex flex-col gap-1 justify-center md:gap-0 lg:gap-1">
                <h1 className="text-xl md:text-lg lg:text-xl font-bold text-orange-950">
                  {cat.title}
                </h1>
                <p className="text-sm text-gray-500 md:text-xs lg:text-sm">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHomeMaintenancePage;
