// app/aviso/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | yaol_commerce",
  description:
    "How yaol_commerce collects, uses, and discloses your personal information when you visit or shop with us.",
};

export default function ReturnPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-neutral">
      <h1>Políticas de Garantía y Devoluciones</h1>
      <p>En Yantissimo, tu satisfacción es importante para nosotros.</p>
      <p>
        Antes de realizar cualquier devolución o solicitud de garantía, te
        pedimos leer atentamente nuestras políticas:
      </p>

      <section>
        <h2>1. Garantías de fábrica</h2>
        <p>
          Todas las llantas que comercializamos cuentan con garantía
          directamente del fabricante.
        </p>
        <p>
          Esta garantía cubre únicamente defectos de fabricación y no aplica en
          casos de:
        </p>
        <ul>
          <li>Golpes, cortes, ponchaduras o daños por mal uso.</li>
          <li>
            Desgaste irregular causado por falta de alineación o balanceo.
          </li>
          <li>Instalación incorrecta o condiciones inadecuadas de uso.</li>
        </ul>
      </section>

      <section>
        <h2>2. Procedimiento para solicitud de garantía</h2>
        <p>Para iniciar una revisión de garantía, el cliente deberá:</p>
        <ul>
          <li>Presentar su comprobante de compra.</li>
          <li>Enviar evidencia fotográfica del daño o defecto.</li>
          <li>
            En algunos casos, entregar la llanta en uno de nuestros talleres
            físicos en el estado de Colima para su inspección.
          </li>
        </ul>
        <p>
          Una vez recibida la evidencia, nuestro equipo técnico y/o el
          fabricante evaluará el caso.
        </p>
        <p>
          Si se confirma un defecto de fábrica, se procederá a la reposición o
          reembolso según lo determine la marca.
        </p>
      </section>

      <section>
        <h2>3. Devoluciones sin defecto</h2>
        <p>
          Por tratarse de un producto especializado, no aceptamos devoluciones
          por error de compra, cambio de opinión o incompatibilidad con el
          vehículo. Te recomendamos verificar las medidas y especificaciones
          antes de realizar tu pedido.
        </p>
      </section>

      <section>
        <h2>4. Plazos y reembolsos</h2>
        <p>
          En caso de aprobación de una garantía, el reembolso o reemplazo se
          gestionará en un plazo estimado de 10 a 15 días hábiles, dependiendo
          del fabricante y la logística de envío.
        </p>
      </section>
    </main>
  );
}
