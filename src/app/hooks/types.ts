// types.ts
export type ChosenItem = {
  id: string;
  title: string;
  items: string[];
};

export interface FeaturedItem {
  id: string;
  name: string; // Replace with actual fields from the featuredItems collection
  price: number; // Example field, replace with actual fields
  imgUrl: string; // Example field, replace with actual fields
  // Add other fields as needed based on your Firestore document structure
}

export interface FooterData {
  aboutUs: string;
  location: string;
  operatingDays: string;
  openHours: string;
  accessibility: string;
  img: string[]; // Array of image URLs
}

export interface Item {
  id: string;          // Add id property
  title: string;
  desc: string;
  img: string;
  fromDB: string;
  price: number;       // Add price property (if needed)
}

export interface FeaturedItem extends Item {
  id: string;
  name: string;  // You can rename or add additional fields specific to featured items
  price: number;
  imgUrl: string;
  // Add any other properties specific to featured items
}