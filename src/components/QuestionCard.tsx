import React from "react";
import type { QuestionItem } from "@/lib/schema";
import { ChevronRight } from "lucide-react";

interface QuestionCardProps {
  index: number;
  item: QuestionItem;
  answer: string;
  onAnswerChange: (value: string) => void;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  item,
  answer,
  onAnswerChange,
  disabled,
}) => {
  const inputId = `question-answer-${index}`;
  const hintId = `question-hint-${index}`;

  return (
    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0 mt-0.5"
          aria-hidden="true"
        >
          {index + 1}
        </span>
        <div className="space-y-1.5 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {item.question}
          </h3>
          {item.probes && item.probes.length > 0 && (
            <ul id={hintId} className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pl-1">
              {item.probes.map((probe, pIdx) => (
                <li key={pIdx} className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{probe}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="pt-1">
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Your thoughts on this inquiry:
        </label>
        <textarea
          id={inputId}
          aria-describedby={item.probes && item.probes.length > 0 ? hintId : undefined}
          rows={2}
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={disabled}
          maxLength={1000}
          placeholder="Jot down your honest reaction or what this question reveals to you..."
          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-colors"
        />
      </div>
    </div>
  );
};
