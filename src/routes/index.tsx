import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, Clock, Crosshair, ListChecks, Target } from "lucide-react";
import { q } from "@/services/queries";
import { AlertBanner, DemoBadge, EmptyState, Panel, StatCard } from "@/components/fie/primitives";
import { MatchCard, Timeline } from "@/components/fie/cards";
import { OpportunityTable } from "@/components/fie/OpportunityTable";
import { pct, teamMap, time } from "@/utils/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Centro de operaciones · FIE" },
      { name: "description", content: "Panel principal de FIE: próximos partidos de LaLiga, oportunidades de valor y actividad reciente." },
      { property: "og:title", content: "Centro de operaciones · FIE" },
      { property: "og:description", content: "Inteligencia antes que apuestas. Panel de análisis de LaLiga." },
    ],
  }),
  loader: async ({ context: { queryClient: c } }) => {
    await Promise.all([c.ensureQueryData(q.teams()), c.ensureQueryData(q.matches()), c.ensureQueryData(q.opportunities()), c.ensureQueryData(q.history()), c.ensureQueryData(q.meta()), c.ensureQueryData(q.alerts())]);
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: teams } = useSuspenseQuery(q.teams());
  const { data: matches } = useSuspenseQuery(q.matches());
  const { data: ops } = useSuspenseQuery(q.opportunities());
  const { data: history } = useSuspenseQuery(q.history());
  const { data: meta } = useSuspenseQuery(q.meta());
  const { data: alerts } = useSuspenseQuery(q.alerts());
  const tm = teamMap(teams);
  const mm = Object.fromEntries(matches.map((m) => [m.id, m]));
  const upcoming = matches.filter((m) => m.round === meta.currentRound).sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const values = ops.filter((o) => o.isValue).sort((a, b) => b.ev - a.ev).slice(0, 6);
  const analyzed = matches.filter((m) => m.status === "completado" || m.status === "finalizado").length;
  const settled = history.filter((h) => h.result !== "anulada");
  const acc = settled.filter((h) => h.result === "ganada").length / Math.max(1, settled.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-success">Centro de operaciones</div>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">LaLiga · Jornada {meta.currentRound}</h1>
          <p className="text-sm text-muted-foreground">Todos los valores mostrados son <strong className="text-warning">datos ficticios de prueba</strong>.</p>
        </div>
        <Link to="/partidos" className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Ver calendario</Link>
      </div>

      {alerts.filter((a) => a.level === "critico").map((a) => <AlertBanner key={a.id} {...a} />)}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Partidos analizados" value={analyzed} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Oportunidades" value={ops.filter((o) => o.isValue).length} tone="success" icon={<Target className="h-4 w-4" />} />
        <StatCard label="Predicciones" value={history.length} icon={<ListChecks className="h-4 w-4" />} />
        <StatCard label="Precisión histórica" value={pct(acc)} tone="warning" icon={<Crosshair className="h-4 w-4" />} />
        <StatCard label="Última actualización" value={time(meta.now)} icon={<Clock className="h-4 w-4" />} hint="hora Madrid" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Próximos partidos" demo action={<Link to="/partidos" className="text-xs text-info">Todos</Link>}>
            <div className="grid gap-3 md:grid-cols-2">
              {upcoming.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} teams={tm} compact />)}
            </div>
          </Panel>
          <Panel title="Oportunidades detectadas" demo action={<Link to="/oportunidades" className="text-xs text-info">Ver todas</Link>}>
            {values.length ? <OpportunityTable items={values} matches={mm} teams={tm} showUpdated={false} /> : <EmptyState title="Sin oportunidades de valor" detail="FIE no fuerza recomendaciones." />}
          </Panel>
        </div>
        <Panel title="Actividad reciente" demo>
          <Timeline
            items={[
              ...alerts.map((a) => ({ id: a.id, title: a.title, detail: a.detail, at: a.at, tone: a.level === "critico" ? "bg-danger" : a.level === "advertencia" ? "bg-warning" : "bg-info" })),
              ...history.slice(-5).reverse().map((h) => ({ id: h.id, title: `Predicción registrada: ${h.forecast}`, detail: `${tm[mm[h.matchId].homeId].short}–${tm[mm[h.matchId].awayId].short} · ${h.result}`, at: h.analyzedAt, tone: "bg-success" })),
            ]}
          />
          <div className="mt-4"><DemoBadge label="ACTIVIDAD SIMULADA" /></div>
        </Panel>
      </div>
    </div>
  );
}
