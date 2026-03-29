interface StatusBadgeProps {
  status: "healthy" | "attention" | "problem";
  size?: "sm" | "md";
}

const config = {
  healthy: { label: "Healthy", dot: "bg-healthy" },
  attention: { label: "Needs Care", dot: "bg-warning" },
  problem: { label: "Problem", dot: "bg-danger" },
};

const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const { label, dot } = config[status] ?? { label: status ?? "Unknown", dot: "bg-muted-foreground" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-muted font-semibold ${
        size === "sm" ? "px-2.5 py-0.5 text-caption" : "px-3 py-1 text-label"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
