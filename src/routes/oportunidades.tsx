import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { q } from "@/services/queries";
import { AlertBanner, EmptyState, FilterSelect, PageHeader, Panel } from "@/components/fie/primitives";
import { OpportunityTable } from "@/components/fie/OpportunityTable";
import { teamMap } from "@/utils/format";
import type { IntegrityLevel, MarketCategory, RiskLevel } from "@/types";

export const Route = createFileRoute("/oportunidades")({
  head: () => ({
    meta: [
      { title: "Oportunidades de valor · FIE" },
      { name: "description", content: "Mercados donde la probabilidad estimada y la cuota justifican un valor esperado positivo." },
      { property: "og:title", content: "Oportunidades de valor · FIE" },
      { property: "og:description", content: "Detección de apuestas de valor en LaLiga sin forzar recomendaciones." },
    ],
  }),
  loader: async ({ context: { queryClient: c } }) => {
    await Promise.all([c.ensureQueryData(q.teams()), c.ensureQueryData(q.matches()), c.ensureQueryData(q.opportunities())]);
  },
  component: Page,
});

const CATS: MarketCategory[] = ["1X2", "Doble oportunidad", "Goles", "Ambos marcan", "Córners", "Tarjetas", "Jugadores", "Otros"];
const RISK_ORDER: RiskLevel[] = ["bajo", "medio", "alto", "critico"];
const INT_ORDER: IntegrityLevel[] = ["verde", "amarillo", "naranja", "rojo"];

function Page() {
  const { data: teams } = useSuspenseQuery(q.teams());
  const { data: matches } = useSuspenseQuery(q.matches());
  const { data: ops } = useSuspenseQuery(q.opportunities());
  const tm = teamMap(teams);
  const mm = Object.fromEntries(matches.map((m) => [m.id, m]));
  const [cat, setCat] = useState<"all" | MarketCategory>("all");
  const [date, setDate] = useState("all");
  const [risk, setRisk] = useState<RiskLevel>("alto");
  const [integ, setInteg] = useState<IntegrityLevel>("naranja");
  const [minEv, setMinEv] = useState("3");
  const [match, setMatch] = useState("all");
  const dates = [...new Set(ops.map((o) => mm[o.matchId].kickoff.slice(0, 10)))].sort();

  const list = useMemo(
    () =>
      ops
        .filter((o) => cat === "all" || o.category === cat)
        .filter((o) => date === "all" || mm[o.matchId].kickoff.startsWith(date))
        .filter((o) => match === "all" || o.matchId === match)
        .filter((o) => RISK_ORDER.indexOf(o.risk) <= RISK_ORDER.indexOf(risk))
        .filter((o) => INT_ORDER.indexOf(o.integrity) <= INT_ORDER.indexOf(integ))
        .filter((o) => o.ev * 100 >= Number(minEv))
        .sort((a, b) => b.ev - a.ev),
    [ops, cat, date, match, risk, integ, minEv, mm],
  );
  const matchOpts = [...new Set(ops.map((o) => o.matchId))];

  return (
    <div className="space-y-5">
      <PageHeader title="Oportunidades" subtitle="Valor esperado = probabilidad × cuota − 1. Una probabilidad alta no implica rentabilidad." />
      <AlertBanner level="info" title="Datos ficticios de prueba" detail="Cuotas y probabilidades son DEMO. No constituyen pronósticos reales." />
      <div className="panel grid grid-cols-2 gap-3 p-4 md:grid-cols-4 xl:grid-cols-7">
        <FilterSelect label="Competición" value="laliga" onChange={() => {}} options={[{ value: "laliga", label: "LaLiga" }]} />
        <FilterSelect label="Fecha" value={date} onChange={setDate} options={[{ value: "all", label: "Todas" }, ...dates.map((d) => ({ value: d, label: d }))]} />
        <FilterSelect label="Partido" value={match} onChange={setMatch} options={[{ value: "all", label: "Todos" }, ...matchOpts.map((id) => ({ value: id, label: `${tm[mm[id].homeId].short}–${tm[mm[id].awayId].short}` }))]} />
        <FilterSelect label="Mercado" value={cat} onChange={setCat} options={[{ value: "all", label: "Todos" }, ...CATS.map((c) => ({ value: c, label: c }))]} />
        <FilterSelect label="Riesgo máx." value={risk} onChange={setRisk} options={RISK_ORDER.map((r) => ({ value: r, label: r }))} />
        <FilterSelect label="Integridad mín." value={integ} onChange={setInteg} options={INT_ORDER.map((r) => ({ value: r, label: r }))} />
        <FilterSelect label="EV mínimo" value={minEv} onChange={setMinEv} options={["-100", "0", "3", "5", "10"].map((v) => ({ value: v, label: v === "-100" ? "Cualquiera" : `${v}%` }))} />
      </div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {(["all", ...CATS] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${cat === c ? "border-success bg-success/10 text-success" : "text-muted-foreground"}`}>{c === "all" ? "Todos" : c}</button>
        ))}
      </div>
      <Panel title={`${list.length} resultados`} demo>
        {list.length ? <OpportunityTable items={list} matches={mm} teams={tm} /> : <EmptyState title="No existen oportunidades de valor con estos criterios" detail="FIE no fuerza recomendaciones. Ajusta filtros o espera nueva información." />}
      </Panel>
    </div>
  );
}
