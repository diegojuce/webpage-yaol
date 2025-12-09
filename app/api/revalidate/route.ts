import crypto from "crypto";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

/**
 * Verify Shopify webhook HMAC using the app's API secret (SHOPIFY_WEBHOOK_SECRET).
 * Returns true when either:
 *  - No HMAC header is present (keeps backward compatibility for manual curls/tests), or
 *  - HMAC header is present AND matches the digest of the raw body with the secret.
 */
function verifyOptionalShopifyHmac(req: NextRequest, rawBody: string): boolean {
  const header = req.headers.get("x-shopify-hmac-sha256");
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  // If no header or no secret configured, skip strict validation (compatible with manual POSTs)
  if (!header || !secret) return true;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  // timingSafeEqual requires Buffers and same length
  const a = Buffer.from(header, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const raw = await req.text(); // important: read raw body BEFORE any parsing
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Simple query-secret gate (works for manual curl and Shopify)
  if (secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Optional HMAC verification (enforced only if Shopify sends header AND you set SHOPIFY_WEBHOOK_SECRET)
  if (!verifyOptionalShopifyHmac(req, raw)) {
    return new Response("Invalid HMAC", { status: 401 });
  }

  // Invalidate caches tagged for Shopify data
  // Next 15 requires a profile/config as second arg.
  // Use immediate expiration for on-demand invalidation.
  revalidateTag("products", { expire: 0 });
  revalidateTag("collections", { expire: 0 });

  // Optionally invalidate specific paths if needed (uncomment if you don't use tags everywhere)
  // revalidatePath("/");
  // revalidatePath("/productos");

  return Response.json({ revalidated: true });
}
