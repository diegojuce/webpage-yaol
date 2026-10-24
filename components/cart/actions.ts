"use server";
import { cartLineVariants } from "lib/commerce/variant-utils";

import {
  COMMERCE_DISABLED_MESSAGE,
  COMMERCE_ENABLED,
  COMMERCE_PROVIDER,
} from "lib/commerce-status";
import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  getOrderBySession,
  getProductFresh,
  isValidCartId,
  removeFromCart,
  ShopApiError,
  startCheckout as startNativeCheckout,
  updateCart,
  updateCartAttributes,
} from "lib/commerce";
import { revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// cartId cookie: persistente para que el cart sobreviva refreshes y entre
// sesiones del mismo navegador. El regreso del pago NO depende de esta
// cookie: Stripe regresa a /agendar-cita?session_id=… y el pedido se busca
// por la sesión.
const CART_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  httpOnly: true,
};

export async function setCartIdFromParam(rawCartId?: string | null) {
  if (!COMMERCE_ENABLED) {
    return { ok: false as const, error: "invalid_cart_id" as const };
  }

  const cartId =
    rawCartId !== undefined && rawCartId !== null
      ? String(rawCartId).trim()
      : "";

  if (!isValidCartId(cartId)) {
    return { ok: false as const, error: "invalid_cart_id" as const };
  }

  (await cookies()).set("cartId", cartId, CART_COOKIE_OPTIONS);
  revalidateTag(TAGS.cart, { expire: 0 });
  return { ok: true as const };
}

export async function setCartAttributes(payload: {
  quoteId?: string | number | null;
  sucursal?: string | null;
  sucursalCode?: string | null;
  phone?: string | null;
}) {
  if (!COMMERCE_ENABLED) {
    return;
  }

  const quoteId =
    payload.quoteId !== undefined && payload.quoteId !== null
      ? String(payload.quoteId).trim()
      : "";
  // The cart attribute `sucursal` always travels as the uppercase 3-letter
  // backend code (e.g. "CON", "TEC"). Prefer `sucursalCode` when provided;
  // fall back to `sucursal` (assumed to already be a code, since UI callers
  // resolve via backendBranchCode).
  const rawSucursalCode =
    payload.sucursalCode !== undefined && payload.sucursalCode !== null
      ? String(payload.sucursalCode).trim()
      : payload.sucursal !== undefined && payload.sucursal !== null
        ? String(payload.sucursal).trim()
        : "";
  const sucursal = rawSucursalCode.toUpperCase();
  const phone =
    payload.phone !== undefined && payload.phone !== null
      ? String(payload.phone).trim()
      : "";

  const attributes = [
    ...(quoteId ? [{ key: "quote_id", value: quoteId }] : []),
    ...(sucursal ? [{ key: "sucursal", value: sucursal }] : []),
    ...(phone ? [{ key: "telefono", value: phone }] : []),
  ];

  console.debug("[actions][setCartAttributes] Setting attributes:", attributes);
  if (!attributes.length) {
    console.warn(
      "[actions][setCartAttributes] No valid attributes to set, skipping.",
    );
    return;
  }

  let cartId = (await cookies()).get("cartId")?.value;

  // Un carrito que expiró o ya se pagó cuenta como inexistente.
  if (isValidCartId(cartId) && !(await getCart())) {
    cartId = undefined;
  }

  if (!isValidCartId(cartId)) {
    console.debug(
      "[actions][setCartAttributes] Missing/invalid cartId cookie (",
      cartId,
      "). Creating cart with attributes...",
    );
    const newCart = await createCart(attributes);
    cartId = newCart.id!;
    (await cookies()).set("cartId", cartId, CART_COOKIE_OPTIONS);
  } else {
    console.debug(
      "[actions][setCartAttributes] Updating cart attributes for cartId:",
      cartId,
    );
    const res = await updateCartAttributes(attributes, cartId);
    console.debug(
      "[actions][setCartAttributes] updateCartAttributes response:",
      res,
    );
  }

  revalidateTag(TAGS.cart, { expire: 0 });
}

export async function addItem(
  prevState: any,
  payload: { selectedVariantId: string | undefined; quantity: number },
) {
  if (!COMMERCE_ENABLED) {
    return COMMERCE_DISABLED_MESSAGE;
  }

  console.debug("[actions][addItem] Payload:", payload);
  const { selectedVariantId } = payload;
  let { quantity } = payload;

  if (!selectedVariantId || quantity < 1) {
    return "Error al agregar el producto al carrito";
  }
  console.debug(
    "[actions][addItem] Adding to cart:",
    selectedVariantId,
    quantity,
  );

  try {
    // Validate cartId from cookie; create one if missing/invalid.
    let cartId = (await cookies()).get("cartId")?.value;
    let cart: import("lib/commerce/types").Cart | undefined;

    if (!isValidCartId(cartId)) {
      console.debug(
        "[actions][addItem] Missing/invalid cartId cookie (",
        cartId,
        "). Creating cart...",
      );
      const newCart = await createCart();
      cartId = newCart.id!; // Keep full id with ?key
      (await cookies()).set("cartId", cartId, CART_COOKIE_OPTIONS);
      console.debug("[actions][addItem] Created cart:", cartId);
      cart = newCart;
    } else {
      cart = await getCart();
      // Cookie de un carrito que expiró o ya se pagó: se empieza uno nuevo.
      if (!cart) {
        const newCart = await createCart();
        cartId = newCart.id!;
        (await cookies()).set("cartId", cartId, CART_COOKIE_OPTIONS);
        cart = newCart;
      }
    }

    // Si ya existe una línea con este variant en el carrito, actualizar su cantidad
    const existingLine = cart?.lines.find(
      (line) => line.merchandise.id === selectedVariantId,
    );

    if (existingLine) {
      let maxAvailable: number | undefined;

      // Usar stock de Shopify desde el producto en el carrito
      const productAny = (existingLine.merchandise?.product ?? {}) as any;
      const variants = cartLineVariants(productAny);
      const currentVariant = variants.find(
        (variant: any) => variant.id === existingLine.merchandise.id,
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
        cartId,
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
  if (!COMMERCE_ENABLED) {
    return COMMERCE_DISABLED_MESSAGE;
  }

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error al obtener el carrito";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
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
  },
) {
  if (!COMMERCE_ENABLED) {
    return COMMERCE_DISABLED_MESSAGE;
  }

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
    const variants = cartLineVariants(productAny);
    const currentVariant = variants.find(
      (variant: any) => variant.id === lineItem.merchandise.id,
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
  },
) {
  if (!COMMERCE_ENABLED) {
    return COMMERCE_DISABLED_MESSAGE;
  }

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
  if (!COMMERCE_ENABLED) {
    return;
  }

  let cart = await getCart();
  redirect(cart!.checkoutUrl);
}

export type UnavailableCartItem = {
  title: string;
  requested: number;
  available: number;
};

export type ValidateCartAvailabilityResult =
  | { ok: true; checkoutUrl: string }
  | {
      ok: false;
      error: "empty_cart" | "unavailable" | "error";
      unavailableItems: UnavailableCartItem[];
    };

// Last-mile validation before checkout: re-fetches each product in the cart
// from the backend and verifies the binary sufficientStock flag.
export async function validateCartAvailability(): Promise<ValidateCartAvailabilityResult> {
  if (!COMMERCE_ENABLED) {
    return { ok: false, error: "error", unavailableItems: [] };
  }

  try {
    const cart = await getCart();

    if (!cart || cart.lines.length === 0) {
      return { ok: false, error: "empty_cart", unavailableItems: [] };
    }

    // Fetch fresh availability once per unique handle.
    const handles = Array.from(
      new Set(cart.lines.map((line) => line.merchandise.product.handle)),
    );

    const freshEntries = await Promise.all(
      handles.map(async (handle) => {
        try {
          const quantityForHandle = cart.lines
            .filter((line) => line.merchandise.product.handle === handle)
            .reduce((sum, line) => sum + line.quantity, 0);
          console.debug(
            `[validateCartAvailability] Fetching fresh product for handle: ${handle} (total quantity in cart: ${quantityForHandle})`,
          );
          const product = await getProductFresh(handle, quantityForHandle);
          return [handle, product?.sufficientStock === true] as const;
        } catch (e) {
          console.error(
            "[actions][validateCartAvailability] getProductFresh failed for",
            handle,
            e,
          );
          return [handle, false] as const;
        }
      }),
    );
    const sufficientStockByHandle = new Map(freshEntries);

    const unavailableItems: UnavailableCartItem[] = [];

    for (const line of cart.lines) {
      const handle = line.merchandise.product.handle;
      const hasSufficientStock = sufficientStockByHandle.get(handle) === true;
      const productTitle = line.merchandise.product.title;
      const variantLabel =
        line.merchandise.title && line.merchandise.title !== "Default Title"
          ? `${productTitle} (${line.merchandise.title})`
          : productTitle;

      if (!hasSufficientStock) {
        unavailableItems.push({
          title: variantLabel,
          requested: line.quantity,
          available: 0,
        });
      }
    }

    if (unavailableItems.length > 0) {
      return { ok: false, error: "unavailable", unavailableItems };
    }

    return { ok: true, checkoutUrl: cart.checkoutUrl };
  } catch (e) {
    console.error("[actions][validateCartAvailability] error:", e);
    return { ok: false, error: "error", unavailableItems: [] };
  }
}

// Origen del sitio (preview, producción o local) al que Stripe regresa.
async function returnOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export type StartCheckoutResult =
  | { ok: true; url: string }
  | {
      ok: false;
      error: "empty_cart" | "unavailable" | "missing_phone" | "missing_branch" | "error";
      message?: string;
      unavailableItems: UnavailableCartItem[];
    };

// "Completar pago": con el carrito nativo el backend valida stock, aparta
// las piezas y abre Stripe Checkout; con Shopify (legado) se valida y se usa
// su checkoutUrl.
export async function startCheckout(): Promise<StartCheckoutResult> {
  if (!COMMERCE_ENABLED) {
    return { ok: false, error: "error", message: COMMERCE_DISABLED_MESSAGE, unavailableItems: [] };
  }

  if (COMMERCE_PROVIDER !== "native") {
    const result = await validateCartAvailability();
    return result.ok ? { ok: true, url: result.checkoutUrl } : result;
  }

  try {
    const session = await startNativeCheckout(await returnOrigin());
    return { ok: true, url: session.url };
  } catch (e) {
    if (!(e instanceof ShopApiError)) {
      console.error("[actions][startCheckout] error:", e);
      return { ok: false, error: "error", unavailableItems: [] };
    }
    switch (e.code) {
      case "SIN_EXISTENCIA": {
        const cart = await getCart().catch(() => undefined);
        const requested = (sku: string) =>
          (cart?.lines ?? [])
            .filter((l) => l.merchandise.product.handle === sku)
            .reduce((sum, l) => sum + l.quantity, 0);
        revalidateTag(TAGS.cart, { expire: 0 });
        return {
          ok: false,
          error: "unavailable",
          message: e.message,
          unavailableItems: (e.lines ?? []).map((l) => ({
            title: l.title,
            requested: requested(l.sku),
            available: l.quantityAvailable,
          })),
        };
      }
      case "FALTA_TELEFONO":
        return { ok: false, error: "missing_phone", message: e.message, unavailableItems: [] };
      case "FALTA_SUCURSAL":
        return { ok: false, error: "missing_branch", message: e.message, unavailableItems: [] };
      case "CARRITO_VACIO":
      case "CARRITO_NO_ENCONTRADO":
      case "CARRITO_CERRADO":
        revalidateTag(TAGS.cart, { expire: 0 });
        return { ok: false, error: "empty_cart", unavailableItems: [] };
      default:
        console.error("[actions][startCheckout]", e.status, e.code, e.message);
        return {
          ok: false,
          error: "error",
          message: e.status < 500 ? e.message : undefined,
          unavailableItems: [],
        };
    }
  }
}

// Regreso de Stripe (/agendar-cita?session_id=…): estado del pedido. null si
// la sesión no existe (o no es del proveedor nativo).
export async function lookupCheckoutSession(sessionId: string) {
  if (COMMERCE_PROVIDER !== "native") return null;
  try {
    return (await getOrderBySession(sessionId)) ?? null;
  } catch (e) {
    console.error("[actions][lookupCheckoutSession]", e);
    throw new Error("No se pudo consultar el pago");
  }
}

export async function createCartAndSetCookie() {
  if (!COMMERCE_ENABLED) {
    return;
  }

  let cart = await createCart();
  (await cookies()).set("cartId", cart.id!, CART_COOKIE_OPTIONS);
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
