import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de envío | yaol_commerce",
  description:
    "Conoce la política de envío de Yantissimo: cobertura, tiempos de entrega, costos y recolección en tienda.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-neutral">
      <h1>Política de Envío</h1>
      <p>
        En Yantissimo realizamos envíos a todo México mediante paqueterías
        nacionales confiables.
      </p>

      <section>
        <h2>1. Cobertura y tiempos de entrega</h2>
        <ul>
          <li>Envíos disponibles a todo el territorio nacional.</li>
          <li>
            Los tiempos de entrega varían entre 3 y 7 días hábiles, dependiendo
            de la ubicación del cliente.
          </li>
          <li>
            En zonas extendidas o de difícil acceso, los tiempos pueden ser
            mayores.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Costos de envío</h2>
        <p>
          El costo del envío se calcula automáticamente al momento de realizar
          tu compra, con base en la dirección de entrega y el tamaño del
          pedido. Algunos envíos son gratis.
        </p>
      </section>

      <section>
        <h2>3. Entregas en taller o recolección en tienda</h2>
        <p>
          Puedes optar por instalar tus llantas en nuestros talleres físicos en
          Colima o recoger tu pedido sin costo adicional.
        </p>
        <p>
          Nuestro equipo te confirmará la disponibilidad y horarios para la cita
          de instalación o entrega.
        </p>
      </section>

      <section>
        <h2>4. Daños durante el transporte</h2>
        <p>
          Si tu pedido llega con daños visibles en el empaque o el producto, no
          aceptes la entrega y notifícalo de inmediato a nuestro equipo de
          atención al cliente para iniciar el reclamo correspondiente con la
          paquetería.
        </p>
      </section>
    </main>
  );
}
