import { NextResponse } from "next/server";
import { createCartWithLines } from "lib/shopify";

type IncomingLine = {
  variantId?: string;
  merchandiseId?: string;
  quantity?: number;
  sellingPlanId?: string;
};

function normalizeLines(lines: IncomingLine[]) {
  return lines.map((line, index) => {
    const merchandiseId = line.variantId || line.merchandiseId;
    const quantity = Number(line.quantity);

    if (!merchandiseId) {
      throw new Error(`Missing variantId/merchandiseId at index ${index}`);
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Quantity must be > 0 at index ${index}`);
    }

    return {
      merchandiseId,
      quantity,
      ...(line.sellingPlanId ? { sellingPlanId: line.sellingPlanId } : {}),
    };
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lines = Array.isArray(body?.lines) ? body.lines : [];

    if (!lines.length) {
      return NextResponse.json(
        { error: "lines array required" },
        { status: 400 },
      );
    }

    const normalized = normalizeLines(lines);
    const { cart, checkoutUrl } = await createCartWithLines(normalized);

    return NextResponse.json({
      checkoutUrl,
      cartId: cart.id,
      totalQuantity: cart.totalQuantity,
      lines: cart.lines,
    });
  } catch (error) {
    console.error("[api/test-checkout] Failed to create checkout", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}
