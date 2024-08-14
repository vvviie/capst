import React from "react";
import Link from "next/link";
import Image from "next/image";
import BurgerMenu from "./BurgerMenu";

// TEMPORARY LANG KASI WALA PANG WORKING LOGIN
const user = false;

const Navbar = () => {
  return (
    <div
      className="fixed top-0 left-0 w-full text-white flex px-10 py-4 h-14 justify-between md:px-24 md:py-4 xl:px-56 z-10"
      style={{ backgroundColor: "#30261F" }}
    >
      {/* LOGO HERE */}
      <div className="font-bold text-xl hover:text-yellow-100">
        <Link href="/">fikaställe</Link>
      </div>
      {/* BURGER MENU */}
      <div className="md:hidden hover:text-yellow-100">
        <BurgerMenu />
      </div>
      {/* NAV LINK PAGES  */}
      <div className=" hidden md:flex font-semibold">
        <div className="px-4 hover:text-yellow-100">
          <Link href="/">Home</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/menu">Menu</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/">Book</Link>
        </div>
        <div className="px-4 hover:text-yellow-100">
          <Link href="/">Orders</Link>
        </div>
      </div>

      {/* NAV LINK PERSONAL */}
      {/* Kapag nag-log in ang user, magiging Username, at Logout ang nakalagay.
      If hindi naman, Login ang nakalagay. */}

      {user ? (
        <div className="hidden md:flex md:justify-between font-semibold">
          <div>
            <Link href="/">
              <Image
                src="/shoppingcart.png"
                alt=""
                width={20}
                height={20}
                className=" mt-1"
              />
            </Link>
          </div>
          <div>
            <Link href="/">Username</Link>
          </div>
          <div>
            <Link href="/">Logout</Link>
          </div>
        </div>
      ) : (
        <div className="hidden md:block font-semibold">
          <Link href="/login">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
