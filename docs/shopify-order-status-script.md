# Shopify thank-you → /agendar-cita auto-redirect

After the customer completes checkout, redirect them automatically to
`/agendar-cita?quote_id=X` so they can pick a time slot for the service they
just paid for. WhatsApp also gets the same link via the
`confirmacion_pedido` template, so this script is a UX shortcut, not the
single point of failure.

## Where to paste

Shopify admin → **Settings** → **Checkout** → **Order status page** →
**Additional scripts**.

## Script

```html
<script>
  (function () {
    try {
      var attrs =
        (window.Shopify && Shopify.checkout && Shopify.checkout.note_attributes) ||
        [];
      var entry = attrs.find(function (a) {
        return a.name === 'quote_id' || a.name === '_quote_id';
      });
      var quoteId = entry && entry.value;
      if (!quoteId) return;

      var url =
        'https://shop.yantissimo.com/agendar-cita?quote_id=' +
        encodeURIComponent(quoteId);

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

## How `quote_id` lands on `note_attributes`

The webhook `bypassYaol.post('/orders/paid')` creates the quote and writes
`yssm.quote_id` as a metafield on the order. But the metafield is **not**
exposed to the order status page JS — Shopify only surfaces
`Shopify.checkout.note_attributes`. To get `quote_id` onto note_attributes, we
have two paths:

1. **Webhook callback into Shopify (recommended once observed in prod):**
   inside `/orders/paid` handler, after creating the quote, call
   `orderUpdate` mutation and set `note_attributes` to include
   `{ name: 'quote_id', value: quote.id }`. This is the durable answer but
   adds another Shopify GraphQL call and depends on webhook latency.
2. **Pre-checkout seed (current behavior):** the storefront sets a
   `quote_id` cart attribute when one already exists (for example, after a
   quote was created elsewhere and the customer is closing it through the
   shop). For greenfield orders coming straight from the storefront, the
   webhook is the only writer, so the script above will silently no-op the
   first ~1-2s after checkout completes — WhatsApp covers that gap.

If the metafield write happens before the customer reaches the order status
page, an alternative is to fetch the metafield via the Storefront API from
the script. That requires an unauthenticated metafield read access scope and
is left as a follow-up.

## Acceptance check

1. Place a sandbox order with the storefront. Set the `note_attributes` of
   the order in Shopify admin → Orders → \[order\] → Edit → "Additional
   details" → add `quote_id` with a real id.
2. Open the order status page (the link in the order admin sidebar).
3. After ~1.5s the page should redirect to
   `https://shop.yantissimo.com/agendar-cita?quote_id=<id>`.
4. Remove the attribute and confirm the page no longer redirects.
