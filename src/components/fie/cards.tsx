import { Link } from "@tanstack/react-router";
import { MapPin, ChevronRight } from "lucide-react";
import type { EvidenceItem, Match, Opportunity, Player, Team, TeamStats } from "@/types";
import { Crest, DemoBadge, EVIndicator, IntegrityLight, RecommendationBadge, RiskBadge, SourceTypeTag, VerificationTag, FormPills } from "./primitives";
import { STATUS_LABEL, dateShort, dateTime, odds, pct, time } from "@/utils/format";
import { cn } from "@/lib/utils";

export function MatchCard({ match, teams, compact }: { match: Match; teams: Record<string, Team>; compact?: boolean }) {
  const h = teams[match.homeId], a = teams[match.awayId];
  return (
    <div className="panel flex flex-col gap-3 p-4 transition-colors hover:border-info/50 animate-fade">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono">J{match.round} · {dateShort(match.kickoff)} · {time(match.kickoff)}</span>
        <IntegrityLight level={match.integrity} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Crest team={h} />
          <span className="truncate text-sm font-semibold">{h.name}</span>
        </div>
        <span className="num shrink-0 rounded bg-muted px-2 py-1 text-sm">
          {match.score ? `${match.score.home} – ${match.score.away}` : "vs"}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold">{a.name}</span>
          <Crest team={a} />
        </div>
      </div>
      {!compact && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {match.stadium}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", match.status === "completado" ? "bg-success/15 text-success" : match.status === "en_proceso" ? "bg-info/15 text-info" : "bg-muted text-muted-foreground")}>
            {STATUS_LABEL[match.status]}
          </span>
          {match.round >= 9 && <RecommendationBadge rec={match.recommendation} />}
        </div>
        <Link
          to="/partidos/$matchId"
          params={{ matchId: match.id }}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-info/15 px-3 text-xs font-semibold text-info transition-colors hover:bg-info/25"
        >
          {match.score ? "Ver ficha" : "Analizar partido"} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function OpportunityCard({ op, match, teams }: { op: Opportunity; match: Match; teams: Record<string, Team> }) {
  return (
    <Link to="/partidos/$matchId" params={{ matchId: match.id }} className="panel block p-4 transition-colors hover:border-success/50 animate-fade">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground">{teams[match.homeId].short} – {teams[match.awayId].short} · {op.category}</div>
          <div className="truncate font-semibold">{op.selection}</div>
        </div>
        <EVIndicator value={op.ev} />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <Metric label="Prob." value={pct(op.probability)} />
        <Metric label="Cuota" value={odds(op.odds)} />
        <Metric label="Justa" value={odds(op.fairOdds)} />
        <Metric label="Mín. valor" value={odds(op.minOdds)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <RiskBadge risk={op.risk} />
        <span className={cn("text-[11px] font-semibold", op.isValue ? "text-success" : "text-muted-foreground")}>{op.isValue ? "Valor detectado" : "Sin valor"}</span>
        <IntegrityLight level={op.integrity} />
      </div>
    </Link>
  );
}

export function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md bg-background/60 px-1 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("num text-sm", tone)}>{value}</div>
    </div>
  );
}

export function TeamCard({ team, stats }: { team: Team; stats?: TeamStats }) {
  return (
    <Link to="/equipos/$teamId" params={{ teamId: team.id }} className="panel flex items-center gap-3 p-4 transition-colors hover:border-info/50 animate-fade">
      <Crest team={team} size={44} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{team.name}</div>
        <div className="text-xs text-muted-foreground">{team.city}</div>
        {stats && <div className="mt-1"><FormPills form={stats.form} /></div>}
      </div>
      {stats && (
        <div className="text-right">
          <div className="num text-lg font-semibold">{stats.position}º</div>
          <div className="num text-xs text-muted-foreground">{stats.points} pts</div>
        </div>
      )}
    </Link>
  );
}

const AVAIL: Record<Player["availability"], string> = {
  disponible: "text-success", duda: "text-warning", lesionado: "text-danger", sancionado: "text-caution",
};
export function PlayerCard({ player, team }: { player: Player; team: Team }) {
  return (
    <Link to="/jugadores/$playerId" params={{ playerId: player.id }} className="panel flex items-center gap-3 p-3 transition-colors hover:border-info/50">
      <PlayerAvatar player={player} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate font-semibold">{player.name} <DemoBadge /></div>
        <div className="text-xs text-muted-foreground">{player.position} · {team.short} · {player.age} años</div>
      </div>
      <div className="text-right text-xs">
        <div className="num">{player.goals}G · {player.assists}A</div>
        <div className={cn("capitalize", AVAIL[player.availability])}>{player.availability}</div>
      </div>
    </Link>
  );
}

export function PlayerAvatar({ player, size = 40 }: { player: Player; size?: number }) {
  const initials = player.name.split(" ").map((s) => s[0]).join("");
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full border bg-panel-2 font-display font-semibold text-muted-foreground" style={{ width: size, height: size, fontSize: size * 0.34 }} title="Sin fotografía (DEMO)">
      {initials}
    </span>
  );
}

export function EvidenceRow({ item }: { item: EvidenceItem }) {
  return (
    <div className="rounded-md border bg-background/40 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <VerificationTag status={item.status} />
        <SourceTypeTag type={item.sourceType} />
        <span className="num ml-auto text-[10px] text-muted-foreground">Fiabilidad {item.reliability}%</span>
      </div>
      <div className="mt-2 text-sm font-semibold">{item.title}</div>
      <p className={cn("text-sm text-muted-foreground", item.sourceType === "rumor" && "italic")}>{item.detail}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
        <span>{item.source}</span>
        <span>Publicado: {dateTime(item.publishedAt)}</span>
        <span>Extraído: {dateTime(item.extractedAt)}</span>
      </div>
    </div>
  );
}

export function Timeline({ items }: { items: { id: string; title: string; detail?: string; at: string; tone?: string; extra?: React.ReactNode }[] }) {
  return (
    <ol className="relative ml-2 border-l">
      {items.map((it) => (
        <li key={it.id} className="mb-4 ml-4 last:mb-0">
          <span className={cn("absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-background", it.tone ?? "bg-info")} />
          <div className="text-[11px] text-muted-foreground">{dateTime(it.at)}</div>
          <div className="text-sm font-medium">{it.title}</div>
          {it.detail && <div className="text-xs text-muted-foreground">{it.detail}</div>}
          {it.extra}
        </li>
      ))}
    </ol>
  );
}
