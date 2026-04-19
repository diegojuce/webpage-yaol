"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./homepage-logo-loader.module.css";

const WHEEL_ICON_SRC = "/llanta_icon.svg";
const LOGO_O_CENTER_RATIO = 0.905;
const LOGO_O_OFFSET_PX = 0;
const ANIMATION_SPEED_FACTOR = 2;

const scaleTime = (seconds: number) => seconds / ANIMATION_SPEED_FACTOR;

declare global {
  interface Window {
    gsap?: {
      set: (target: gsapTarget, vars: Record<string, unknown>) => void;
      to: (
        target: gsapTarget,
        vars: Record<string, unknown>,
      ) => { kill: () => void };
      timeline: (vars?: Record<string, unknown>) => gsapTimeline;
      getProperty: (target: gsapTarget, property: string) => number;
      utils: {
        clamp: (min: number, max: number, value: number) => number;
      };
    };
  }
}

type gsapTarget = Element | Element[] | string | null | undefined;
type gsapTimeline = {
  to: (
    target: gsapTarget,
    vars: Record<string, unknown>,
    position?: string,
  ) => gsapTimeline;
  kill: () => void;
};

type HomepageLogoLoaderProps = {
  onFinish?: () => void;
};

export default function HomepageLogoLoader({
  onFinish,
}: HomepageLogoLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isGsapReady, setIsGsapReady] = useState(false);
  const [hasWheelIconError, setHasWheelIconError] = useState(false);
  const hasFinishedRef = useRef(false);

  const finishLoader = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinish?.();
    setIsVisible(false);
  }, [onFinish]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const logoMaskRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  const loadingTextRef = useRef<HTMLParagraphElement>(null);
  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const wheelIconRef = useRef<HTMLImageElement>(null);
  const rimRef = useRef<HTMLDivElement>(null);
  const spokesRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.gsap) {
      setIsGsapReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || isGsapReady) return;
    const fallback = window.setTimeout(() => {
      finishLoader();
    }, 4000);

    return () => window.clearTimeout(fallback);
  }, [finishLoader, isVisible, isGsapReady]);

  useEffect(() => {
    if (!isVisible || !isGsapReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishLoader();
      return;
    }

    const gsap = window.gsap;
    const overlay = overlayRef.current;
    const scene = sceneRef.current;
    const logoMask = logoMaskRef.current;
    const logoImage = logoImageRef.current;
    const loadingText = loadingTextRef.current;
    const wheelWrap = wheelWrapRef.current;
    const wheel = wheelRef.current;
    const wheelIcon = wheelIconRef.current;
    const rim = rimRef.current;
    const spokes = spokesRef.current;
    const hub = hubRef.current;

    if (
      !gsap ||
      !overlay ||
      !scene ||
      !logoMask ||
      !logoImage ||
      !loadingText ||
      !wheelWrap ||
      !wheel ||
      !wheelIcon ||
      !rim ||
      !spokes ||
      !hub
    ) {
      finishLoader();
      return;
    }

    const sceneRect = scene.getBoundingClientRect();
    const sceneWidth = sceneRect.width;
    const logoRect = logoImage.getBoundingClientRect();
    const wheelSize = wheelWrap.getBoundingClientRect().width;
    const hasMeasuredLogo = logoRect.width > 0;
    const logoWidth = hasMeasuredLogo ? logoRect.width : sceneWidth * 0.66;
    const logoLeft = hasMeasuredLogo
      ? logoRect.left - sceneRect.left
      : (sceneWidth - logoWidth) / 2;

    const startX = sceneWidth * 0.07 - wheelSize / 2;
    const endCenterX =
      logoLeft + logoWidth * LOGO_O_CENTER_RATIO + LOGO_O_OFFSET_PX;
    const endX = endCenterX - wheelSize / 2;
    const distance = Math.max(endX - startX, 1);
    const rollingDegrees = (distance / (Math.PI * wheelSize)) * 360;

    gsap.set(logoMask, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(wheelWrap, { x: 0, y: 0, yPercent: -50, rotation: 0 });
    gsap.set(loadingText, { x: 0, opacity: 0.92 });
    gsap.set(wheel, { opacity: 1 });
    gsap.set(wheelIcon, { opacity: 0, scale: 0.84 });
    gsap.set([rim, spokes, hub], { opacity: 0, scale: 0.74 });

    const revealLogo = () => {
      const x = gsap.getProperty(wheelWrap, "x");
      const progress = gsap.utils.clamp(0, 1, x / distance);
      gsap.set(logoMask, { clipPath: `inset(0 ${100 - progress * 100}% 0 0)` });
    };

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: scaleTime(0.45),
          ease: "power2.out",
          onComplete: finishLoader,
        });
      },
    });

    timeline
      .to(wheelWrap, {
        rotation: 430,
        duration: scaleTime(0.88),
        ease: "none",
      })
      .to(
        wheel,
        {
          borderColor: "#0d0d0d",
          borderTopColor: "#0d0d0d",
          background:
            "radial-gradient(circle at 50% 50%, #2c2c2c 0%, #141414 60%, #090909 100%)",
          boxShadow: "0 0 0 2px #252525 inset, 0 12px 20px rgba(0, 0, 0, 0.4)",
          duration: scaleTime(0.45),
          ease: "power2.inOut",
        },
        `-=${scaleTime(0.2)}`,
      )
      .to(
        hasWheelIconError ? [rim, spokes, hub] : wheelIcon,
        hasWheelIconError
          ? {
              opacity: 1,
              scale: 1,
              duration: scaleTime(0.45),
              stagger: scaleTime(0.05),
              ease: "power2.out",
            }
          : {
              opacity: 1,
              scale: 1,
              duration: scaleTime(0.45),
              ease: "power2.out",
            },
        "<",
      )
      .to(wheelWrap, {
        x: distance,
        rotation: `+=${rollingDegrees}`,
        duration: scaleTime(1.65),
        ease: "power4.inOut",
        onUpdate: revealLogo,
      })
      .to(
        loadingText,
        {
          opacity: 0,
          x: 8,
          duration: scaleTime(0.32),
          ease: "power2.out",
        },
        `<+=${scaleTime(0.04)}`,
      )
      .to(
        hasWheelIconError ? wheel : [wheelIcon, wheel],
        {
          opacity: 0,
          duration: scaleTime(0.28),
          ease: "power2.out",
        },
        `+=${scaleTime(0.02)}`,
      );

    revealLogo();

    return () => timeline.kill();
  }, [finishLoader, hasWheelIconError, isGsapReady, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsGsapReady(true)}
      />
      <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
        <div ref={sceneRef} className={styles.scene}>
          <p ref={loadingTextRef} className={styles.loadingText}>
            Cargando...
          </p>
          <div ref={logoMaskRef} className={styles.logoMask}>
            <img
              ref={logoImageRef}
              src="/logo_blanco.svg"
              alt=""
              className={styles.logoImage}
            />
          </div>

          <div ref={wheelWrapRef} className={styles.wheelWrap}>
            <div ref={wheelRef} className={styles.wheel}>
              <img
                ref={wheelIconRef}
                src={WHEEL_ICON_SRC}
                alt=""
                className={styles.wheelIcon}
                onError={() => setHasWheelIconError(true)}
              />
              <div ref={rimRef} className={styles.rim} />
              <div ref={spokesRef} className={styles.spokes} />
              <div ref={hubRef} className={styles.hub} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
