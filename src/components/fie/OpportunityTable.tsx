import { Link } from "@tanstack/react-router";
import type { Match, Opportunity, Team } from "@/types";
import { EVIndicator, IntegrityLight, RiskBadge } from "./primitives";
import { OpportunityCard } from "./cards";
import { dateTime, odds, pct } from "@/utils/format";

export function OpportunityTable({ items, matches, teams, showUpdated = true }: { items: Opportunity[]; matches: Record<string, Match>; teams: Record<string, Team>; showUpdated?: boolean }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {items.map((o) => (
          <OpportunityCard key={o.id} op={o} match={matches[o.matchId]} teams={teams} />
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 pr-3">Partido</th>
              <th className="pr-3">Mercado</th>
              <th className="pr-3">Selección</th>
              <th className="pr-3 text-right">Prob.</th>
              <th className="pr-3 text-right">Cuota</th>
              <th className="pr-3 text-right">Justa</th>
              <th className="pr-3 text-right">Mín. valor</th>
              <th className="pr-3 text-right">EV</th>
              <th className="pr-3 text-right">Confianza</th>
              <th className="pr-3">Riesgo</th>
              <th className="pr-3">Integridad</th>
              {showUpdated && <th>Actualizado</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((o) => {
              const m = matches[o.matchId];
              return (
                <tr key={o.id} className="border-b border-border/60 transition-colors hover:bg-accent/40">
                  <td className="py-2.5 pr-3">
                    <Link to="/partidos/$matchId" params={{ matchId: m.id }} className="font-medium hover:text-info">
                      {teams[m.homeId].short} – {teams[m.awayId].short}
                    </Link>
                  </td>
                  <td className="pr-3 text-muted-foreground">{o.category}</td>
                  <td className="pr-3">{o.selection}</td>
                  <td className="num pr-3 text-right">{pct(o.probability)}</td>
                  <td className="num pr-3 text-right">{odds(o.odds)}</td>
                  <td className="num pr-3 text-right text-muted-foreground">{odds(o.fairOdds)}</td>
                  <td className="num pr-3 text-right text-muted-foreground">{odds(o.minOdds)}</td>
                  <td className="pr-3 text-right"><EVIndicator value={o.ev} /></td>
                  <td className="num pr-3 text-right text-muted-foreground">{o.confidence}/100</td>
                  <td className="pr-3"><RiskBadge risk={o.risk} /></td>
                  <td className="pr-3"><IntegrityLight level={o.integrity} /></td>
                  {showUpdated && <td className="text-xs text-muted-foreground">{dateTime(o.updatedAt)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
