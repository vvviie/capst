import Image from "next/image";
import { LandingSec } from "./components/LandingSec";
import FeaturedItems from "./components/FeaturedItems";
import AboutUs from "./components/AboutUs";
import NewsSubscription from "./components/NewsSubscription";

export default function Home() {
  return (
    <main>
      <LandingSec />
      <FeaturedItems />
      <AboutUs />
      <NewsSubscription />
    </main>
  );
}
