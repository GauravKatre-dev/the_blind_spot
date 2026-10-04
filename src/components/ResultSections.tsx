import React, { useState } from "react";
import type { AnalysisResult, FollowupResult } from "@/lib/schema";
import { SeverityBadge } from "./SeverityBadge";
import { QuestionCard } from "./QuestionCard";
import {
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Split,
  EyeOff,
  CheckCircle2,
  FileQuestion,
} from "lucide-react";

interface ResultSectionsProps {
  analysis: AnalysisResult;
  onFollowupSubmit: (answers: { question: string; answer: string }[]) => Promise<void>;
  followupResult: FollowupResult | null;
  isFollowupLoading: boolean;
  onReset: () => void;
}

export const ResultSections: React.FC<ResultSectionsProps> = ({
  analysis,
  onFollowupSubmit,
  followupResult,
  isFollowupLoading,
  onReset,
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);

  const handleAnswerChange = (idx: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: text }));
  };

  const handleReflect = () => {
    const formatted = analysis.questions.map((q, idx) => ({
      question: q.question,
      answer: answers[idx]?.trim() || "No specific answer provided.",
    }));
    onFollowupSubmit(formatted);
  };

  const handleCopySummary = () => {
    const textToCopy = `=== BLIND SPOT REFLECTION SUMMARY ===\nDecision: ${analysis.decision_summary}\n\nAlfred's Observation:\n${analysis.observation}\n\nUnstated Assumptions:\n${analysis.assumptions
      .map((a, i) => `${i + 1}. ${a.assumption} (Test: ${a.how_to_test})`)
      .join("\n")}\n\nOverlooked Factors:\n${analysis.overlooked_factors
      .map((f, i) => `${i + 1}. [${f.category}] ${f.factor} - Impact: ${f.severity}`)
      .join("\n")}\n\nInternal Conflicts:\n${analysis.internal_conflicts
      .map((c, i) => `${i + 1}. "${c.statement_a}" vs "${c.statement_b}" -> Tension: ${c.tension}`)
      .join("\n")}\n\n${
      followupResult
        ? `Follow-Up Reflection:\n${followupResult.reflection_summary}\n\nWhat Shifted:\n${followupResult.what_shifted.join("\n")}`
        : ""
    }`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      aria-labelledby="analysis-results-heading"
      className="space-y-8 animate-in fade-in duration-300"
    >
      {/* 1. Mandatory Persistent Non-Verdict Notice */}
      <div
        role="note"
        aria-label="Important ethical boundary notice"
        className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 text-white dark:bg-indigo-950 dark:border dark:border-indigo-800 shadow-md"
      >
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
        <div className="text-sm font-semibold tracking-wide">
          This tool does not decide for you; it helps you think.
        </div>
      </div>

      {/* Safety Notice if flagged */}
      {analysis.safety_flag && (
        <div
          role="alert"
          className="p-5 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 space-y-2"
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
            <span>Support & Well-Being Notice</span>
          </div>
          <p className="text-xs leading-relaxed">
            Your situation involves intense personal distress or safety considerations. While structured thinking can bring order, please consider consulting a trusted confidant, counselor, or professional helpline (such as 988 Suicide &amp; Crisis Lifeline or local support services).
          </p>
        </div>
      )}

      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2
            id="analysis-results-heading"
            tabIndex={-1}
            className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white outline-none"
          >
            Blind Spot Examination
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {analysis.decision_summary}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Export Reflection</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>New Decision</span>
          </button>
        </div>
      </div>

      {/* Observation Callout */}
      <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
            Companion Observation
          </h3>
        </div>
        <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-serif italic">
          &ldquo;{analysis.observation}&rdquo;
        </p>
      </div>

      {/* Grid: Stated Reasons vs Unstated Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stated Reasons */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              What You Explicitly Stated
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {analysis.stated_reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unstated Assumptions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Unstated Assumptions Beneath
            </h3>
          </div>
          <div className="space-y-3">
            {analysis.assumptions.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {item.assumption}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Why it matters:</span> {item.why_it_matters}
                </p>
                <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded">
                  <span className="font-semibold">How to test:</span> {item.how_to_test}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlooked Factors */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Overlooked Factors &amp; Silent Dimensions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crucial angles not mentioned in your initial assessment
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysis.overlooked_factors.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  <SeverityBadge severity={item.severity} />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.factor}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.why_it_matters}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Conflicts */}
      {analysis.internal_conflicts && analysis.internal_conflicts.length > 0 && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Split className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Internal Conflicts &amp; Competing Priorities
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Two of your own stated priorities pulling in opposite directions
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.internal_conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-500">Stated goal A:</span> &ldquo;{conflict.statement_a}&rdquo;
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-500">Stated goal B:</span> &ldquo;{conflict.statement_b}&rdquo;
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Underlying Friction:</span> {conflict.tension}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cognitive Biases */}
      {analysis.bias_flags && analysis.bias_flags.length > 0 && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Potential Cognitive Biases
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tentative thinking patterns evidenced strictly by your own phrasing
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.bias_flags.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">
                    {item.bias}
                  </span>
                </div>
                <blockquote className="italic border-l-2 border-slate-400 pl-2.5 text-slate-600 dark:text-slate-300">
                  &ldquo;{item.evidence_quote}&rdquo;
                </blockquote>
                <p className="text-slate-600 dark:text-slate-400 pt-1">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Information Checklist */}
      {analysis.missing_information && analysis.missing_information.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Information Gaps Worth Investigating
            </h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
            {analysis.missing_information.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" aria-hidden="true" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Inquiries & Follow-up Section */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Open Inquiries for You to Contemplate
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Answer one or more questions below, then click &ldquo;Reflect on my answers&rdquo; to test how your perspective shifts.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {analysis.questions.map((q, idx) => (
            <QuestionCard
              key={idx}
              index={idx}
              item={q}
              answer={answers[idx] || ""}
              onAnswerChange={(val) => handleAnswerChange(idx, val)}
              disabled={isFollowupLoading}
            />
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={handleReflect}
            disabled={isFollowupLoading}
            className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{isFollowupLoading ? "Synthesizing Reflection..." : "Reflect on My Answers"}</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>

        {/* Follow-up reflection results display */}
        {followupResult && (
          <div className="mt-8 p-6 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Companion Reflection on Your Answers
              </h4>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic">
              &ldquo;{followupResult.reflection_summary}&rdquo;
            </p>

            {followupResult.what_shifted && followupResult.what_shifted.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  What Shifted in Your Reasoning:
                </h5>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {followupResult.what_shifted.map((shift, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" aria-hidden="true" />
                      <span>{shift}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {followupResult.new_blind_spots && followupResult.new_blind_spots.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Newly Emerged Considerations:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {followupResult.new_blind_spots.map((item, nIdx) => (
                    <div key={nIdx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-500">{item.category}</span>
                        <SeverityBadge severity={item.severity} />
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.factor}</p>
                      <p className="text-[11px] text-slate-500">{item.why_it_matters}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
