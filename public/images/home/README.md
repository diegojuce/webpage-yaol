# Imágenes de la página de inicio (Yantissimo)

Esta carpeta contiene los slots de imágenes que usa la nueva landing. Cada subcarpeta corresponde a una sección de [components/home/landing](../../../components/home/landing). Si una imagen no existe, el componente muestra un placeholder con tono cálido — al subir el archivo con el nombre exacto, la imagen aparece automáticamente sin tocar código.

## Cómo subir tus fotos

1. Renombra tu archivo al nombre indicado abajo (mismo nombre + extensión).
2. Pega el archivo en la subcarpeta correspondiente.
3. Recarga la página.

Formatos recomendados: `.jpg` (fotos) o `.webp` (más ligero). Resolución recomendada: 1600×1000px (4:3 / 16:10). Mantén las tomas bien iluminadas y centradas.

## Slots disponibles

### `hero/` — Hero principal
- `hero-bg.jpg` — foto de fondo del hero (taller / sucursal principal). 1920×1080+ recomendado.

### `quick-access/` — 4 tarjetas tipo de vehículo
- `auto.jpg` — categoría AUTO (sedán / compacto).
- `suv.jpg` — categoría SUV / camionetas.
- `camion.jpg` — categoría CAMIÓN / pickup.
- `offroad.jpg` — categoría OFF-ROAD (AT / mud).

### `bento/` — Grid editorial de 8 tiles
- `compra.jpg` — "Compra en línea".
- `sucursales.jpg` — "Cerca de ti" (sucursales).
- `catalogo.jpg` — "Amplia gama de llantas" (catálogo).
- `atencion.jpg` — "Atención profesional" (tile destacado, grande).
- `tecnologia.jpg` — "Tecnología de primera".
- `productos.jpg` — "Productos y servicios".
- `nosotros.jpg` — "Sobre Yantissimo".
- `guia.jpg` — "Guía de llantas".

### `featured/` — Llantas destacadas (6 productos)
- `tire-1.jpg` … `tire-6.jpg` — fotos de llanta sobre fondo claro.

## Fotos del taller existentes

Ya tienes fotos reales en [public/fotos](../../fotos/). Si quieres reutilizar una, copia o renombra al slot que toque. Por ejemplo:

```bash
cp public/fotos/IMG_0105.jpg public/images/home/hero/hero-bg.jpg
cp public/fotos/IMG_0138.jpg public/images/home/bento/atencion.jpg
```
