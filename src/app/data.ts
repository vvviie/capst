export type Drinks = {
    id: string;
    title: string;
    desc?: string;
    type: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
};

export type Pastries = {
    id: string;
    title: string;
    desc?: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
    //options?: { title: string; additionalPrice: number }[];
  };

  export type Pasta = {
    id: string;
    title: string;
    desc?: string;
    type: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
    //options?: { title: string; additionalPrice: number }[];
  };

  export type Sandwiches = {
    id: string;
    title: string;
    desc?: string;
    type: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
    //options?: { title: string; additionalPrice: number }[];
  };

  export type MainCourse = {
    id: string;
    title: string;
    desc?: string;
    type: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
    //options?: { title: string; additionalPrice: number }[];
  };

  export type Snacks = {
    id: string;
    title: string;
    desc?: string;
    type: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
    //options?: { title: string; additionalPrice: number }[];
  };

type Menu = {
    id: number;
    title: string;
    slug: string;
    img: string;
    desc?: string;
    color: string;
};

type Menus = Menu[];

export const menuGroup:Menus = [
    {
        id: 1,
        title: "Drinks",
        slug: "drinks",
        img: "/menugroups/drink.webp",
        desc: "A delightful selection of hot, iced, affogato, and blended beverages, including both coffee and non-coffee options.",
        color: "white",
    },
    {
        id: 2,
        title: "Pastries",
        slug: "pastries",
        img: "/menugroups/pastry.webp",
        desc: "Freshly baked pastries, perfect for a sweet treat or a light snack.",
        color: "white",
    },
    {
        id: 3,
        title: "Pasta",
        slug: "pasta",
        img: "/menugroups/pasta.webp",
        desc: "Savory and comforting pasta dishes, crafted with rich sauces and quality ingredients.",
        color: "white",
    },
    {
        id: 4,
        title: "Sandwiches",
        slug: "sandwiches",
        img: "/menugroups/sandwich.webp",
        desc: "Hearty and flavorful sandwiches, made with fresh bread and premium fillings.",
        color: "white",
    },
    {
        id: 5,
        title: "Main Course",
        slug: "maincourse",
        img: "/menugroups/meal.webp",
        desc: "Satisfying meals that are perfect for lunch or dinner, offering a balanced and delicious dining experience.",
        color: "white",
    },
    {
        id: 6,
        title: "Snacks",
        slug: "snacks",
        img: "/menugroups/side.webp",
        desc: "Enjoy a variety of quick bites like crispy fries, loaded nachos, and other savory treats, perfect for satisfying your cravings.",
        color: "white",
    },
]