import React from "react";
import { DEMO_SCENARIOS, type DemoScenario } from "@/lib/demoScenarios";
import { Lightbulb, GraduationCap, DollarSign, HeartHandshake } from "lucide-react";

interface DemoPickerProps {
  onSelect: (scenario: DemoScenario) => void;
  disabled?: boolean;
}

const scenarioIcons = {
  "internship-dilemma": GraduationCap,
  "financial-ev-purchase": DollarSign,
  "relocation-partner": HeartHandshake,
};

/**
 * Interactive demo scenario selector.
 * Allows evaluators and users to instantly populate diverse decision contexts.
 */
export const DemoPicker: React.FC<DemoPickerProps> = ({ onSelect, disabled }) => {
  return (
    <section
      aria-labelledby="demo-picker-heading"
      className="p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
        <h2 id="demo-picker-heading" className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
          Try a Demo Scenario (Evaluator Quick-Load)
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {DEMO_SCENARIOS.map((scenario) => {
          const Icon = scenarioIcons[scenario.id as keyof typeof scenarioIcons] || Lightbulb;
          return (
            <button
              key={scenario.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(scenario)}
              className="group text-left p-3 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {scenario.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {scenario.tagline}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
