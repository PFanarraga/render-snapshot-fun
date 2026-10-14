/**
 * DEMO DATA LAYER — every value here is fictitious test data.
 * Generated deterministically from a seed. Replace via src/services/api.ts
 * once the FastAPI backend is available. Components never import this file.
 */
import type {
  Alert,
  Contradiction,
  DossierSection,
  EvidenceItem,
  IntegrityLevel,
  IntelModule,
  IntelRecord,
  MarketCategory,
  MarketKey,
  Match,
  ModelInfo,
  Opportunity,
  Player,
  Position,
  Prediction,
  Recommendation,
  RiskLevel,
  SourceType,
  Team,
  TeamStats,
  VerificationStatus,
} from "@/types";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20262027);
const r = (a: number, b: number) => a + rand() * (b - a);
const ri = (a: number, b: number) => Math.floor(r(a, b + 1));
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const round2 = (n: number) => Math.round(n * 100) / 100;

export const SEASON = "2026/27";
export const MODEL_VERSION = "fie-demo-0.4.1";
export const CURRENT_ROUND = 9;
export const NOW = "2026-10-14T01:00:00Z";

// Club names, cities and stadiums are public reference info; coaches and all metrics are DEMO.
const T: [string, string, string, string, string, string, string][] = [
  ["rma", "Real Madrid", "RMA", "Madrid", "Santiago Bernabéu", "#f5f5f5", "#1e3a8a"],
  ["fcb", "FC Barcelona", "FCB", "Barcelona", "Spotify Camp Nou", "#a50044", "#004d98"],
  ["atm", "Atlético de Madrid", "ATM", "Madrid", "Riyadh Air Metropolitano", "#cb3524", "#f5f5f5"],
  ["ath", "Athletic Club", "ATH", "Bilbao", "San Mamés", "#ee2523", "#ffffff"],
  ["vil", "Villarreal CF", "VIL", "Vila-real", "Estadio de la Cerámica", "#ffe667", "#005187"],
  ["rso", "Real Sociedad", "RSO", "San Sebastián", "Reale Arena", "#0067b1", "#ffffff"],
  ["bet", "Real Betis", "BET", "Sevilla", "Benito Villamarín", "#00954c", "#ffffff"],
  ["sev", "Sevilla FC", "SEV", "Sevilla", "Ramón Sánchez-Pizjuán", "#ffffff", "#d4021d"],
  ["val", "Valencia CF", "VAL", "Valencia", "Mestalla", "#ffffff", "#ee3524"],
  ["cel", "RC Celta", "CEL", "Vigo", "Abanca-Balaídos", "#8ac3ee", "#ffffff"],
  ["osa", "CA Osasuna", "OSA", "Pamplona", "El Sadar", "#d91a21", "#0a346f"],
  ["get", "Getafe CF", "GET", "Getafe", "Coliseum", "#005999", "#ffffff"],
  ["gir", "Girona FC", "GIR", "Girona", "Montilivi", "#cd2534", "#ffffff"],
  ["ray", "Rayo Vallecano", "RAY", "Madrid", "Estadio de Vallecas", "#ffffff", "#e53027"],
  ["mll", "RCD Mallorca", "MLL", "Palma", "Son Moix", "#e20613", "#000000"],
  ["esp", "RCD Espanyol", "ESP", "Barcelona", "RCDE Stadium", "#007fc8", "#ffffff"],
  ["ala", "Deportivo Alavés", "ALA", "Vitoria", "Mendizorroza", "#0761af", "#ffffff"],
  ["elc", "Elche CF", "ELC", "Elche", "Martínez Valero", "#ffffff", "#05642c"],
  ["lev", "Levante UD", "LEV", "Valencia", "Ciutat de València", "#004b96", "#b4053f"],
  ["ovi", "Real Oviedo", "OVI", "Oviedo", "Carlos Tartiere", "#0033a0", "#ffffff"],
];
const STRENGTH = [1.9, 1.95, 1.65, 1.4, 1.4, 1.25, 1.3, 1.1, 1.05, 1.1, 1.0, 0.9, 1.05, 1.0, 0.95, 0.95, 0.9, 0.85, 0.8, 0.8];

export const teams: Team[] = T.map(([id, name, short, city, stadium, c1, c2], i) => ({
  id,
  name,
  short,
  city,
  stadium,
  colors: [c1, c2],
  coach: `Entrenador DEMO ${String.fromCharCode(65 + i)}`,
  strength: STRENGTH[i],
}));
const teamById = (id: string) => teams.find((t) => t.id === id)!;

// --- Poisson model (demo) -------------------------------------------------
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const pois = (k: number, l: number) => (Math.exp(-l) * l ** k) / fact(k);
function poissonMarkets(lh: number, la: number) {
  let home = 0, draw = 0, away = 0, over = 0, btts = 0;
  for (let i = 0; i <= 8; i++)
    for (let j = 0; j <= 8; j++) {
      const p = pois(i, lh) * pois(j, la);
      if (i > j) home += p;
      else if (i === j) draw += p;
      else away += p;
      if (i + j > 2) over += p;
      if (i > 0 && j > 0) btts += p;
    }
  const s = home + draw + away;
  return { home: home / s, draw: draw / s, away: away / s, over25: over, btts };
}
function samplePois(l: number) {
  const L = Math.exp(-l);
  let k = 0, p = 1;
  do {
    k++;
    p *= rand();
  } while (p > L);
  return k - 1;
}

// --- Fixtures (circle method) --------------------------------------------
const ids = teams.map((t) => t.id);
const ROUNDS = 16;
const INT: IntegrityLevel[] = ["verde", "amarillo", "naranja", "rojo"];
const MARKET_KEYS: MarketKey[] = ["1x2", "goles", "btts", "corners", "tarjetas", "jugadores"];

const shiftInt = (base: IntegrityLevel, d: number): IntegrityLevel =>
  INT[Math.max(0, Math.min(3, INT.indexOf(base) + d))];

export const matches: Match[] = [];
{
  const rot = [...ids];
  for (let rd = 1; rd <= ROUNDS; rd++) {
    const base = new Date(Date.UTC(2026, 7, 22 + (rd - 1) * 7));
    for (let k = 0; k < 10; k++) {
      let h = rot[k], a = rot[19 - k];
      if ((rd + k) % 2 === 0) [h, a] = [a, h];
      const th = teamById(h), ta = teamById(a);
      const lh = 1.35 * (th.strength / ta.strength) ** 0.9 * 1.08;
      const la = 1.15 * (ta.strength / th.strength) ** 0.9 * 0.95;
      const pm = poissonMarkets(lh, la);
      const d = new Date(base);
      d.setUTCDate(d.getUTCDate() + Math.floor(k / 4));
      d.setUTCHours(pick([12, 14, 16, 17, 19]), pick([0, 15, 30]));
      const past = rd < CURRENT_ROUND;
      const integrity: IntegrityLevel = past
        ? pick(["verde", "verde", "amarillo"])
        : rd === CURRENT_ROUND
          ? pick(INT)
          : rd === CURRENT_ROUND + 1
            ? pick(["amarillo", "naranja", "rojo"])
            : pick(["naranja", "rojo", "rojo"]);
      const status = past
        ? "finalizado"
        : rd === CURRENT_ROUND
          ? pick(["completado", "completado", "en_proceso"] as const)
          : rd === CURRENT_ROUND + 1
            ? pick(["en_proceso", "pendiente"] as const)
            : "pendiente";
      const marketIntegrity = Object.fromEntries(
        MARKET_KEYS.map((m) => [m, shiftInt(integrity, ri(-1, 1))]),
      ) as Record<MarketKey, IntegrityLevel>;
      const fav = pm.home > pm.away ? th.name : ta.name;
      matches.push({
        id: `j${rd}-${h}-${a}`,
        round: rd,
        kickoff: d.toISOString(),
        homeId: h,
        awayId: a,
        stadium: th.stadium,
        status,
        integrity,
        score: past ? { home: samplePois(lh), away: samplePois(la) } : undefined,
        probs: { home: pm.home, draw: pm.draw, away: pm.away },
        xg: { home: round2(lh), away: round2(la) },
        over25: pm.over25,
        btts: pm.btts,
        marketIntegrity,
        recommendation: "SIN OPORTUNIDADES",
        mainForecast:
          Math.max(pm.home, pm.away) < 0.42 ? "Partido equilibrado (DEMO)" : `Ligera ventaja ${fav} (DEMO)`,
      });
    }
    rot.splice(1, 0, rot.pop()!);
  }
}
const matchById = (id: string) => matches.find((m) => m.id === id)!;

// --- Opportunities --------------------------------------------------------
function riskFor(odds: number, integ: IntegrityLevel): RiskLevel {
  if (integ === "rojo") return "critico";
  if (odds > 3.6 || integ === "naranja") return "alto";
  if (odds > 2.2) return "medio";
  return "bajo";
}
export const opportunities: Opportunity[] = [];
for (const m of matches.filter((x) => x.round >= CURRENT_ROUND && x.round <= CURRENT_ROUND + 2)) {
  const h = teamById(m.homeId).short, a = teamById(m.awayId).short;
  const rows: [MarketCategory, string, number, MarketKey][] = [
    ["1X2", `Victoria ${h}`, m.probs.home, "1x2"],
    ["1X2", "Empate", m.probs.draw, "1x2"],
    ["1X2", `Victoria ${a}`, m.probs.away, "1x2"],
    ["Doble oportunidad", `${h} o empate (1X)`, m.probs.home + m.probs.draw, "1x2"],
    ["Doble oportunidad", `${a} o empate (X2)`, m.probs.away + m.probs.draw, "1x2"],
    ["Goles", "Más de 2.5 goles", m.over25, "goles"],
    ["Goles", "Menos de 2.5 goles", 1 - m.over25, "goles"],
    ["Ambos marcan", "Ambos marcan: Sí", m.btts, "btts"],
    ["Ambos marcan", "Ambos marcan: No", 1 - m.btts, "btts"],
    ["Córners", "Más de 9.5 córners", r(0.38, 0.62), "corners"],
    ["Tarjetas", "Más de 4.5 tarjetas", r(0.33, 0.6), "tarjetas"],
    ["Jugadores", `Delantero DEMO ${h} marca`, r(0.2, 0.42), "jugadores"],
    ["Otros", `${h} gana 1ª parte`, m.probs.home * r(0.62, 0.72), "1x2"],
  ];
  rows.forEach(([category, selection, p, mk], i) => {
    const fair = 1 / p;
    const odds = round2(Math.max(1.03, fair * r(0.86, 1.1)));
    const integ = m.marketIntegrity[mk];
    const ev = p * odds - 1;
    const risk = riskFor(odds, integ);
    const confidence = Math.round(
      ({ verde: 82, amarillo: 66, naranja: 48, rojo: 25 })[integ] + r(-8, 8),
    );
    opportunities.push({
      id: `${m.id}-o${i}`,
      matchId: m.id,
      category,
      selection,
      probability: p,
      odds,
      fairOdds: round2(fair),
      minOdds: round2(fair * 1.03),
      ev,
      confidence,
      risk,
      integrity: integ,
      updatedAt: new Date(Date.parse(NOW) - ri(5, 600) * 60000).toISOString(),
      isValue: ev >= 0.03 && integ !== "rojo",
    });
  });
}
for (const m of matches) {
  if (m.round < CURRENT_ROUND) continue;
  const ops = opportunities.filter((o) => o.matchId === m.id);
  const best = ops.sort((x, y) => y.ev - x.ev)[0];
  let rec: Recommendation = "SIN OPORTUNIDADES";
  if (m.integrity === "rojo" || !best) rec = "INFORMACIÓN INSUFICIENTE";
  else if (best.ev > 0.05 && (best.risk === "alto" || best.risk === "critico")) rec = "RIESGO ELEVADO";
  else if (best.ev > 0.05 && m.integrity === "naranja") rec = "ESPERAR CONFIRMACIÓN";
  else if (best.ev > 0.05) rec = "OPORTUNIDAD DETECTADA";
  else if (best.ev > 0) rec = "VALOR INSUFICIENTE";
  m.recommendation = rec;
}

// --- Standings ------------------------------------------------------------
export const standings: TeamStats[] = (() => {
  const s: Record<string, TeamStats> = {};
  for (const t of teams)
    s[t.id] = {
      teamId: t.id, position: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0,
      form: [], home: { w: 0, d: 0, l: 0, gf: 0, ga: 0 }, away: { w: 0, d: 0, l: 0, gf: 0, ga: 0 },
      xg: 0, xga: 0, shotsPerGame: round2(r(9, 17)), shotsOnTargetPerGame: round2(r(3, 6.5)),
      possession: Math.round(r(40, 62)), cleanSheets: 0, pointsByRound: [], xgByRound: [],
    };
  for (const m of matches.filter((x) => x.score).sort((a, b) => a.round - b.round)) {
    const { home: gh, away: ga } = m.score!;
    const H = s[m.homeId], A = s[m.awayId];
    const xh = round2(m.xg.home * r(0.75, 1.25)), xa = round2(m.xg.away * r(0.75, 1.25));
    for (const [X, gf, gc, xf, xc, split] of [
      [H, gh, ga, xh, xa, "home"],
      [A, ga, gh, xa, xh, "away"],
    ] as const) {
      X.played++; X.gf += gf; X.ga += gc; X.xg += xf; X.xga += xc;
      X[split].gf += gf; X[split].ga += gc;
      if (gc === 0) X.cleanSheets++;
      const res = gf > gc ? "W" : gf === gc ? "D" : "L";
      if (res === "W") { X.won++; X.points += 3; X[split].w++; }
      else if (res === "D") { X.drawn++; X.points += 1; X[split].d++; }
      else { X.lost++; X[split].l++; }
      X.form.push(res);
      X.pointsByRound.push(X.points);
      X.xgByRound.push(xf);
    }
  }
  const arr = Object.values(s).map((x) => ({
    ...x, gd: x.gf - x.ga, xg: round2(x.xg), xga: round2(x.xga), form: x.form.slice(-5),
  }));
  arr.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  arr.forEach((x, i) => (x.position = i + 1));
  return arr;
})();

// --- Players --------------------------------------------------------------
const FIRST = ["Álex", "Bruno", "Carlos", "Dani", "Eric", "Fede", "Gonzalo", "Hugo", "Iker", "Javi", "Leo", "Mario", "Nico", "Óscar", "Pablo", "Raúl", "Sergio", "Toni", "Unai", "Víctor"];
const LAST = ["Arenas", "Blanco", "Castro", "Duarte", "Escudero", "Ferrer", "Gallego", "Herrera", "Iglesias", "Jurado", "Lozano", "Molina", "Navas", "Ortega", "Prieto", "Quintana", "Rivas", "Soler", "Tormo", "Vidal"];
const NAT = ["España", "Francia", "Argentina", "Brasil", "Portugal", "Uruguay", "Marruecos", "Países Bajos", "Colombia", "Alemania"];
const INJ = ["Molestias musculares", "Esguince de tobillo", "Rotura fibrilar", "Sobrecarga", "Contusión en rodilla"];
const POS: Position[] = ["POR", "DEF", "DEF", "DEF", "MED", "MED", "MED", "DEL", "DEL"];
export const players: Player[] = [];
teams.forEach((t) => {
  POS.forEach((pos, i) => {
    const apps = ri(2, CURRENT_ROUND - 1);
    const minutes = apps * ri(45, 90);
    const att = pos === "DEL" ? 1 : pos === "MED" ? 0.45 : pos === "DEF" ? 0.12 : 0;
    const shots = Math.round(apps * r(0.5, 3.5) * att);
    const xg = round2(shots * r(0.08, 0.16));
    const availability = pick(["disponible", "disponible", "disponible", "disponible", "duda", "lesionado", "sancionado"] as const);
    const injuries = Array.from({ length: ri(0, 3) }, (_, k) => ({
      date: new Date(Date.UTC(2026 - k, ri(0, 11), ri(1, 28))).toISOString(),
      type: pick(INJ),
      daysOut: ri(5, 60),
    }));
    players.push({
      id: `${t.id}-p${i}`,
      name: `${pick(FIRST)} ${pick(LAST)}`,
      teamId: t.id,
      position: pos,
      number: pos === "POR" ? 1 : ri(2, 30),
      age: ri(19, 35),
      nationality: pick(NAT),
      minutes,
      apps,
      goals: Math.max(0, Math.round(xg * r(0.6, 1.4))),
      assists: Math.round(apps * r(0, 0.3) * (att + 0.2)),
      shots,
      shotsOnTarget: Math.round(shots * r(0.3, 0.5)),
      xg,
      xa: round2(apps * r(0.02, 0.2) * (att + 0.2)),
      yellow: ri(0, 4),
      red: rand() > 0.92 ? 1 : 0,
      availability,
      injuries: availability === "lesionado" && injuries.length === 0 ? [{ date: NOW, type: pick(INJ), daysOut: ri(7, 30) }] : injuries,
      suspensions: availability === "sancionado" ? [{ date: NOW, reason: "Acumulación de amarillas (DEMO)", matches: 1 }] : [],
      minutesByRound: Array.from({ length: CURRENT_ROUND - 1 }, () => (rand() > 0.25 ? ri(10, 90) : 0)),
    });
  });
});

// --- Evidence / Intelligence ---------------------------------------------
const SOURCES = ["Fuente oficial DEMO (club)", "Diario deportivo DEMO A", "Diario regional DEMO B", "Agencia DEMO", "Cuenta social DEMO verificada", "Foro DEMO", "Analista FIE (DEMO)", "Proveedor de cuotas DEMO"];
const SRC_TYPE: Record<string, SourceType> = {
  "Fuente oficial DEMO (club)": "oficial", "Diario deportivo DEMO A": "periodistica", "Diario regional DEMO B": "periodistica",
  "Agencia DEMO": "hecho", "Cuenta social DEMO verificada": "rumor", "Foro DEMO": "opinion", "Analista FIE (DEMO)": "analista",
  "Proveedor de cuotas DEMO": "hecho",
};
const STATUS_BY_TYPE: Record<SourceType, VerificationStatus[]> = {
  oficial: ["confirmado"], hecho: ["confirmado", "corroborado"], periodistica: ["corroborado", "probable", "desactualizado"],
  rumor: ["no_confirmado", "contradictorio"], opinion: ["no_confirmado"], analista: ["probable"], prediccion: ["probable"],
};
let evId = 0;
function evidence(title: string, detail: string, source = pick(SOURCES)): EvidenceItem {
  const st = SRC_TYPE[source];
  const pub = Date.parse(NOW) - ri(1, 96) * 3600000;
  return {
    id: `ev${evId++}`, title, detail, source, sourceType: st, status: pick(STATUS_BY_TYPE[st]),
    reliability: Math.round(({ oficial: 95, hecho: 88, periodistica: 70, rumor: 30, opinion: 20, analista: 60, prediccion: 50 })[st] + r(-6, 6)),
    publishedAt: new Date(pub).toISOString(), extractedAt: new Date(pub + ri(5, 180) * 60000).toISOString(),
  };
}

export const DOSSIER_TABS: { key: string; title: string }[] = [
  { key: "estadisticas", title: "Estadísticas" }, { key: "equipos", title: "Equipos" }, { key: "jugadores", title: "Jugadores" },
  { key: "lesiones", title: "Lesiones y sanciones" }, { key: "alineaciones", title: "Alineaciones" }, { key: "tactica", title: "Táctica" },
  { key: "entrenadores", title: "Entrenadores" }, { key: "arbitro", title: "Árbitro" }, { key: "clima", title: "Clima" },
  { key: "estadio", title: "Estadio y terreno" }, { key: "calendario", title: "Calendario y descanso" },
  { key: "institucional", title: "Contexto institucional" }, { key: "psicologico", title: "Contexto psicológico" },
  { key: "h2h", title: "Enfrentamientos directos" }, { key: "noticias", title: "Noticias y redes" },
  { key: "mercado", title: "Mercado de apuestas" }, { key: "fuentes", title: "Fuentes y evidencias" },
  { key: "faltantes", title: "Datos faltantes" },
];
const TEMPLATES: Record<string, [string, string][]> = {
  estadisticas: [["Tendencia de xG", "El local promedia más xG en casa que fuera en las últimas jornadas (DEMO)."], ["Volumen de tiros", "Diferencia de tiros a puerta favorable al local (DEMO)."]],
  equipos: [["Estado de forma", "Racha reciente irregular del visitante (DEMO)."], ["Rotaciones", "Posibles rotaciones por calendario europeo (DEMO)."]],
  jugadores: [["Jugador clave", "Mediocentro DEMO acumula 5 partidos completos seguidos."], ["Goleador", "Delantero DEMO con 4 tiros por partido."]],
  lesiones: [["Baja confirmada", "Defensa DEMO fuera por lesión muscular."], ["Duda", "Extremo DEMO entrenó al margen."]],
  alineaciones: [["Once probable", "Alineación probable publicada por prensa DEMO; no oficial."]],
  tactica: [["Sistema", "4-3-3 con presión alta esperada (DEMO)."], ["Balón parado", "Visitante concede muchos remates en córners (DEMO)."]],
  entrenadores: [["Declaraciones", "El entrenador DEMO pide 'máxima concentración'."]],
  arbitro: [["Designación", "Árbitro DEMO con media de 5.1 tarjetas por partido."]],
  clima: [["Previsión", "Lluvia moderada prevista, 14 °C (DEMO)."]],
  estadio: [["Césped", "Terreno recién resembrado según club DEMO."]],
  calendario: [["Descanso", "El visitante jugó hace 3 días; el local descansó 6 (DEMO)."]],
  institucional: [["Directiva", "Rumor de cambios en la dirección deportiva (DEMO)."]],
  psicologico: [["Presión", "El local necesita puntuar para salir de la zona baja (DEMO)."]],
  h2h: [["Historial", "3 de los últimos 5 enfrentamientos terminaron con más de 2.5 goles (DEMO)."]],
  noticias: [["Redes sociales", "Publicación viral sobre posible baja, sin confirmar (DEMO)."], ["Prensa", "Crónica de entrenamiento de ayer (DEMO)."]],
  mercado: [["Movimiento de cuotas", "La cuota del local bajó de 2.10 a 1.95 en 24 h (DEMO)."]],
  fuentes: [["Cobertura", "12 fuentes consultadas, 7 corroboradas (DEMO)."]],
  faltantes: [["Contradicción", "Dos medios difieren sobre la disponibilidad del portero (DEMO)."], ["Sin datos", "No hay datos de entrenamiento a puerta cerrada."]],
};
export function buildDossier(matchId: string): DossierSection[] {
  const local = mulberry32(matchId.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  return DOSSIER_TABS.map((t) => {
    const empty = local() < 0.18;
    return {
      ...t,
      items: empty ? [] : (TEMPLATES[t.key] ?? []).map(([ti, de]) => evidence(ti, de, SOURCES[Math.floor(local() * SOURCES.length)])),
    };
  });
}

export const intelModules: IntelModule[] = [
  "Recolector de información", "Descubrimiento de fuentes", "Investigador de noticias", "Inteligencia de redes sociales",
  "Verificación de información", "Detector de contradicciones", "Seguimiento de lesiones", "Seguimiento de entrenamientos",
  "Seguimiento de alineaciones", "Inteligencia táctica", "Inteligencia de árbitros", "Inteligencia meteorológica",
  "Inteligencia de estadios", "Seguimiento de cuotas",
].map((name, i) => ({
  id: `mod${i}`, name, status: pick(["activo", "activo", "activo", "pausado", "pendiente", "error"] as const),
  lastRun: new Date(Date.parse(NOW) - ri(2, 300) * 60000).toISOString(), items: ri(0, 240),
}));

const upcoming = matches.filter((m) => m.round === CURRENT_ROUND || m.round === CURRENT_ROUND + 1);
export const intelRecords: IntelRecord[] = Array.from({ length: 36 }, () => {
  const m = pick(upcoming);
  const key = pick(DOSSIER_TABS).key;
  const [ti, de] = pick(TEMPLATES[key]);
  return { ...evidence(`${ti} · ${teamById(m.homeId).short}-${teamById(m.awayId).short}`, de), module: pick(intelModules).name, matchId: m.id };
}).sort((a, b) => b.extractedAt.localeCompare(a.extractedAt));

export const contradictions: Contradiction[] = upcoming.slice(0, 6).map((m, i) => ({
  id: `c${i}`,
  topic: pick(["Disponibilidad del portero titular", "Sistema táctico previsto", "Estado del césped", "Regreso de lesionado clave"]) + " (DEMO)",
  matchId: m.id,
  versions: [
    { source: "Fuente oficial DEMO (club)", claim: "No hay comunicado oficial al respecto.", sourceType: "oficial", status: "no_encontrado", publishedAt: NOW },
    { source: "Diario deportivo DEMO A", claim: "Será titular según fuentes del vestuario.", sourceType: "periodistica", status: "probable", publishedAt: NOW },
    { source: "Cuenta social DEMO verificada", claim: "No viajará con el equipo.", sourceType: "rumor", status: "contradictorio", publishedAt: NOW },
  ],
}));

// --- History --------------------------------------------------------------
export const predictions: Prediction[] = matches
  .filter((m) => m.score)
  .filter(() => rand() > 0.45)
  .map((m, i) => {
    const h = teamById(m.homeId).short, a = teamById(m.awayId).short;
    const opt = pick([
      ["1X2", `Victoria ${h}`, m.probs.home, m.score!.home > m.score!.away],
      ["Goles", "Más de 2.5 goles", m.over25, m.score!.home + m.score!.away > 2],
      ["Ambos marcan", "Ambos marcan: Sí", m.btts, m.score!.home > 0 && m.score!.away > 0],
      ["1X2", `Victoria ${a}`, m.probs.away, m.score!.away > m.score!.home],
    ] as const);
    const odds = round2((1 / opt[2]) * r(0.98, 1.15));
    const result = rand() < 0.04 ? "anulada" : opt[3] ? "ganada" : "perdida";
    return {
      id: `pr${i}`, matchId: m.id, analyzedAt: new Date(Date.parse(m.kickoff) - ri(3, 30) * 3600000).toISOString(),
      market: opt[0] as MarketCategory, forecast: opt[1], probability: opt[2], probs: m.probs, odds,
      closingOdds: round2(odds * r(0.9, 1.05)), ev: opt[2] * odds - 1, risk: riskFor(odds, m.integrity), integrity: m.integrity,
      infoSnapshot: `${ri(6, 18)} fuentes · ${ri(0, 3)} contradicciones (DEMO)`, modelVersion: pick(["fie-demo-0.3.2", "fie-demo-0.4.0", MODEL_VERSION]),
      result, stake: 1, profit: result === "ganada" ? round2(odds - 1) : result === "perdida" ? -1 : 0,
    } as Prediction;
  })
  .sort((a, b) => a.analyzedAt.localeCompare(b.analyzedAt));

// --- Lab ------------------------------------------------------------------
export const models: ModelInfo[] = [
  { id: "poisson", name: "Poisson", description: "Goles independientes por equipo según fuerza ofensiva/defensiva.", brier: 0.205, logLoss: 0.995, accuracy: 0.49, roi: 0.021, calibrationError: 0.041, status: "activo" },
  { id: "dixon", name: "Dixon-Coles", description: "Poisson con corrección de marcadores bajos y ponderación temporal.", brier: 0.199, logLoss: 0.978, accuracy: 0.51, roi: 0.034, calibrationError: 0.032, status: "activo" },
  { id: "elo", name: "Elo", description: "Rating dinámico actualizado tras cada partido.", brier: 0.212, logLoss: 1.012, accuracy: 0.47, roi: -0.012, calibrationError: 0.055, status: "referencia" },
  { id: "logit", name: "Regresión logística", description: "Clasificador multinomial sobre variables de forma, xG y contexto.", brier: 0.207, logLoss: 1.001, accuracy: 0.5, roi: 0.008, calibrationError: 0.047, status: "experimental" },
  { id: "mc", name: "Monte Carlo", description: "10.000 simulaciones por partido sobre distribución de goles.", brier: 0.201, logLoss: 0.984, accuracy: 0.5, roi: 0.027, calibrationError: 0.036, status: "experimental" },
];
export const labEvolution = Array.from({ length: CURRENT_ROUND - 1 }, (_, i) => {
  const row: Record<string, number> = { jornada: i + 1 };
  for (const m of models) row[m.id] = round2((m.brier + r(-0.02, 0.02)) * 1000) / 1000;
  return row;
});
export const labByMarket = (["1X2", "Goles", "Ambos marcan", "Córners", "Tarjetas"] as const).map((mk) => {
  const row: Record<string, number | string> = { market: mk };
  for (const m of models) row[m.id] = round2(r(-0.06, 0.08) * 100);
  return row;
});
export const labCalibration = Array.from({ length: 10 }, (_, i) => {
  const p = (i + 0.5) / 10;
  const row: Record<string, number> = { predicha: round2(p * 100) };
  for (const m of models) row[m.id] = round2(Math.min(100, Math.max(0, (p + r(-m.calibrationError, m.calibrationError) * 1.5) * 100)));
  return row;
});

// --- Alerts ---------------------------------------------------------------
export const alerts: Alert[] = [
  { id: "a1", level: "critico", title: "Información crítica faltante", detail: "3 partidos de la próxima jornada sin datos de alineación (DEMO).", at: NOW },
  { id: "a2", level: "advertencia", title: "Movimiento brusco de cuota", detail: `Cuota local −9% en ${teamById(upcoming[0].homeId).short}-${teamById(upcoming[0].awayId).short} (DEMO).`, at: NOW, matchId: upcoming[0].id },
  { id: "a3", level: "advertencia", title: "Contradicción detectada", detail: "Versiones opuestas sobre disponibilidad de un portero (DEMO).", at: NOW, matchId: upcoming[1].id },
  { id: "a4", level: "info", title: "Recopilación completada", detail: "Investigador de noticias procesó 128 artículos (DEMO).", at: NOW },
];

export { teamById, matchById };
