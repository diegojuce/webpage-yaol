import Link from "next/link";
import { COMPANY, WHATSAPP_DISPLAY, whatsappHref } from "lib/company";
import type { ReactNode } from "react";

export const metadata = {
  title: "Términos y Condiciones | Yantissimo",
  description:
    "Términos y Condiciones de uso del sitio web y la App de Yantissimo: compras, cotizaciones, pagos, citas, Club Yantissimo, garantías y privacidad.",
  alternates: { canonical: "/terminos-condiciones" },
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

const SupportEmail = () => (
  <a className="underline" href={`mailto:${COMPANY.supportEmail}`}>
    {COMPANY.supportEmail}
  </a>
);

const WhatsApp = () => (
  <a
    className="underline"
    href={whatsappHref()}
    target="_blank"
    rel="noopener noreferrer"
  >
    {WHATSAPP_DISPLAY}
  </a>
);

export default function TermsPage() {
  return (
    <div className="mt-28 min-h-screen bg-white text-[#0F0F0F]">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-16 md:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D19D00] md:text-sm">
          Legal
        </p>
        <h1 className="mt-4 font-staatliches text-5xl font-black uppercase leading-[0.95] tracking-[0.03em] md:text-7xl">
          Términos y Condiciones de{" "}
          <span className="bg-[#FFC600] px-2">Yantissimo</span>
        </h1>
        <p className="mt-4 text-sm text-neutral-500">
          Última actualización: 2 de noviembre de 2026
        </p>

        <p className="mt-8 text-base leading-relaxed text-neutral-700">
          Bienvenido a <strong>Yantissimo</strong>. Estos Términos y
          Condiciones (los &quot;Términos&quot;) aplican al sitio web{" "}
          <a className="underline" href={COMPANY.website}>
            yantissimo.com
          </a>{" "}
          y a la aplicación móvil de Yantissimo para clientes (en conjunto, la
          &quot;Plataforma&quot;). Al comprar, crear una cuenta, iniciar sesión
          o usar la Plataforma, aceptas estos Términos. Si no estás de acuerdo
          con ellos, no uses la Plataforma.
        </p>

        <Section title="1. Quiénes somos">
          <p>
            La Plataforma es operada por {COMPANY.legalName}{" "}
            (&quot;Yantissimo&quot;, &quot;nosotros&quot;), con domicilio en{" "}
            {ADDRESS}.
          </p>
          <p>
            Contacto: <SupportEmail /> · WhatsApp <WhatsApp />.
          </p>
        </Section>

        <Section title="2. Qué ofrece la Plataforma">
          <p>
            La Plataforma te permite, según esté disponible en tu sucursal:
          </p>
          <List
            items={[
              <>
                Consultar el <strong>catálogo de productos</strong> (llantas,
                refacciones y servicios), armar un <strong>carrito</strong> y
                comprar en línea.
              </>,
              <>
                Elegir la <strong>entrega</strong> de tu compra: instalación en
                sucursal o envío, según la cobertura disponible.
              </>,
              <>
                Solicitar y consultar <strong>cotizaciones</strong>, y pagarlas
                mediante enlaces de pago.
              </>,
              <>
                <strong>Agendar citas</strong> de servicio en nuestras
                sucursales.
              </>,
              <>
                Registrar y administrar tus <strong>vehículos</strong> (en la
                App).
              </>,
              <>
                Recibir y administrar <strong>recordatorios</strong> de servicio
                y mantenimiento.
              </>,
              "Consultar el historial de tus visitas y servicios.",
              <>
                Adquirir y usar la membresía <strong>Club Yantissimo</strong> y,
                en su caso, beneficios de <strong>convenios</strong> con
                empresas u organizaciones.
              </>,
              <>
                Recibir <strong>notificaciones</strong> sobre tus pedidos,
                citas, cotizaciones, recordatorios y promociones.
              </>,
            ]}
          />
          <p>
            Podemos añadir, modificar o retirar funciones en cualquier momento.
            Algunas funciones pueden no estar disponibles en todas las
            sucursales.
          </p>
        </Section>

        <Section title="3. Requisitos y cuenta de usuario">
          <List
            ordered
            items={[
              <>
                Debes tener <strong>18 años cumplidos</strong> y capacidad legal
                para contratar. Si eres menor de edad, solo puedes usar la
                Plataforma con la autorización y supervisión de tu madre, padre
                o tutor.
              </>,
              <>
                Debes proporcionar información{" "}
                <strong>veraz, completa y actualizada</strong> (nombre,
                teléfono, correo, datos del vehículo, etc.).
              </>,
              <>
                Eres responsable de mantener la{" "}
                <strong>confidencialidad de tu contraseña</strong> y de toda la
                actividad realizada desde tu cuenta. Avísanos de inmediato si
                sospechas de un uso no autorizado.
              </>,
              "Cada persona debe tener una sola cuenta. No puedes ceder ni transferir tu cuenta a terceros.",
              <>
                Podemos <strong>suspender o bloquear</strong> una cuenta cuando
                detectemos información falsa, uso fraudulento, intentos
                repetidos de acceso no autorizado o incumplimiento de estos
                Términos.
              </>,
            ]}
          />
        </Section>

        <Section title="4. Uso permitido">
          <p>
            Te comprometes a <strong>no</strong>:
          </p>
          <List
            items={[
              "Usar la Plataforma para fines ilícitos o contrarios a estos Términos.",
              "Registrar vehículos que no sean tuyos o sobre los que no tengas autorización.",
              "Intentar acceder sin permiso a sistemas, cuentas o datos de otras personas.",
              "Realizar ingeniería inversa, descompilar, copiar o alterar la Plataforma o sus servidores.",
              "Interferir con la operación de la Plataforma (por ejemplo, mediante scripts automatizados, ataques o sobrecarga de servidores).",
              "Falsificar, duplicar o compartir indebidamente códigos QR, membresías o beneficios.",
            ]}
          />
        </Section>

        <Section title="5. Productos, cotizaciones y precios">
          <List
            ordered
            items={[
              <>
                Los{" "}
                <strong>
                  precios, existencias, promociones y disponibilidad
                </strong>{" "}
                mostrados en la Plataforma son informativos y pueden cambiar sin
                previo aviso. La existencia se confirma al momento de la compra
                o instalación.
              </>,
              <>
                Una <strong>cotización</strong> es una propuesta de precio para
                los productos y servicios indicados;{" "}
                <strong>no garantiza</strong> existencias ni constituye por sí
                sola una venta. Salvo que se indique otra cosa, tiene la
                vigencia señalada en ella o, en su defecto, la que determine la
                sucursal.
              </>,
              "Las imágenes y descripciones son ilustrativas. Pueden existir diferencias menores de presentación, marca o modelo respecto del producto entregado; en ese caso te lo informaremos antes de concretar la venta.",
              <>
                Los precios están expresados en{" "}
                <strong>pesos mexicanos (MXN)</strong> e incluyen IVA salvo que
                se indique lo contrario.
              </>,
              "La cantidad que puedes agregar al carrito puede estar limitada por la existencia disponible.",
              "Las promociones (por ejemplo, las del Buen Fin) tienen la vigencia y condiciones indicadas en cada una y aplican hasta agotar existencias.",
              "Nos reservamos el derecho de corregir errores evidentes de captura de precios o descripciones, informándote antes de procesar tu pedido.",
            ]}
          />
        </Section>

        <Section title="6. Pagos">
          <List
            items={[
              <>
                Los pagos en línea se procesan mediante{" "}
                <strong>Stripe</strong>, proveedor de pagos de terceros. No
                almacenamos los datos completos de tu tarjeta; el tratamiento de
                esa información se rige por los términos y políticas de Stripe.
              </>,
              "Algunos métodos de pago o la verificación de tu banco (3D Secure) pueden mostrarte una ventana o página de pago externa.",
              "Las promociones de meses sin intereses, cuando existan, aplican con las tarjetas, montos y condiciones indicados al momento del pago.",
              "Eres responsable de que los medios de pago que utilices sean tuyos o estés autorizado a usarlos.",
              "Los comprobantes fiscales (facturas) se emiten conforme a la legislación aplicable y a los datos fiscales que nos proporciones. Solicítalos dentro del plazo que indique la sucursal o la normativa vigente.",
            ]}
          />
        </Section>

        <Section title="7. Citas de servicio">
          <List
            ordered
            items={[
              "Al agendar una cita eliges sucursal, servicio, vehículo, fecha y horario según la disponibilidad mostrada.",
              "La cita queda sujeta a confirmación operativa. Si surge un imprevisto (falta de refacciones, contingencia, cierre de sucursal), te contactaremos para reprogramarla.",
              <>
                Te pedimos{" "}
                <strong>cancelar o reprogramar con anticipación</strong> si no
                podrás asistir. Podemos limitar nuevas citas ante inasistencias
                reiteradas sin aviso.
              </>,
              <>
                El diagnóstico en sucursal puede revelar servicios adicionales;{" "}
                <strong>
                  no realizaremos trabajos adicionales sin tu autorización
                </strong>
                .
              </>,
              "La duración y el costo finales pueden diferir de lo estimado en la Plataforma cuando el estado real del vehículo así lo requiera, previa información y aprobación tuya.",
            ]}
          />
        </Section>

        <Section title="8. Recordatorios y notificaciones">
          <List
            items={[
              <>
                La App puede mostrarte <strong>recordatorios del sistema</strong>{" "}
                (generados a partir de tu historial de servicios y reglas de
                mantenimiento) y <strong>recordatorios propios</strong> que tú
                crees y edites.
              </>,
              <>
                Los recordatorios son una <strong>ayuda orientativa</strong>; no
                sustituyen el manual del fabricante ni el criterio de un
                técnico. No somos responsables por servicios omitidos por no
                haber recibido o atendido un recordatorio.
              </>,
              <>
                Puedes recibir <strong>notificaciones push</strong>, mensajes
                por WhatsApp, SMS o correo relacionados con tu cuenta, pedidos,
                citas, cotizaciones y recordatorios. Puedes desactivar las
                notificaciones desde los ajustes de tu dispositivo. Las
                comunicaciones promocionales se envían solo en la medida
                permitida por la ley y tus preferencias.
              </>,
            ]}
          />
        </Section>

        <Section title="9. Club Yantissimo">
          <List
            ordered
            items={[
              <>
                La membresía <strong>Club Yantissimo</strong> está asociada a{" "}
                <strong>un vehículo (placa) específico</strong>, no a la
                persona. Cada vehículo requiere su propia membresía.
              </>,
              <>
                Los beneficios, costo, vigencia, sucursales participantes y
                condiciones de uso se muestran al momento de contratar y pueden
                consultarse en cualquier momento en la sección{" "}
                <Link className="underline" href="/club">
                  Club
                </Link>
                .
              </>,
              <>
                La membresía es <strong>personal e intransferible</strong> y
                solo es válida mientras esté vigente. Para hacer uso de los
                beneficios podrás ser requerido de presentar el{" "}
                <strong>código QR</strong> o número de membresía.
              </>,
              "Los beneficios no son acumulables con otras promociones salvo que se indique expresamente, y no son canjeables por dinero.",
              "Podemos modificar los beneficios futuros del Club con aviso razonable; los cambios no afectarán los beneficios ya pagados durante la vigencia contratada, salvo causa justificada o por exigencia legal.",
              "Podemos cancelar una membresía por uso fraudulento, información falsa o mal uso del QR, sin que proceda reembolso en esos casos.",
              "Las condiciones de cancelación y reembolso se rigen por la sección 11 y por la legislación aplicable.",
            ]}
          />
        </Section>

        <Section title="10. Convenios">
          <p>
            Si tu empresa u organización tiene un <strong>convenio</strong> con
            nosotros, podrás ver en la App tus beneficios y tu código QR. Su
            vigencia y condiciones dependen del convenio firmado; si este
            termina o dejas de pertenecer a la organización, los beneficios
            dejarán de estar disponibles.
          </p>
        </Section>

        <Section title="11. Cancelaciones, devoluciones y garantías">
          <List
            items={[
              <>
                <strong>Productos:</strong> las devoluciones, cambios y
                garantías se rigen por las políticas de la sucursal, la
                garantía del fabricante o distribuidor y la{" "}
                <strong>Ley Federal de Protección al Consumidor</strong>.
                Conserva tu comprobante de compra.
              </>,
              <>
                <strong>Servicios:</strong> cuentan con la garantía que se
                indique en la orden de servicio o comprobante.
              </>,
              <>
                <strong>Productos instalados o usados:</strong> por razones de
                seguridad, normalmente no admiten devolución, salvo defecto de
                fabricación o error nuestro.
              </>,
              <>
                <strong>Membresías y compras en línea:</strong> puedes solicitar
                la cancelación o reembolso conforme a la ley y a las condiciones
                indicadas al momento de la compra. Escríbenos a{" "}
                <SupportEmail />.
              </>,
            ]}
          />
        </Section>

        <Section title="12. Privacidad y datos personales">
          <p>
            El tratamiento de tus datos personales se rige por nuestro{" "}
            <Link className="underline" href="/politica-privacidad">
              Aviso de Privacidad
            </Link>
            , disponible en la App y en este sitio. Al usar la Plataforma
            reconoces haberlo leído.
          </p>
          <p>
            De forma general, recopilamos los datos que nos proporcionas
            (identificación, contacto, vehículos, historial de servicios,
            pedidos, citas, cotizaciones) y datos técnicos (token del
            dispositivo para notificaciones, tipo de dispositivo), con la
            finalidad de operar la Plataforma y prestarte los servicios. Puedes
            ejercer tus derechos de{" "}
            <strong>
              acceso, rectificación, cancelación y oposición (ARCO)
            </strong>{" "}
            escribiendo a <SupportEmail />.
          </p>
        </Section>

        <Section title="13. Eliminación de la cuenta">
          <p>
            Puedes solicitar la eliminación de tu cuenta y datos desde la App
            (si la función está disponible) o escribiendo a <SupportEmail />.
            Podremos conservar la información que la ley nos obligue a resguardar
            (por ejemplo, comprobantes fiscales y registros de operaciones)
            durante los plazos legales.
          </p>
        </Section>

        <Section title="14. Propiedad intelectual">
          <p>
            La Plataforma, su diseño, código, marcas, logotipos, nombres
            comerciales, textos, imágenes y demás contenidos son propiedad de{" "}
            {COMPANY.legalName} o de sus licenciantes y están protegidos por las
            leyes de propiedad intelectual. Se te otorga una licencia{" "}
            <strong>
              limitada, personal, revocable, no exclusiva e intransferible
            </strong>{" "}
            para usar la Plataforma con fines personales. Las marcas de terceros
            (llantas, fabricantes, etc.) pertenecen a sus respectivos titulares.
          </p>
        </Section>

        <Section title="15. Disponibilidad del servicio">
          <p>
            Procuramos que la Plataforma esté disponible de forma continua, pero{" "}
            <strong>no garantizamos</strong> que funcione sin interrupciones ni
            errores. Puede haber mantenimientos, fallas de conectividad o de
            proveedores externos. La Plataforma requiere conexión a internet
            para la mayoría de sus funciones; el sitio web, un navegador
            actualizado, y la App, un dispositivo compatible (iOS 16 o
            superior).
          </p>
        </Section>

        <Section title="16. Limitación de responsabilidad">
          <p>En la máxima medida permitida por la ley:</p>
          <List
            items={[
              "La Plataforma se ofrece “tal cual” y “según disponibilidad”.",
              "No seremos responsables por daños indirectos, pérdida de oportunidades o lucro cesante derivados del uso o imposibilidad de uso de la Plataforma.",
              "No somos responsables por fallas atribuibles a terceros (proveedores de pago, operadores de telecomunicaciones, tiendas de aplicaciones) ni por información incorrecta que tú proporciones.",
              "Nada en estos Términos limita derechos que la ley reconozca a los consumidores ni nuestra responsabilidad por dolo o negligencia grave.",
            ]}
          />
        </Section>

        <Section title="17. Enlaces y servicios de terceros">
          <p>
            La Plataforma puede contener enlaces o integraciones con servicios
            de terceros (pagos, mapas, mensajería, redes sociales). No
            controlamos ni somos responsables de sus contenidos o políticas; su
            uso se rige por los términos de cada tercero.
          </p>
        </Section>

        <Section title="18. Modificaciones a los Términos">
          <p>
            Podemos actualizar estos Términos en cualquier momento. Publicaremos
            la versión vigente en la Plataforma con su fecha de actualización y,
            cuando el cambio sea relevante, te lo notificaremos. Si continúas
            usando la Plataforma después de la entrada en vigor del cambio, se
            entenderá que lo aceptas. Si no estás de acuerdo, deja de usarla y,
            si lo deseas, solicita la eliminación de tu cuenta.
          </p>
        </Section>

        <Section title="19. Terminación">
          <p>
            Puedes dejar de usar la Plataforma cuando quieras. Podemos suspender
            o terminar tu acceso, con o sin aviso previo, cuando exista
            incumplimiento de estos Términos, riesgo de seguridad o
            requerimiento de autoridad. Las secciones que por su naturaleza
            deban subsistir (propiedad intelectual, limitación de
            responsabilidad, legislación aplicable) seguirán vigentes.
          </p>
        </Section>

        <Section title="20. Legislación aplicable y jurisdicción">
          <p>
            Estos Términos se rigen por las leyes de los{" "}
            <strong>Estados Unidos Mexicanos</strong>. Para su interpretación y
            cumplimiento, las partes se someten a la jurisdicción de los
            tribunales competentes de{" "}
            <strong>
              {COMPANY.hqAddress.city}, {COMPANY.hqAddress.state}
            </strong>
            , sin perjuicio de los derechos que la{" "}
            <strong>Ley Federal de Protección al Consumidor</strong> te otorgue
            para acudir a la <strong>PROFECO</strong> o a los tribunales de tu
            domicilio.
          </p>
        </Section>

        <Section title="21. Contacto">
          <p>Si tienes dudas sobre estos Términos, escríbenos:</p>
          <List
            items={[
              <>
                <strong>Correo:</strong> <SupportEmail />
              </>,
              <>
                <strong>WhatsApp:</strong> <WhatsApp />
              </>,
              <>
                <strong>Domicilio:</strong> {ADDRESS}
              </>,
            ]}
          />
        </Section>

        <p className="mt-12 border-t border-neutral-200 pt-6 text-sm italic text-neutral-500">
          Al usar Yantissimo confirmas que has leído, entendido y aceptado estos
          Términos y Condiciones.
        </p>
      </article>
    </div>
  );
}
