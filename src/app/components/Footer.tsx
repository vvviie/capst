"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
  import { db } from "@/app/firebase"; // Adjust the import based on your file structure
  import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

  const Footer = () => {
    const [tel, setTel] = useState("");
    const [socials, setSocials] = useState([]);

    // Fetch footer data from Firestore on component mount
    useEffect(() => {
      const fetchFooterData = async () => {
        const docRef = doc(db, "webContent", "footerSection"); // Adjust the path as necessary
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTel(data.tel);
          setSocials(data.socials);
        } else {
          console.log("No such document!");
          // Initialize with empty data if no document exists
          setTel("");
          setSocials([]);
        }
      };

      fetchFooterData();
    }, []);

  return (
    <div
      className="h-96 px-10 py-14 md:px-24 relative flex flex-col justify-between items-center
      lg:flex-row lg:h-60 xl:px-56 text-white"
      style={{ backgroundColor: "#30261F" }}
    >
      <div className="flex flex-row items-center justify-center gap-2">
        <div className="relative w-12 h-12">
          <Image src={"/circlelogo.png"} alt="" fill className="object-cover" />
        </div>
        <h1 className="  font-bold text-xl">fikaställe by fika kafé</h1>
      </div>

      {/* DIVIDER */}
      <div className="h-0.5 w-[50vw] bg-white lg:w-0.5 lg:h-20"></div>

      {/* CONTACT US */}
      <h1 className="  text-xl">CONTACT US</h1>

      {/* TELEPHONE NUMBER */}
      <div className="flex flex-col justify-center items-center gap-2">
        <span className=" ">Telephone No.</span>
        <h1 className="text-xl   font-bold">{tel}</h1>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="flex flex-col justify-center items-center gap-2">
        <span className=" ">Social Media</span>
        <div className="flex gap-1 items-center justify-center">
          {socials.map((soc) => (
            <div
              className={`relative ${
                soc.active ? "block" : "hidden"
              } w-8 h-8 hover:scale-[1.08] duration-200`}
              key={soc.name} // Add a unique key for each social media item
            >
              <Link href={soc.url} target="_blank">
                <i
                  className={`${soc.icon} ${
                    soc.name === "instagram"
                      ? "text-[26px]"
                      : soc.name === "email"
                      ? "text-[27px]"
                      : "text-2xl"
                  }  `}
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