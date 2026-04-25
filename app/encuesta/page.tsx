import type { Metadata } from "next";
import SurveyPage from "./survey-page";

export const metadata: Metadata = {
  title: "Encuesta de satisfacción",
  description:
    "Encuesta de satisfacción de Yantissimo para calificar tu experiencia de servicio.",
};

export default function EncuestaPage() {
  return <SurveyPage />;
}
