export function Notice({ kind = "info", children }: { kind?: "info" | "success" | "error" | "warning"; children: React.ReactNode }) {
  const styles = {
    info: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    error: "border-red-500/40 bg-red-500/10 text-red-300",
    warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}
