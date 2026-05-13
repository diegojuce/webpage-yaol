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
    street: "Av. Tecnológico 3, La Frontera",
    city: "Villa de Álvarez",
    state: "Colima",
    postalCode: "28978",
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
    maps: "https://maps.google.com/?q=Av+Tecnologico+3+La+Frontera+Villa+de+Alvarez",
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
    maps: "https://maps.google.com/?q=Av+Benito+Juarez+365+Villa+de+Alvarez",
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
    maps: "https://maps.google.com/?q=Av+Constitucion+1837+Colima",
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
    maps: "https://maps.google.com/?q=Ninos+Heroes+1050+Colima",
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
    maps: "https://maps.google.com/?q=Enrique+Corona+Morfin+422+Colima",
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
    maps: "https://maps.google.com/?q=Blvd+Miguel+de+la+Madrid+11386+Manzanillo",
    badges: ["Zona costera", "Especialistas en SUV"],
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
    handle: "/yantissimollantas",
    href: "https://facebook.com/yantissimollantas",
  },
  {
    id: "ig",
    name: "Instagram",
    handle: "@yantissimo",
    href: "https://instagram.com/yantissimo",
  },
  {
    id: "tk",
    name: "TikTok",
    handle: "@yantissimo",
    href: "https://tiktok.com/@yantissimo",
  },
];

export function telHref(phone: string) {
  return `tel:+52${phone.replace(/\s/g, "")}`;
}

export function whatsappHref(text?: string) {
  const base = `https://wa.me/${WHATSAPP_CENTRAL}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
