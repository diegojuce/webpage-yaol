// Tipos propios del comercio. Los componentes importan SOLO de aquí (vía
// lib/commerce), nunca de un proveedor. La forma replica la que ya consumía
// la UI para no reescribir componentes en la Fase 1; los adaptadores
// (providers/native.ts, providers/shopify.ts) traducen hacia estos tipos.
//
// Montos: `Money.amount` es un string decimal en pesos ("2999.99") porque así
// lo muestra la UI. Los cálculos de dinero (carrito, checkout, IVA) se hacen
// en el backend en centavos enteros; el frontend solo formatea.

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type SEO = {
  title: string;
  description: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  sku?: string;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice?: Money | null;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  vendor?: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type ProductAvailability = {
  availableForSale: boolean;
  sufficientStock: boolean;
};

export type CategoryKind = "vehiculo" | "tipo" | "gama";

// Hoy una colección es una marca (ver /bypass/shop/brands).
export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  path: string;
};

export type Menu = {
  title: string;
  path: string;
};

export type CartAttribute = {
  key: string;
  value: string;
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Cart = {
  id: string | undefined;
  // Solo proveedor shopify; el checkout nativo (Fase 3) no usa URL fija.
  checkoutUrl: string;
  attributes?: CartAttribute[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
};
