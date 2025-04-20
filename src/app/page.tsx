import { cookies } from "next/headers";
import { LandingSec } from "./components/LandingSec";
import FeaturedItems from "./components/FeaturedItems";
import AboutUs from "./components/AboutUs";
import NewsSubscription from "./components/NewsSubscription";
import { fetchFeaturedItems, fetchFooterData } from './lib/firebaseUtil';

export default async function Home() {
  const cookieStore = cookies();
  const hasUserCookie = cookieStore.has("user");

  try {
    const featuredItems = await fetchFeaturedItems();
    const footerData = await fetchFooterData();

    return (
      <main>
        <LandingSec />
        <FeaturedItems items={featuredItems} />
        <AboutUs data={footerData} />
        {hasUserCookie && <NewsSubscription />}
      </main>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <main>
        <LandingSec />
        <FeaturedItems items={[]} />
        <AboutUs data={{ aboutUs: "", location: "", operatingDays: "", openHours: "", accessibility: "", img: [] }} />
        {hasUserCookie && <NewsSubscription />}
      </main>
    );
  }
}
