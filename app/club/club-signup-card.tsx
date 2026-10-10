"use client";

// Alta pública al Club Yantissimo en cuatro pasos:
//   telefono → codigo → vehiculo → listo (descarga del .pkpass)
//
// Réplica del flujo del ERP (erp-yssm/(public)/club) con la UI de yantissimo.com.

import {
  ClubError,
  darDeAlta,
  descargarPase,
  pedirCodigo,
  soloDigitos,
  verificarCodigo,
  type Membresia,
  type VehiculoClub,
} from "lib/api/club";
import { useMemo, useState } from "react";

type Paso = "telefono" | "codigo" | "vehiculo" | "listo";

const PASOS: { id: Paso; label: string }[] = [
  { id: "telefono", label: "Tus datos" },
  { id: "codigo", label: "Confirma" },
  { id: "vehiculo", label: "Tu auto" },
  { id: "listo", label: "Listo" },
];

const INPUT =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#FFC600] focus:bg-white/[0.07] disabled:opacity-50";
const LABEL =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/45";

const mensaje = (err: unknown, fallback: string) =>
  err instanceof ClubError ? err.message : fallback;

function etiquetaVehiculo(v: VehiculoClub) {
  if (v.por_definir) return "Vehículo por definir";
  const partes = [v.plate, [v.brand, v.model].filter(Boolean).join(" "), v.year]
    .filter(Boolean)
    .map(String);
  return partes.join(" · ") || `Vehículo #${v.id}`;
}

export default function ClubSignupCard() {
  const [paso, setPaso] = useState<Paso>("telefono");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [telefono, setTelefono] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");

  const [token, setToken] = useState<string | null>(null);
  const [vehiculos, setVehiculos] = useState<VehiculoClub[]>([]);
  const [eleccion, setEleccion] = useState(""); // id | "nuevo" | "despues"
  const [nuevo, setNuevo] = useState({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
  });

  const [membresia, setMembresia] = useState<Membresia | null>(null);
  const [bajando, setBajando] = useState(false);

  const telefonoOk = soloDigitos(telefono).length === 10;
  const codigoOk = /^\d{6}$/.test(codigo);

  // Un vehículo que ya tiene membresía viva no se puede volver a dar de alta.
  const disponibles = useMemo(
    () => vehiculos.filter((v) => !v.membership_id),
    [vehiculos]
  );

  // La membresía es por vehículo, así que el placeholder "por definir" vale por
  // UN auto sin declarar, no por varios: solo puede haber una diferida a la vez.
  const yaTieneDiferida = useMemo(
    () => vehiculos.some((v) => v.por_definir && v.membership_id),
    [vehiculos]
  );

  const altaLista =
    !!eleccion &&
    (eleccion !== "nuevo" ||
      !!(nuevo.placa.trim() || nuevo.marca.trim() || nuevo.modelo.trim()));

  async function onPedirCodigo() {
    setError("");
    setAviso("");
    setEnviando(true);
    try {
      await pedirCodigo(telefono);
      setAviso("Te mandamos un código por WhatsApp. Vence en 10 minutos.");
      setPaso("codigo");
    } catch (err) {
      setError(mensaje(err, "No se pudo enviar el código."));
    } finally {
      setEnviando(false);
    }
  }

  async function onVerificar() {
    setError("");
    setAviso("");
    setEnviando(true);
    try {
      const data = await verificarCodigo(telefono, codigo, nombre);
      setToken(data.token);
      setVehiculos(data.vehiculos);
      const libres = data.vehiculos.filter((v) => !v.membership_id);
      setEleccion(libres.length ? String(libres[0]!.id) : "nuevo");
      setPaso("vehiculo");
    } catch (err) {
      setError(mensaje(err, "No se pudo verificar el código."));
    } finally {
      setEnviando(false);
    }
  }

  async function onAlta() {
    if (!token) return;
    setError("");
    setEnviando(true);
    try {
      setMembresia(await darDeAlta(token, eleccion, nuevo));
      setPaso("listo");
    } catch (err) {
      setError(mensaje(err, "No se pudo completar tu alta."));
    } finally {
      setEnviando(false);
    }
  }

  async function onDescargar() {
    if (!token || !membresia) return;
    setError("");
    setBajando(true);
    try {
      await descargarPase(token, membresia.membership_number);
    } catch (err) {
      setError(mensaje(err, "No se pudo generar tu tarjeta."));
    } finally {
      setBajando(false);
    }
  }

  const indice = PASOS.findIndex((p) => p.id === paso);

  return (
    <div
      id="alta"
      className="scroll-mt-32 rounded-[28px] border border-white/10 bg-[#141414] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-8"
    >
      {/* Stepper */}
      <ol className="mb-7 flex items-center gap-1.5">
        {PASOS.map((p, i) => {
          const hecho = i < indice;
          const activo = i === indice;
          return (
            <li key={p.id} className="flex flex-1 flex-col gap-2">
              <span
                className={`h-1 w-full rounded-full transition-colors ${
                  hecho || activo ? "bg-[#FFC600]" : "bg-white/10"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  activo
                    ? "text-[#FFC600]"
                    : hecho
                      ? "text-white/55"
                      : "text-white/25"
                }`}
              >
                {p.label}
              </span>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {aviso && !error ? (
        <p className="mb-5 rounded-xl border border-[#FFC600]/30 bg-[#FFC600]/10 px-4 py-3 text-sm text-[#FFD34A]">
          {aviso}
        </p>
      ) : null}

      {paso === "telefono" ? (
        <div className="flex flex-col gap-5">
          <Encabezado
            titulo="Únete gratis"
            sub="Sin descargar ninguna app. Solo necesitamos tu celular."
          />
          <div>
            <label className={LABEL} htmlFor="club-tel">
              Celular
            </label>
            <input
              id="club-tel"
              className={INPUT}
              value={telefono}
              onChange={(e) =>
                setTelefono(soloDigitos(e.target.value).slice(0, 10))
              }
              placeholder="10 dígitos"
              inputMode="numeric"
              autoComplete="tel-national"
              disabled={enviando}
            />
            <p className="mt-2 text-[12px] leading-relaxed text-white/40">
              Te enviaremos un código por WhatsApp para confirmar que es tuyo.
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="club-nombre">
              Nombre <span className="text-white/25">(opcional)</span>
            </label>
            <input
              id="club-nombre"
              className={INPUT}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="¿Cómo te llamamos?"
              autoComplete="name"
              disabled={enviando}
            />
          </div>
          <Boton onClick={onPedirCodigo} disabled={!telefonoOk || enviando}>
            {enviando ? "Enviando…" : "Enviarme el código"}
          </Boton>
        </div>
      ) : null}

      {paso === "codigo" ? (
        <div className="flex flex-col gap-5">
          <Encabezado
            titulo="Confirma tu celular"
            sub={`Escribe el código que llegó al ${soloDigitos(telefono).replace(
              /(\d{3})(\d{3})(\d{4})/,
              "$1 $2 $3"
            )} por WhatsApp.`}
          />
          <div>
            <label className={LABEL} htmlFor="club-codigo">
              Código de 6 dígitos
            </label>
            <input
              id="club-codigo"
              className={`${INPUT} text-center text-2xl font-bold tracking-[0.5em]`}
              value={codigo}
              onChange={(e) =>
                setCodigo(soloDigitos(e.target.value).slice(0, 6))
              }
              placeholder="······"
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={enviando}
            />
          </div>
          <Boton onClick={onVerificar} disabled={!codigoOk || enviando}>
            {enviando ? "Verificando…" : "Continuar"}
          </Boton>
          <div className="flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={() => {
                setCodigo("");
                setError("");
                setAviso("");
                setPaso("telefono");
              }}
              disabled={enviando}
              className="text-white/45 transition-colors hover:text-white disabled:opacity-40"
            >
              ← Cambiar número
            </button>
            <button
              type="button"
              onClick={onPedirCodigo}
              disabled={enviando}
              className="font-semibold text-[#FFC600] transition-colors hover:text-[#FFD34A] disabled:opacity-40"
            >
              Reenviar código
            </button>
          </div>
        </div>
      ) : null}

      {paso === "vehiculo" ? (
        <div className="flex flex-col gap-5">
          <Encabezado
            titulo="¿Para qué vehículo?"
            sub="La membresía es por auto. Si tienes varios, puedes dar de alta cada uno."
          />

          <div className="flex flex-col gap-2">
            {disponibles.map((v) => (
              <Opcion
                key={v.id}
                seleccionada={eleccion === String(v.id)}
                onClick={() => setEleccion(String(v.id))}
                titulo={etiquetaVehiculo(v)}
                sub="Ya lo tenemos registrado a tu nombre"
              />
            ))}
            <Opcion
              seleccionada={eleccion === "nuevo"}
              onClick={() => setEleccion("nuevo")}
              titulo="Registrar otro vehículo"
              sub="Captura placa, marca y modelo"
            />
            <Opcion
              seleccionada={eleccion === "despues"}
              onClick={() => !yaTieneDiferida && setEleccion("despues")}
              disabled={yaTieneDiferida}
              titulo="Lo registro después"
              sub={
                yaTieneDiferida
                  ? "Ya tienes una membresía pendiente de asignar"
                  : "Tu vendedor captura los datos en tu próxima visita"
              }
            />
          </div>

          {eleccion === "nuevo" ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <label className={LABEL} htmlFor="club-placa">
                  Placa
                </label>
                <input
                  id="club-placa"
                  className={INPUT}
                  value={nuevo.placa}
                  onChange={(e) =>
                    setNuevo((n) => ({
                      ...n,
                      placa: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="ABC-123-D"
                  disabled={enviando}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_90px]">
                <div>
                  <label className={LABEL} htmlFor="club-marca">
                    Marca
                  </label>
                  <input
                    id="club-marca"
                    className={INPUT}
                    value={nuevo.marca}
                    onChange={(e) =>
                      setNuevo((n) => ({ ...n, marca: e.target.value }))
                    }
                    placeholder="Nissan"
                    disabled={enviando}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="club-modelo">
                    Modelo
                  </label>
                  <input
                    id="club-modelo"
                    className={INPUT}
                    value={nuevo.modelo}
                    onChange={(e) =>
                      setNuevo((n) => ({ ...n, modelo: e.target.value }))
                    }
                    placeholder="Versa"
                    disabled={enviando}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="club-anio">
                    Año
                  </label>
                  <input
                    id="club-anio"
                    className={INPUT}
                    value={nuevo.anio}
                    onChange={(e) =>
                      setNuevo((n) => ({
                        ...n,
                        anio: soloDigitos(e.target.value).slice(0, 4),
                      }))
                    }
                    placeholder="2020"
                    inputMode="numeric"
                    disabled={enviando}
                  />
                </div>
              </div>
              <p className="text-[12px] text-white/40">
                Con la placa o la marca nos basta.
              </p>
            </div>
          ) : null}

          {eleccion === "despues" ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-white/60">
              Tu membresía queda a tu nombre y en tu próxima visita el vendedor
              captura los datos de tu vehículo.
            </p>
          ) : null}

          <Boton onClick={onAlta} disabled={enviando || !altaLista}>
            {enviando ? "Dando de alta…" : "Unirme al Club"}
          </Boton>
        </div>
      ) : null}

      {paso === "listo" ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC600] text-2xl text-black">
              ✓
            </span>
            <h2
              className="m-0 text-3xl font-black uppercase leading-none tracking-[0.04em] text-white"
              style={{
                fontFamily:
                  "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif",
              }}
            >
              ¡Ya eres del Club!
            </h2>
            <p className="m-0 max-w-[340px] text-[14px] leading-relaxed text-white/55">
              Tu membresía queda pendiente de activación. Preséntala en
              cualquier sucursal Yantissimo para activarla y empezar a usar tus
              beneficios.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-center">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Número de membresía
            </p>
            <p className="m-0 mt-1 break-all font-mono text-[13px] text-white">
              {membresia?.membership_number}
            </p>
          </div>

          <Boton onClick={onDescargar} disabled={bajando}>
            {bajando ? "Generando…" : "Agregar a Apple Wallet"}
          </Boton>
          <p className="text-center text-[12px] text-white/40">
            ¿Android? Guarda el número o preséntalo en sucursal; ahí te damos tu
            tarjeta.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Encabezado({ titulo, sub }: { titulo: string; sub: string }) {
  return (
    <div>
      <h2
        className="m-0 text-[28px] font-black uppercase leading-none tracking-[0.04em] text-white"
        style={{
          fontFamily:
            "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif",
        }}
      >
        {titulo}
      </h2>
      <p className="m-0 mt-2 text-[14px] leading-relaxed text-white/50">{sub}</p>
    </div>
  );
}

function Boton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC600] px-6 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFD34A] hover:shadow-[0_18px_50px_rgba(255,211,74,0.35)] disabled:pointer-events-none disabled:bg-white/10 disabled:text-white/35"
    >
      {children}
    </button>
  );
}

function Opcion({
  titulo,
  sub,
  seleccionada,
  onClick,
  disabled,
}: {
  titulo: string;
  sub: string;
  seleccionada: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={seleccionada}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
        seleccionada
          ? "border-[#FFC600] bg-[#FFC600]/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/25"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          seleccionada ? "border-[#FFC600]" : "border-white/25"
        }`}
      >
        {seleccionada ? (
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFC600]" />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-white">
          {titulo}
        </span>
        <span className="block text-[12px] text-white/45">{sub}</span>
      </span>
    </button>
  );
}
