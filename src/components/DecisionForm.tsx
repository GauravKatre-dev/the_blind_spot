import React, { useState } from "react";
import type { AnalyzeRequest } from "@/lib/schema";
import { ToneToggle } from "./ToneToggle";
import { Plus, Trash2, ArrowRight } from "lucide-react";

interface DecisionFormProps {
  initialValues?: AnalyzeRequest;
  onSubmit: (data: AnalyzeRequest) => void;
  isLoading: boolean;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const [decision, setDecision] = useState(initialValues?.decision || "");
  const [options, setOptions] = useState<string[]>(
    initialValues?.options && initialValues.options.length > 0
      ? initialValues.options
      : ["", ""]
  );
  const [keyDetails, setKeyDetails] = useState(initialValues?.keyDetails || "");
  const [leaning, setLeaning] = useState(initialValues?.leaning || "");
  const [tone, setTone] = useState<"Alfred" | "Plain">(initialValues?.tone || "Alfred");

  const [errors, setErrors] = useState<Record<string, string>>({});


  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!decision.trim() || decision.trim().length < 5) {
      newErrors.decision = "Please specify the decision you are weighing (minimum 5 characters).";
    }

    if (!keyDetails.trim() || keyDetails.trim().length < 10) {
      newErrors.keyDetails = "Please describe the key details and circumstances (minimum 10 characters).";
    }

    if (!leaning.trim() || leaning.trim().length < 5) {
      newErrors.leaning = "Please explain what is driving your current leaning (minimum 5 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const filteredOptions = options.map((o) => o.trim()).filter(Boolean);

    onSubmit({
      decision: decision.trim(),
      options: filteredOptions,
      keyDetails: keyDetails.trim(),
      leaning: leaning.trim(),
      tone,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Examine Your Decision
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provide the dilemma as you see it today. Alfred will surface the angles you haven&apos;t considered.
          </p>
        </div>
        <ToneToggle tone={tone} onChange={setTone} disabled={isLoading} />
      </div>

      {/* Field 1: The Decision */}
      <div className="space-y-1.5">
        <label
          htmlFor="decision-input"
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          What decision are you weighing? <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <p id="decision-hint" className="text-xs text-slate-500 dark:text-slate-400">
          State the core choice or dilemma succinctly (e.g. &ldquo;Should I take the startup internship or finish college on schedule?&rdquo;)
        </p>
        <textarea
          id="decision-input"
          aria-describedby={`decision-hint ${errors.decision ? "decision-error" : ""}`}
          aria-invalid={!!errors.decision}
          rows={2}
          value={decision}
          onChange={(e) => {
            setDecision(e.target.value);
            if (errors.decision) setErrors({ ...errors, decision: "" });
          }}
          disabled={isLoading}
          maxLength={1000}
          placeholder="e.g. Should I accept a 6-month startup internship and defer graduation?"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white ${
            errors.decision
              ? "border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500"
              : "border-slate-300 dark:border-slate-700"
          }`}
        />
        <div className="flex justify-between items-center text-xs">
          {errors.decision ? (
            <span id="decision-error" role="alert" className="text-rose-600 dark:text-rose-400 font-medium">
              {errors.decision}
            </span>
          ) : (
            <span />
          )}
          <span className="text-slate-400">{decision.length}/1000</span>
        </div>
      </div>

      {/* Field 2: Options Under Consideration */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
          Options you are considering (Optional)
        </label>
        <p id="options-hint" className="text-xs text-slate-500 dark:text-slate-400">
          List the paths you are deliberating between.
        </p>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <label htmlFor={`option-${idx}`} className="sr-only">
                {`Option ${idx + 1}`}
              </label>
              <input
                id={`option-${idx}`}
                type="text"
                aria-describedby="options-hint"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                disabled={isLoading}
                maxLength={300}
                placeholder={`Option ${idx + 1} (e.g. Take the internship)`}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              />
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  disabled={isLoading}
                  aria-label={`Remove Option ${idx + 1}`}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px] py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add another option</span>
          </button>
        )}
      </div>

      {/* Field 3: Key Details & Circumstances */}
      <div className="space-y-1.5">
        <label
          htmlFor="details-input"
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Key details and circumstances <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <p id="details-hint" className="text-xs text-slate-500 dark:text-slate-400">
          Share constraints, numbers, timelines, commitments, and trade-offs you currently know.
        </p>
        <textarea
          id="details-input"
          aria-describedby={`details-hint ${errors.keyDetails ? "details-error" : ""}`}
          aria-invalid={!!errors.keyDetails}
          rows={4}
          value={keyDetails}
          onChange={(e) => {
            setKeyDetails(e.target.value);
            if (errors.keyDetails) setErrors({ ...errors, keyDetails: "" });
          }}
          disabled={isLoading}
          maxLength={2500}
          placeholder="e.g. $4,500/mo stipend, 15-minute commute, 50+ hr work weeks, remaining 2 capstone classes with strict attendance policies..."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white ${
            errors.keyDetails
              ? "border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500"
              : "border-slate-300 dark:border-slate-700"
          }`}
        />
        <div className="flex justify-between items-center text-xs">
          {errors.keyDetails ? (
            <span id="details-error" role="alert" className="text-rose-600 dark:text-rose-400 font-medium">
              {errors.keyDetails}
            </span>
          ) : (
            <span />
          )}
          <span className="text-slate-400">{keyDetails.length}/2500</span>
        </div>
      </div>

      {/* Field 4: Current Leaning */}
      <div className="space-y-1.5">
        <label
          htmlFor="leaning-input"
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          What is driving you most toward your leaning? <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <p id="leaning-hint" className="text-xs text-slate-500 dark:text-slate-400">
          Be honest about your emotional pull, gut feeling, or primary attraction.
        </p>
        <textarea
          id="leaning-input"
          aria-describedby={`leaning-hint ${errors.leaning ? "leaning-error" : ""}`}
          aria-invalid={!!errors.leaning}
          rows={2}
          value={leaning}
          onChange={(e) => {
            setLeaning(e.target.value);
            if (errors.leaning) setErrors({ ...errors, leaning: "" });
          }}
          disabled={isLoading}
          maxLength={1000}
          placeholder="e.g. Leaning toward accepting it because the stipend is lucrative, it is near my house, and I want startup prestige on my CV."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white ${
            errors.leaning
              ? "border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500"
              : "border-slate-300 dark:border-slate-700"
          }`}
        />
        <div className="flex justify-between items-center text-xs">
          {errors.leaning ? (
            <span id="leaning-error" role="alert" className="text-rose-600 dark:text-rose-400 font-medium">
              {errors.leaning}
            </span>
          ) : (
            <span />
          )}
          <span className="text-slate-400">{leaning.length}/1000</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Find My Blind Spots</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};
