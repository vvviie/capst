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

type Book = {
  id: number;
  title: string;
  desc: string;
  href: string;
  img?: string;
  slug: string;
}

type Booking = Book[];

export const Reserve:Booking = [
  {
    id: 1,
    title: "Table Reservation",
    desc: "Reserve a table for a specific amount of people, date, and time.",
    href: "",
    img: "/fikaplace/3.jpg",
    slug: "table",
  },
  {
    id: 2,
    title: "Exclusive Café",
    desc: "Reserve the entire establishment for an event you want to celebrate here.",
    href: "",
    img: "/fikaplace/1.jpg",
    slug: "event",
  },
  {
    id: 3,
    title: "Mobile Café Reservation",
    desc: "Coming soon.",
    href: "",
    img: "/fikaplace/6.jpg",
    slug: "mobilecafe",
  },
]

type bft = {
  title: string;
  items: string[];
}

type bfts = bft[];

export const Buffet:bfts = [
  {
    title: "Veggies",
    items: ["Chicken Mango Salad", "Ceasar Salad", "Mixed Veggies Salad", "Stirfried Mixed Veggies"],
  },
  {
    title: "Pasta",
    items: ["Shrimp Aglio Olio", "Spaghetti Bolognese", "Creamy Carbonara", "Creamy Pesto", "Sardines Red Pesto",
      "Creamy Aligue Pasta"
    ],
  },
  {
    title: "Mains",
    items: ["Chicken Saltimbocca", "Roasted Lemon Chicken", "Tuscan Chicken", "Fika Fried Chicken", "Orange Chicken",
      "Pork Salpicao", "Pork Hamonado", "Swedish Meatballs", "Beef Stroganoff", "Creamy Mushroom Roast Beef",
      "Fika House Tapa", "Fish Fillet in Creamy Lemon Butter Sauce", " Baked Bangus", "Cajun Seafood Mix"
    ],
  },
  {
    title: "Dessert",
    items: ["Leche Flan", "Mango Tapioca", "Mixed Fruits", "Cheesecake Cups"],
  },
]

export const Chosen:bfts = [
  {
    title: "Veggies",
    items: ["Chicken Mango Salad"],
  },
  {
    title: "Pasta",
    items: ["Shrimp Aglio Olio",
    ],
  },
  {
    title: "Mains",
    items: ["Chicken Saltimbocca", "Roasted Lemon Chicken",
    ],
  },
  {
    title: "Dessert",
    items: ["Leche Flan",],
  },
]

export const Promo = [
  "20% off for all café drinks during the event!",
  "Unlimited iced tea or cucumber lemonade"
]

type ResDets = {
  id: string;
  type: string;
  dateRes: string;
  timeRes: string;
  timeResEnd?: string;
  dateReq: string;
  timeReq: string;
  pax?: number;
  package?: string;
  buffet?: {title: string; foods: string[];}[];
  price?: number;
  status: string;
}

type ReserDets = ResDets[];

export const ReservationDetails:ReserDets = [
  {
    id: "1",
    type: "Table",
    dateRes: "07/20/2024",
    timeRes: "1pm",
    dateReq: "7/10/2024",
    timeReq: "10:59",
    pax: 4,
    status: "Requested"
  },
  {
    id: "2",
    type: "Event",
    dateRes: "07/24/2024",
    timeRes: "12pm",
    timeResEnd: "7pm",
    dateReq: "7/10/2024",
    timeReq: "10:30",
    pax: 20,
    package: "A",
    buffet: [{title: "Veggies", foods: ["Chicken Mango Salad"]},
    {title: "Pasta", foods: ["Shrimp Aglio Olio"]},
    {title: "Mains", foods: ["Chicken Saltimbocca", "Roasted Lemon Chicken"]},
    {title: "Dessert", foods: ["Leche Flan"]}],
    price: 69420,
    status: "Approved"
  },
]