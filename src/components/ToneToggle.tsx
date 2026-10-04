import React from "react";
import { UserCheck, Sparkles } from "lucide-react";

interface ToneToggleProps {
  tone: "Alfred" | "Plain";
  onChange: (tone: "Alfred" | "Plain") => void;
  disabled?: boolean;
}

/**
 * Accessible toggle control for companion voice style.
 * Alfred: Discreet, dry-witted butler persona.
 * Plain: Neutral, direct analytical wording.
 */
export const ToneToggle: React.FC<ToneToggleProps> = ({ tone, onChange, disabled }) => {
  return (
    <fieldset className="flex flex-col gap-1.5" disabled={disabled}>
      <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Thinking Companion Voice
      </legend>
      <div
        className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
        role="radiogroup"
        aria-label="Companion voice persona"
      >
        <button
          type="button"
          role="radio"
          aria-checked={tone === "Alfred"}
          onClick={() => onChange("Alfred")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
            tone === "Alfred"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          <span>Alfred (Butler)</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={tone === "Plain"}
          onClick={() => onChange("Plain")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
            tone === "Plain"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <UserCheck className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          <span>Plain (Neutral)</span>
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {tone === "Alfred"
          ? "Alfred delivers discreet observations and thoughtful inquiries with calm restraint."
          : "Plain delivers unadorned, direct analytical points with neutral phrasing."}
      </p>
    </fieldset>
  );
};
