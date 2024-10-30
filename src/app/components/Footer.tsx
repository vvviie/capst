import React from "react";
import Image from "next/image";
import Link from "next/link";

const data = {
  title: "CONTACT US",
  tel: "(046)1234567",
};

const socials = [
  {
    name: "facebook",
    active: true,
    icon: "fa-brands fa-facebook-f",
    url: "https://www.facebook.com/fikastalle/",
  },
  {
    name: "messenger",
    active: true,
    icon: "fab fa-facebook-messenger",
    url: "https://www.facebook.com/fikastalle/",
  },
  {
    name: "instagram",
    active: true,
    icon: "fa-brands fa-instagram",
    url: "https://www.instagram.com/fikastalle.fikakafe/",
  },
  {
    name: "tiktok",
    active: true,
    icon: "fa-brands fa-tiktok",
    url: "https://www.tiktok.com/@fikastalle",
  },
  {
    name: "email",
    active: true,
    icon: "fa-solid fa-envelope",
    url: "mailto:emailaddressngfikastalle@gmail.com",
  },
];

const Footer = () => {
  return (
    <div
      className="h-96 px-10 py-14 md:px-24 relative flex flex-col justify-between items-center lg:flex-row lg:h-60 xl:px-56"
      style={{ backgroundColor: "#30261F" }}
    >
      <div className="flex flex-row items-center justify-center gap-2">
        <div className="relative w-12 h-12">
          <Image src={"/circlelogo.png"} alt="" fill className="object-cover" />
        </div>
        <h1 className="text-white font-bold text-xl">
          fikaställe by fika kafé
        </h1>
      </div>

      {/* DIVIDER */}
      <div className="h-0.5 w-[50vw] bg-white lg:w-0.5 lg:h-20"></div>

      {/* CONTACT US */}
      <h1 className="text-white text-xl">{data.title}</h1>

      {/* TELEPHONE NUMBER */}
      <div className="flex flex-col justify-center items-center gap-2">
        <span className="text-white">Telephone No.</span>
        <h1 className="text-xl text-white font-bold">{data.tel}</h1>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="flex flex-col justify-center items-center gap-2">
        <span className="text-white">Social Media</span>
        <div className="flex gap-1 items-center justify-center">
          {socials.map((soc) => (
            <div
              className={`relative ${
                soc.active ? "block" : "hidden"
              } w-8 h-8 hover:scale-[1.08] duration-200`}
            >
              <Link href={soc.url} target="_blank">
                <i
                  className={`${soc.icon} ${
                    soc.name === "instagram"
                      ? "text-[26px]"
                      : soc.name === "email"
                      ? "text-[27px]"
                      : "text-2xl"
                  } text-white`}
                ></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
