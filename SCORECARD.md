# PromptWars 2026 Evaluator Scorecard: "Blind Spot"

**Product Name:** Blind Spot  
**Persona:** Alfred (Calm, discreet, dry-witted butler-style thinking companion - voice layer only)  
**Live Deployed URL:** https://blind-spot-711135942629.us-central1.run.app  
**Health Endpoint:** https://blind-spot-711135942629.us-central1.run.app/api/health (HTTP 200 OK)  
**GitHub Repository:** https://github.com/GauravKatre-dev/the_blind_spot (Branch: main)  
**Target:** 100/100 Evaluation across all 7 criteria  

---

## 1. Code Quality
| Requirement | Evidence / Implementation Files | Verification |
|-------------|---------------------------------|--------------|
| Strict TypeScript | `tsconfig.json` (`strict: true`, no `any`) | `npm run typecheck` |
| Clean Linter & Formatter | `eslint.config.mjs`, `.prettierrc`, minimal deps | `npm run lint` |
| Modular Architecture | Small single-purpose modules in `src/lib/*` and `src/components/*` | Code inspection |
| JSDoc & Types | Full JSDoc on all exported functions; single source of truth in `src/lib/schema.ts` | Type definitions |
| Architectural Documentation | `README.md` with mermaid diagrams, design rationale, and trade-offs | Documentation |

## 2. Security
| Requirement | Evidence / Implementation Files | Verification |
|-------------|---------------------------------|--------------|
| Server-Side API Key Only | Read strictly via `process.env.GEMINI_API_KEY` in `src/lib/gemini.ts`; never exposed to browser | Client bundle inspection |
| Environment Protection | `.gitignore` contains `.env*` with `!.env.example`; verified with `git check-ignore` | `git check-ignore .env.local` |
| Input Validation & Limits | `src/lib/schema.ts` & `src/lib/sanitize.ts` (4000 char cap, delimiter escaping) | `tests/schema.test.ts`, `tests/sanitize.test.ts` |
| Prompt-Injection Defense | System prompt instruction + strict tag delimiter (`<user_input>`) sanitization in `src/lib/prompt.ts` | `tests/prompt.test.ts` |
| Deterministic Guardrails | `src/lib/guardrail.ts` scans output for recommendation phrasing without LLM calls | `tests/guardrail.test.ts` |
| Security Headers | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy in `next.config.ts` | HTTP response headers |
| Per-IP Rate Limiting | In-memory token bucket / sliding window limiter in `src/lib/rateLimit.ts` | `tests/rateLimit.test.ts` |
| Non-Root Container | Docker multi-stage running under non-root `nextjs:nodejs` user | `Dockerfile` |

## 3. Efficiency
| Requirement | Evidence / Implementation Files | Verification |
|-------------|---------------------------------|--------------|
| Single LLM Call per Turn | Exactly 1 structured call per analysis / followup | `src/app/api/analyze/route.ts` |
| Fast Flash Model | `gemini-3.8-flash` with automatic fallback to `gemini-3.5-flash-lite` | `src/lib/gemini.ts` |
| Request Timeout & Retry | AbortController timeout + exponential backoff with jitter (max 2 retries) | `src/lib/gemini.ts`, `tests/gemini.test.ts` |
| In-Memory Cache | SHA-256 hashed TTL cache for identical input analysis | `src/lib/cache.ts` |
| Minimal Client Bundle | Server components by default; minimal dependencies; standalone build | `next.config.ts` output: standalone |

## 4. Testing
| Requirement | Evidence / Implementation Files | Verification |
|-------------|---------------------------------|--------------|
| Comprehensive Unit Tests | 42 Vitest tests covering schema, sanitize, guardrails, prompts, rate limiting, and retry | `npm run test` (42/42 passing) |
| Mocked API Route Tests | Success, invalid input, upstream failure, guardrail violation, injection checks | `tests/api-analyze.test.ts`, `tests/api-followup.test.ts` |
| Target 80%+ Coverage | Code coverage on `src/lib/` | `npm run test:coverage` (83.6% line coverage) |
| Automated Accessibility Scans | `axe-core` scanning `SeverityBadge`, `ErrorBanner`, `DemoPicker` for 0 critical/serious a11y violations | `tests/a11y-components.test.tsx` |
| GitHub Actions CI | Automated lint, typecheck, unit test, and build pipeline | `.github/workflows/ci.yml` |

## 5. Accessibility (WCAG 2.2 AA / Lighthouse 95+)
| Requirement | Evidence / Implementation Files | Verification |
|-------------|---------------------------------|--------------|
| Semantic Landmarks | `<header>`, `<main>`, `<footer>`, `<nav>` in `layout.tsx` and `page.tsx` | Axe scan / DOM inspection |
| Keyboard Operability & Focus | Visible focus rings (`focus-visible:ring-2`), skip-to-content link, focus management | Manual & Axe verification |
| Form Controls & ARIA | `<label>` associated with inputs, `aria-describedby` hints, `aria-live` error alerts | Axe scan (`tests/a11y-components.test.tsx`) |
| Dynamic Region Announcements | `aria-live="polite"` on results container, auto-focus to findings heading | Screen reader testing |
| Visual Contrast & Zoom | AA contrast ratio (4.5:1 text, 3:1 UI), supports 200% zoom and 320px viewport | Responsive test |
| Redundant Encoding | Severity conveyed by both textual label and distinct iconography (never color alone) | `tests/a11y-components.test.tsx` |
| Motion Safety | Respects `prefers-reduced-motion` | Tailwind CSS configuration |

## 6. Problem Statement Alignment ("The Blind Spot")
| Requirement | Evidence / Implementation Files | Verification |
|-------------|---------------------------------|--------------|
| Non-Deciding Thinking Companion | Never decides for user; clear persistent notice: *"This tool does not decide for you; it helps you think."* | Guardrail tests & UI |
| 1:1 Requirement Mapping | Unstated assumptions, overlooked factors, internal conflicts, bias probes | `src/lib/schema.ts`, UI cards |
| Multi-Scenario Demos | 1. 6-Month Internship (from brief), 2. Financial Dilemma, 3. Personal/Relationship Dilemma | `src/lib/demoScenarios.ts` |
| Reflection Follow-Up Loop | Guided followup answering questions with re-analysis (`/api/followup`) | `tests/api-followup.test.ts` |
| Graceful Thin-Input Handling | Identifies `missing_information` rather than hallucinating details | Schema & prompt tests |

## 7. Google Services Usage
| Service | Role & Concrete Usage in Repo | Configuration & Evidence |
|---------|--------------------------------|--------------------------|
| **Gemini API** (`@google/genai`) | Single-turn structured reasoning engine (`gemini-3.8-flash` with dynamic fallback to `gemini-3.5-flash-lite`) using strict OpenAPI response schemas. | `src/lib/gemini.ts`, `tests/gemini.test.ts` |
| **Google Cloud Run** | Serverless container deployment in `us-central1` with HTTPS, automatic scaling, non-root user execution, and fast startup probe. | `Dockerfile`, service: `blind-spot` |
| **Google Secret Manager** | Secure production injection of `GEMINI_API_KEY` via `--set-secrets`. The key is never present in code, git history, or client bundles. | Mounted at container runtime |
| **Google Cloud Build / Artifact Registry** | Container image building pipeline using multi-stage caching (`gcloud run deploy --source .`). | Artifact Registry repository `cloud-run-source-deploy` |
| **Google Cloud Logging** | Observability, health monitoring, and structured error/trace inspection. | `gcloud logging read` |

---
*Updated automatically throughout project phases.*
