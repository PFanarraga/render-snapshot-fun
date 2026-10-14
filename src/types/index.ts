// Domain types for FIE. Mirror these in the future FastAPI (Pydantic) schemas.

export type IntegrityLevel = "verde" | "amarillo" | "naranja" | "rojo";
export type RiskLevel = "bajo" | "medio" | "alto" | "critico";
export type AnalysisStatus = "pendiente" | "en_proceso" | "completado" | "finalizado";
export type Recommendation =
  | "OPORTUNIDAD DETECTADA"
  | "ESPERAR CONFIRMACIÓN"
  | "VALOR INSUFICIENTE"
  | "RIESGO ELEVADO"
  | "INFORMACIÓN INSUFICIENTE"
  | "SIN OPORTUNIDADES";
export type MarketCategory =
  | "1X2"
  | "Doble oportunidad"
  | "Goles"
  | "Ambos marcan"
  | "Córners"
  | "Tarjetas"
  | "Jugadores"
  | "Otros";
export type MarketKey = "1x2" | "goles" | "btts" | "corners" | "tarjetas" | "jugadores";
export type VerificationStatus =
  | "confirmado"
  | "corroborado"
  | "probable"
  | "no_confirmado"
  | "contradictorio"
  | "no_encontrado"
  | "desactualizado";
export type SourceType =
  | "hecho"
  | "oficial"
  | "periodistica"
  | "rumor"
  | "opinion"
  | "analista"
  | "prediccion";
export type FormResult = "W" | "D" | "L";

export interface Team {
  id: string;
  name: string;
  short: string;
  city: string;
  stadium: string;
  colors: [string, string];
  coach: string;
  strength: number;
}

export interface Split {
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
}

export interface TeamStats {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: FormResult[];
  home: Split;
  away: Split;
  xg: number;
  xga: number;
  shotsPerGame: number;
  shotsOnTargetPerGame: number;
  possession: number;
  cleanSheets: number;
  pointsByRound: number[];
  xgByRound: number[];
}

export interface Match {
  id: string;
  round: number;
  kickoff: string;
  homeId: string;
  awayId: string;
  stadium: string;
  status: AnalysisStatus;
  integrity: IntegrityLevel;
  score?: { home: number; away: number };
  probs: { home: number; draw: number; away: number };
  xg: { home: number; away: number };
  over25: number;
  btts: number;
  marketIntegrity: Record<MarketKey, IntegrityLevel>;
  recommendation: Recommendation;
  mainForecast: string;
}

export interface Opportunity {
  id: string;
  matchId: string;
  category: MarketCategory;
  selection: string;
  probability: number;
  odds: number;
  fairOdds: number;
  minOdds: number;
  ev: number;
  confidence: number;
  risk: RiskLevel;
  integrity: IntegrityLevel;
  updatedAt: string;
  isValue: boolean;
}

export type Position = "POR" | "DEF" | "MED" | "DEL";
export type Availability = "disponible" | "duda" | "lesionado" | "sancionado";

export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: Position;
  number: number;
  age: number;
  nationality: string;
  minutes: number;
  apps: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  xg: number;
  xa: number;
  yellow: number;
  red: number;
  availability: Availability;
  injuries: { date: string; type: string; daysOut: number }[];
  suspensions: { date: string; reason: string; matches: number }[];
  minutesByRound: number[];
}

export interface EvidenceItem {
  id: string;
  title: string;
  detail: string;
  source: string;
  sourceType: SourceType;
  status: VerificationStatus;
  reliability: number;
  publishedAt: string;
  extractedAt: string;
}

export interface IntelRecord extends EvidenceItem {
  module: string;
  matchId?: string;
}

export interface Contradiction {
  id: string;
  topic: string;
  matchId: string;
  versions: {
    source: string;
    claim: string;
    sourceType: SourceType;
    status: VerificationStatus;
    publishedAt: string;
  }[];
}

export interface DossierSection {
  key: string;
  title: string;
  items: EvidenceItem[];
}

export interface Prediction {
  id: string;
  matchId: string;
  analyzedAt: string;
  market: MarketCategory;
  forecast: string;
  probability: number;
  probs: { home: number; draw: number; away: number };
  odds: number;
  closingOdds: number;
  ev: number;
  risk: RiskLevel;
  integrity: IntegrityLevel;
  infoSnapshot: string;
  modelVersion: string;
  result: "ganada" | "perdida" | "anulada";
  stake: number;
  profit: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  brier: number;
  logLoss: number;
  accuracy: number;
  roi: number;
  calibrationError: number;
  status: "activo" | "experimental" | "referencia";
}

export interface IntelModule {
  id: string;
  name: string;
  status: "activo" | "pausado" | "error" | "pendiente";
  lastRun: string;
  items: number;
}

export interface Alert {
  id: string;
  level: "critico" | "advertencia" | "info";
  title: string;
  detail: string;
  at: string;
  matchId?: string;
}

export interface Settings {
  markets: MarketCategory[];
  minEv: number;
  maxRisk: RiskLevel;
  prioritySources: string[];
  notifications: boolean;
  criticalOnly: boolean;
  theme: "oscuro" | "claro";
  language: "es" | "en";
}
