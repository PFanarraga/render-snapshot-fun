/**
 * Service layer. Today it resolves DEMO data; later swap each function body
 * for `fetch(`${API_BASE}/...`)` against the FastAPI backend.
 */
import * as demo from "@/data/demo";
import type { Settings } from "@/types";

export const API_BASE = import.meta.env.VITE_FIE_API_URL ?? "";
const delay = <T,>(v: T) => Promise.resolve(v);

export const api = {
  meta: () =>
    delay({ season: demo.SEASON, modelVersion: demo.MODEL_VERSION, currentRound: demo.CURRENT_ROUND, now: demo.NOW, isDemo: true }),
  teams: () => delay(demo.teams),
  standings: () => delay(demo.standings),
  team: (id: string) =>
    delay({
      team: demo.teams.find((t) => t.id === id) ?? null,
      stats: demo.standings.find((s) => s.teamId === id) ?? null,
      players: demo.players.filter((p) => p.teamId === id),
      matches: demo.matches.filter((m) => m.homeId === id || m.awayId === id),
    }),
  matches: () => delay(demo.matches),
  match: (id: string) => {
    const match = demo.matches.find((m) => m.id === id) ?? null;
    return delay({
      match,
      opportunities: demo.opportunities.filter((o) => o.matchId === id),
      dossier: match ? demo.buildDossier(id) : [],
      contradictions: demo.contradictions.filter((c) => c.matchId === id),
      players: match ? demo.players.filter((p) => p.teamId === match.homeId || p.teamId === match.awayId) : [],
    });
  },
  opportunities: () => delay(demo.opportunities),
  players: () => delay(demo.players),
  player: (id: string) => delay(demo.players.find((p) => p.id === id) ?? null),
  intelligence: () =>
    delay({ modules: demo.intelModules, records: demo.intelRecords, contradictions: demo.contradictions }),
  history: () => delay(demo.predictions),
  lab: () => delay({ models: demo.models, evolution: demo.labEvolution, byMarket: demo.labByMarket, calibration: demo.labCalibration }),
  alerts: () => delay(demo.alerts),
  defaultSettings: (): Settings => ({
    markets: ["1X2", "Doble oportunidad", "Goles", "Ambos marcan", "Córners", "Tarjetas", "Jugadores", "Otros"],
    minEv: 3,
    maxRisk: "alto",
    prioritySources: ["Fuentes oficiales", "Agencias"],
    notifications: true,
    criticalOnly: false,
    theme: "oscuro",
    language: "es",
  }),
};
