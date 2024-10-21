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
  prodCat: "sandwichMenu",
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
  value: "Available",
},
{
  id: 2,
  value: "Unavailable",
},
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