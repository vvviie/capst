import Image from "next/image";
import Link from "next/link";
import React from "react";

const category = [
<<<<<<< HEAD
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
  {
    id: 3,
    title: "Footer Section",
    desc: "Update the footer section of your website.",
    img: "/coffee.png",
    src: "footer",
  },
=======
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
    {
        id: 3,
        title: "Footer Section",
        desc: "Update the footer section of your website.",
        img: "/coffee.png",
        src: "footer",
    },
>>>>>>> 8ff37b8651210cf028a425e13b307c96087ce439
];

const AdminHomeMaintenancePage = () => {
  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
<<<<<<< HEAD
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1400px] space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
          Home Page Maintenance
        </h1>
        {/* CATEGORY CONTAINER */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.map((cat) => (
            <Link
              href={`/fkstllhomemaintenance/${cat.src}`}
              className="border-2 border-gray-100 shadow-md rounded-md bg-white px-4 relative aspect-square
            overflow-clip flex flex-col justify-end"
              key={cat.id}
            >
              {/* IMAGE CONTAINER */}
              <div className="absolute top-0 left-0 w-full h-2/3">
                <Image
                  src={cat.img}
                  alt={cat.img}
                  fill
                  className="object-cover"
                />
              </div>
              {/* TITLE AND DESC */}
              <div className="h-1/3 py-4 text-center flex flex-col justify-center md:gap-0 lg:gap-1">
                <h1 className="text-lg lg:text-xl font-bold text-orange-950">
                  {cat.title}
                </h1>
                <p className="text-xs text-gray-500 lg:text-sm">{cat.desc}</p>
              </div>
            </Link>
          ))}
=======
        >
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[1400px] space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
                    Home Page Maintenance
                </h1>
                {/* CATEGORY CONTAINER */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.map((cat) => (
                        <Link
                            href={`/fkstllhomemaintenance/${cat.src}`}
                            className="border-2 border-gray-100 shadow-md rounded-md bg-white px-4 relative aspect-square
            overflow-clip flex flex-col justify-end"
                            key={cat.id}
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="absolute top-0 left-0 w-full h-2/3">
                                <Image
                                    src={cat.img}
                                    alt={cat.img}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* TITLE AND DESC */}
                            <div className="h-1/3 py-4 text-center flex flex-col justify-center md:gap-0 lg:gap-1">
                                <h1 className="text-lg lg:text-xl font-bold text-orange-950">
                                    {cat.title}
                                </h1>
                                <p className="text-xs text-gray-500 lg:text-sm">{cat.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
>>>>>>> 8ff37b8651210cf028a425e13b307c96087ce439
        </div>
      </div>
    </div>
  );
};

export default AdminHomeMaintenancePage;
