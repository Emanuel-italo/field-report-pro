import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface ChecklistItemProps {
  label: string;
  value: "conforme" | "nao_conforme" | null;
  onChange: (value: "conforme" | "nao_conforme") => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-2 py-2 border-b border-border last:border-0">
      <p className="text-sm">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("conforme")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors border",
            value === "conforme"
              ? "bg-success text-success-foreground border-success"
              : "bg-card text-muted-foreground border-border hover:border-success/50"
          )}
        >
          <Check className="h-3.5 w-3.5" />
          Conforme
        </button>
        <button
          type="button"
          onClick={() => onChange("nao_conforme")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors border",
            value === "nao_conforme"
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-card text-muted-foreground border-border hover:border-destructive/50"
          )}
        >
          <X className="h-3.5 w-3.5" />
          Não Conforme
        </button>
      </div>
    </div>
  );
};

export default ChecklistItem;
