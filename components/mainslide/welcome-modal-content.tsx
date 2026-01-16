"use client";

export function WelcomeModalContent() {
  return (
    <div className="flex h-full w-full flex-col gap-8 px-6 py-10 md:px-12 lg:px-20">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Demo
        </p>
        <h1 className="text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">
          Contenido de prueba para el modal
        </h1>
        <p className="max-w-3xl text-base text-neutral-600">
          Aquí puedes colocar la información completa que necesites. Este bloque es solo
          de ejemplo para ver cómo se comporta el scroll y la distribución del texto en
          pantalla completa.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Sección 1</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Agrega aquí cualquier componente, formulario o listado. Usa este espacio para
            maquetar el contenido real del modal.
          </p>
        </article>
        <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Sección 2</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Este es un ejemplo adicional para ver cómo se verían varias columnas en
            pantallas grandes. El contenedor admite scroll si el contenido crece.
          </p>
        </article>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">Lista de puntos</h3>
        <ul className="grid gap-2 text-sm text-neutral-700 md:grid-cols-2">
          <li className="rounded-lg bg-neutral-50 px-3 py-2">Punto 1 de ejemplo</li>
          <li className="rounded-lg bg-neutral-50 px-3 py-2">Punto 2 de ejemplo</li>
          <li className="rounded-lg bg-neutral-50 px-3 py-2">Punto 3 de ejemplo</li>
          <li className="rounded-lg bg-neutral-50 px-3 py-2">Punto 4 de ejemplo</li>
        </ul>
      </section>
    </div>
  );
}
