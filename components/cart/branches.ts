export type BranchOption = {
  id: string;
  name: string;
  address: string;
  city: string;
  hours: string;
  phone: string;
  distance: string;
  lat: number;
  lng: number;
};

export const CART_BRANCHES: BranchOption[] = [
  {
    id: "tecnologico",
    name: "Tecnológico",
    address: "Av. Tecnológico 512, Colima, Col.",
    city: "Colima",
    hours: "Lun - Sáb · 9:00 a 19:00",
    phone: "(312) 222 0099",
    distance: "2.4 km",
    lat: 19.261,
    lng: -103.696,
  },
  {
    id: "benito-juarez",
    name: "Benito Juárez",
    address: "Av. Benito Juárez 880, Colima, Col.",
    city: "Colima",
    hours: "Lun - Sáb · 9:00 a 19:00",
    phone: "(312) 312 4455",
    distance: "3.1 km",
    lat: 19.2475,
    lng: -103.7221,
  },
  {
    id: "constitucion",
    name: "Constitución",
    address: "Av. Constitución 1240, Villa de Álvarez, Col.",
    city: "Villa de Álvarez",
    hours: "Lun - Sáb · 9:00 a 19:00",
    phone: "(312) 316 0088",
    distance: "5.6 km",
    lat: 19.2772,
    lng: -103.7395,
  },
  {
    id: "ninos-heroes",
    name: "Niños Héroes",
    address: "Blvd. Niños Héroes 455, Colima, Col.",
    city: "Colima",
    hours: "Lun - Sáb · 9:00 a 19:00",
    phone: "(312) 313 7711",
    distance: "1.8 km",
    lat: 19.2455,
    lng: -103.711,
  },
  {
    id: "colinas-del-rey",
    name: "Colinas del Rey",
    address: "Av. Colinas del Rey 22, Villa de Álvarez, Col.",
    city: "Villa de Álvarez",
    hours: "Lun - Vie · 9:00 a 18:00",
    phone: "(312) 314 2020",
    distance: "7.3 km",
    lat: 19.2906,
    lng: -103.7478,
  },
  {
    id: "manzanillo-blvd",
    name: "Manzanillo Blvd.",
    address: "Blvd. Miguel de la Madrid 1820, Manzanillo, Col.",
    city: "Manzanillo",
    hours: "Lun - Sáb · 9:00 a 19:00",
    phone: "(314) 334 1100",
    distance: "96 km",
    lat: 19.1,
    lng: -104.3385,
  },
  {
    id: "manzanillo-tapeixtles",
    name: "Manzanillo Tapeixtles",
    address: "Carr. Manzanillo - Cihuatlán 75, Tapeixtles, Col.",
    city: "Manzanillo",
    hours: "Lun - Sáb · 9:00 a 18:00",
    phone: "(314) 336 5522",
    distance: "102 km",
    lat: 19.0625,
    lng: -104.368,
  },
];
