import React from "react";
import Link from "next/link";
import { menuGroup } from "../data";
import Image from "next/image";

const MenuPage = () => {
  return (
    <div
      className="relative h-auto mt-14 flex flex-col items-center bg-orange-50 gap-4 py-4
    overflow-hidden justify-center md:py-10
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-contain lg:bg-no-repeat lg:bg-center"
    >
      <h1 className="font-bold text-orange-950 text-3xl">Fikaställe's Menu</h1>
      <div
        className="flex flex-col justify-center items-center gap-4 px-10 md:px-24
      md:grid md:grid-cols-2 lg:grid-cols-3 xl:px-56 2xl:grid-cols-4"
      >
        {menuGroup.map((category) => (
          <Link
            href={`/menu/${category.slug}`}
            key={category.id}
            className="h-auto w-full rounded-xl overflow-hidden bg-white flex flex-col gap-2 justify-center items-center
            pb-6 shadow-xl hover:bg-gray-50 md:min-h-[550px] xl:max-w-[330px]"
          >
            <div className="relative w-full aspect-square">
              <Image
                src={category.img}
                alt={category.title}
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-center text-xl font-bold text-orange-900">
              {category.title}
            </h1>
            <span className="px-10 text-justify">{category.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
