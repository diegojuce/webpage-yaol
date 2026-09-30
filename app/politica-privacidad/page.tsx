import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import { COMPANY, WHATSAPP_DISPLAY } from "lib/company";
import type { ReactNode } from "react";

export const metadata = {
  title: "Aviso de Privacidad | Yantissimo",
  description:
    "Aviso de Privacidad de Yantissimo conforme a la LFPDPPP: qué datos personales recabamos, para qué los usamos y cómo ejercer tus derechos ARCO.",
  alternates: { canonical: "/privacy-policy" },
};

const ADDRESS = `${COMPANY.hqAddress.street}, C.P. ${COMPANY.hqAddress.postalCode}, ${COMPANY.hqAddress.city}, ${COMPANY.hqAddress.state}, México`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-staatliches text-3xl uppercase tracking-[0.03em] md:text-4xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-neutral-700">
        {children}
      </div>
    </section>
  );
}

function List({ items, ordered }: { items: ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`space-y-1.5 pl-6 ${ordered ? "list-decimal" : "list-disc"}`}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mt-28 min-h-screen bg-white text-[#0F0F0F]">
      <ScrollToTopOnMount behavior="auto" />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-16 md:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D19D00] md:text-sm">
          Legal
        </p>
        <h1 className="mt-4 font-staatliches text-5xl font-black uppercase leading-[0.95] tracking-[0.03em] md:text-7xl">
          Aviso de Privacidad de{" "}
          <span className="bg-[#FFC600] px-2">Yantissimo</span>
        </h1>
        <p className="mt-4 text-sm text-neutral-500">
          Última actualización: 29 de septiembre de 2026
        </p>

        <Section title="1. Responsable">
          <p>
            {COMPANY.legalName} (&quot;Yantissimo&quot;, &quot;nosotros&quot;),
            con domicilio en {ADDRESS}, es responsable del tratamiento de tus
            datos personales conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares (LFPDPPP) y su normativa
            vigente.
          </p>
          <p>
            Contacto para temas de privacidad:{" "}
            <a className="underline" href={`mailto:${COMPANY.email}`}>
              {COMPANY.email}
            </a>{" "}
            · {WHATSAPP_DISPLAY}
          </p>
        </Section>

        <Section title="2. Datos personales que recabamos">
          <p>
            <strong>Datos que tú nos proporcionas:</strong>
          </p>
          <List
            items={[
              "Identificación y contacto: nombre, número de teléfono y correo electrónico.",
              "Datos del vehículo: placa, marca, modelo, año y kilometraje.",
              "Datos de tu cuenta: credenciales de acceso y códigos de recuperación de contraseña.",
              "Datos de servicio: solicitudes de cotización, citas, notas adicionales y aceptación de cotizaciones.",
            ]}
          />
          <p>
            <strong>Datos que se generan al usar el servicio:</strong>
          </p>
          <List
            items={[
              "Historial de visitas y servicios, cotizaciones, pagos (estado del pago) y recordatorios de servicio.",
              "Resultados de inspecciones y revisiones posteriores (postchecks) de tu vehículo.",
              "Membresía y beneficios del Club Llantísimo, asociados a cada vehículo.",
              "Token del dispositivo, necesario para enviarte notificaciones push.",
            ]}
          />
          <p>
            No recabamos tu ubicación, contactos, fotos ni micrófono desde la
            app. Tampoco usamos herramientas de publicidad ni de analítica de
            terceros.
          </p>
          <p>
            <strong>Datos sensibles:</strong> no solicitamos datos personales
            sensibles.
          </p>
          <p>
            <strong>Datos de pago:</strong> los pagos con tarjeta se procesan a
            través de [PROCESADOR DE PAGOS]. Yantissimo no almacena números
            completos de tarjeta.
          </p>
        </Section>

        <Section title="3. Finalidades">
          <p>
            <strong>Necesarias para el servicio:</strong>
          </p>
          <List
            ordered
            items={[
              "Crear y administrar tu cuenta y autenticarte.",
              "Asociar tus vehículos y llevar su historial de servicio.",
              "Elaborar, enviar y dar seguimiento a cotizaciones, citas y pagos.",
              "Enviarte recordatorios de servicio y avisos sobre tu visita o tu vehículo, por notificación push, WhatsApp o SMS.",
              "Administrar tu membresía y beneficios del Club Llantísimo.",
              "Cumplir obligaciones legales, fiscales y de garantía.",
            ]}
          />
          <p>
            <strong>Adicionales (puedes negarte sin afectar el servicio):</strong>
          </p>
          <ol className="list-decimal space-y-1.5 pl-6" start={7}>
            <li>Enviarte promociones, ofertas y novedades.</li>
            <li>Encuestas de satisfacción y mejora del servicio.</li>
          </ol>
          <p>
            Si no quieres que tratemos tus datos para las finalidades 7 y 8,
            escríbenos a{" "}
            <a className="underline" href={`mailto:${COMPANY.email}`}>
              {COMPANY.email}
            </a>{" "}
            o desactiva las notificaciones promocionales en la app.
          </p>
        </Section>

        <Section title="4. Transferencias y encargados">
          <p>
            No vendemos tus datos. Los compartimos únicamente con proveedores
            que nos prestan servicios y que actúan por nuestra cuenta:
          </p>
          <List
            items={[
              "Apple (APNs): entrega de notificaciones push.",
              "Meta (WhatsApp Business): envío de mensajes de servicio y recordatorios.",
              "[PROCESADOR DE PAGOS]: cobro de servicios.",
              "[PROVEEDOR DE HOSTING/BASE DE DATOS]: alojamiento de la información.",
            ]}
          />
          <p>
            También podremos compartir datos con autoridades cuando una ley o
            resolución lo exija. Estas transferencias no requieren tu
            consentimiento conforme al artículo 37 de la LFPDPPP.
          </p>
        </Section>

        <Section title="5. Derechos ARCO y revocación">
          <p>
            Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al
            tratamiento de tus datos, y a revocar tu consentimiento. Para
            ejercerlos, envía una solicitud a{" "}
            <a className="underline" href={`mailto:${COMPANY.email}`}>
              {COMPANY.email}
            </a>{" "}
            con:
          </p>
          <List
            items={[
              "tu nombre y un medio para responderte;",
              "un documento que acredite tu identidad;",
              "la descripción clara de los datos y del derecho que quieres ejercer.",
            ]}
          />
          <p>
            Responderemos en un máximo de 20 días hábiles desde que recibamos tu
            solicitud. Si procede, la haremos efectiva en los 15 días hábiles
            siguientes.
          </p>
          <p>
            <strong>Eliminación de cuenta:</strong> puedes solicitarla en{" "}
            <a className="underline" href={`mailto:${COMPANY.email}`}>
              {COMPANY.email}
            </a>{" "}
            o [RUTA EN LA APP]. Conservaremos únicamente lo que la ley nos
            obligue a guardar (por ejemplo, información fiscal).
          </p>
        </Section>

        <Section title="6. Conservación y seguridad">
          <p>
            Conservamos tus datos mientras tengas una cuenta activa y durante
            los plazos legales aplicables. Después los bloqueamos y los
            suprimimos.
          </p>
          <p>
            Protegemos tu información con medidas administrativas, técnicas y
            físicas. La comunicación entre la app y nuestros servidores va
            cifrada (HTTPS) y tu sesión se guarda en el Keychain de tu
            dispositivo.
          </p>
        </Section>

        <Section title="7. Notificaciones y comunicaciones">
          <p>
            Puedes desactivar las notificaciones push en los Ajustes de iOS en
            cualquier momento. Para dejar de recibir mensajes por WhatsApp o
            SMS, responde &quot;BAJA&quot; o escríbenos a{" "}
            <a className="underline" href={`mailto:${COMPANY.email}`}>
              {COMPANY.email}
            </a>
            .
          </p>
        </Section>

        <Section title="8. Menores de edad">
          <p>
            La app no está dirigida a menores de 18 años. Si detectas que un
            menor nos proporcionó datos, avísanos para eliminarlos.
          </p>
        </Section>

        <Section title="9. Cambios a este aviso">
          <p>
            Cualquier cambio se publicará en la app y en{" "}
            <a className="underline" href={`${COMPANY.website}/privacy-policy`}>
              {COMPANY.website}/privacy-policy
            </a>
            . Si el cambio afecta las finalidades o las transferencias, te lo
            notificaremos por los medios de contacto que nos diste.
          </p>
        </Section>

        <Section title="10. Autoridad">
          <p>
            Si consideras que tu derecho a la protección de datos ha sido
            vulnerado, puedes acudir a la autoridad competente en materia de
            protección de datos personales en México.
          </p>
        </Section>
      </article>
    </div>
  );
}
