"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/shopify";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function addItem(
  prevState: any,
  payload: { selectedVariantId: string | undefined; quantity: number },
) {
  const { selectedVariantId, quantity } = payload;

  if (!selectedVariantId || quantity < 1) {
    return "Error adding item to cart";
  }

  try {
    await addToCart([{ merchandiseId: selectedVariantId, quantity }]);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error adding item to cart";
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id]);
      revalidateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  },
) {
  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }]);
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout() {
  let cart = await getCart();
  redirect(cart!.checkoutUrl);
}

export async function createCartAndSetCookie() {
  let cart = await createCart();
  (await cookies()).set("cartId", cart.id!);
}


// switch (sucursal) {
//   case 'tec':
//     addItem(null, {selectedVariantId: "gid://shopify/ProductVariant/45765059444935", quantity: 1})
//     break;
//   case 'bjz':
//     addItem(null, {selectedVariantId: "gid://shopify/ProductVariant/45765059477703", quantity: 1})
//     break;
//   case 'con':
//     addItem(null, {selectedVariantId: "gid://shopify/ProductVariant/45765059510471", quantity: 1})
//     break;
//   case 'nhs':
//     addItem(null, {selectedVariantId: "gid://shopify/ProductVariant/45765059543239", quantity: 1})
//     break;
//   case 'rey':
//     addItem(null, {selectedVariantId: "gid://shopify/ProductVariant/45765059576007", quantity: 1})
//     break;
//   case 'man':
//     addItem(null, {selectedVariantId: "gid://shopify/ProductVariant/45765059608775", quantity: 1})
//     break;
//   case 'tap':
//     addItem(null, {selectedVariantId: "gid://shopify/ProductVariant/45765059641543", quantity: 1})
//     break;
// }
