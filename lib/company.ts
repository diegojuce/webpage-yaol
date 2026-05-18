// Datos reales de Yantissimo — fuente única de verdad para páginas
// institucionales (ubicaciones, contacto, nosotros) y JSON-LD.

export const WHATSAPP_CENTRAL = "5213122220099"; // E.164 sin '+', para wa.me
export const WHATSAPP_DISPLAY = "312 222 0099";

export const COMPANY = {
  legalName: "Yantissimo",
  brandName: "Yantissimo",
  foundedYear: 2016,
  foundedDate: "2016-10-27",
  email: "marketing@yantissimo.com",
  fleetEmail: "marketing@yantissimo.com",
  website: "https://yantissimo.com",
  hqAddress: {
    street: "Av. de los Diamantes 144, Esmeralda Nte",
    city: "Colima",
    state: "Colima",
    postalCode: "28017",
    country: "MX",
  },
};

export type Branch = {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string;
  address: string;
  zip: string;
  maps: string;
  badges: string[];
  photoHue: number;
};

export const BRANCHES: Branch[] = [
  {
    id: "tecnologico",
    name: "Tecnológico",
    city: "Villa de Álvarez",
    state: "Colima",
    phone: "312 119 7566",
    address: "Av. Tecnológico 3, La Frontera",
    zip: "28978",
    maps: "https://maps.app.goo.gl/rvvUCJyVnz1HBFBZ7",
    badges: ["Sucursal flagship", "Estacionamiento amplio"],
    photoHue: 22,
  },
  {
    id: "benito-juarez",
    name: "Benito Juárez",
    city: "Villa de Álvarez",
    state: "Colima",
    phone: "312 103 6625",
    address: "Av. Benito Juárez 365, La Gloria",
    zip: "28980",
    maps: "https://maps.app.goo.gl/tbE5cgR6tMo8D9M96",
    badges: ["Sala de espera", "Café cortesía"],
    photoHue: 36,
  },
  {
    id: "constitucion",
    name: "Constitución",
    city: "Colima",
    state: "Colima",
    phone: "312 319 5414",
    address: "Av. Constitución 1837, Parque Royal",
    zip: "28017",
    maps: "https://maps.app.goo.gl/wDtsexoAdx4S5oGp6",
    badges: ["Atención express", "Alineación 3D"],
    photoHue: 18,
  },
  {
    id: "ninos-heroes",
    name: "Niños Héroes",
    city: "Colima",
    state: "Colima",
    phone: "312 385 6157",
    address: "Av. Niños Héroes esq. Ignacio Torres 1050",
    zip: "28040",
    maps: "https://maps.app.goo.gl/xyHYVZbUZoX9xgH89",
    badges: ["Centro de Colima", "Drive-through"],
    photoHue: 28,
  },
  {
    id: "colinas-del-rey",
    name: "Colinas del Rey",
    city: "Colima",
    state: "Colima",
    phone: "312 229 7350",
    address: "Av. Enrique Corona Morfin 422",
    zip: "28017",
    maps: "https://maps.app.goo.gl/Ri3Q29cqTq3adrGq6",
    badges: ["Nueva sucursal", "Boutique de llantas"],
    photoHue: 40,
  },
  {
    id: "manzanillo",
    name: "Manzanillo",
    city: "Manzanillo",
    state: "Colima",
    phone: "314 116 2978",
    address: "Blvd. Miguel de la Madrid 11386, Salagua",
    zip: "28869",
    maps: "https://maps.app.goo.gl/f5m8TorULwUqFrc59",
    badges: ["Zona costera", "Especialistas en SUV"],
    photoHue: 14,
  },
  {
    id: "manzanillo-tap",
    name: "Manzanillo Tapeixtles",
    city: "Manzanillo",
    state: "Colima",
    phone: "312 181 5518",
    address: "Libramiento Tapeixtles - Colima S/N 150 mts antes de las vías del tren",
    zip: "28975",
    maps: "https://maps.app.goo.gl/gt3EG1SaNkvGigo19",
    badges: ["Zona portuaria", "Llantas de Camion"],
    photoHue: 14,
  },
];

export const HOURS = [
  { d: "Lun – Vie", h: "9:00 a 19:00", closed: false },
  { d: "Sábado", h: "9:00 a 14:00", closed: false },
  { d: "Domingo", h: "Cerrado", closed: true },
];

export const SERVICES = [
  { id: "llantas", label: "Venta y montaje" },
  { id: "alineacion", label: "Alineación 3D" },
  { id: "balanceo", label: "Balanceo Pro" },
  { id: "frenos", label: "Frenos" },
  { id: "suspension", label: "Suspensión" },
  { id: "afinacion", label: "Afinación" },
  { id: "nitrogeno", label: "Nitrógeno" },
];

export const BRANDS = [
  "MICHELIN",
  "BRIDGESTONE",
  "CONTINENTAL",
  "GOODYEAR",
  "PIRELLI",
  "HANKOOK",
  "TOYO",
];

export const SOCIALS = [
  {
    id: "fb",
    name: "Facebook",
    handle: "/Yantissimo",
    href: "https://www.facebook.com/Yantissimo",
  },
  {
    id: "ig",
    name: "Instagram",
    handle: "@yantisimomkt",
    href: "https://www.instagram.com/yantisimomkt/",
  },
  {
    id: "tk",
    name: "TikTok",
    handle: "@yantissimo_oficial",
    href: "https://www.tiktok.com/@yantissimo_oficial",
  },
];

export function telHref(phone: string) {
  return `tel:+52${phone.replace(/\s/g, "")}`;
}

export function whatsappHref(text?: string) {
  const base = `https://wa.me/${WHATSAPP_CENTRAL}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
