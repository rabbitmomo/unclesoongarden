interface StatusBadgeProps {
  status: "healthy" | "attention" | "problem";
  size?: "sm" | "md";
}

const config = {
  healthy: { label: "Healthy", dotColor: "hsl(var(--healthy))" },
  attention: { label: "Needs Care", dotColor: "hsl(var(--warning))" },
  problem: { label: "Problem", dotColor: "hsl(var(--danger))" },
};

const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const { label, dotColor } = config[status] ?? {
    label: status ?? "Unknown",
    dotColor: "hsl(var(--muted-foreground))",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-muted font-semibold ${
        size === "sm" ? "px-2.5 py-0.5 text-caption" : "px-3 py-1 text-label"
      }`}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
      {label}
    </span>
  );
};

export default StatusBadge;
