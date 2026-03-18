export interface City {
  id: string;
  city: string;
  country: string;
  region: string;
  short_description: string;
  latitude: number;
  longitude: number;
  budget_level: string;
  culture: number;
  adventure: number;
  nature: number;
  beaches: number;
  nightlife: number;
  cuisine: number;
  wellness: number;
  urban: number;
  seclusion: number;
}

export const cities: City[] = [
  {
    id: "c54acf38-3029-496b-8c7a-8343ad82785c",
    city: "Milan",
    country: "Italy",
    region: "europe",
    short_description: "Chic streets lined with fashion boutiques, historic architecture, and lively piazzas create a sophisticated yet welcoming atmosphere, perfect for leisurely exploration.",
    latitude: 45.4641943,
    longitude: 9.1896346,
    budget_level: "Luxury",
    culture: 5,
    adventure: 2,
    nature: 2,
    beaches: 1,
    nightlife: 4,
    cuisine: 5,
    wellness: 3,
    urban: 5,
    seclusion: 2
  },
  {
    id: "0bd12654-ed64-424e-a044-7bc574bcf078",
    city: "Yasawa Islands",
    country: "Fiji",
    region: "oceania",
    short_description: "Crystal-clear waters, secluded beaches, and vibrant coral reefs create a serene paradise perfect for unwinding and immersing in natural beauty.",
    latitude: -17.2909471,
    longitude: 177.1257858,
    budget_level: "Luxury",
    culture: 2,
    adventure: 4,
    nature: 5,
    beaches: 5,
    nightlife: 2,
    cuisine: 3,
    wellness: 4,
    urban: 1,
    seclusion: 5
  },
  {
    id: "73036cda-9134-46fc-a2c6-807782d59dfb",
    city: "Whistler",
    country: "Canada",
    region: "north_america",
    short_description: "Snow-capped peaks and lush forests create a serene escape, where outdoor adventures meet cozy village vibes and crisp mountain air.",
    latitude: 50.1171903,
    longitude: -122.9543022,
    budget_level: "Luxury",
    culture: 3,
    adventure: 5,
    nature: 5,
    beaches: 2,
    nightlife: 3,
    cuisine: 3,
    wellness: 4,
    urban: 2,
    seclusion: 4
  },
  {
    id: "3872c9c0-6b6e-49e1-9743-f46bfe591b86",
    city: "Guanajuato",
    country: "Mexico",
    region: "north_america",
    short_description: "Winding cobblestone streets and colorful facades create a charming, vibrant atmosphere, where history and lively festivals fill the air with excitement.",
    latitude: 20.9876996,
    longitude: -101.0,
    budget_level: "Mid-range",
    culture: 5,
    adventure: 3,
    nature: 3,
    beaches: 1,
    nightlife: 3,
    cuisine: 4,
    wellness: 3,
    urban: 4,
    seclusion: 2
  },
  {
    id: "e1ebc1b6-8798-422d-847a-22016faff3fd",
    city: "Surabaya",
    country: "Indonesia",
    region: "asia",
    short_description: "Bustling streets filled with the aroma of local spices, vibrant markets, and a rich cultural tapestry invite exploration and discovery.",
    latitude: -7.2459717,
    longitude: 112.7378266,
    budget_level: "Budget",
    culture: 4,
    adventure: 3,
    nature: 3,
    beaches: 2,
    nightlife: 3,
    cuisine: 4,
    wellness: 3,
    urban: 4,
    seclusion: 2
  },
  {
    id: "26bd92cc-1bd7-46bc-a132-9c227115194a",
    city: "Nuuk",
    country: "Greenland",
    region: "north_america",
    short_description: "Rugged landscapes meet the calm of icy fjords, where the crisp air and vibrant local culture create a unique Arctic charm.",
    latitude: 64.1766835,
    longitude: -51.7359356,
    budget_level: "Luxury",
    culture: 3,
    adventure: 4,
    nature: 5,
    beaches: 2,
    nightlife: 2,
    cuisine: 3,
    wellness: 2,
    urban: 2,
    seclusion: 5
  },
  {
    id: "20f80ed8-ce7f-43ad-a34d-a0cb156f5d4e",
    city: "Windhoek",
    country: "Namibia",
    region: "africa",
    short_description: "A blend of modernity and tradition, with bustling markets, German colonial architecture, and the vast Namibian landscape providing a unique backdrop.",
    latitude: -22.53356015,
    longitude: 17.0454775,
    budget_level: "Mid-range",
    culture: 3,
    adventure: 4,
    nature: 4,
    beaches: 1,
    nightlife: 3,
    cuisine: 3,
    wellness: 3,
    urban: 3,
    seclusion: 4
  },
  {
    id: "0dae5759-947a-40c9-aaea-e2e647f1061e",
    city: "Kingston",
    country: "Jamaica",
    region: "north_america",
    short_description: "Vibrant streets pulse with reggae rhythms, while lush hills and beaches offer a serene escape, creating a captivating blend of energy and tranquility.",
    latitude: 17.9712148,
    longitude: -76.7928128,
    budget_level: "Mid-range",
    culture: 4,
    adventure: 3,
    nature: 3,
    beaches: 3,
    nightlife: 4,
    cuisine: 4,
    wellness: 3,
    urban: 3,
    seclusion: 2
  },
  {
    id: "4e2d3678-bbb3-428e-a1df-0ba956ef3c77",
    city: "Nafplio",
    country: "Greece",
    region: "europe",
    short_description: "Charming cobblestone streets, vibrant bougainvillea, and the gentle sea breeze create a serene atmosphere perfect for leisurely exploration and relaxation.",
    latitude: 37.5659229,
    longitude: 22.8068782,
    budget_level: "Mid-range",
    culture: 4,
    adventure: 3,
    nature: 4,
    beaches: 3,
    nightlife: 3,
    cuisine: 4,
    wellness: 3,
    urban: 3,
    seclusion: 4
  },
  {
    id: "b78d096a-87d0-4010-baac-e4879cab6aa9",
    city: "Tbilisi",
    country: "Georgia",
    region: "asia",
    short_description: "Cobblestone streets wind through eclectic neighborhoods, where vibrant markets and ancient architecture create a welcoming blend of history and modern charm.",
    latitude: 41.6934591,
    longitude: 44.8014495,
    budget_level: "Budget",
    culture: 4,
    adventure: 3,
    nature: 3,
    beaches: 1,
    nightlife: 3,
    cuisine: 4,
    wellness: 3,
    urban: 3,
    seclusion: 3
  }
];
