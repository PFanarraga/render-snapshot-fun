import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { q } from "@/services/queries";
import { AlertBanner, Crest, DemoBadge, EmptyState, IntegrityLight, NotFoundInfo, Panel, ProbabilityBar, RecommendationBadge, Tabs } from "@/components/fie/primitives";
import { EvidenceRow, PlayerCard } from "@/components/fie/cards";
import { OpportunityTable } from "@/components/fie/OpportunityTable";
import { ChartBox, axis, grid, tooltip } from "@/components/fie/charts";
import { INTEGRITY_LABEL, dateTime, teamMap } from "@/utils/format";
import type { MarketKey } from "@/types";

export const Route = createFileRoute("/partidos/$matchId")({
  loader: async ({ context: { queryClient: c }, params }) => {
    const [d] = await Promise.all([c.ensureQueryData(q.match(params.matchId)), c.ensureQueryData(q.teams()), c.ensureQueryData(q.standings())]);
    if (!d.match) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Ficha de análisis de partido · FIE" },
      { name: "description", content: "Resumen ejecutivo, probabilidades, mercados de valor e investigación completa del partido." },
      { property: "og:title", content: "Ficha de análisis de partido · FIE" },
      { property: "og:description", content: "Análisis de partido de LaLiga en FIE." },
    ],
  }),
  notFoundComponent: () => <EmptyState title="Partido no encontrado" />,
  errorComponent: ({ error }) => <EmptyState title="Error al cargar" detail={String(error)} />,
  component: MatchPage,
});

const MKT: Record<MarketKey, string> = { "1x2": "Resultado 1X2", goles: "Goles", btts: "Ambos marcan", corners: "Córners", tarjetas: "Tarjetas", jugadores: "Jugadores" };

function MatchPage() {
  const { matchId } = Route.useParams();
  const { data } = useSuspenseQuery(q.match(matchId));
  const { data: teams } = useSuspenseQuery(q.teams());
  const { data: standings } = useSuspenseQuery(q.standings());
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("estadisticas");
  const m = data.match!;
  const tm = teamMap(teams);
  const h = tm[m.homeId], a = tm[m.awayId];
  const values = data.opportunities.filter((o) => o.isValue).sort((x, y) => y.ev - x.ev);
  const section = data.dossier.find((s) => s.key === tab)!;
  const sh = standings.find((s) => s.teamId === h.id)!, sa = standings.find((s) => s.teamId === a.id)!;

  return (
    <div className="space-y-5">
      <Link to="/partidos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Partidos</Link>

      {/* Executive summary */}
      <section className="panel grid-bg overflow-hidden">
        <div className="bg-gradient-to-b from-panel/40 to-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-mono">LaLiga · Jornada {m.round} · {dateTime(m.kickoff)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.stadium}</span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <Link to="/equipos/$teamId" params={{ teamId: h.id }} className="flex flex-1 flex-col items-center gap-2 text-center"><Crest team={h} size={64} /><span className="font-display font-semibold sm:text-lg">{h.name}</span></Link>
            <div className="num text-3xl font-semibold">{m.score ? `${m.score.home}–${m.score.away}` : "VS"}</div>
            <Link to="/equipos/$teamId" params={{ teamId: a.id }} className="flex flex-1 flex-col items-center gap-2 text-center"><Crest team={a} size={64} /><span className="font-display font-semibold sm:text-lg">{a.name}</span></Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">Probabilidades estimadas <DemoBadge /></div>
              <ProbabilityBar label={`Victoria ${h.short}`} value={m.probs.home} />
              <ProbabilityBar label="Empate" value={m.probs.draw} tone="neutral" />
              <ProbabilityBar label={`Victoria ${a.short}`} value={m.probs.away} />
              <div className="text-sm"><span className="text-muted-foreground">Pronóstico principal:</span> {m.mainForecast}</div>
            </div>
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Recomendación final</div>
              <RecommendationBadge rec={m.recommendation} large />
              <div className="rounded-md border bg-background/50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground"><span>Semáforo de integridad</span><IntegrityLight level={m.integrity} size="md" /></div>
                <div className="text-xs">{INTEGRITY_LABEL[m.integrity]}. <span className="text-muted-foreground">Mide la calidad de la información, no la probabilidad de acierto.</span></div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(Object.keys(MKT) as MarketKey[]).map((k) => (
                    <div key={k} className="flex flex-col gap-1 rounded bg-muted/50 p-2 text-[11px]"><span className="text-muted-foreground">{MKT[k]}</span><IntegrityLight level={m.marketIntegrity[k]} /></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {m.integrity === "rojo" && <AlertBanner level="critico" title="Falta información crítica" detail="No se recomienda tomar decisiones con la información disponible." />}
      {data.contradictions.length > 0 && <AlertBanner level="advertencia" title={`${data.contradictions.length} contradicción(es) entre fuentes`} detail={data.contradictions[0].topic} />}

      <Panel title="Mercados con posible valor" demo>
        {m.score ? <NotFoundInfo text="PARTIDO FINALIZADO · CONSULTAR HISTORIAL" /> : values.length ? <OpportunityTable items={values} matches={{ [m.id]: m }} teams={tm} showUpdated={false} /> : <EmptyState title="Sin oportunidades de valor en este partido" detail="Ninguna cuota disponible supera la cuota mínima de valor calculada." />}
      </Panel>

      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-info/50 bg-info/10 py-4 font-display text-sm font-semibold tracking-wider text-info transition-colors hover:bg-info/20">
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} {open ? "OCULTAR ANÁLISIS COMPLETO" : "VER ANÁLISIS COMPLETO"}
      </button>

      {open && (
        <section className="panel animate-fade">
          <div className="px-4 pt-2"><Tabs tabs={data.dossier.map((d) => ({ key: d.key, label: d.title }))} value={tab} onChange={setTab} /></div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2"><h3 className="font-semibold">{section.title}</h3><DemoBadge /></div>
            {tab === "estadisticas" && (
              <ChartBox height={220}>
                <BarChart data={[
                  { k: "xG/partido", [h.short]: sh.played ? sh.xg / sh.played : 0, [a.short]: sa.played ? sa.xg / sa.played : 0 },
                  { k: "Goles/partido", [h.short]: sh.played ? sh.gf / sh.played : 0, [a.short]: sa.played ? sa.gf / sa.played : 0 },
                  { k: "Tiros a puerta", [h.short]: sh.shotsOnTargetPerGame, [a.short]: sa.shotsOnTargetPerGame },
                ]}>
                  <CartesianGrid {...grid} /><XAxis dataKey="k" {...axis} /><YAxis {...axis} /><Tooltip {...tooltip} formatter={(v: number) => v.toFixed(2)} /><Legend />
                  <Bar dataKey={h.short} fill="var(--info)" radius={[4, 4, 0, 0]} /><Bar dataKey={a.short} fill="var(--success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartBox>
            )}
            {tab === "jugadores" && <div className="grid gap-2 md:grid-cols-2">{data.players.filter((p) => p.position === "DEL").map((p) => <PlayerCard key={p.id} player={p} team={tm[p.teamId]} />)}</div>}
            {tab === "lesiones" && (
              <div className="grid gap-2 md:grid-cols-2">{data.players.filter((p) => p.availability !== "disponible").map((p) => <PlayerCard key={p.id} player={p} team={tm[p.teamId]} />)}</div>
            )}
            {tab === "faltantes" && data.contradictions.map((c) => (
              <div key={c.id} className="rounded-md border border-danger/40 p-3">
                <div className="text-sm font-semibold text-danger">{c.topic}</div>
                <ul className="mt-2 space-y-1 text-sm">{c.versions.map((v, i) => <li key={i}><span className="text-muted-foreground">{v.source}:</span> {v.claim}</li>)}</ul>
              </div>
            ))}
            {section.items.length ? section.items.map((it) => <EvidenceRow key={it.id} item={it} />) : <NotFoundInfo />}
          </div>
        </section>
      )}
    </div>
  );
}
