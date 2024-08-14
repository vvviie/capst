import React from "react";
import Image from "next/image";
import Link from "next/link";

const data = {
  title: "CONTACT US",
  tel: "(046)1234567",
  socials: {
    facebook: {
      img: "/fb.png",
      url: "https://www.facebook.com/fikastalle/",
    },
    messenger: {
      img: "/ms.png",
      url: "https://www.facebook.com/fikastalle/",
    },
    instagram: {
      img: "/ig.png",
      url: "https://www.instagram.com/fikastalle.fikakafe/",
    },
  },
};

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
        <div className="flex gap-4 items-center justify-center">
          {/* FACEBOOK */}
          <div className="relative w-8 h-8">
            <Link href={data.socials.facebook.url}>
              <Image src={data.socials.facebook.img} alt="" fill />
            </Link>
          </div>
          {/* MESSENGER */}
          <div className="relative w-8 h-8">
            <Link href={data.socials.messenger.url}>
              <Image src={data.socials.messenger.img} alt="" fill />
            </Link>
          </div>
          {/* INSTAGRAM */}
          <div className="relative w-8 h-8">
            <Link href={data.socials.instagram.url}>
              <Image src={data.socials.instagram.img} alt="" fill />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
