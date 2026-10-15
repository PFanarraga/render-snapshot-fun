import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { q } from "@/services/queries";
import { Crest, DemoBadge, FilterSelect, IntegrityLight, PageHeader, Panel, RecommendationBadge } from "@/components/fie/primitives";
import { STATUS_LABEL, dateTime, pct, teamMap } from "@/utils/format";
import type { Recommendation } from "@/types";

export const Route = createFileRoute("/analisis")({
  head: () => ({
    meta: [
      { title: "Análisis de partidos · FIE" },
      { name: "description", content: "Cola de análisis con recomendaciones, integridad por mercado y estado de cada partido." },
      { property: "og:title", content: "Análisis de partidos · FIE" },
      { property: "og:description", content: "Estado y recomendaciones de los análisis de FIE." },
    ],
  }),
  loader: async ({ context: { queryClient: c } }) => {
    await Promise.all([c.ensureQueryData(q.teams()), c.ensureQueryData(q.matches()), c.ensureQueryData(q.meta())]);
  },
  component: Page,
});

const RECS: Recommendation[] = ["OPORTUNIDAD DETECTADA", "ESPERAR CONFIRMACIÓN", "VALOR INSUFICIENTE", "RIESGO ELEVADO", "INFORMACIÓN INSUFICIENTE", "SIN OPORTUNIDADES"];

function Page() {
  const { data: teams } = useSuspenseQuery(q.teams());
  const { data: matches } = useSuspenseQuery(q.matches());
  const { data: meta } = useSuspenseQuery(q.meta());
  const tm = teamMap(teams);
  const [rec, setRec] = useState<"all" | Recommendation>("all");
  const pool = matches.filter((m) => m.round >= meta.currentRound && m.round <= meta.currentRound + 2);
  const list = pool.filter((m) => rec === "all" || m.recommendation === rec).sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  return (
    <div className="space-y-5">
      <PageHeader title="Análisis" subtitle="Cola de análisis de las próximas jornadas" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {RECS.map((r) => (
          <button key={r} onClick={() => setRec(rec === r ? "all" : r)} className={`panel p-3 text-left transition-colors ${rec === r ? "border-info" : ""}`}>
            <div className="num text-xl font-semibold">{pool.filter((m) => m.recommendation === r).length}</div>
            <RecommendationBadge rec={r} />
          </button>
        ))}
      </div>
      <Panel title="Partidos en análisis" demo action={<div className="w-44"><FilterSelect label="" value={rec} onChange={setRec} options={[{ value: "all", label: "Todas las recomendaciones" }, ...RECS.map((r) => ({ value: r, label: r }))]} /></div>}>
        <div className="divide-y">
          {list.map((m) => (
            <Link key={m.id} to="/partidos/$matchId" params={{ matchId: m.id }} className="flex flex-col gap-2 py-3 hover:bg-accent/30 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2">
                <Crest team={tm[m.homeId]} size={28} /><Crest team={tm[m.awayId]} size={28} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{tm[m.homeId].name} – {tm[m.awayId].name}</div>
                  <div className="text-xs text-muted-foreground">J{m.round} · {dateTime(m.kickoff)} · {STATUS_LABEL[m.status]}</div>
                </div>
              </div>
              <div className="num flex gap-3 text-xs text-muted-foreground"><span>1 {pct(m.probs.home, 0)}</span><span>X {pct(m.probs.draw, 0)}</span><span>2 {pct(m.probs.away, 0)}</span><DemoBadge /></div>
              <div className="flex items-center gap-3"><IntegrityLight level={m.integrity} /><RecommendationBadge rec={m.recommendation} /></div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
