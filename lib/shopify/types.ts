// Tipos crudos de la Storefront API de Shopify y de /bypass/shopify (legado).
// Los tipos de dominio viven en lib/commerce/types; aquí solo se derivan las
// formas con edges/node que devuelve Shopify. Se borra en la Fase 6.
import type {
  Cart,
  CartAttribute,
  CartItem,
  CategoryKind,
  Collection,
  Image,
  Menu,
  Product,
  ProductAvailability,
  ProductVariant,
  SEO,
} from "lib/commerce/types";

export type * from "lib/commerce/types";

export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type BackendImage = {
  image: string;
};

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    cartId: string;
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
  variables: {
    lineItems?: {
      merchandiseId: string;
      quantity: number;
      sellingPlanId?: string;
    }[];
    attributes?: CartAttribute[];
  };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyCartAttributesUpdateOperation = {
  data: {
    cartAttributesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    attributes: CartAttribute[];
  };
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionProductsOperation = {
  data: {
    collection: {
      products: Connection<ShopifyProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>;
  };
};

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle: string;
  };
};

export type ShopifyVerifyQty = {
  data: { product: ProductAvailability };
  variables: {
    handle: string;
    quantity: number;
  };
};

export type BackendImageOperation = {
  data: { product: BackendImage };
  variables: {
    handle: string;
  };
};

export type ShopifyProductRecommendationsOperation = {
  data: {
    productRecommendations: ShopifyProduct[];
  };
  variables: {
    productId: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type ShopifyCategoryProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    kind: CategoryKind;
    value: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type ShopifyCart = Omit<Cart, "lines"> & {
  lines: Connection<CartItem>;
};

export type ShopifyCollection = Omit<Collection, "path">;

export type ShopifyProduct = Omit<Product, "variants" | "images"> & {
  variants: Connection<ProductVariant>;
  images: Connection<Image>;
};
