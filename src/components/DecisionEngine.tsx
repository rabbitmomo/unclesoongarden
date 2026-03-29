import { ArrowRight, Brain } from "lucide-react";

interface Decision {
  action: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface DecisionEngineProps {
  decisions: Decision[];
  overallVerdict: string;
}

const priorityStyles = {
  high: "border-l-danger",
  medium: "border-l-warning",
  low: "border-l-healthy",
};

const DecisionEngine = ({ decisions, overallVerdict }: DecisionEngineProps) => {
  return (
    <div className="bg-card rounded-2xl p-5 card-shadow animate-fade-up">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-label text-primary">Decision Engine</p>
          <p className="text-caption text-muted-foreground">AI-powered recommendations</p>
        </div>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/10">
        <p className="text-body-lg font-semibold text-foreground">{overallVerdict}</p>
      </div>

      <div className="space-y-2.5">
        {decisions.map((d, i) => (
          <div
            key={i}
            className={`bg-background rounded-xl p-3.5 border-l-4 ${priorityStyles[d.priority]}`}
          >
            <div className="flex items-start gap-2.5">
              <ArrowRight size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body font-semibold">{d.action}</p>
                <p className="text-caption text-muted-foreground">{d.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionEngine;
