import type { AnalyzeRequest } from "./schema";

export interface DemoScenario {
  id: string;
  title: string;
  tagline: string;
  category: "Career / Academic" | "Financial" | "Personal / Relational";
  request: AnalyzeRequest;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "internship-dilemma",
    title: "6-Month Full-Time Tech Internship",
    tagline: "High stipend and proximity vs. graduating on time and actual mentorship quality",
    category: "Career / Academic",
    request: {
      decision: "Should I accept a 6-month full-time software engineering internship at a local Series-B startup or complete my final semester of university on campus?",
      options: [
        "Accept the 6-month startup internship and defer graduation by one semester",
        "Decline the internship and finish my final semester with my cohort on schedule",
        "Attempt to negotiate a 20-hr part-time remote contract while attending university full-time",
      ],
      keyDetails:
        "Stipend is $4,500/month (very good for my city). The office is a 15-minute commute from home. The team has 12 engineers and works long hours (often 50+ hrs/wk). My university requires a strict attendance policy for 2 remaining capstone courses. If I defer, I graduate in December instead of May, delaying potential full-time job search cycles.",
      leaning: "I'm strongly leaning toward accepting it because of the high stipend, the fact that it is close to home, and having real industry startup experience on my resume.",
      tone: "Alfred",
    },
  },
  {
    id: "financial-ev-purchase",
    title: "Financing a New EV vs. Investing Savings",
    tagline: "Excitement over fuel savings and new tech vs. capital lockup and depreciation",
    category: "Financial",
    request: {
      decision: "Should I spend $38,000 in liquid savings to purchase a new Electric Vehicle or keep driving my paid-off 2016 sedan and invest the capital in index funds?",
      options: [
        "Buy the new EV with cash and eliminate all gas and oil maintenance costs",
        "Keep my 2016 sedan and invest the entire $38,000 into a diversified market index",
        "Finance 50% of the EV at 6.8% interest and invest the other half",
      ],
      keyDetails:
        "My current car runs reliably but gets only 24 MPG and has 95,000 miles. I commute 45 miles round trip daily, spending about $260/month on fuel. The EV tax credit is $7,500. $38,000 represents 65% of my total liquid savings buffer. My job is stable but tech industry layoffs remain common.",
      leaning: "I'm leaning toward buying the EV because I hate spending money on gas and oil changes every month, and the instant torque and safety tech feel like a huge lifestyle upgrade.",
      tone: "Alfred",
    },
  },
  {
    id: "relocation-partner",
    title: "Relocating for Partner's Career",
    tagline: "Supporting a significant other's milestone vs. proximity to aging parents and personal community",
    category: "Personal / Relational",
    request: {
      decision: "Should I relocate across the country to Seattle for my partner's newly offered dream job or stay in Chicago where my aging parents and established social circle reside?",
      options: [
        "Relocate together to Seattle immediately this autumn",
        "Maintain a long-distance relationship for 9-12 months while evaluating long-term prospects",
        "Ask partner to negotiate a remote arrangement or decline the offer",
      ],
      keyDetails:
        "We have been together for 4 years and live together. My partner received a promotion offer with a 40% salary bump in Seattle. However, my mother was recently diagnosed with early-stage Parkinson's and relies on me for weekend assistance. My own job allows remote work, but my entire emotional support structure is in the Midwest.",
      leaning: "I want to say yes and pack our bags because I love my partner and want to support their ambition, and I worry that saying no will breed lingering resentment.",
      tone: "Alfred",
    },
  },
];
