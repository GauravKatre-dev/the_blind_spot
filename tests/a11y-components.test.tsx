import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { SeverityBadge } from "../src/components/SeverityBadge";
import { ErrorBanner } from "../src/components/ErrorBanner";
import { DemoPicker } from "../src/components/DemoPicker";

describe("Accessibility (axe-core) Component Audit", () => {
  it("SeverityBadge has zero critical or serious accessibility violations", async () => {
    const { container } = render(
      <div>
        <SeverityBadge severity="high" />
        <SeverityBadge severity="medium" />
        <SeverityBadge severity="low" />
      </div>
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false }, // jsdom does not calculate CSS color contrast
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it("ErrorBanner has zero critical or serious accessibility violations", async () => {
    const { container } = render(
      <ErrorBanner message="Test error message for screen readers" onDismiss={() => {}} />
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it("DemoPicker has zero critical or serious accessibility violations", async () => {
    const { container } = render(
      <DemoPicker onSelect={() => {}} disabled={false} />
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalViolations).toHaveLength(0);
  });
});
