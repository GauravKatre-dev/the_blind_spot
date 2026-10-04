import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export type SeverityLevel = "low" | "medium" | "high";

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

/**
 * Accessible severity badge.
 * Encodes severity using BOTH distinct iconography and explicit textual labels,
 * ensuring WCAG compliance without conveying information through color alone.
 */
export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  switch (severity) {
    case "high":
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800"
          role="status"
          aria-label="High severity impact"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>High Impact</span>
        </span>
      );
    case "medium":
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
          role="status"
          aria-label="Medium severity impact"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Moderate Impact</span>
        </span>
      );
    case "low":
    default:
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
          role="status"
          aria-label="Low severity impact"
        >
          <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Minor Factor</span>
        </span>
      );
  }
};
