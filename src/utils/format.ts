import type { AnalysisStatus, IntegrityLevel, RiskLevel, Team, VerificationStatus, SourceType } from "@/types";

export const pct = (p: number, d = 1) => `${(p * 100).toFixed(d)}%`;
export const odds = (o: number) => o.toFixed(2);
export const ev = (e: number) => `${e >= 0 ? "+" : ""}${(e * 100).toFixed(1)}%`;
export const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short", timeZone: "Europe/Madrid" });
export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
export const dateTime = (iso: string) => `${dateShort(iso)} · ${time(iso)}`;

export const teamMap = (teams: Team[]) => Object.fromEntries(teams.map((t) => [t.id, t])) as Record<string, Team>;

export const INTEGRITY_LABEL: Record<IntegrityLevel, string> = {
  verde: "Información suficiente y verificada",
  amarillo: "Incompleta, pero analizable",
  naranja: "Incertidumbre importante",
  rojo: "Falta información crítica",
};
export const STATUS_LABEL: Record<AnalysisStatus, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Análisis completado",
  finalizado: "Finalizado",
};
export const RISK_LABEL: Record<RiskLevel, string> = { bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico" };
export const VERIF_LABEL: Record<VerificationStatus, string> = {
  confirmado: "Confirmado",
  corroborado: "Corroborado",
  probable: "Probable",
  no_confirmado: "No confirmado",
  contradictorio: "Contradictorio",
  no_encontrado: "No encontrado",
  desactualizado: "Desactualizado",
};
export const SOURCE_LABEL: Record<SourceType, string> = {
  hecho: "Hecho confirmado",
  oficial: "Declaración oficial",
  periodistica: "Información periodística",
  rumor: "Rumor",
  opinion: "Opinión",
  analista: "Interpretación del analista",
  prediccion: "Predicción",
};
