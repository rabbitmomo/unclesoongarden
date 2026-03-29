import { useState, useEffect } from "react";
//test lovable
interface AIToolResultProps {
  icon: string;
  toolName: string;
  description: string;
  status: "scanning" | "done";
  result?: {
    label: string;
    confidence?: number;
    severity?: "good" | "warning" | "critical";
    details?: string;
  };
  delay?: number;
}

const severityColors = {
  good: "bg-healthy/15 text-healthy border-healthy/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  critical: "bg-danger/15 text-danger border-danger/20",
};

const AIToolResult = ({ icon, toolName, description, status, result, delay = 0 }: AIToolResultProps) => {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="bg-card rounded-2xl p-4 card-shadow animate-fade-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-label text-foreground">{toolName}</p>
            {status === "scanning" ? (
              <span className="text-caption text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Scanning...
              </span>
            ) : (
              <span className="text-caption text-healthy flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-healthy" />
                Done
              </span>
            )}
          </div>
          <p className="text-caption text-muted-foreground mt-0.5">{description}</p>

          {status === "done" && result && (
            <div className="mt-3 space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-label ${severityColors[result.severity || "good"]}`}>
                {result.label}
              </div>
              {result.confidence !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  <span className="text-caption text-muted-foreground font-semibold w-12 text-right">
                    {result.confidence}%
                  </span>
                </div>
              )}
              {result.details && (
                <p className="text-caption text-muted-foreground">{result.details}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIToolResult;
