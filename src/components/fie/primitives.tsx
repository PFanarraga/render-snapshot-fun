import type { ReactNode } from "react";
import { AlertTriangle, Info, OctagonAlert, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntegrityLevel, RiskLevel, Recommendation, SourceType, Team, VerificationStatus, FormResult } from "@/types";
import { INTEGRITY_LABEL, RISK_LABEL, SOURCE_LABEL, VERIF_LABEL, ev as fmtEv, pct } from "@/utils/format";

export function DemoBadge({ className, label = "DEMO" }: { className?: string; label?: string }) {
  return (
    <span
      title="Datos ficticios de prueba"
      className={cn(
        "inline-flex items-center rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-warning",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function Panel({ title, action, children, className, demo }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; demo?: boolean }) {
  return (
    <section className={cn("panel animate-fade", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
            {demo && <DemoBadge />}
          </h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "info", icon }: { label: string; value: ReactNode; hint?: string; tone?: "info" | "success" | "warning" | "caution" | "danger"; icon?: ReactNode }) {
  const toneCls = { info: "text-info", success: "text-success", warning: "text-warning", caution: "text-caution", danger: "text-danger" }[tone];
  return (
    <div className="panel relative overflow-hidden p-4 animate-fade">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={toneCls}>{icon}</span>
      </div>
      <div className={cn("num mt-2 text-2xl font-semibold", toneCls)}>{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <DemoBadge />
        {hint}
      </div>
    </div>
  );
}

const INT_BG: Record<IntegrityLevel, string> = { verde: "bg-success", amarillo: "bg-warning", naranja: "bg-caution", rojo: "bg-danger" };
const INT_TXT: Record<IntegrityLevel, string> = { verde: "text-success", amarillo: "text-warning", naranja: "text-caution", rojo: "text-danger" };
const LEVELS: IntegrityLevel[] = ["verde", "amarillo", "naranja", "rojo"];

/** Integrity of available information — NOT probability of winning. */
export function IntegrityLight({ level, label, showText = false, size = "sm" }: { level: IntegrityLevel; label?: string; showText?: boolean; size?: "sm" | "md" }) {
  const d = size === "md" ? "h-3 w-3" : "h-2 w-2";
  return (
    <span className="inline-flex items-center gap-2" title={`Integridad: ${INTEGRITY_LABEL[level]}`}>
      <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-1.5 py-1">
        {LEVELS.map((l) => (
          <span key={l} className={cn("rounded-full", d, l === level ? INT_BG[l] : "bg-muted")} />
        ))}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      {showText && <span className={cn("text-xs font-medium", INT_TXT[level])}>{INTEGRITY_LABEL[level]}</span>}
    </span>
  );
}

const RISK_CLS: Record<RiskLevel, string> = {
  bajo: "border-success/40 text-success bg-success/10",
  medio: "border-warning/40 text-warning bg-warning/10",
  alto: "border-caution/40 text-caution bg-caution/10",
  critico: "border-danger/50 text-danger bg-danger/10",
};
export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[11px] font-semibold", RISK_CLS[risk])}>Riesgo {RISK_LABEL[risk]}</span>;
}

const REC_CLS: Record<Recommendation, string> = {
  "OPORTUNIDAD DETECTADA": "border-success/50 bg-success/10 text-success",
  "ESPERAR CONFIRMACIÓN": "border-warning/50 bg-warning/10 text-warning",
  "VALOR INSUFICIENTE": "border-info/40 bg-info/10 text-info",
  "RIESGO ELEVADO": "border-danger/50 bg-danger/10 text-danger",
  "INFORMACIÓN INSUFICIENTE": "border-caution/50 bg-caution/10 text-caution",
  "SIN OPORTUNIDADES": "border-border bg-muted text-muted-foreground",
};
export function RecommendationBadge({ rec, large }: { rec: Recommendation; large?: boolean }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border font-mono font-semibold tracking-wide", large ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-[10px]", REC_CLS[rec])}>
      {rec}
    </span>
  );
}

const VERIF_CLS: Record<VerificationStatus, string> = {
  confirmado: "bg-success/15 text-success border-success/40",
  corroborado: "bg-info/15 text-info border-info/40",
  probable: "bg-warning/15 text-warning border-warning/40",
  no_confirmado: "bg-caution/15 text-caution border-caution/40",
  contradictorio: "bg-danger/15 text-danger border-danger/40",
  no_encontrado: "bg-neutral/15 text-neutral border-neutral/40",
  desactualizado: "bg-neutral-dark/30 text-neutral border-neutral-dark",
};
export function VerificationTag({ status }: { status: VerificationStatus }) {
  return <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", VERIF_CLS[status])}>{VERIF_LABEL[status]}</span>;
}

const SRC_CLS: Record<SourceType, string> = {
  hecho: "border-solid", oficial: "border-solid", periodistica: "border-solid",
  rumor: "border-dashed italic", opinion: "border-dotted italic", analista: "border-dashed", prediccion: "border-dotted",
};
export function SourceTypeTag({ type }: { type: SourceType }) {
  return <span className={cn("inline-flex rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground", SRC_CLS[type])}>{SOURCE_LABEL[type]}</span>;
}

export function ProbabilityBar({ value, label, tone = "info" }: { value: number; label?: string; tone?: "info" | "success" | "neutral" }) {
  const bar = { info: "bg-info", success: "bg-success", neutral: "bg-neutral" }[tone];
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="num">{pct(value)}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${Math.min(100, value * 100)}%` }} />
      </div>
    </div>
  );
}

export function EVIndicator({ value }: { value: number }) {
  const cls = value >= 0.03 ? "text-success" : value > 0 ? "text-warning" : "text-danger";
  return <span className={cn("num font-semibold", cls)}>{fmtEv(value)}</span>;
}

export function Crest({ team, size = 36 }: { team: Team; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] font-bold shadow-sm"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${team.colors[0]} 50%, ${team.colors[1]} 50%)`, fontSize: size * 0.28 }}
      aria-label={team.name}
    >
      <span className="rounded bg-background/85 px-0.5 text-foreground">{team.short}</span>
    </span>
  );
}

export function NotFoundInfo({ text = "NO SE ENCONTRÓ INFORMACIÓN" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-4 font-mono text-xs tracking-wide text-neutral">
      <SearchX className="h-4 w-4" /> {text}
    </div>
  );
}

export function AlertBanner({ level, title, detail }: { level: "critico" | "advertencia" | "info"; title: string; detail?: string }) {
  const map = {
    critico: { cls: "border-danger/50 bg-danger/10 text-danger", Icon: OctagonAlert },
    advertencia: { cls: "border-warning/50 bg-warning/10 text-warning", Icon: AlertTriangle },
    info: { cls: "border-info/40 bg-info/10 text-info", Icon: Info },
  }[level];
  return (
    <div className={cn("flex items-start gap-3 rounded-md border px-3 py-2.5", map.cls)}>
      <map.Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        {detail && <div className="text-xs text-foreground/80">{detail}</div>}
      </div>
    </div>
  );
}

export function FormPills({ form }: { form: FormResult[] }) {
  if (!form.length) return <span className="text-xs text-neutral">—</span>;
  return (
    <span className="inline-flex gap-1">
      {form.map((f, i) => (
        <span key={i} className={cn("inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold", f === "W" ? "bg-success/20 text-success" : f === "D" ? "bg-neutral/20 text-neutral" : "bg-danger/20 text-danger")}>
          {f === "W" ? "V" : f === "D" ? "E" : "D"}
        </span>
      ))}
    </span>
  );
}

export function FilterSelect<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 rounded-md border border-input bg-panel-2 px-2 text-sm normal-case tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center">
      <SearchX className="h-6 w-6 text-neutral" />
      <div className="mt-2 font-semibold">{title}</div>
      {detail && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { key: T; label: string }[]; value: T; onChange: (k: T) => void }) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto border-b px-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors",
            value === t.key ? "border-info text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
