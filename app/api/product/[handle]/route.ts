import { NextResponse } from "next/server";
import { getProduct } from "lib/shopify";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const match = url.pathname.match(/\/api\/product\/(.+)$/);
    const handle = match?.[1] ? decodeURIComponent(match[1]) : undefined;
    if (!handle) {
      return NextResponse.json({ error: "Missing handle" }, { status: 400 });
    }

    const product = await getProduct(handle);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
