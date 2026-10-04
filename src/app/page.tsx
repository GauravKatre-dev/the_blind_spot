"use client";

import React, { useState, useRef } from "react";
import type { AnalyzeRequest, AnalysisResult, FollowupResult } from "@/lib/schema";
import type { DemoScenario } from "@/lib/demoScenarios";
import { DecisionForm } from "@/components/DecisionForm";
import { DemoPicker } from "@/components/DemoPicker";
import { ResultSections } from "@/components/ResultSections";
import { LoadingStatus } from "@/components/LoadingStatus";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Compass, ShieldCheck } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState<AnalyzeRequest | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [followupResult, setFollowupResult] = useState<FollowupResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSelectDemo = (scenario: DemoScenario) => {
    setFormData(scenario.request);
    setFormKey((k) => k + 1);
    setErrorMessage(null);
  };

  const handleFormSubmit = async (data: AnalyzeRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAnalysis(null);
    setFollowupResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Unable to complete analysis. Please try again.");
      }

      setAnalysis(json.data);

      // Accessibility: Move focus to the results heading after completion
      setTimeout(() => {
        const heading = document.getElementById("analysis-results-heading");
        if (heading) {
          heading.focus();
        }
      }, 100);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message === "Failed to fetch"
          ? "Network connection interrupted or request timed out. Please try again."
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupSubmit = async (answers: { question: string; answer: string }[]) => {
    if (!analysis || !formData) return;
    setIsFollowupLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: formData.decision,
          previousObservation: analysis.observation,
          answers,
          tone: formData.tone,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Unable to synthesize reflection. Please try again.");
      }

      setFollowupResult(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during reflection.";
      setErrorMessage(msg);
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setFollowupResult(null);
    setErrorMessage(null);
    setFormData(undefined);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <span>Challenge: The Blind Spot &bull; PromptWars 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Surface the angles <br className="hidden sm:inline" />
          <span className="text-indigo-600 dark:text-indigo-400">you haven&apos;t considered.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Alfred is a discreet, calm thinking companion that illuminates unstated assumptions, overlooked risks, and internal conflicts in your reasoning.
        </p>

        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Strict non-verdict guarantee: We never choose for you.</span>
        </div>
      </section>

      {/* Error Announcement Banner */}
      <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

      {/* Quick-load Demo Scenarios */}
      <DemoPicker onSelect={handleSelectDemo} disabled={isLoading} />

      {/* Main Decision Input Form */}
      <DecisionForm
        key={formKey}
        initialValues={formData}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      {/* Live Loading Region */}
      {isLoading && <LoadingStatus label="Alfred is examining your decision context..." />}

      {/* Results Region with Polite ARIA Live */}
      <div ref={resultsRef} aria-live="polite" aria-atomic="true">
        {analysis && (
          <ResultSections
            analysis={analysis}
            onFollowupSubmit={handleFollowupSubmit}
            followupResult={followupResult}
            isFollowupLoading={isFollowupLoading}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
