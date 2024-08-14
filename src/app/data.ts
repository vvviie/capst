export type Drinks = {
    id: string;
    title: string;
    desc?: string;
    type: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
    options?: {title: string; additionalPrice: number}[];
    addtionals?: {title: string; addtionalPrice: number}[];
    milk?: {title: string; addtionalPrice: number}[];
};

type Beverages = Drinks[];

export const HotDrinks:Beverages = [
    {
        id: "hd1",
        title: "Espresso Shot",
        desc: "A shot of espresso.",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 60,
        availability: "unavailable",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd2",
        title: "Long Black",
        desc: "A combination of water and espresso.",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 85,
        availability: "available",
        calorie: "high",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd3",
        title: "Cappuccino",
        desc: "A combination of vanilla syrup, espresso, foamy milk, and cinnamon.",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 115,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 10
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd4",
        title: "Fika Signature Latte",
        desc: "A combination of vanilla, hazelnut, and caramel syrups, together with espresso and milk.",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 145,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd5",
        title: "Cafe Latte",
        desc: "A combination of espresso and milk.",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 105,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 10
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd6",
        title: "Mocha Latte",
        desc: "A combination of chocolate sauce, espresso, and milk.",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 135,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd7",
        title: "Spanish Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 125,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd8",
        title: "White Mocha Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 145,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd9",
        title: "Caramel Macchiato",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 145,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd10",
        title: "Choco Milk",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 115,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd11",
        title: "Matcha Milk",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 125,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
            {
                title: "12 oz",
                additionalPrice: 20
            }
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "hd12",
        title: "Tea",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 90,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
];

export const IcedDrinks:Beverages = [
    {
        id: "id1",
        title: "Americano",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 105,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id2",
        title: "Fika Signature Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id3",
        title: "Cafe Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 135,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id4",
        title: "Spanish Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 145,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id5",
        title: "Salted Caramel Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 155,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id6",
        title: "Mocha Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 155,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id7",
        title: "White Mocha Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id8",
        title: "Caramel Macchiato",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id9",
        title: "Dirty Matcha Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 185,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id10",
        title: "Cappuccino",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 145,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id11",
        title: "Coffee Jelly Latte",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 155,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id12",
        title: "Choco Milk",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 155,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id13",
        title: "Matcha Milk",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 165,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id14",
        title: "Strawberry Milk",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 165,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id15",
        title: "Matcha-berry Milk",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 185,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id16",
        title: "Earth Matcha",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id17",
        title: "Peach Matcha",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "id18",
        title: "Choco-berry",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 185,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Add Vanilla Float",
                addtionalPrice: 25,
            },
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
];

export const BlendedDrinks:Beverages = [
    {
        id: "bd1",
        title: "Mocha Chip Blend",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 165,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd2",
        title: "White Mocha Chip Blend",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd3",
        title: "Caramel Latte Blend",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd4",
        title: "Cappuccino Blend",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd5",
        title: "Coffee Jelly Blend",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 185,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd6",
        title: "Choco Chip Cream",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 165,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd7",
        title: "Matcha Cream",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd8",
        title: "Lotus Biscoff",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 185,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd9",
        title: "Nutella Chocolate",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 185,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd10",
        title: "Strawberry Cream",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 175,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "bd11",
        title: "Oreo Cream",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 185,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "16 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
];

export const Affogato:Beverages = [
    {
        id: "ad1",
        title: "Espresso",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 85,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "ad2",
        title: "Mocha",
        desc: "",
        type: "Coffee",
        img: "/menugroups/drink.webp",
        price: 95,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "ad3",
        title: "Salted Caramel Spro",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 95,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
    {
        id: "ad4",
        title: "Matcha",
        desc: "",
        type: "Non-Coffee",
        img: "/menugroups/drink.webp",
        price: 105,
        availability: "available",
        calorie: "low",
        options: [
            {
                title: "8 oz",
                additionalPrice: 0
            },
        ],
        addtionals: [
            {
                title: "Espresso",
                addtionalPrice: 30,
            },
            {
                title: "Syrup",
                addtionalPrice: 30,
            },
        ],
        milk: [
            {
                title: "Almond",
                addtionalPrice: 30,
            },
            {
                title: "Oat",
                addtionalPrice: 40,
            },
        ],
    },
];


export type Pastries = {
    id: number;
    title: string;
    desc?: string;
    img: string;
    price: number;
    availability: string;
    calorie: string;
    options?: { title: string; additionalPrice: number }[];
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