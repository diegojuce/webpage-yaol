"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
  updateCartAttributes,
} from "lib/shopify";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const isValidCartId = (id?: string) =>
  !!id && id.startsWith("gid://shopify/Cart/") && id.includes("?key=");

export async function setCartIdFromParam(rawCartId?: string | null) {
  const cartId =
    rawCartId !== undefined && rawCartId !== null
      ? String(rawCartId).trim()
      : "";

  if (!isValidCartId(cartId)) {
    return { ok: false as const, error: "invalid_cart_id" as const };
  }

  (await cookies()).set("cartId", cartId);
  revalidateTag(TAGS.cart, { expire: 0 });
  return { ok: true as const };
}

export async function setCartAttributes(payload: {
  quoteId?: string | number | null;
  sucursal?: string | null;
}) {
  const quoteId =
    payload.quoteId !== undefined && payload.quoteId !== null
      ? String(payload.quoteId).trim()
      : "";
  const sucursal =
    payload.sucursal !== undefined && payload.sucursal !== null
      ? String(payload.sucursal).trim()
      : "";

  const attributes = [
    ...(quoteId ? [{ key: "quote_id", value: quoteId }] : []),
    ...(sucursal ? [{ key: "sucursal", value: sucursal }] : []),
  ];

  console.debug("[actions][setCartAttributes] Setting attributes:", attributes);
  if (!attributes.length) {
    console.warn(
      "[actions][setCartAttributes] No valid attributes to set, skipping."
    );
    return;
  }

  let cartId = (await cookies()).get("cartId")?.value;

  if (!isValidCartId(cartId)) {
    console.debug(
      "[actions][setCartAttributes] Missing/invalid cartId cookie (",
      cartId,
      "). Creating cart with attributes..."
    );
    const newCart = await createCart(attributes);
    cartId = newCart.id!;
    (await cookies()).set("cartId", cartId);
  } else {
    console.debug(
      "[actions][setCartAttributes] Updating cart attributes for cartId:",
      cartId
    );
    const res = await updateCartAttributes(attributes, cartId);
    console.debug(
      "[actions][setCartAttributes] updateCartAttributes response:",
      res
    );
  }

  revalidateTag(TAGS.cart, { expire: 0 });
}

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
    let cartId = (await cookies()).get("cartId")?.value;
    let cart: import("lib/shopify/types").Cart | undefined;

    if (!isValidCartId(cartId)) {
      console.debug(
        "[actions][addItem] Missing/invalid cartId cookie (",
        cartId,
        "). Creating cart..."
      );
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
      let maxAvailable: number | undefined;

      // Usar stock de Shopify desde el producto en el carrito
      const productAny = (existingLine.merchandise?.product ?? {}) as any;
      const edges = productAny?.variants?.edges ?? [];
      const variants = edges.map((e: any) => e.node);
      const currentVariant = variants.find(
        (variant: any) => variant.id === existingLine.merchandise.id
      );
      if (typeof currentVariant?.quantityAvailable === "number") {
        maxAvailable = currentVariant.quantityAvailable;
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

    revalidateTag(TAGS.cart, { expire: 0 });
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
      revalidateTag(TAGS.cart, { expire: 0 });
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
    lineId?: string;
    merchandiseId?: string;
    updateType: "plus" | "minus";
  }
) {
  const { lineId, merchandiseId, updateType } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error al obtener el carrito";
    }

    const lineItem = lineId
      ? cart.lines.find((line) => line.id === lineId)
      : merchandiseId
        ? cart.lines.find((line) => line.merchandise.id === merchandiseId)
        : undefined;
    if (!lineItem) {
      return "Producto no encontrado en el carrito";
    }
    if (!lineItem.id) {
      return "Producto no encontrado en el carrito";
    }

    const productAny = (lineItem.merchandise?.product ?? {}) as any;
    const edges = productAny?.variants?.edges ?? [];
    const variants = edges.map((e: any) => e.node);
    const currentVariant = variants.find(
      (variant: any) => variant.id === lineItem.merchandise.id
    );
    const maxAvailable =
      typeof currentVariant?.quantityAvailable === "number"
        ? currentVariant.quantityAvailable
        : undefined;

    let quantity =
      updateType === "plus" ? lineItem.quantity + 1 : lineItem.quantity - 1;

    if (updateType === "plus" && typeof maxAvailable === "number") {
      if (maxAvailable <= 0) {
        quantity = 0;
      } else if (quantity > maxAvailable) {
        quantity = maxAvailable;
      }
    }

    if (quantity <= 0) {
      await removeFromCart([lineItem.id!]);
    } else {
      await updateCart([
        {
          id: lineItem.id!,
          merchandiseId: lineItem.merchandise.id,
          quantity,
        },
      ]);
    }

    revalidateTag(TAGS.cart, { expire: 0 });
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

    revalidateTag(TAGS.cart, { expire: 0 });
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
