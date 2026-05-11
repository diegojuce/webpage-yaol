# Shopify thank-you → /agendar-cita auto-redirect

After the customer completes checkout, redirect them automatically to
`/agendar-cita?shopify_order_id=X`. The frontend exchanges that Shopify
order id for the internal `quote_id` via the `shopify_orders` bridge table
populated by the `/orders/paid` webhook. WhatsApp also gets a direct
`quote_id` link via the `confirmacion_pedido` template, so this script is
a UX shortcut, not the single point of failure.

## Where to paste

Shopify admin → **Settings** → **Checkout** → **Order status page** →
**Additional scripts**.

## Script

```html
<script>
  (function () {
    try {
      var orderId =
        window.Shopify && Shopify.checkout && Shopify.checkout.order_id;
      if (!orderId) return;

      var url =
        'https://shop.yantissimo.com/agendar-cita?shopify_order_id=' +
        encodeURIComponent(orderId);

      // Small delay so analytics/pixels still fire before navigation.
      setTimeout(function () {
        window.location.replace(url);
      }, 1500);
    } catch (e) {
      /* no-op: WhatsApp link is the fallback */
    }
  })();
</script>
```

## How the exchange works

1. `Shopify.checkout.order_id` is always populated on the order status
   page (it's the Shopify numeric order id), so the redirect never
   silently no-ops the way the previous `note_attributes`-based script
   did for greenfield orders.
2. `/agendar-cita` reads `?shopify_order_id=` and calls
   `GET /bypass/yaol/quote-by-shopify-order?shopify_order_id=<id>`.
3. That endpoint queries the `shopify_orders` bridge table
   (`shopify_order_id TEXT PK → quote_id BIGINT FK`) populated inside the
   `/orders/paid` webhook transaction.
4. On hit, the page rewrites the URL to `?quote_id=<id>` and continues
   with the normal registered-client flow.
5. If the webhook hasn't inserted yet (Shopify webhook latency), the page
   retries with the same backoff used elsewhere (1s, 2s, 4s, 8s, 16s —
   ~31s total) before surfacing `not_found`.

## Acceptance check

1. Place a real (or sandbox) order from the storefront.
2. After ~1.5s on the order status page, the browser should redirect to
   `https://shop.yantissimo.com/agendar-cita?shopify_order_id=<id>`.
3. The page should briefly show the `syncing` state and then settle on
   the registered-client form (URL rewrites to `?quote_id=<id>`).
4. If you reload the page while the webhook is still processing, the
   exchange retries automatically.
