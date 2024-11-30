import { LandingSec } from "./components/LandingSec";
import FeaturedItems from "./components/FeaturedItems";
import AboutUs from "./components/AboutUs";
import NewsSubscription from "./components/NewsSubscription";
import { fetchFeaturedItems, fetchFooterData } from './lib/firebaseUtil.js'; // Adjust the import based on your file structure


export default async function Home() {
  try {
    const featuredItems = await fetchFeaturedItems(); // Fetch your featured items
    const footerData = await fetchFooterData(); // Fetch footer data

    return (
      <main>
        <LandingSec />
        <FeaturedItems items={featuredItems} />
        <AboutUs data={footerData} />
        <NewsSubscription />
      </main>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <main>
        <LandingSec />
        <FeaturedItems items={[]} />
        <AboutUs data={{ aboutUs: "", location: "", operatingDays: "", openHours: "", accessibility: "", img: [] }} />
        <NewsSubscription />
      </main>
    );
  }
}