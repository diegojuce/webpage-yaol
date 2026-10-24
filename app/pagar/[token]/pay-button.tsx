"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payQuote } from "./actions";

export default function PayButton({
  token,
  label,
}: {
  token: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await payQuote(token);
      if (result.ok) {
        router.push(`/pago/${result.sessionId}`);
        return;
      }
      setError(result.message);
    } catch {
      setError("No se pudo iniciar el pago. Inténtalo de nuevo.");
    }
    setPending(false);
  };

  return (
    <>
      {error ? (
        <p role="alert" className="success__lead" style={{ color: "#E53935" }}>
          {error}
        </p>
      ) : null}
      <div className="success__actions">
        <button
          type="button"
          className={`cta ${pending ? "cta--loading" : ""}`}
          disabled={pending}
          onClick={handlePay}
        >
          {pending ? (
            <span className="cta__spin" />
          ) : (
            <>
              {label} <span className="cta__arrow">→</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
