import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingStatusProps {
  label?: string;
}

const STATUS_MESSAGES = [
  "Examining your stated priorities and explicit factors...",
  "Detecting unstated assumptions beneath the surface...",
  "Auditing for internal tensions and competing values...",
  "Mapping overlooked external factors and blind spots...",
  "Synthesizing open inquiries for deliberate reflection...",
];

export const LoadingStatus: React.FC<LoadingStatusProps> = ({ label = "Thinking companion at work..." }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-8 my-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
    >
      <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin motion-reduce:animate-none mb-3" aria-hidden="true" />
      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
        {label}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 transition-opacity duration-300">
        {STATUS_MESSAGES[index]}
      </p>
      <span className="sr-only">Analyzing your decision, please wait.</span>
    </div>
  );
};
