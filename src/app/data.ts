export type Drinks = {
  id: string;
  title: string;
  desc?: string;
  type: string;
  img: string;
  price: number;
  availability: string;
  calorie: string;
  contains: string[];
};

export type Pastries = {
  id: string;
  title: string;
  desc?: string;
  type: string;
  img: string;
  price: number;
  availability: string;
  calorie: string;
  contains: string[];
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
];

export type MenuItem = {
availability: string;
calorie: string;
desc: string;
img: string;
price: number;
prodCategory: string;
prodID: string;
title: string;
type?: string;
contains?: string[];
addEspresso?: number;
addSyrup?: number;
addVanilla?: number;
currSize?: string;
milkAlmond?: number;
milkOat?: number;
upsizable?: boolean;
upsizeSize?: string;
upsizePrice?: number;
serveMashedPotato?: boolean;
serveRice?: boolean;
};

type MenuItems = MenuItem[];

export const pastaMenu: MenuItems = [
{
  availability: "available",
  calorie: "high",
  desc: "A pasta that is oozing with its own pastaness like nothing has been a pasta like this before.",
  img: "/menugroups/pasta.webp",
  price: 255,
  prodCategory: "pastaMenu",
  prodID: "pasta5",
  title: "Aglio Olio Pasta",
  type: "Non-Pesto",
  contains: [""],
},
{
  availability: "unavailable",
  calorie: "med",
  desc: "A pasta that is oozing with its own pastaness like nothing has been a pasta like this before.",
  img: "/menugroups/pasta.webp",
  price: 255,
  prodCategory: "pastaMenu",
  prodID: "pasta6",
  title: "Aglio Olio Pasta",
  type: "Non-Pesto",
  contains: [""],
},
{
  availability: "unavailable",
  calorie: "low",
  desc: "A pasta that is oozing with its own pastaness like nothing has been a pasta like this before.",
  img: "/menugroups/pasta.webp",
  price: 255,
  prodCategory: "pastaMenu",
  prodID: "pasta7",
  title: "Aglio Olio Pasta",
  type: "Non-Pesto",
  contains: [""],
},
];

type menuCat = {
id: number;
prodCat: string;
title: string;
};

type menuCats = menuCat[];

export const menuCategory: menuCats = [
{
  id: 1,
  prodCat: "icedDrinks",
  title: "Iced Drinks",
},
{
  id: 2,
  prodCat: "blendedDrinks",
  title: "Blended Drinks",
},
{
  id: 3,
  prodCat: "hotDrinks",
  title: "Hot Drinks",
},
{
  id: 4,
  prodCat: "affogatoDrinks",
  title: "Affogato Drinks",
},
{
  id: 5,
  prodCat: "mainCourseMenu",
  title: "Main Course",
},
{
  id: 6,
  prodCat: "snacksMenu",
  title: "Snacks",
},
{
  id: 7,
  prodCat: "pastriesMenu",
  title: "Pastries",
},
{
  id: 8,
  prodCat: "sandwichesMenu",
  title: "Sandwiches",
},
{
  id: 9,
  prodCat: "pastaMenu",
  title: "Pasta",
},
];

export const Availability = [
  {
    id: 1,
    name: "Available",  // Capitalized display name
    value: "available"   // Lowercase logical value
  },
  {
    id: 2,
    name: "Unavailable",
    value: "unavailable"
  }
];

export const pastriesMenu:MenuItems = [
{
  
  availability: "available",
  calorie: "high",
  desc: "Rich and creamy cheesecake with a caramelized burnt top, boasting a velvety interior that melts in your mouth with every bite.",
  img: "/menugroups/pastry.webp",
  price: 255,
  prodCategory: "pastriesMenu",
  prodID: "pastries2",
  title: "Basque Burnt Cheesecake",
  type: "Cake",
  contains: ["Milk, Eggs"],
}  
];

export const snacksMenu:MenuItems = [
{
  availability: "available",
  calorie: "high",
  desc: "Crinkle-cut fries layered with crumbled crispy bacon, mayonnaise, and smoky BBQ sauce.",
  img: "/menugroups/side.webp",
  price: 225,
  prodCategory: "snacksMenu",
  prodID: "sn3",
  title: "BBQ Fries",
  type: "Fries",
  contains: [""],
}
];

export const sandwichMenu:MenuItems = [
{
  availability: "available",
  calorie: "high",
  desc: "Special chicken spread served on a triple-stacked whole wheat bread with crisp lettuce, tomato, cucumber, and cheese.",
  img: "/menugroups/sandwich.webp",
  price: 205,
  prodCategory: "sandwichMenu",
  prodID: "sandwich4",
  title: "Chicken Sandwich",
  type: "Sandwiches",
  contains: [""],
},
];

export const mainCourseMenu:MenuItems = [
{
  availability: "available",
  calorie: "high",
  desc: "Our signature deep-fried chicken served with our special gravy sauce and a portion of our regular fries on the side.",
  img: "/menugroups/meal.webp",
  price: 260,
  prodCategory: "mainCourseMenu",
  prodID: "mainCourse10",
  serveMashedPotato: false,
  serveRice: false,
  title: "Fika House Fried Chicken",
  type: "Meat",
  contains: [""],
},
];

export const drinksMenu: MenuItems = [
{
  addEspresso: 30,
  addSyrup: 30,
  addVanilla: 25,
  availability: "unavailable",
  calorie: "low",
  contains: [""],
  currSize: "16oz",
  desc: "A refreshing blend of rich espresso poured over chilled water and ice.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 105,
  prodCategory: "icedDrinks",
  prodID: "id1",
  title: "Americano",
  type: "Coffee",
  upsizable: false,
},
{
  addEspresso: 30,
  addSyrup: 30,
  addVanilla: 25,
  availability: "available",
  calorie: "low",
  contains: ["Milk", "Soy"],
  currSize: "16oz",
  desc: "A chilled treat combining smooth chocolate syrup and cold milk, served over ice for a refreshing and indulgent drink that's perfect for warm days.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 155,
  prodCategory: "icedDrinks",
  prodID: "id12",
  title: "Choco Milk",
  type: "Non-Coffee",
  upsizable: false,
},
{
  addEspresso: 30,
  addSyrup: 30,
  availability: "available",
  calorie: "low",
  contains: ["Milk"],
  currSize: "8oz",
  desc: "A combination of espresso and milk.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 105,
  prodCategory: "hotDrinks",
  prodID: "hd5",
  title: "Cafe Latte",
  type: "Coffee",
  upsizable: true,
  upsizePrice: 10,
  upsizeSize: "12oz",
},
{
  addEspresso: 30,
  addSyrup: 30,
  availability: "available",
  calorie: "low",
  contains: ["Milk", "Soy"],
  currSize: "8oz",
  desc: "A comforting beverage made with rich, velvety chocolate melted into warm milk, creating a sweet and soothing drink perfect for cozy moments.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 115,
  prodCategory: "hotDrinks",
  prodID: "hd10",
  title: "Choco Milk",
  type: "Non-Coffee",
  upsizable: true,
  upsizePrice: 20,
  upsizeSize: "12oz",
},
{
  addEspresso: 30,
  addSyrup: 30,
  availability: "available",
  calorie: "low",
  contains: ["Milk"],
  currSize: "16oz",
  desc: "A frosty mix of espresso, creamy milk, and velvety foam, blended to perfection for a delightful, refreshing treat.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 175,
  prodCategory: "blendedDrinks",
  prodID: "bd4",
  title: "Cappuccino Blend",
  type: "Coffee",
  upsizable: false,
},
{
  addEspresso: 30,
  addSyrup: 30,
  availability: "available",
  calorie: "low",
  contains: ["Milk"],
  currSize: "16oz",
  desc: "A creamy blend of ripe strawberries and smooth milk, mixed with ice for a deliciously sweet and satisfying treat.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 175,
  prodCategory: "blendedDrinks",
  prodID: "bd10",
  title: "Strawberry Cream",
  type: "Non-Coffee",
  upsizable: false,
},
{
  addEspresso: 30,
  addSyrup: 30,
  availability: "available",
  calorie: "low",
  contains: ["Milk"],
  currSize: "8oz",
  desc: "A decadent dessert featuring a scoop of creamy vanilla gelato topped with rich espresso and drizzled with sweet salted caramel, creating a delightful balance of flavors and textures in every sip.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 95,
  prodCategory: "affogatoDrinks",
  prodID: "ad3",
  title: "Salted Caramel Spro",
  type: "Non-Coffee",
  upsizable: false,
},
{
  addEspresso: 30,
  addSyrup: 30,
  availability: "available",
  calorie: "low",
  contains: ["Milk", "Eggs", "Tree Nuts", "Soy"],
  currSize: "8oz",
  desc: "A delightful dessert combining a scoop of creamy vanilla gelato drowned in rich, hot espresso, creating a perfect balance of temperature and flavor.",
  img: "/menugroups/drink.webp",
  milkAlmond: 30,
  milkOat: 40,
  price: 85,
  prodCategory: "affogatoDrinks",
  prodID: "ad1",
  title: "Espresso",
  type: "Coffee",
  upsizable: false,
},
];

type voucherType = {
  voucherName: string;
  available: boolean;
  voucherType: string;
  voucherID: string;
  voucherDeduction: number;
  voucherDescription: string;
  forever: boolean;
  validity?: string;
  unlimited: boolean;
  numberOfTimes?: number;
};

type voucherTypes = voucherType[];

export const vouchers:voucherTypes = [
  {
    voucherName: "1000HitVoucher",
    available: true,
    voucherType: "percent",
    voucherID: "FIKASTALLE1KORDR",
    voucherDeduction: 0.1,
    voucherDescription: "Get 10% off your total order for purchasing P1000 worth of products",
    forever: true,
    unlimited: true,
  },
  {
    voucherName: "firstTimeVoucher",
    available: true,
    voucherType: "minus",
    voucherID: "FIKASTALLEWLCM",
    voucherDeduction: 10,
    voucherDescription: "Get P10 off when ordering",
    forever: true,
    unlimited: true,
  },
  {
    voucherName: "valentinesVoucher",
    available: true,
    voucherType: "minus",
    voucherID: "FIKASTALLEVLNTN",
    voucherDeduction: 10,
    voucherDescription: "Get P20 off when ordering",
    forever: true,
    unlimited: true,
  },
];



export const soldToday = {
  labels: [
    "Today",
  ],
  datasets: [
    {
      label: "Food",
      data: [2, 4, 5, 3, 2, 1, 6, 7, 1, 4, 6, 10],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Drinks",
      data: [2, 7, 10, 3, 6, 7, 2, 11, 12, 6, 4],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}

export const soldWeek = {
  labels: [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  datasets: [
    {
      label: "Food",
      data: [2, 4, 5, 3, 2, 1, 6, 7, 1, 4, 6, 10],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Drinks",
      data: [2, 7, 10, 3, 6, 7, 2, 11, 12, 6, 4],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}

export const soldMonth = {
  labels: [
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5",
  ],
  datasets: [
    {
      label: "Food",
      data: [2, 4, 5, 3, 2, 1, 6, 7, 1, 4, 6, 10],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Drinks",
      data: [2, 7, 10, 3, 6, 7, 2, 11, 12, 6, 4],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}

export const soldYear = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "Food",
      data: [2, 4, 5, 3, 2, 1, 6, 7, 1, 4, 6, 10],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Drinks",
      data: [2, 7, 10, 3, 6, 7, 2, 11, 12, 6, 4, 16],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}


export const salesExpensesToday = {
  labels: [
    "Today",
  ],
  datasets: [
    {
      label: "Sales",
      data: [10000, 9500, 16430, 4320, 6942, 14420],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Expenses",
      data: [6000, 7500, 14430, 1320, 4942, 9420],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}

export const salesExpensesWeek = {
  labels: [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  datasets: [
    {
      label: "Sales",
      data: [10000, 9500, 16430, 4320, 6942, 14420],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Expenses",
      data: [6000, 7500, 14430, 1320, 4942, 9420],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}

export const salesExpensesMonth = {
  labels: [
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5",
  ],
  datasets: [
    {
      label: "Sales",
      data: [10000, 9500, 16430, 4320, 6942, 14420],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Expenses",
      data: [6000, 7500, 14430, 1320, 4942, 9420],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}

export const salesExpensesYear = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "Sales",
      data: [28000, 45000, 56000, 32000, 24000, 15000, 67000, 75000, 12000, 45000, 63000, 10000],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
    {
      label: "Expenses",
      data: [25678, 42456, 19250, 38000, 12000, 15600, 23500, 19000, 12700, 67000, 42000, 16000],
      borderColor: "#F0565F",
      backgroundColor: "#F0565F",
    },
  ]
}

export const ordersAveragePerDay = {
  labels: [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  datasets: [
    {
      label: "Orders",
      data: [10, 9, 12, 13, 24, 23],
      borderColor: "#60A66F",
      backgroundColor: "#60A66F",
    },
  ]
}

export const LikesDislikes = {
  labels: [
    "Likes", "Dislikes"
  ],
  datasets: [
    {
      label: ["Ratio"],
      data: [36, 16],
      backgroundColor: ["#60A66F", "#F0565F",],
      hoverOffset: 4,
    },
  ]
}

type customerReview = {
  id: string;
  like: boolean;
  name: string;
  email: string;
  date: string;
  time: string;
  review: string;
}

type customerReviews = customerReview[];

export const customerReviewList:customerReviews = [
  {
    id: "1",
    like: true,
    name: "John Doe",
    email: "johndoe@gmail.com",
    date: "11/14/2024",
    time: "12:30",
    review: "I had an easy time ordering, and the food is also good. Hoping to dine with my friends the next time I go.",
  },
  {
    id: "2",
    like: true,
    name: "Emma Smith",
    email: "emmasmith@gmail.com",
    date: "11/10/2024",
    time: "12:30",
    review: "The ambiance was fantastic, and the drinks were top-notch. Will definitely visit again!",
  },
  {
    id: "3",
    like: false,
    name: "Michael Brown",
    email: "michaelbrown@gmail.com",
    date: "11/05/2024",
    time: "12:30",
    review: "The service was a bit slow, but the food was good. Could use some improvement in timing.",
  },
  {
    id: "4",
    like: true,
    name: "Sophia Mae Nakamura",
    email: "hindinakamahal@gmail.com",
    date: "10/28/2024",
    time: "12:30",
    review: "Loved the variety on the menu, especially the drinks! The oat milk option is a nice touch.",
  },
  {
    id: "5",
    like: false,
    name: "David Wilson",
    email: "davidwilson@gmail.com",
    date: "10/20/2024",
    time: "12:30",
    review: "Food was fine, but I found the seating arrangement uncomfortable. Might give it another try later.",
  },{
    id: "6",
    like: true,
    name: "Laura Kim",
    email: "laurakim@gmail.com",
    date: "10/15/2024",
    time: "13:45",
    review: "Exceptional coffee! The barista really knows their craft.",
},
{
    id: "7",
    like: false,
    name: "Brian Green",
    email: "briangreen@gmail.com",
    date: "10/10/2024",
    time: "09:00",
    review: "The music was too loud for a morning coffee spot. Hard to relax.",
},
{
    id: "8",
    like: true,
    name: "Ava Patel",
    email: "avapatel@gmail.com",
    date: "10/08/2024",
    time: "18:20",
    review: "Loved the unique drink flavors! The hibiscus tea was refreshing.",
},
{
    id: "9",
    like: true,
    name: "Ethan Lee",
    email: "ethanlee@gmail.com",
    date: "10/01/2024",
    time: "11:15",
    review: "Perfect spot for studying. Great Wi-Fi and comfortable seating.",
},
{
    id: "10",
    like: false,
    name: "Olivia Harris",
    email: "oliviaharris@gmail.com",
    date: "09/28/2024",
    time: "14:00",
    review: "The pastry I ordered was a bit dry. Might try a different one next time.",
},
{
    id: "11",
    like: true,
    name: "James Rodriguez",
    email: "jamesrodriguez@gmail.com",
    date: "09/25/2024",
    time: "08:50",
    review: "Their coffee is consistently amazing, and I love the cozy vibe.",
},
{
    id: "12",
    like: false,
    name: "Isabella Clark",
    email: "isabellaclark@gmail.com",
    date: "09/20/2024",
    time: "17:30",
    review: "Service was a bit slow during peak hours. Food was worth the wait, though.",
},
{
    id: "13",
    like: true,
    name: "Lucas Young",
    email: "lucasyoung@gmail.com",
    date: "09/18/2024",
    time: "10:20",
    review: "The seasonal pumpkin latte was fantastic! Will come back for it.",
},
{
    id: "14",
    like: false,
    name: "Mia Perez",
    email: "miaperez@gmail.com",
    date: "09/16/2024",
    time: "16:45",
    review: "I found the prices a bit high, but the food quality was good.",
},
{
    id: "15",
    like: true,
    name: "Alexander Lopez",
    email: "alexanderlopez@gmail.com",
    date: "09/12/2024",
    time: "12:15",
    review: "Loved the customizable options. Finally found a place that has oat milk!",
},
{
    id: "16",
    like: true,
    name: "Chloe Scott",
    email: "chloescott@gmail.com",
    date: "09/09/2024",
    time: "13:30",
    review: "Perfect place to catch up with friends. Great vibes and coffee.",
},
{
    id: "17",
    like: false,
    name: "Jack Edwards",
    email: "jackedwards@gmail.com",
    date: "09/05/2024",
    time: "15:00",
    review: "It was okay, but I think the place could use a bit more variety on the menu.",
},
{
    id: "18",
    like: true,
    name: "Lily Baker",
    email: "lilybaker@gmail.com",
    date: "09/02/2024",
    time: "11:45",
    review: "Amazing ambiance! Great for working or just hanging out.",
},
{
    id: "19",
    like: false,
    name: "Mason Hill",
    email: "masonhill@gmail.com",
    date: "08/30/2024",
    time: "12:00",
    review: "The iced tea was too sweet for my taste, but the other drinks were nice.",
},
{
    id: "20",
    like: true,
    name: "Grace King",
    email: "graceking@gmail.com",
    date: "08/28/2024",
    time: "17:10",
    review: "The pastries were fresh, and the staff was friendly. A must-visit!",
},
{
    id: "21",
    like: true,
    name: "Henry Garcia",
    email: "henrygarcia@gmail.com",
    date: "08/25/2024",
    time: "08:15",
    review: "They had my favorite blend, and it was brewed to perfection!",
},
{
    id: "22",
    like: false,
    name: "Ava Sanchez",
    email: "avasanchez@gmail.com",
    date: "08/22/2024",
    time: "09:30",
    review: "The seating could be more comfortable, but the drinks are great.",
},
{
    id: "23",
    like: true,
    name: "Benjamin Morris",
    email: "benjaminmorris@gmail.com",
    date: "08/18/2024",
    time: "18:40",
    review: "The staff was attentive and the food came out quickly.",
},
{
    id: "24",
    like: true,
    name: "Hannah Rivera",
    email: "hannahrivera@gmail.com",
    date: "08/16/2024",
    time: "10:05",
    review: "Loved the vegan options! The oat milk latte was delicious.",
},
{
    id: "25",
    like: true,
    name: "William Cooper",
    email: "williamcooper@gmail.com",
    date: "08/14/2024",
    time: "15:20",
    review: "A great place to chill with friends. The food and drinks were top-notch.",
},
{
    id: "26",
    like: false,
    name: "Scarlett Barnes",
    email: "scarlettbarnes@gmail.com",
    date: "08/10/2024",
    time: "11:30",
    review: "It took a while to get my order, but the staff was apologetic.",
},
{
    id: "27",
    like: true,
    name: "Julian Reed",
    email: "julianreed@gmail.com",
    date: "08/07/2024",
    time: "16:55",
    review: "Excellent service! I felt very welcomed from the moment I walked in.",
},
{
    id: "28",
    like: true,
    name: "Ella Rogers",
    email: "ellarogers@gmail.com",
    date: "08/05/2024",
    time: "13:50",
    review: "The atmosphere was amazing, and the espresso was just perfect!",
},
{
    id: "29",
    like: false,
    name: "Landon Powell",
    email: "landonpowell@gmail.com",
    date: "08/03/2024",
    time: "17:30",
    review: "Decent food, but a bit pricey. Might come back for special occasions.",
},
{
    id: "30",
    like: true,
    name: "Madison White",
    email: "madisonwhite@gmail.com",
    date: "08/01/2024",
    time: "12:10",
    review: "The staff was lovely and the desserts were delightful!",
},
];

type topSpending = {
  username: string;
  firstName: string;
  lastName: string;
  membership: string;
  amount: number;
}

type topSpenders = topSpending[];

export const topSpendingCustomers: topSpenders = [
  {
    username: "jdoe123@gmail.com",
    firstName: "John",
    lastName: "Doe",
    membership: "BRONZE",
    amount: 1200.50,
  },
  {
    username: "emsmith@gmail.com",
    firstName: "Emma",
    lastName: "Smith",
    membership: "REGULAR",
    amount: 980.75,
  },
  {
    username: "michael_b@gmail.com",
    firstName: "Michael",
    lastName: "Brown",
    membership: "BRONZE",
    amount: 1500.00,
  },
  {
    username: "hindinakamahal@gmail.com",
    firstName: "Sophia Mae",
    lastName: "Nakamura",
    membership: "REGULAR",
    amount: 820.25,
  },
  {
    username: "liamlee@gmail.com",
    firstName: "Liam",
    lastName: "Lee",
    membership: "BRONZE",
    amount: 1320.40,
  },
];


type expense = {
  id: number;
  name: string;
  amount: number;
}

type expenses = expense[];

export const expenseList:expenses = [
  {
    id: 1,
    name: "Ingredients",
    amount: 5000,
  },
  {
    id: 2,
    name: "Utilities",
    amount: 6000,
  },
  {
    id: 3,
    name: "Salaries",
    amount: 4000,
  },
];

type tnc = {
  header: string;
  desc: string[];
}

type tncs = tnc[];

export const conditions:tncs = [
  {
    header: "Provision of Personal Information",
    desc: ["Users are required to provide accurate and complete Personal Information (Name, Phone Number, Address, and Email Address) to create an account and use the services of the website.",]
  },
  {
    header: "Use of Email Address",
    desc: ["Email addresses will be used to:",
      "Send user notifications related to orders and reservations.",
      "Inform users about promotions and special offers.",
      "Verify user accounts.",
      "Facilitate password reset requests.",
    ]
  },
  {
    header: "No Refund Policy",
    desc: ["Payments made for orders or reservations are non-refundable under any circumstances.",]
  },
  {
    header: "Online Payment Verification",
    desc: ["Users opting for online payments consent to uploading a receipt of payment, which will be verified by the staff of Fikaställe by Fika Kafé.",]
  },
  {
    header: "PWD/Senior Citizen Discount Verification",
    desc: ["Users availing of the PWD/Senior Citizen discount consent to uploading a valid photo of their ID, which will be verified by the staff of Fikaställe by Fika Kafé.",]
  },
  {
    header: "Exclusivity of Discounts and Promotions",
    desc: ["The use of PWD/Senior Citizen discounts will forfeit eligibility for vouchers or promotion codes for the same transaction.",]
  },
  {
    header: "Table Reservations",
    desc: ["A Table Reservation Fee of Php 50.00 per person is required. This amount is consumable during dining in the restaurant.",]
  },
  {
    header: "Exclusive Café Reservations",
    desc: ["A 50% down payment based on the total cost of the chosen reservation specifications is required for Exclusive Café bookings.",]
  },
];

export const terms:tncs = [
  {
    header: "User",
    desc: ["Any individual who registers an account, places an order, or makes a reservation through the Fikaställe by Fika Kafé website.",]
  },
  {
    header: "Personal Information",
    desc: ["Refers to any information provided by the user upon registration, including Name, Phone Number, Address, and Email Address.",]
  },
  {
    header: "Online Payment",
    desc: ["Payment transactions made via digital payment platforms integrated into the website.",]
  },
  {
    header: "PWD/Senior Citizen Discount",
    desc: ["A legally mandated discount provided to individuals holding valid Persons with Disabilities (PWD) or Senior Citizen IDs, subject to verification.",]
  },
  {
    header: "Vouchers or Promotion Codes",
    desc: ["Special offers or discounts applied to reduce the total amount payable by the user, subject to terms of use.",]
  },
  {
    header: "Table Reservation Fee",
    desc: ["A fee of Php 50.00 per person, applicable to table reservations and consumable for dining purposes.",]
  },
  {
    header: "Exclusive Café Reservation",
    desc: ["The process of booking the entire café for private events, requiring a 50% down payment based on the total chosen specifications.",]
  },
];

export const introduction:tnc = {
  header: "Terms and Conditions for Fikaställe by Fika Kafé Online Services",
  desc: ["Welcome to the official online ordering, reservation, and restaurant management website for Fikaställe by Fika Kafé. By signing up and using our platform, you agree to the following Terms and Conditions. Please read these terms carefully before proceeding."]
}

export const conclusion = "By proceeding to sign up and use the Fikaställe by Fika Kafé website, you acknowledge and agree to abide by these terms and conditions. These terms are subject to change at the discretion of Fikaställe by Fika Kafé, and users will be notified of updates via email or website announcements.";
export const conclusion2 = "If you have any questions or concerns regarding these terms, please contact us directly via our customer service channels."


type menuCate = {
  id: number;
  title: string;
  subcat: string[];
  img: string;
}

type menuCates = menuCate[];

export const category:menuCates = [
  {
    id: 1,
    title: "Drinks",
    subcat: ["Hot Drink", "Iced Drink", "Blended Drink", "Affogato",],
    img: "/menugroups/drink.webp",
  },
  {
    id: 2,
    title: "Pastries",
    subcat: ["Cookie", "Cake", "Tart"],
    img: "/menugroups/pastry.webp",
  },
  {
    id: 3,
    title: "Pasta",
    subcat: ["Pesto", "Non-Pesto"],
    img: "/menugroups/pasta.webp",
  },
  {
    id: 4,
    title: "Snacks",
    subcat: ["Nachos", "Fries", "Chicken", "Seafood"],
    img: "/menugroups/side.webp",
  },
  {
    id: 5,
    title: "Sandwiches",
    subcat: ["Sandwiches"],
    img: "/menugroups/sandwich.webp",
  },
  {
    id: 6,
    title: "Main Course",
    subcat: ["Meat", "Sea Food"],
    img: "/menugroups/meal.webp",
  },
];

export const subCategories = [
  "Sub Category 1", "Sub Category 2", "Sub Category 3", 
];


type Expense = {
  expenseAmount: number;
  expenseLabel: string;
  time: string;
};

type ExpenseDocument = {
  docID: string;
  addedExpenses: Expense[];
  date: string;
  totalExpenses: number;
};

type ExpenseDocuments = ExpenseDocument[];

export const ExpenseDocs: ExpenseDocuments = [
  {
    "docID": "2024-11-27",
    "addedExpenses": [
      {
        "expenseAmount": 123,
        "expenseLabel": "label11",
        "time": "19:25"
      },
      {
        "expenseAmount": 213,
        "expenseLabel": "label12",
        "time": "19:25"
      },
      {
        "expenseAmount": 321,
        "expenseLabel": "label13",
        "time": "19:25"
      },
      {
        "expenseAmount": 361,
        "expenseLabel": "label122",
        "time": "11:25"
      },
      {
        "expenseAmount": 341,
        "expenseLabel": "label1112",
        "time": "11:25"
      },
    ],
    "date": "2024-11-27",
    "totalExpenses": 657
  },
  {
    "docID": "2024-11-28",
    "addedExpenses": [
      {
        "expenseAmount": 150,
        "expenseLabel": "label21",
        "time": "10:30"
      },
      {
        "expenseAmount": 275,
        "expenseLabel": "label22",
        "time": "11:45"
      },
      {
        "expenseAmount": 310,
        "expenseLabel": "label23",
        "time": "14:15"
      }
    ],
    "date": "2024-11-28",
    "totalExpenses": 735
  },
  {
    "docID": "2024-11-29",
    "addedExpenses": [
      {
        "expenseAmount": 400,
        "expenseLabel": "label31",
        "time": "08:00"
      },
      {
        "expenseAmount": 220,
        "expenseLabel": "label32",
        "time": "13:20"
      },
      {
        "expenseAmount": 130,
        "expenseLabel": "label33",
        "time": "17:50"
      }
    ],
    "date": "2024-11-29",
    "totalExpenses": 750
  },
  {
    "docID": "2024-11-30",
    "addedExpenses": [
      {
        "expenseAmount": 95,
        "expenseLabel": "label41",
        "time": "09:10"
      },
      {
        "expenseAmount": 150,
        "expenseLabel": "label42",
        "time": "12:45"
      },
      {
        "expenseAmount": 210,
        "expenseLabel": "label43",
        "time": "18:25"
      }
    ],
    "date": "2024-11-30",
    "totalExpenses": 455
  },
  {
    "docID": "2024-12-01",
    "addedExpenses": [
      {
        "expenseAmount": 180,
        "expenseLabel": "label51",
        "time": "08:20"
      },
      {
        "expenseAmount": 120,
        "expenseLabel": "label52",
        "time": "14:40"
      },
      {
        "expenseAmount": 160,
        "expenseLabel": "label53",
        "time": "20:10"
      }
    ],
    "date": "2024-12-01",
    "totalExpenses": 460
  },
  {
    "docID": "2024-12-02",
    "addedExpenses": [
      {
        "expenseAmount": 300,
        "expenseLabel": "label61",
        "time": "09:00"
      },
      {
        "expenseAmount": 220,
        "expenseLabel": "label62",
        "time": "15:15"
      },
      {
        "expenseAmount": 180,
        "expenseLabel": "label63",
        "time": "18:30"
      }
    ],
    "date": "2024-12-02",
    "totalExpenses": 700
  },
  {
    "docID": "2024-12-03",
    "addedExpenses": [
      {
        "expenseAmount": 140,
        "expenseLabel": "label71",
        "time": "08:45"
      },
      {
        "expenseAmount": 185,
        "expenseLabel": "label72",
        "time": "13:50"
      },
      {
        "expenseAmount": 250,
        "expenseLabel": "label73",
        "time": "19:10"
      }
    ],
    "date": "2024-12-03",
    "totalExpenses": 575
  },
];


export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "----Show All----",
];