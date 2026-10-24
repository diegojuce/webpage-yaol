# Plan de migración: Shopify → commerce nativo + Stripe

> Documento vivo. Se actualiza conforme se ejecuta cada fase: marcar tareas
> con `[x]`, registrar decisiones en la sección de cada fase y agregar
> entradas en la **Bitácora** al final.

- **Inicio del plan:** 2026-10-12
- **Repos involucrados:** este frontend (`commerce-main`, Next.js 15) y el
  backend (`jfzepeda/yssm-backend`, clonado en `../yssm-backend`). El trabajo
  del backend va en la rama **`diego-stripe`**, creada desde `staging`.
- **Backend:** Express 4 ESM + PostgreSQL. Migraciones a mano en
  `src/sql/00NN_*.sql`. Leer su `CLAUDE.md` antes de tocarlo (rutas bypass,
  `withTransaction` con `synchronousCommit: 'on'` para dinero y stock,
  `emitDelta` para movimientos de stock, `accesosCatalogo`).
- **Ojo con los nombres:** `orders` y `order_items` ya existen en el backend
  (vistas de `pedidos_mayoreo`). Las tablas nuevas del plan llevan el prefijo
  `shop_` (`shop_carts`, `shop_cart_items`, `shop_orders`, `shop_order_items`,
  `shop_stock_reservations`, `stripe_events`).
- Los tiempos asumen un desarrollador de tiempo completo que conoce el código.

## Estado general

| Fase | Entregable | Tiempo aprox. | ¿Se puede vender? | Estado |
|---|---|---|---|---|
| 0 | Seguridad, cuenta Stripe e interruptor | 2–3 días | No | ✅ Terminada |
| 1 | `lib/commerce` y sitio sin Shopify | 1 sem | No (catálogo sí) | ✅ Terminada (en staging; merge a `main` pendiente) |
| 2 | Carrito propio | 1.5–2 sem | No | ✅ Terminada (en staging) |
| 3 | Checkout Stripe, webhook y cita | 2–3 sem | **Sí, con tarjeta** | ⬜ Pendiente |
| 4 | CFDI 4.0 | 1.5–2 sem | Sí, con factura | ⬜ Pendiente |
| 5 | MSI, OXXO, SPEI, reembolsos, carritos abandonados | 2–3 sem | Sí, completo | ⬜ Pendiente |
| 6 | Producción y retiro de Shopify | 1 sem | — | ⬜ Pendiente |

Leyenda: ⬜ Pendiente · 🟨 En curso · ✅ Terminada · ⛔ Bloqueada

**Total aproximado: 9–13 semanas.** Al terminar la Fase 3 ya se puede vender.

---

## Punto de partida (2026-10-12)

| Función | Fuente actual |
|---|---|
| Catálogo: `getProducts`, `getProduct`, `getCategoryProducts`, `getCollectionProducts` | Backend propio (`/bypass/shopify/...`), con el formato de Shopify |
| Carrito: crear, agregar, actualizar, quitar, atributos (`lib/shopify/index.ts`) | Shopify Storefront API |
| Checkout y pago (`checkoutUrl` en `components/cart/modal.tsx`) | Shopify |
| Menús, páginas, colecciones, recomendaciones | Shopify |
| Ligar el pago con la cita: webhook `orders/paid` → tabla `shopify_orders` → `quote_id` → `/agendar-cita` | Shopify y backend |

- Shopify está suspendido. El carrito está apagado con
  `NEXT_PUBLIC_COMMERCE_ENABLED` (`lib/commerce-status.ts`).
- El token del backend está escrito directo en el código y subido al
  repositorio (`lib/shopify/index.ts`, `lib/shopify/noCacheGetProduct.ts`).

---

## Fase 0 · Preparación (2–3 días)

**Objetivo:** dejar lista la base sin tocar todavía el flujo de compra.

### Tareas

- [x] Mover `X-Backend-bearer-token` a la variable de servidor
      `BACKEND_API_TOKEN`, sin prefijo `NEXT_PUBLIC_`
      (`lib/shopify/index.ts`, `lib/shopify/noCacheGetProduct.ts`).
- [x] Cambiar el token en el backend por uno nuevo (el actual sigue en el
      historial de git).
- [x] Crear la cuenta de Stripe en México, verificar la empresa y conectar
      la cuenta bancaria en MXN. *(Cuenta creada; verificación y CLABE
      pendientes, se necesitan hasta la Fase 6.)*
- [x] Activar el modo de prueba e instalar la Stripe CLI para recibir
      webhooks en local.
- [ ] Variables del backend: `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`.
      *(Agregadas en staging el 2026-10-12; seguimiento en la Fase 3.)*
- [x] ~~Variable del frontend, solo si se usa el Payment Element:~~ No aplica
      en el MVP (Stripe Checkout alojado).
      `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- [x] Convertir `COMMERCE_ENABLED` en
      `COMMERCE_PROVIDER = "off" | "shopify" | "native"`.

**Regla:** la llave secreta de Stripe vive únicamente en el backend.

### Notas y decisiones

- El backend autentica con `Authorization: Bearer <TOKEN_YAOL>` (no con
  `X-Backend-bearer-token`). El frontend manda ese header con el valor de
  `BACKEND_API_TOKEN`, que es el mismo `TOKEN_YAOL` de producción.
- Se reportó al backend: en el código compartido el middleware de auth está
  en `bypassInv` (no definido en ese archivo) y `bypassShopify` no tiene
  auth; además `getProducts` usa `res` fuera de alcance.
- Interruptor: `NEXT_PUBLIC_COMMERCE_PROVIDER` (`off` por default). Si no
  existe y `NEXT_PUBLIC_COMMERCE_ENABLED=true`, se toma `shopify`.
  `COMMERCE_ENABLED` (UI) = proveedor ≠ off; `SHOPIFY_ENABLED` (llamadas a
  Shopify en `lib/shopify`) = proveedor = shopify.
- Se empieza con las llaves de prueba de Stripe sin esperar la verificación
  de la cuenta (solo se necesita para cobrar en real, Fase 6).

---

## Fase 1 · Separar el sitio de Shopify (1 semana)

**Objetivo:** que ningún componente importe de `lib/shopify`.

### Tareas: frontend

- [x] Crear `lib/commerce/types.ts` con `Product`, `Variant`, `Cart`,
      `CartLine`, `Money` y `Order` propios, con IDs simples (SKU o UUID) y
      precios en **centavos enteros**.
- [x] Crear `lib/commerce/index.ts` con el mismo contrato que hoy
      (`getProduct`, `getProducts`, `getCart`, `addToCart`…). Por dentro
      elige el adaptador según `COMMERCE_PROVIDER`.
- [x] `lib/commerce/providers/shopify.ts`: mover aquí el código actual
      (temporal).
- [x] `lib/commerce/providers/native.ts`: adaptador que llama al backend.
- [x] Cambiar los ~30 imports de `lib/shopify` a `lib/commerce`.
- [x] `getMenu` en `components/layout/navbar/index.tsx` → menú fijo en
      `lib/constants.ts`.
- [x] `getPage` en `app/[page]` → borrarlo o servirlo desde el backend (las
      políticas ya viven en `app/(doc)`).
- [x] `getCollections`, `getCollection` y `getProductRecommendations` →
      endpoints del backend.

### Tareas: backend

- [x] Que `/get/products`, `/get/category` y `/get/product` respondan
      **sin** el formato de Shopify (sin `edges/node` ni `gid://`). Mantener
      `/bypass/shopify/*` un tiempo para no romper nada.

### Listo cuando

El sitio navega igual con `COMMERCE_PROVIDER=off` y
`grep -r "lib/shopify" app components` no devuelve nada.

### Notas y decisiones

- **Backend** (rama `diego-stripe`, commit d522ce2): nuevo router
  `/bypass/shop` (GET, `TOKEN_YAOL` con timingSafeEqual, fail-closed):
  `/products?q&sort&reverse`, `/products/:handle`,
  `/products/:handle/recommendations` (misma medida y rin),
  `/products/:handle/availability?quantity`, `/categories/:kind/:value`,
  `/brands`, `/brands/:handle/products`. Precios en centavos, id = handle =
  sku = `inv-<id>`. `/bypass/shopify` sigue montado. 17 pruebas en
  `tests/shop.test.js`.
- **Frontend**: el catálogo siempre sale de `providers/native.ts`; el carrito
  depende de `COMMERCE_PROVIDER` (con `native` aún no hay carrito: Fase 2).
- **Decisión:** `Money.amount` sigue siendo string en pesos en la UI (así se
  muestra). Los cálculos de dinero se hacen en el backend en centavos.
- **Decisión:** una llanta = un SKU, sin variantes. Las dos variantes de
  Shopify ("Recoger en sucursal" / "Envío a domicilio") desaparecen de la
  página de producto; esa elección pasa al carrito en la Fase 2.
- Colecciones = marcas con existencia (`/brands`); aparecen en el filtro de
  búsqueda y en el sitemap.
- Se borraron `app/[page]` (las políticas viven en `app/(doc)`) y
  `app/api/test-checkout` (endpoint público de prueba de Shopify). El
  sitemap lista las páginas fijas del sitio.
- **Orden de despliegue:** primero el backend con `/bypass/shop` en el
  ambiente al que apunta `NEXT_PUBLIC_BACKEND_URL`; después el merge del
  frontend a `main`. Si no, el catálogo sale vacío.
- **Vercel:** Preview y Development apuntan a `https://stg-back.yantissimo.com`;
  Production a `https://back.yantissimo.com`. `BACKEND_API_TOKEN` en los tres.
- **Verificado en preview (2026-10-15):** búsqueda, producto con
  recomendaciones, marca, las 4 categorías y sitemap (850 URLs).
- **Datos sucios en `inventario.marca`:** errores de captura (CONNTINENTAL,
  CONTIENTAL, MICHELLIN, ROADSHiNE) y valores que no son marca (14C, 89H,
  BPB200, LT, QH505, FCR-T, BDR-HG). Corregir en el ERP.
- **Decisión (2026-10-15):** el filtro de búsqueda muestra todas las marcas
  con existencia, tal cual, mientras el ERP limpia los datos.
- `tests/accesosCobertura.test.js` del backend ya fallaba antes (falta
  `docs/autorizacion/endpoints.json` en el repo).

---

## Fase 2 · Carrito propio (1.5–2 semanas)

### Modelo de datos (backend)

```sql
shop_carts (                          -- migración 0154_shop_carritos.sql
  id UUID PK, status TEXT,            -- active | converted | abandoned
  customer_phone TEXT NULL, branch_code TEXT NULL, quote_id BIGINT NULL,
  created_at, updated_at, expires_at  -- expira 30 días después del último cambio
)
shop_cart_items (
  id UUID PK, cart_id FK, sku TEXT,   -- sku = inv-<inventario.id>
  fulfillment TEXT,                   -- install | delivery (por renglón)
  quantity INT,
  UNIQUE(cart_id, sku, fulfillment)
)
```

El carrito **no guarda precios**. Los precios se calculan al leerlo.

### Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/bypass/shop/carts` | Crea un carrito y devuelve su `id` |
| GET | `/bypass/shop/carts/:id` | Devuelve el carrito con precios y stock actuales y sus totales |
| POST | `/bypass/shop/carts/:id/items` | `{sku, quantity, fulfillment}`; suma si ya está, con tope según el stock del SKU |
| PATCH | `/bypass/shop/carts/:id/items/:itemId` | `{quantity?, fulfillment?}`; 0 quita el renglón; cambiar la entrega funde renglones |
| DELETE | `/bypass/shop/carts/:id/items/:itemId` | Quita el renglón |
| PATCH | `/bypass/shop/carts/:id` | Sucursal, teléfono, `quote_id` (sustituye a `updateCartAttributes`) |

### Reglas

- Precio e IVA se calculan **siempre en el servidor**, con el precio de
  lista que ya incluye IVA del 16%. Guardar subtotal sin IVA, IVA y total
  (se necesitan para facturar).
- Stock disponible = stock de la sucursal o almacén − apartados vigentes
  (Fase 3).

### Tareas

- [x] Backend: migraciones de `carts` y `cart_items`. *(0154, escrita; falta aplicarla en STG.)*
- [x] Backend: endpoints `/shop/carts*`. *(commit 7044651, 14 pruebas.)*
- [x] Frontend, `components/cart/actions.ts`: la cookie `cartId` pasa a ser
      un UUID (sigue `httpOnly`), `isValidCartId` valida UUID y las acciones
      llaman a `lib/commerce`.
- [x] Frontend, `components/cart/cart-context.tsx`: adaptar a los tipos
      nuevos y mantener la actualización inmediata en pantalla.
- [x] Frontend, `add-to-cart.tsx` y `modal.tsx`: ajustar tipos (el
      checkout se toca en la Fase 3).

### Listo cuando

Con `COMMERCE_PROVIDER=native` se puede agregar, editar y quitar productos,
el carrito sobrevive a un refresh y no deja pasar del stock.

### Notas y decisiones

- **Decisión (2026-10-15):** la entrega se elige por renglón, igual que con
  Shopify: "Instalar en sucursal" o "Envío a domicilio". En la UI son dos
  variantes por llanta con id `inv-<id>:install` / `inv-<id>:delivery`; el
  backend guarda `fulfillment` en el renglón. Si hay renglones con envío,
  Stripe pedirá la dirección en la Fase 3.
- El stock se topa por SKU sumando ambos tipos de entrega; tope de 20 piezas
  por SKU. Si el stock cae después de agregar, el renglón queda marcado
  (`exceedsStock` / `available: false`) y fuera del total.
- IVA: `subtotalCents = round(total / 1.16)`, `taxCents = total − subtotal`.
- Con `COMMERCE_PROVIDER=native` el modal ya no pre-crea un carrito por visita:
  se crea al agregar el primer producto o al guardar sucursal/teléfono. Si la
  cookie apunta a un carrito expirado o pagado, se crea uno nuevo.
- El botón de pago muestra "disponible muy pronto" hasta la Fase 3.
- **Preview:** `NEXT_PUBLIC_COMMERCE_PROVIDER=native` solo en Preview de
  Vercel. La 0154 ya está aplicada en STG y el carrito está en `staging`.
- **Verificado en navegador (2026-10-23, Playwright contra el preview):**
  agregar desde producto con "Envío a domicilio", wizard de teléfono y
  sucursal (se guardan en el carrito), cambiar la entrega desde el carrito,
  `+` topado al stock (2), el carrito sobrevive a un refresh y la cookie es
  httpOnly con UUID. El backend tiene exactamente lo que muestra la UI.
- **Bug corregido:** el toast de bienvenida (`duration: Infinity`) tapaba el
  botón "Continuar al carrito" del wizard y, por el modal, no se podía
  cerrar. Ahora se descarta al agregar al carrito.
- **Pendiente aparte:** el mapa del wizard de sucursal muestra "API KEY
  REQUIRED" (mapa base de Carto sin llave).

---

## Fase 3 · Checkout con Stripe: el MVP vendible (2–3 semanas)

### Modelo de datos

```sql
orders (
  id BIGSERIAL PK, cart_id FK, quote_id BIGINT NULL,
  status TEXT,  -- pending_payment | paid | cancelled | expired | refunded | partially_refunded
  customer_name, customer_phone, customer_email, branch_code,
  subtotal_cents, tax_cents, total_cents, currency DEFAULT 'MXN',
  stripe_checkout_session_id TEXT UNIQUE, stripe_payment_intent_id TEXT UNIQUE,
  paid_at, created_at
)
order_items (
  order_id FK, sku, title, quantity,
  unit_price_cents, unit_tax_cents        -- precio congelado al comprar
)
stock_reservations (
  id PK, order_id FK, sku, branch_code, quantity,
  expires_at, status                       -- active | consumed | released
)
stripe_events (event_id TEXT PK, type, processed_at)   -- evita procesar un evento dos veces
```

### Flujo de pago

```
[Modal] "Completar pago"
   → server action startCheckout()
   → POST /shop/checkout { cart_id, nombre, teléfono, email, sucursal }
        backend, dentro de una transacción:
        1. Recalcula precios y valida stock (reemplaza validateCartAvailability)
        2. Crea order (pending_payment) + order_items
        3. Crea stock_reservations (expires_at = ahora + 30 min)
        4. Crea la sesión de Stripe Checkout:
             mode=payment, currency=mxn, line_items con unit_amount en centavos
             metadata.order_id, client_reference_id=order_id
             expires_at = ahora + 30 min
             success_url = /agendar-cita?session_id={CHECKOUT_SESSION_ID}
             cancel_url  = /?cart=open
        5. Devuelve session.url
   → window.location.href = url

[Stripe] → POST /webhooks/stripe   (firma verificada con STRIPE_WEBHOOK_SECRET)
   checkout.session.completed (payment_status=paid):
        - Si el event_id ya está en stripe_events → responde 200 y no hace nada
        - order → paid, reservas → consumed, se descuenta el stock
        - Crea la cotización con sus partidas (lo que hoy hace orders/paid) → order.quote_id
        - Carrito → converted
        - Envía la plantilla de WhatsApp confirmacion_pedido
   checkout.session.expired:
        - order → expired, reservas → released

[Regreso] /agendar-cita?session_id=cs_...
   → GET /shop/orders/by-session/:session_id → { status, quote_id }
   → Si sigue en pending_payment: reintentos cortos (el webhook suele tardar segundos)
```

### Decisiones tomadas

- **Stripe Checkout (página alojada por Stripe)** para el MVP: menos
  código, 3D Secure y obligaciones mínimas de seguridad de tarjetas. El
  Payment Element embebido puede llegar después.
- Un pedido **solo** se marca como pagado desde el webhook, nunca desde el
  `success_url`.
- Precios en centavos enteros en todo el sistema.

### Tareas: backend

- [x] Variables del backend: `STRIPE_SECRET_KEY` (sk_test) y
      `STRIPE_WEBHOOK_SECRET` (traída de la Fase 0). *(Agregadas en staging el
      2026-10-12; el webhook secret se llena al crear el endpoint.)*
- [ ] Migraciones de `orders`, `order_items`, `stock_reservations` y
      `stripe_events`.
- [ ] `POST /shop/checkout`.
- [ ] `POST /webhooks/stripe` con verificación de firma y control de
      eventos repetidos.
- [ ] Crear la cotización desde el webhook (reutilizar la lógica actual de
      `orders/paid`).
- [ ] `GET /shop/orders/by-session/:session_id`.

### Tareas: frontend

- [ ] Server action `startCheckout()` y nuevo `handleCheckout` en
      `components/cart/modal.tsx`. Quitar `yaol_pending_cart_token` y la
      búsqueda del `gid`.
- [ ] Captura de nombre, teléfono, email y sucursal antes de pagar.
- [ ] `app/agendar-cita/page.tsx`: reemplazar la búsqueda por
      `shopify_order_id` y `cart_token` con la búsqueda por `session_id`.
- [ ] Decidir si se queda el flujo "agendar primero, pagar después". Si se
      queda, el pedido se crea con el `quote_id` que ya existe.

### Pruebas obligatorias

- [ ] Tarjetas de prueba: éxito, rechazo, 3D Secure y fondos insuficientes.
- [ ] `stripe trigger checkout.session.completed`.
- [ ] Un evento repetido no duplica la cotización.
- [ ] Dos clientes comprando la última llanta al mismo tiempo.
- [ ] Un pago que expira y libera el stock.

### Listo cuando

En modo de prueba, un cliente compra, paga, aterriza en `/agendar-cita` con
su `quote_id` y agenda; el stock y la cotización quedan bien en el backend.

### Notas y decisiones

_(vacío)_

---

## Fase 4 · Facturación CFDI 4.0 (1.5–2 semanas)

### Tareas

- [ ] Elegir un PAC (Facturapi, Facturama, SW Sapien…) o conectar el
      sistema actual de facturación. *(El backend ya tiene
      `src/clients/facturapi.js` y webhook `/bypass/facturapi`: reutilizar.)*
- [ ] Casilla opcional "¿Requieres factura?", en el checkout o en
      `/status/[id]` después de pagar. Pide RFC, razón social, régimen
      fiscal, código postal fiscal y uso de CFDI.
- [ ] Tabla `invoices (order_id, uuid_sat, status, xml_url, pdf_url, rfc, …)`.
- [ ] Al recibir el pago con datos fiscales: timbrar un CFDI de pago en una
      sola exhibición (PUE), con forma de pago según el método (04 tarjeta de
      crédito, 28 débito, 03 transferencia, 01 efectivo/OXXO).
- [ ] Sin datos fiscales: la venta entra a la **factura global** del
      periodo, con un proceso automático diario o mensual.
- [ ] Reembolsos: CFDI de egreso (nota de crédito) o cancelación, según
      aplique.
- [ ] Enviar PDF y XML por WhatsApp o correo.
- [ ] Revisar con el contador las claves SAT de producto (llantas y servicio
      de instalación) y los motivos de cancelación.

### Notas y decisiones

_(vacío)_

---

## Fase 5 · Métodos de pago mexicanos y operación (2–3 semanas)

### Tareas: métodos de pago

- [ ] **Meses sin intereses:** activar installments en la sesión de
      Checkout y fijar un monto mínimo. Reescribir
      `components/product/payment-options.tsx` con las comisiones reales de
      Stripe (hoy muestra meses *con* intereses).
- [ ] **OXXO:** usar `checkout.session.async_payment_succeeded` y
      `async_payment_failed`, que el apartado dure lo mismo que el voucher
      (1–3 días), estado `awaiting_payment` y aviso por WhatsApp.
- [ ] **SPEI:** transferencia con `customer_balance`, mismo manejo de pago
      tardío.

### Tareas: operación

- [ ] Reembolsos desde el CRM: `POST /admin/orders/:id/refund` que llama a
      la API de reembolsos de Stripe, más el webhook `charge.refunded` para
      cambiar el estado y emitir la nota de crédito.
- [ ] Contracargos: webhook `charge.dispute.created` → alerta a
      administración.
- [ ] Conciliación: reporte de depósitos de Stripe vs pedidos pagados, con
      comisiones por separado para contabilidad.
- [ ] Carritos abandonados: proceso automático que busca carritos activos
      con teléfono y más de 2 h sin cambios → plantilla de WhatsApp.
- [ ] Píxeles: eventos de compra de Meta y Google en `/agendar-cita` al
      confirmar la orden; idealmente desde el servidor (Conversions API).
- [ ] Antifraude: reglas de Radar (por ejemplo, bloquear tarjetas
      extranjeras en montos altos).

### Notas y decisiones

_(vacío)_

---

## Fase 6 · Salida a producción y retiro de Shopify (1 semana)

### Tareas

- [ ] Probar en staging con llaves de prueba durante una semana, con el
      personal de sucursal.
- [ ] Activar las llaves de producción y hacer una compra real de bajo
      monto con reembolso.
- [ ] Encender `COMMERCE_PROVIDER=native` en producción.
- [ ] Vigilar durante 2 semanas los webhooks fallidos (panel de Stripe) y
      los pedidos atorados en `pending_payment`.
- [ ] Exportar de Shopify el historial de clientes y pedidos antes de
      cerrar la cuenta.
- [ ] Frontend: borrar `lib/commerce/providers/shopify.ts`, `lib/shopify/`,
      `app/api/test-checkout`, el `revalidate` de Shopify,
      `docs/shopify-order-status-script.md` y las variables `SHOPIFY_*`.
- [ ] Backend: archivar la tabla `shopify_orders` y los endpoints
      `quote-by-cart-token` y `quote-by-shopify-order`.
- [ ] Actualizar el aviso de privacidad (Stripe y el PAC como encargados) y
      los términos de venta.

### Notas y decisiones

_(vacío)_

---

## Riesgos principales

- **Fase 3:** que el webhook procese dos veces el mismo evento y el apartado
  de stock (ventas dobles de la última pieza). Es donde más conviene
  invertir en pruebas.
- **Comisiones:** confirmar las tarifas vigentes de Stripe en México
  (tarjeta, MSI, OXXO, SPEI) antes de fijar precios y opciones de pago.

---

## Bitácora

Formato: `AAAA-MM-DD · Fase N · qué se hizo / qué se decidió / qué quedó pendiente`.

- 2026-10-12 · Plan · Se crea este documento a partir del análisis del
  repositorio.
- 2026-10-12 · Fase 0 · Token del backend movido a `BACKEND_API_TOKEN`
  (solo servidor) en `lib/shopify/index.ts` y `noCacheGetProduct.ts`;
  agregado a `.env.example`. Pendiente: rotar el token en el backend.
- 2026-10-12 · Fase 0 · Token configurado en Vercel y `.env.local`
  (commit ed9880b). Pendiente del backend: proteger `/bypass/shopify/*`,
  que hoy responde 200 sin token.
- 2026-10-12 · Fase 0 · Vercel: Node 20.x → 24.x; proyecto conectado al
  repo `diegojuce/webpage-yaol` (antes solo se desplegaba con la CLI). Se
  corrigió el autor de git del repo (tenía comillas tipográficas).
- 2026-10-12 · Fase 0 · Deploy automático funcionando (601415d en
  producción); catálogo y producto verificados con `BACKEND_API_TOKEN` =
  `TOKEN_YAOL`. El token viejo del historial ya no lo valida el backend.
  Pendiente backend: auth en `/bypass/shopify/*`. Detectado: `www.yantissimo.com`
  da 525 (SSL Cloudflare↔origen).
- 2026-10-12 · Fase 0 · Cuenta Stripe creada (sandbox "Yantissimo"),
  verificación pendiente. Stripe CLI 1.53.1 instalada. `COMMERCE_PROVIDER`
  implementado.
- 2026-10-12 · Fase 0 · `stripe login` hecho (acct_1UPnVIRzetgpiCYb,
  test, MXN). Falta: confirmar `STRIPE_SECRET_KEY` en el backend de staging.
- 2026-10-12 · Fase 0 · **Terminada.** Variables de Stripe del backend
  movidas a la Fase 3. El backend lo escribe su programador; este repo le
  entrega specs de endpoints.
- 2026-10-12 · Fase 0 · El programador del backend agregó las llaves de
  Stripe (test) en staging.
- 2026-10-12 · Backend · Clonado `jfzepeda/yssm-backend` y creada la rama
  `diego-stripe` desde `staging` (9b3575f). En `staging`, `/bypass/shopify` ya
  valida `TOKEN_YAOL` (falta desplegar). Tablas nuevas con prefijo `shop_`.
- 2026-10-15 · Fase 1 · `/bypass/shop` desplegado en staging (PR #92).
  Preview de `diego-stripe` verificado contra staging. Marcas: se muestran
  todas (opción C). Falta: desplegar `/bypass/shop` en producción y merge a `main`.
- 2026-10-15 · Fase 1 · Producción del backend no puede recibir
  `/bypass/shop` todavía (≈30 migraciones en cola en staging). Se sigue
  trabajando y probando contra staging; el merge de `diego-stripe` a `main`
  (frontend) espera a que `/bypass/shop` esté en `back.yantissimo.com`.
- 2026-10-23 · Fase 2 · **Terminada en staging.** 0154 aplicada en STG,
  carrito en `staging`, flujo completo verificado en el preview con
  Playwright. Sigue la Fase 3 (checkout con Stripe).
