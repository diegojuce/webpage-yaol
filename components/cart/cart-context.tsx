"use client";

import type {
  Cart,
  CartItem,
  Product,
  ProductVariant,
} from "lib/shopify/types";
import React, {
  createContext,
  use,
  useContext,
  useMemo,
  useOptimistic,
} from "react";

type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: { merchandiseId: string; updateType: UpdateType };
    }
  | {
      type: "ADD_ITEM";
      payload: { variant: ProductVariant; product: Product; quantity: number };
    }
  | {
      type: "UPDATE_ITEM_VARIANT";
      payload: { lineId: string; variant: ProductVariant; product: Product };
    };

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType
): CartItem | null {
  if (updateType === "delete") return null;

  const productAny = (item.merchandise?.product ?? {}) as any;
  const edges = productAny?.variants?.edges ?? [];
  const variants: ProductVariant[] = edges.map((e: any) => e.node);
  const currentVariant = variants.find(
    (variant) => variant.id === item.merchandise.id
  );
  const maxAvailable =
    typeof currentVariant?.quantityAvailable === "number"
      ? currentVariant.quantityAvailable
      : undefined;

  let newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;

  if (updateType === "plus" && typeof maxAvailable === "number") {
    if (item.quantity >= maxAvailable) {
      return item;
    }

    newQuantity = Math.min(item.quantity + 1, maxAvailable);
  }

  if (newQuantity <= 0) return null;

  const currentAmountNum = Number(item.cost.totalAmount.amount);
  const singleItemAmount =
    item.quantity > 0 && Number.isFinite(currentAmountNum)
      ? currentAmountNum / item.quantity
      : Number.isFinite(currentAmountNum)
        ? currentAmountNum
        : 0;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString()
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  quantityToAdd: number
): CartItem {
  const baseQuantity = existingItem ? existingItem.quantity : 0;
  let newQuantity = baseQuantity + quantityToAdd;

  const maxAvailable =
    typeof variant.quantityAvailable === "number"
      ? variant.quantityAvailable
      : undefined;

  if (typeof maxAvailable === "number") {
    if (maxAvailable <= 0) {
      newQuantity = baseQuantity;
    } else {
      newQuantity = Math.min(newQuantity, maxAvailable);
    }
  }

  // Fallback to product-level price if variant price is missing/invalid.
  const variantAmount = Number(variant?.price?.amount);
  const useVariantPrice = Number.isFinite(variantAmount) && variantAmount > 0;
  const priceAmountStr = useVariantPrice
    ? variant.price.amount
    : product.priceRange.minVariantPrice.amount;
  const currencyCode =
    (variant?.price?.currencyCode as string | undefined) ||
    product.priceRange.minVariantPrice.currencyCode;

  const totalAmount = calculateItemCost(newQuantity, priceAmountStr);

  return {
    id: existingItem?.id,
    quantity: newQuantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title || product.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
}

function updateCartTotals(
  lines: CartItem[]
): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "USD";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "USD" },
      totalAmount: { amount: "0", currencyCode: "USD" },
      totalTaxAmount: { amount: "0", currencyCode: "USD" },
    },
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  switch (action.type) {
    case "UPDATE_ITEM": {
      const { merchandiseId, updateType } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) =>
          item.merchandise.id === merchandiseId
            ? updateCartItem(item, updateType)
            : item
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: "0" },
          },
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product, quantity } = action.payload;
      const existingItem = currentCart.lines.find(
        (item) => item.merchandise.id === variant.id
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        quantity
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            item.merchandise.id === variant.id ? updatedItem : item
          )
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "UPDATE_ITEM_VARIANT": {
      const { lineId, variant, product } = action.payload;
      const updatedLines = currentCart.lines.map((item) => {
        if (item.id !== lineId) return item;

        // Keep quantity; recalc price with fallback
        const variantAmount = Number(variant?.price?.amount);
        const useVariantPrice = Number.isFinite(variantAmount) && variantAmount > 0;
        const priceAmountStr = useVariantPrice
          ? variant.price.amount
          : (product as any)?.priceRange?.minVariantPrice?.amount ?? "0";
        const currencyCode =
          (variant?.price?.currencyCode as string | undefined) ||
          (product as any)?.priceRange?.minVariantPrice?.currencyCode ||
          item.cost.totalAmount.currencyCode;

        const newTotalAmount = calculateItemCost(item.quantity, priceAmountStr);

        return {
          ...item,
          cost: {
            ...item.cost,
            totalAmount: { amount: newTotalAmount, currencyCode },
          },
          merchandise: {
            ...item.merchandise,
            id: variant.id,
            title: variant.title || item.merchandise.title,
            selectedOptions: variant.selectedOptions,
          },
        };
      });

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
}

export function CartProvider({
  children,
  cartPromise,
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  return (
    <CartContext.Provider value={{ cartPromise }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const initialCart = use(context.cartPromise);
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    initialCart,
    cartReducer
  );

  const updateCartItem = (merchandiseId: string, updateType: UpdateType) => {
    updateOptimisticCart({
      type: "UPDATE_ITEM",
      payload: { merchandiseId, updateType },
    });
  };

  const addCartItem = (
    variant: ProductVariant,
    product: Product,
    quantity: number
  ) => {
    updateOptimisticCart({
      type: "ADD_ITEM",
      payload: { variant, product, quantity },
    });
  };

  const updateCartItemVariant = (
    lineId: string,
    variant: ProductVariant,
    product: Product
  ) => {
    updateOptimisticCart({
      type: "UPDATE_ITEM_VARIANT",
      payload: { lineId, variant, product },
    });
  };

  return useMemo(
    () => ({
      cart: optimisticCart,
      updateCartItem,
      addCartItem,
      updateCartItemVariant,
    }),
    [optimisticCart]
  );
}
