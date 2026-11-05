import Link from "next/link";
import { COMPANY, WHATSAPP_DISPLAY, whatsappHref } from "lib/company";
import type { ReactNode } from "react";

export const metadata = {
  title: "Soporte de la App | Yantissimo",
  description:
    "Ayuda con la app de Yantissimo: acceso a tu cuenta, vehículos, citas, Club y cotizaciones. Contáctanos por correo o WhatsApp.",
  alternates: { canonical: "/app/support" },
};

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

const linkClassName =
  "break-words underline underline-offset-4 hover:text-[#0F0F0F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F0F0F]";

export default function AppSupportPage() {
  return (
    <div className="mt-28 min-h-screen bg-white text-[#0F0F0F]">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-16 md:pt-20">
        <h1 className="font-staatliches text-5xl font-black uppercase leading-[0.95] tracking-[0.03em] md:text-7xl">
          Soporte de la App de{" "}
          <span className="bg-[#FFC600] px-2">Yantissimo</span>
        </h1>
        <p className="mt-8 text-base leading-relaxed text-neutral-700">
          Si necesitas ayuda para entrar a tu cuenta, gestionar tus vehículos o
          usar las funciones de la app, contáctanos. También podemos orientarte
          sobre tus citas, cotizaciones y beneficios del Club Yantissimo.
        </p>

        <Section title="Contacta a soporte">
          <p>
            <strong>Correo electrónico:</strong>{" "}
            <a
              className={linkClassName}
              href={`mailto:${COMPANY.supportEmail}?subject=Soporte%20de%20la%20app%20Yantissimo`}
            >
              {COMPANY.supportEmail}
            </a>
          </p>
          <p>
            <strong>WhatsApp:</strong>{" "}
            <a
              className={linkClassName}
              href={whatsappHref(
                "Hola, necesito ayuda con la app de Yantissimo.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {WHATSAPP_DISPLAY}
            </a>
          </p>
          <p>
            Cuéntanos qué estabas intentando hacer y qué ocurrió. No compartas
            contraseñas, códigos de verificación ni datos completos de tu
            tarjeta.
          </p>
        </Section>

        <Section title="Problemas para entrar a tu cuenta">
          <p>
            Usa el teléfono o correo electrónico asociado a tu cuenta. Si
            olvidaste tu contraseña, selecciona la opción de recuperación en la
            pantalla de inicio de sesión y sigue las instrucciones.
          </p>
          <p>
            Si no recibes el código de recuperación, ya no tienes acceso al
            número registrado o aparece un mensaje de cuenta inactiva,
            escríbenos por alguno de los medios anteriores e indica el mensaje
            que ves.
          </p>
        </Section>

        <Section title="Reportar un problema en la app">
          <p>Para ayudarnos a revisar lo ocurrido, incluye:</p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>La función o pantalla en la que necesitas ayuda.</li>
            <li>Los pasos que seguiste y el mensaje de error, si aparece.</li>
            <li>El modelo de tu dispositivo y la versión de iOS o iPadOS.</li>
            <li>La versión de la app y la fecha aproximada del problema.</li>
            <li>
              Una captura de pantalla, si ayuda a explicar el caso, ocultando
              información personal o de pago.
            </li>
          </ul>
          <p>
            Si puedes, comprueba tu conexión a internet y revisa si hay una
            actualización de Yantissimo disponible en App Store.
          </p>
        </Section>

        <Section title="Citas, cotizaciones y Club">
          <p>
            Para consultar una cita, una cotización, un pago o un beneficio del
            Club, indica la sucursal y el folio correspondiente, si lo tienes.
            Evita incluir información de otras personas.
          </p>
          <p>
            También puedes consultar los teléfonos y direcciones de nuestras
            sucursales en{" "}
            <Link className={linkClassName} href="/ubicaciones">
              Ubicaciones
            </Link>
            .
          </p>
        </Section>

        <Section title="Privacidad y datos de tu cuenta">
          <p>
            Consulta nuestro{" "}
            <Link className={linkClassName} href="/politica-privacidad">
              Aviso de Privacidad
            </Link>{" "}
            para conocer el tratamiento de tus datos y los medios para ejercer
            tus derechos. Si tienes dudas sobre tu cuenta o su eliminación,
            contáctanos por los medios indicados en esta página.
          </p>
          <p>
            Puedes consultar las condiciones de uso de la app y nuestros
            servicios en los{" "}
            <Link className={linkClassName} href="/terminos-condiciones">
              Términos y Condiciones
            </Link>
            .
          </p>
        </Section>
      </article>
    </div>
  );
}
