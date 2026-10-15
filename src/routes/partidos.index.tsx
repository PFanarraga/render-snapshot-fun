import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { q } from "@/services/queries";
import { EmptyState, FilterSelect, PageHeader } from "@/components/fie/primitives";
import { MatchCard } from "@/components/fie/cards";
import { teamMap } from "@/utils/format";
import type { AnalysisStatus } from "@/types";

export const Route = createFileRoute("/partidos/")({
  head: () => ({
    meta: [
      { title: "Partidos de LaLiga · FIE" },
      { name: "description", content: "Calendario de LaLiga con filtros por jornada, equipo y estado del análisis." },
      { property: "og:title", content: "Partidos de LaLiga · FIE" },
      { property: "og:description", content: "Calendario y estado de análisis de cada partido." },
    ],
  }),
  loader: async ({ context: { queryClient: c } }) => {
    await Promise.all([c.ensureQueryData(q.teams()), c.ensureQueryData(q.matches()), c.ensureQueryData(q.meta())]);
  },
  component: Calendar,
});

function Calendar() {
  const { data: teams } = useSuspenseQuery(q.teams());
  const { data: matches } = useSuspenseQuery(q.matches());
  const { data: meta } = useSuspenseQuery(q.meta());
  const tm = teamMap(teams);
  const [round, setRound] = useState(String(meta.currentRound));
  const [team, setTeam] = useState("all");
  const [status, setStatus] = useState<"all" | AnalysisStatus>("all");
  const [when, setWhen] = useState<"all" | "prox" | "ant">("all");
  const [text, setText] = useState("");
  const rounds = [...new Set(matches.map((m) => m.round))];

  const list = useMemo(() => {
    const s = text.toLowerCase();
    return matches
      .filter((m) => round === "all" || m.round === Number(round))
      .filter((m) => team === "all" || m.homeId === team || m.awayId === team)
      .filter((m) => status === "all" || m.status === status)
      .filter((m) => when === "all" || (when === "prox" ? !m.score : !!m.score))
      .filter((m) => !s || `${tm[m.homeId].name} ${tm[m.awayId].name} ${m.stadium}`.toLowerCase().includes(s))
      .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  }, [matches, round, team, status, when, text, tm]);

  return (
    <div>
      <PageHeader title="Partidos" subtitle="Calendario LaLiga · fechas y horarios DEMO" />
      <div className="panel mb-5 grid grid-cols-2 gap-3 p-4 md:grid-cols-5">
        <label className="col-span-2 flex flex-col gap-1 text-[11px] uppercase tracking-wider text-muted-foreground md:col-span-1">
          Buscar
          <span className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4" />
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Equipo o estadio" className="h-10 w-full rounded-md border border-input bg-panel-2 pl-8 pr-2 text-sm normal-case text-foreground outline-none focus:ring-2 focus:ring-ring" />
          </span>
        </label>
        <FilterSelect label="Jornada" value={round} onChange={setRound} options={[{ value: "all", label: "Todas" }, ...rounds.map((r) => ({ value: String(r), label: `Jornada ${r}` }))]} />
        <FilterSelect label="Equipo" value={team} onChange={setTeam} options={[{ value: "all", label: "Todos" }, ...teams.map((t) => ({ value: t.id, label: t.name }))]} />
        <FilterSelect label="Estado" value={status} onChange={setStatus} options={[{ value: "all", label: "Todos" }, { value: "pendiente", label: "Pendiente" }, { value: "en_proceso", label: "En proceso" }, { value: "completado", label: "Completado" }, { value: "finalizado", label: "Finalizado" }]} />
        <FilterSelect label="Periodo" value={when} onChange={setWhen} options={[{ value: "all", label: "Todos" }, { value: "prox", label: "Próximos" }, { value: "ant", label: "Anteriores" }]} />
      </div>
      <div className="mb-3 text-xs text-muted-foreground">{list.length} partidos</div>
      {list.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.map((m) => <MatchCard key={m.id} match={m} teams={tm} />)}</div>
      ) : (
        <EmptyState title="Ningún partido coincide con los filtros" />
      )}
    </div>
  );
}
