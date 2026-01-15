"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/shopify";
import { getRawProduct } from "lib/shopify/noCacheGetProduct";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function addItem(
  prevState: any,
  payload: { selectedVariantId: string | undefined; quantity: number }
) {
  console.debug("[actions][addItem] Payload:", payload);
  const { selectedVariantId } = payload;
  let { quantity } = payload;

  if (!selectedVariantId || quantity < 1) {
    return "Error al agregar el producto al carrito";
  }
  console.debug(
    "[actions][addItem] Adding to cart:",
    selectedVariantId,
    quantity
  );

  try {
    // Validate cartId from cookie; create one if missing/invalid.
    const isValidCartId = (id?: string) =>
      !!id && id.startsWith("gid://shopify/Cart/") && id.includes("?key=");

    let cartId = (await cookies()).get("cartId")?.value;
    let cart: import("lib/shopify/types").Cart | undefined;

    if (!isValidCartId(cartId)) {
      console.debug("[actions][addItem] Missing/invalid cartId cookie (", cartId, "). Creating cart...");
      const newCart = await createCart();
      cartId = newCart.id!; // Keep full id with ?key
      (await cookies()).set("cartId", cartId);
      console.debug("[actions][addItem] Created cart:", cartId);
      cart = newCart;
    } else {
      cart = await getCart();
    }

    // Si ya existe una línea con este variant en el carrito, actualizar su cantidad
    const existingLine = cart?.lines.find(
      (line) => line.merchandise.id === selectedVariantId
    );

    if (existingLine) {
      const handle = (existingLine.merchandise as any)?.product?.handle;
      let maxAvailable: number | undefined;

      // Preferir stock desde el backend propio
      if (handle) {
        const backendProduct = await getRawProduct(handle);
        const backendVariant = backendProduct?.variants.find(
          (variant) => variant.id === selectedVariantId
        );

        if (typeof backendVariant?.quantityAvailable === "number") {
          maxAvailable = backendVariant.quantityAvailable;
        }
      }

      // Si el backend no devolvió stock, usar el de Shopify como respaldo
      if (typeof maxAvailable !== "number") {
        const productAny = (existingLine.merchandise?.product ?? {}) as any;
        const edges = productAny?.variants?.edges ?? [];
        const variants = edges.map((e: any) => e.node);
        const currentVariant = variants.find(
          (variant: any) => variant.id === existingLine.merchandise.id
        );
        if (typeof currentVariant?.quantityAvailable === "number") {
          maxAvailable = currentVariant.quantityAvailable;
        }
      }

      let newQuantity = existingLine.quantity + quantity;

      if (typeof maxAvailable === "number") {
        if (maxAvailable <= 0) {
          newQuantity = 0;
        } else if (newQuantity > maxAvailable) {
          newQuantity = maxAvailable;
        }
      }

      if (newQuantity <= 0) {
        await removeFromCart([existingLine.id!]);
      } else if (newQuantity !== existingLine.quantity) {
        await updateCart([
          {
            id: existingLine.id!,
            merchandiseId: selectedVariantId,
            quantity: newQuantity,
          },
        ]);
      }
    } else {
      // Si no existe en el carrito, usar la lógica normal de Shopify
      await addToCart(
        [{ merchandiseId: selectedVariantId, quantity }],
        cartId
      ).then((r) => {
        console.debug("[actions][addItem] addToCart response:", r);
      });
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error al agregar el producto al carrito";
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error al obtener el carrito";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId
    );

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id]);
      revalidateTag(TAGS.cart);
    } else {
      return "Producto no encontrado en el carrito";
    }
  } catch (e) {
    return "Error al eliminar el producto del carrito";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  }
) {
  const { merchandiseId } = payload;
  let { quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error al obtener el carrito";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId
    );

    if (lineItem) {
      const handle = (lineItem.merchandise as any)?.product?.handle;
      let maxAvailable: number | undefined;

      // Preferir stock desde el backend propio
      if (handle) {
        const backendProduct = await getRawProduct(handle);
        const backendVariant = backendProduct?.variants.find(
          (variant) => variant.id === merchandiseId
        );

        if (typeof backendVariant?.quantityAvailable === "number") {
          maxAvailable = backendVariant.quantityAvailable;
        }
      }

      // Si el backend no devolvió stock, usar el de Shopify como respaldo
      if (typeof maxAvailable !== "number") {
        const productAny = (lineItem.merchandise?.product ?? {}) as any;
        const edges = productAny?.variants?.edges ?? [];
        const variants = edges.map((e: any) => e.node);
        const currentVariant = variants.find(
          (variant: any) => variant.id === lineItem.merchandise.id
        );
        if (typeof currentVariant?.quantityAvailable === "number") {
          maxAvailable = currentVariant.quantityAvailable;
        }
      }

      if (typeof maxAvailable === "number") {
        if (maxAvailable <= 0) {
          quantity = 0;
        } else if (quantity > maxAvailable) {
          quantity = maxAvailable;
        }
      }
    }

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
    return "Error al actualizar la cantidad del producto";
  }
}

export async function updateItemVariant(
  prevState: any,
  payload: {
    lineId: string;
    merchandiseId: string; // new variant id
  }
) {
  try {
    const cart = await getCart();
    if (!cart) {
      return "Error al obtener el carrito";
    }

    const lineItem = cart.lines.find((line) => line.id === payload.lineId);
    if (!lineItem) {
      return "Línea de producto no encontrada";
    }

    await updateCart([
      {
        id: lineItem.id!,
        merchandiseId: payload.merchandiseId,
        quantity: lineItem.quantity,
      },
    ]);

    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return "Error al actualizar la variante del producto";
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
