import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity, Bell, CalendarDays, FlaskConical, History, Home, Menu, Radar, Settings, Shield, Target, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { alerts, SEASON } from "@/data/demo";
import { AlertBanner, DemoBadge } from "@/components/fie/primitives";

const NAV = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/partidos", label: "Partidos", icon: CalendarDays },
  { to: "/analisis", label: "Análisis", icon: Activity },
  { to: "/oportunidades", label: "Oportunidades", icon: Target },
  { to: "/equipos", label: "Equipos", icon: Shield },
  { to: "/jugadores", label: "Jugadores", icon: Users },
  { to: "/inteligencia", label: "Inteligencia", icon: Radar },
  { to: "/historial", label: "Historial", icon: History },
  { to: "/laboratorio", label: "Laboratorio", icon: FlaskConical },
  { to: "/configuracion", label: "Configuración", icon: Settings },
] as const;
const BOTTOM = [NAV[0], NAV[1], NAV[3], NAV[6]];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-success/40 bg-success/10 font-display text-sm font-bold text-success">FIE</span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-semibold">Football Intelligence Engine</span>
        <span className="block text-[10px] text-muted-foreground">Inteligencia antes que apuestas.</span>
      </span>
    </Link>
  );
}

function isActive(path: string, to: string) {
  return to === "/" ? path === "/" : path.startsWith(to);
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [more, setMore] = useState(false);
  const [bell, setBell] = useState(false);
  const critical = alerts.filter((a) => a.level === "critico");

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <div className="border-b p-4"><Logo /></div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive(path, n.to) ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}>
              <n.icon className={cn("h-4 w-4", isActive(path, n.to) && "text-success")} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning animate-signal" /> Modo demostración</div>
          <div className="mt-1">Sin conexión a servicios externos</div>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4">
            <div className="lg:hidden"><Link to="/" className="grid h-9 w-9 place-items-center rounded-lg border border-success/40 bg-success/10 font-display text-sm font-bold text-success">FIE</Link></div>
            <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
              <span className="rounded border bg-panel px-2 py-1 font-semibold">LaLiga</span>
              <span className="num hidden text-muted-foreground sm:inline">Temporada {SEASON}</span>
              <span className="hidden items-center gap-1.5 text-muted-foreground md:inline-flex"><span className="h-2 w-2 rounded-full bg-warning animate-signal" /> Sistema: demostración</span>
              <DemoBadge className="sm:hidden" />
            </div>
            <div className="relative">
              <button onClick={() => setBell((b) => !b)} aria-label="Notificaciones" className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-accent">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
              </button>
              {bell && (
                <div className="absolute right-0 top-12 z-40 w-[min(22rem,90vw)] space-y-2 rounded-lg border bg-popover p-3 shadow-xl animate-fade">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alertas <DemoBadge /></div>
                  {alerts.map((a) => <AlertBanner key={a.id} level={a.level} title={a.title} detail={a.detail} />)}
                </div>
              )}
            </div>
            <Link to="/configuracion" aria-label="Perfil" className="grid h-9 w-9 place-items-center rounded-full border bg-panel-2 text-xs font-semibold">AN</Link>
          </div>
          {critical.length > 0 && (
            <div className="border-t border-danger/30 bg-danger/10 px-4 py-1.5 text-xs text-danger">
              <strong>Alerta crítica:</strong> {critical[0].detail}
            </div>
          )}
        </header>

        <main className="mx-auto max-w-[1400px] px-4 pb-28 pt-5 lg:px-8 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {BOTTOM.map((n) => (
          <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10px]", isActive(path, n.to) ? "text-success" : "text-muted-foreground")}>
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
        <button onClick={() => setMore(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground">
          <Menu className="h-5 w-5" /> Más
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t bg-popover p-4 pb-8 animate-fade" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><Logo /><button onClick={() => setMore(false)} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-md hover:bg-accent"><X className="h-5 w-5" /></button></div>
            <div className="grid grid-cols-3 gap-2">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setMore(false)} className={cn("flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs", isActive(path, n.to) ? "border-success/50 text-success" : "text-muted-foreground")}>
                  <n.icon className="h-5 w-5" /> {n.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
