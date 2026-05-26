"use client";

import Image from "components/safe-image";
import {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./survey-page.module.css";

const STAR_QUESTIONS = [
  {
    id: "atencion",
    num: "01",
    label: "Atención al cliente",
    hint: "Trato, amabilidad y claridad en la información.",
  },
  {
    id: "tiempo",
    num: "02",
    label: "Tiempo de servicio",
    hint: "¿Se cumplió el tiempo prometido?",
  },
  {
    id: "calidad",
    num: "03",
    label: "Calidad del trabajo",
    hint: "Resultado final y atención al detalle.",
  },
  {
    id: "instalaciones",
    num: "04",
    label: "Instalaciones y limpieza",
    hint: "Orden, higiene y comodidad del taller.",
  },
  {
    id: "confianza",
    num: "05",
    label: "Confianza",
    hint: "¿Te sentiste en buenas manos?",
  },
] as const;

const STAR_LABELS = ["", "Mala", "Regular", "Buena", "Muy buena", "Excelente"];
const MAX_COMMENT_LENGTH = 600;

type QuestionId = (typeof STAR_QUESTIONS)[number]["id"];
type Ratings = Record<QuestionId, number>;

const INITIAL_RATINGS = STAR_QUESTIONS.reduce((acc, question) => {
  acc[question.id] = 0;
  return acc;
}, {} as Ratings);

const INITIAL_HOVERED = STAR_QUESTIONS.reduce((acc, question) => {
  acc[question.id] = 0;
  return acc;
}, {} as Ratings);

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.8l-6.1 3.2 1.5-6.8L2.2 9.5l6.9-.7L12 2.5z" />
    </svg>
  );
}

type NpsSliderControl = HTMLDivElement & {
  npsSlider?: {
    value: number;
    set: (value: number) => void;
    reset: () => void;
  };
};

function initNpsSlider(
  root: NpsSliderControl,
  onChange?: (value: number) => void,
) {
  const track = root.querySelector<HTMLDivElement>("[data-nps-track]");
  const thumb = root.querySelector<HTMLDivElement>("[data-nps-thumb]");

  if (!track || !thumb) {
    return () => {};
  }

  let pos = 0;
  let value = 0;
  let dragging = false;

  const render = (continuous: boolean) => {
    root.style.setProperty("--nps-value", (pos / 10).toString());
    root.setAttribute("aria-valuenow", String(value));
    if (!continuous && typeof onChange === "function") {
      onChange(value);
    }
  };

  const setFromClientX = (clientX: number) => {
    const rect = track.getBoundingClientRect();
    const thumbWidth = thumb.offsetWidth;
    const usable = rect.width - thumbWidth;
    const x = Math.max(
      0,
      Math.min(usable, clientX - rect.left - thumbWidth / 2),
    );
    pos = (usable > 0 ? x / usable : 0) * 10;
    const nextValue = Math.round(pos);
    const changed = nextValue !== value;
    value = nextValue;
    render(true);
    if (changed && typeof onChange === "function") {
      onChange(value);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    const draggingClass = styles["is-dragging"];
    if (draggingClass) {
      root.classList.add(draggingClass);
    }
    track.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
    root.focus();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (dragging) {
      setFromClientX(event.clientX);
    }
  };

  const endDrag = () => {
    if (!dragging) {
      return;
    }
    dragging = false;
    const draggingClass = styles["is-dragging"];
    if (draggingClass) {
      root.classList.remove(draggingClass);
    }
    pos = value;
    render(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    let next = value;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(10, value + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = Math.max(0, value - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 10;
        break;
      default:
        return;
    }
    event.preventDefault();
    value = next;
    pos = next;
    render(false);
  };

  track.addEventListener("pointerdown", onPointerDown);
  track.addEventListener("pointermove", onPointerMove);
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  root.addEventListener("keydown", onKeyDown);

  root.npsSlider = {
    get value() {
      return value;
    },
    set(v: number) {
      value = Math.max(0, Math.min(10, v | 0));
      pos = value;
      render(false);
    },
    reset() {
      value = 0;
      pos = 0;
      render(false);
    },
  };

  render(false);

  return () => {
    track.removeEventListener("pointerdown", onPointerDown);
    track.removeEventListener("pointermove", onPointerMove);
    track.removeEventListener("pointerup", endDrag);
    track.removeEventListener("pointercancel", endDrag);
    root.removeEventListener("keydown", onKeyDown);
    const draggingClass = styles["is-dragging"];
    if (draggingClass) {
      root.classList.remove(draggingClass);
    }
    delete root.npsSlider;
  };
}

export default function SurveyPage() {
  const [ratings, setRatings] = useState<Ratings>(INITIAL_RATINGS);
  const [hovered, setHovered] = useState<Ratings>(INITIAL_HOVERED);
  const [nps, setNps] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const npsSliderRef = useRef<NpsSliderControl | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const sliderRoot = npsSliderRef.current;
    if (!sliderRoot) {
      return;
    }

    let isFirstEmit = true;
    const destroy = initNpsSlider(sliderRoot, (nextValue) => {
      if (isFirstEmit) {
        isFirstEmit = false;
        return;
      }
      setNps(nextValue);
    });

    return () => {
      destroy();
    };
  }, []);

  const filledStars = useMemo(
    () => Object.values(ratings).filter((value) => value > 0).length,
    [ratings],
  );

  const completedSections = filledStars + (nps !== null ? 1 : 0);
  const completionPercent = (completedSections / 6) * 100;
  const canSubmit = filledStars === STAR_QUESTIONS.length && nps !== null;

  const averageScore = useMemo(() => {
    const total = Object.values(ratings).reduce((sum, value) => sum + value, 0);
    return (total / STAR_QUESTIONS.length).toFixed(1);
  }, [ratings]);

  const onStarKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentValue: number,
  ) => {
    const group = event.currentTarget.parentElement;
    if (!group) {
      return;
    }

    const buttons = Array.from(group.querySelectorAll("button"));
    if (!buttons.length) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = Math.min(buttons.length - 1, currentValue);
      buttons[nextIndex]?.focus();
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      const previousIndex = Math.max(0, currentValue - 2);
      buttons[previousIndex]?.focus();
    }
  };

  const submitSurvey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || nps === null || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/encuesta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ratings,
          nps,
          comments: comments.trim(),
          submittedAt: new Date().toISOString(),
          source: "encuesta-web",
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible enviar la encuesta.");
      }

      setHasSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_error) {
      setSubmitError(
        "No se pudo enviar en este momento. Intenta de nuevo en unos segundos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.strip}>
        <div className={styles.stripInner}>
          <span>
            <b>Yantissimo</b>{" "}
            <span className={styles.hideXs}>· Tu opinión nos mueve</span>
          </span>
          <span className={styles.hideXs}>
            Colima · Villa de Álvarez · Manzanillo · Comala
          </span>
        </div>
      </div>

      <header className={styles.masthead}>
        <Image
          src="/logo_blanco.svg"
          alt="Yantissimo"
          width={141}
          height={30}
          priority
        />
        <div className={styles.region}>
          <b>Encuesta</b>
          <span>2 minutos</span>
        </div>
      </header>

      <main className={styles.shell}>
        {!hasSubmitted && (
          <div className={styles.contentGrid}>
            <section className={styles.hero}>
              <p className={styles.eyebrow}>Tu opinión</p>
              <h1 className={styles.title}>
                ¿Cómo nos
                <br />
                <span className={styles.accent}>fue hoy?</span>
              </h1>
              <p className={styles.lead}>
                Ayúdanos a mejorar. Califica tu experiencia en cada punto — toma
                menos de dos minutos y leemos cada respuesta.
              </p>
            </section>

            <form className={styles.form} onSubmit={submitSurvey} noValidate>
              <div className={styles.progress}>
                <span className={styles.progressCount}>
                  <b>{completedSections}</b> / 6 completadas
                </span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              {STAR_QUESTIONS.map((question) => {
                const selected = ratings[question.id];
                const hoveredValue = hovered[question.id];
                const shownLabel = hoveredValue || selected;

                return (
                  <div key={question.id} className={styles.q}>
                    <div className={styles.qHead}>
                      <span className={styles.qNum}>{question.num}</span>
                      <h2 className={styles.qLabel}>{question.label}</h2>
                    </div>
                    <p className={styles.qHint}>{question.hint}</p>
                    <div
                      className={styles.stars}
                      role="radiogroup"
                      aria-label={question.label}
                    >
                      <div className={styles.starGroup}>
                        {[1, 2, 3, 4, 5].map((value) => {
                          const starClassName = [
                            styles.star,
                            value <= selected ? styles.isOn : "",
                            hoveredValue > 0 && value <= hoveredValue
                              ? styles.isHover
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ");

                          return (
                            <button
                              key={value}
                              type="button"
                              className={starClassName}
                              role="radio"
                              aria-checked={selected === value}
                              aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                              onMouseEnter={() =>
                                setHovered((prev) => ({
                                  ...prev,
                                  [question.id]: value,
                                }))
                              }
                              onMouseLeave={() =>
                                setHovered((prev) => ({
                                  ...prev,
                                  [question.id]: 0,
                                }))
                              }
                              onClick={() =>
                                setRatings((prev) => ({
                                  ...prev,
                                  [question.id]: value,
                                }))
                              }
                              onKeyDown={(event) => onStarKeyDown(event, value)}
                            >
                              <StarIcon />
                            </button>
                          );
                        })}
                      </div>
                      <span
                        className={[
                          styles.starLabel,
                          shownLabel > 0 ? styles.isFilled : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {STAR_LABELS[shownLabel]}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className={styles.q}>
                <div className={styles.qHead}>
                  <span className={styles.qNum}>06</span>
                  <h2 className={styles.qLabel}>
                    ¿Qué tan probable es que nos recomiendes?
                  </h2>
                </div>
                <p className={styles.qHint}>
                  De 0 (nada probable) a 10 (muy probable).
                </p>
                <div className={styles.nps}>
                  <div
                    id="nps1"
                    ref={npsSliderRef}
                    className={styles["nps-slider"]}
                    role="slider"
                    aria-label="Probabilidad de recomendarnos"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={0}
                    tabIndex={0}
                  >
                    <div
                      className={styles["nps-slider__track"]}
                      data-nps-track="true"
                    >
                      <div className={styles["nps-slider__rail"]}>
                        <div className={styles["nps-slider__fill"]} />
                      </div>
                      <div
                        className={styles["nps-slider__thumb"]}
                        data-nps-thumb="true"
                      />
                    </div>
                    <div className={styles["nps-slider__ends"]}>
                      <span>0</span>
                      <span>
                        <b id="nps-value">{nps ?? 0}</b> / 10
                      </span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.q}>
                <div className={styles.qHead}>
                  <span className={styles.qNum}>07</span>
                  <h2 className={styles.qLabel}>Comentarios</h2>
                </div>
                <p className={styles.qHint}>
                  Cuéntanos lo que quieras — qué podemos mejorar, qué te
                  encantó.
                </p>
                <div className={styles.taWrap}>
                  <textarea
                    value={comments}
                    maxLength={MAX_COMMENT_LENGTH}
                    placeholder="Opcional. Tu comentario llega directo al equipo."
                    onChange={(event) => setComments(event.target.value)}
                  />
                  <div className={styles.charCount}>
                    <span>{comments.length}</span> / {MAX_COMMENT_LENGTH}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar encuesta"}
                  <span className={styles.arrow}>→</span>
                </button>
                <span className={styles.legal}>Yantissimo 2026</span>
              </div>

              {submitError ? (
                <p className={styles.submitError} role="alert">
                  {submitError}
                </p>
              ) : null}
            </form>
          </div>
        )}

        {hasSubmitted ? (
          <section className={`${styles.thanks} ${styles.isOn}`}>
            <div className={styles.mark} aria-hidden="true">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </div>
            <h2>
              ¡Gracias,
              <br />
              <span className={styles.accent}>nos vemos pronto!</span>
            </h2>
            <p>
              Tu opinión ya llegó al equipo. Seguimos trabajando para que tu
              auto esté en las mejores manos.
            </p>
            <div className={styles.summary}>
              <span>
                Promedio <b>{averageScore} ★</b>
              </span>
              <span>
                Recomendación <b>{nps}/10</b>
              </span>
            </div>
          </section>
        ) : null}
      </main>
    </section>
  );
}
