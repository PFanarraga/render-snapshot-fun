import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

export const axis = { stroke: "var(--border)", tick: { fill: "var(--muted-foreground)", fontSize: 11 } };
export const grid = { stroke: "var(--border)", strokeDasharray: "3 3" };
export const tooltip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--foreground)" },
};
export const SERIES = ["var(--info)", "var(--success)", "var(--warning)", "var(--caution)", "var(--chart-5)"];

export function ChartBox({ children, height = 240 }: { children: ReactNode; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">{children as React.ReactElement}</ResponsiveContainer>
    </div>
  );
}
