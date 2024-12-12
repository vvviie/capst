"use client";
import CheckoutPopup from "@/app/components/CheckoutPopup";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase"; // Adjust the import based on your file structure
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { useRouter } from "next/navigation";

interface Social {
    name: string;
    url: string;
    icon: string;
    active: boolean;
}

const FooterMaintenancePage = () => {
    const [open, setOpen] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const router = useRouter(); // Initialize useRouter
    // State to hold telephone and social media URLs
    const [tel, setTel] = useState("");
    const [socials, setSocials] = useState<Social[]>([]);

    useEffect(() => {
        // Check if the cookie 'user' exists
        const userCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='));
    
        if (userCookie || !userCookie) {
          // Redirect to '/' if the cookie 'user' exists or doesn't exist
        router.push('/');
        }
    }, [router]);

    // Fetch existing footer data from Firestore on component mount
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

    const handleSubmit = async () => {
        try {
            const footerData = {
                tel: tel,
                socials: socials,
            };

            // Send data to Firestore
            await setDoc(doc(db, "webContent", "footerSection"), footerData); // Adjust the path as necessary

            // Log the updated data
            console.log("Document written with ID: ", footerData);

            // Show popup message
            setIsPopupVisible(true);
            setTimeout(() => {
                setIsPopupVisible(false);
            }, 750);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <div
            className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-center
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
        >
            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[500px]">
                {/* HEADER CONTAINER */}
                <div className="flex justify-start items-center gap-2">
                    {/* LINK BACK TO MAINTE */}
                    <Link
                        href={"/fkstllhomemaintenance"}
                        className="flex items-center space-x-2 font-bold text-orange-950 text-xl sm:text-2xl text-left hover:text-orange-800 cursor-pointer"
                    >
                        <i className="fa fa-angle-left" aria-hidden="true"></i>
                        <span>Maintenance</span>
                    </Link>
                </div>
                <div className="w-full flex gap-2 sm:gap-4 items-center mb-4 mt-2">
                    <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                    <span className="text-xl sm:text-2xl text-center font-bold text-orange-900">
                        Footer Section
                    </span>
                    <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
                </div>
                {/* FORM CONTAINER */}
                <div
                    className="bg-white border-2 border-gray-100 rounded-md shadow-md px-4 pt-2 pb-6
                    flex flex-col gap-2"
                >
                    {!open ? (
                        // INITIAL DISPLAY
                        <div className="w-full flex flex-col gap-2 items-center">
                            <h1 className="w-full text-start text-xl font-bold text-orange-950">
                                Footer Information
                            </h1>
                            {/* DETAIL CONTAINER */}
                            <div className="w-full flex flex-col gap-2 items-start md:px-2">
                                {/* TELEPHONE */}
                                <div className="flex flex-col gap-0.5 w-full">
                                    <div className="mt-2 w-full flex gap-2 items-center">
                                        <i className={`fa fa-phone text-sm text-gray-500`}></i>
                                        <h1 className="text-sm text-gray-500">Telephone</h1>
                                    </div>
                                    <p
                                        className="font-semibold text-gray-900 mb-2"
                                        style={{ overflowWrap: "anywhere" }}
                                    >
                                        {tel}
                                    </p>
                                </div>
                                {/* SOCIALS */}
                                {socials.map((soc, index) => (
                                    <div className="flex flex-col gap-0.5 w-full" key={soc.name}>
                                        <hr />
                                        <div className="mt-2 w-full flex gap-2 items-center">
                                            <i className={`${soc.icon} text-sm text-gray-500`}></i>
                                            <h1 className="text-sm text-gray-500">{soc.name}</h1>
                                        </div>
                                        <p
                                            className="font-semibold text-gray-900 mb-2"
                                            style={{ overflowWrap: "anywhere" }}
                                        >
                                            {soc.url}
                                        </p>
                                        <select
                                            name="active"
                                            id="selectActive"
                                            className="border-2 border-gray-100 rounded-md shadow-md text-center w-1/2 mb-4 h-10 font-bold bg-white text-gray-500"
                                            value={soc.active ? "true" : "false"} // Reflect current active status
                                            onChange={async (e) => {
                                                const updatedSocials = [...socials];
                                                updatedSocials[index].active =
                                                    e.target.value === "true"; // Update active status

                                                // Update state
                                                setSocials(updatedSocials);

                                                // Optionally, update Firestore directly
                                                const footerData = {
                                                    tel: tel,
                                                    socials: updatedSocials.map((soc) => ({
                                                        name: soc.name,
                                                        url: soc.url,
                                                        icon: soc.icon, // Include icon class
                                                        active: soc.active, // Include active status
                                                    })),
                                                };

                                                try {
                                                    await setDoc(
                                                        doc(db, "webContent", "footerSection"),
                                                        footerData
                                                    ); // Update Firestore
                                                    console.log("Document successfully updated!");
                                                } catch (error) {
                                                    console.error("Error updating document: ", error);
                                                }
                                            }}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                ))}
                                <button
                                    className="w-full bg-orange-950 font-bold text-white h-10 rounded-md shadow-md
                                    hover:bg-orange-900 hover:scale-[1.02] duration-200"
                                    onClick={() => setOpen(true)}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ) : (
                        // EDIT FOOTER
                        <div className="w-full flex flex-col gap-2 items-center">
                            <h1 className="w-full text-start text-xl mb-2 font-bold text-orange-950">
                                Update Footer
                            </h1>
                            <div className="w-full flex flex-col gap-2 items-start md:px-2">
                                {/* TELEPHONE */}
                                <div className="flex flex-col gap-2 w-full mb-4">
                                    <label
                                        className="text-orange-950 text-sm w-full text-left space-x-1"
                                        htmlFor={`inputTel`}
                                    >
                                        <i className={`fa fa-phone`}></i>
                                        <span className="">Telephone</span>
                                    </label>
                                    <input
                                        className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                                        name={`inputTel`}
                                        id={`inputTel`}
                                        type="text"
                                        placeholder={`Telephone No.`}
                                        value={tel}
                                        onChange={(e) => setTel(e.target.value)}
                                        required
                                    />
                                </div>
                                {socials.map((soc, index) => (
                                    <div
                                        key={soc.name}
                                        className="w-full flex flex-col gap-2 items-start justify-center"
                                    >
                                        <hr />
                                        <label
                                            className="text-orange-950 text-sm w-full text-left space-x-1"
                                            htmlFor={`input${soc.name}`}
                                        >
                                            <i className={soc.icon}></i>
                                            <span>{soc.name}</span>
                                        </label>
                                        <input
                                            className="border-2 border-solid border-orange-900 w-full h-10 pl-2 rounded-md bg-orange-50"
                                            name={`input${soc.name}`}
                                            id={`input${soc.name}`}
                                            type="text"
                                            placeholder={`${soc.name} URL`}
                                            value={soc.url}
                                            onChange={(e) => {
                                                const updatedSocials = [...socials];
                                                updatedSocials[index].url = e.target.value;
                                                setSocials(updatedSocials);
                                            }}
                                            required
                                        />
                                        <input
                                            className="border-2 border-solid border-gray-300 w-full h-10 pl-2 rounded-md bg-white"
                                            type="text"
                                            placeholder="Icon class (e.g., fa-facebook-f)"
                                            value={soc.icon}
                                            onChange={(e) => {
                                                const updatedSocials = [...socials];
                                                updatedSocials[index].icon = e.target.value; // Update icon class
                                                setSocials(updatedSocials);
                                            }}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* BUTTONS CONTAINER */}
                            <div className="w-full flex gap-2 mt-4">
                                <button
                                    className="w-2/3 bg-orange-950 font-bold text-white h-10 rounded-md shadow-md
                hover:bg-orange-900 hover:scale-[1.02] duration-200"
                                    onClick={() => {
                                        handleSubmit();
                                        setTimeout(() => {
                                            setOpen(false);
                                        }, 900);
                                    }}
                                >
                                    Update
                                </button>
                                <button
                                    className="w-1/3 bg-white font-bold text-gray-500 h-10 rounded-md shadow-md
                border-2 border-gray-100 hover:bg-gray-50 hover:scale-[1.02] duration-200"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* PRODUCT CREATED POP UP */}
            {isPopupVisible && <CheckoutPopup message={`Footer Updated!`} />}
        </div>
    );
};

export default FooterMaintenancePage;