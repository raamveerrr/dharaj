import type { ReactNode } from "react";

interface Col<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
}: {
  columns: Col<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={"px-4 py-3 font-semibold " + (c.className ?? "")}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-secondary/30">
              {columns.map((c) => (
                <td key={c.key} className={"px-4 py-3 " + (c.className ?? "")}>
                  {c.render ? c.render(r) : String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
