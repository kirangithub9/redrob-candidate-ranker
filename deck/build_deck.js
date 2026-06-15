const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Redrob Ranker Team";
pres.title = "Intelligent Candidate Discovery & Ranking";

// ── PALETTE: "Midnight Executive" ──
const NAVY = "1E2761";
const ICE = "CADCFC";
const WHITE = "FFFFFF";
const SLATE = "64748B";
const ACCENT = "00A896"; // teal accent
const DARK_TEXT = "1E293B";
const LIGHT_BG = "F4F6FB";

const makeShadow = () => ({
  type: "outer",
  color: "000000",
  blur: 6,
  offset: 2,
  angle: 45,
  opacity: 0.12,
});

// ─────────────────────────────────────────────
// SLIDE 1 — TITLE
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: NAVY };

  slide.addText("Intelligent Candidate\nDiscovery & Ranking", {
    x: 0.8, y: 1.6, w: 11.5, h: 2.2,
    fontSize: 44, bold: true, color: WHITE, fontFace: "Arial",
    lineSpacingMultiple: 1.05,
  });

  slide.addText("Ranking 100,000 candidates the way a great recruiter would — beyond keyword filters", {
    x: 0.8, y: 3.7, w: 11, h: 0.8,
    fontSize: 18, color: ICE, italic: true, fontFace: "Arial",
  });

  slide.addShape(pres.shapes.OVAL, {
    x: 11.2, y: 0.6, w: 1.6, h: 1.6,
    fill: { color: ACCENT, transparency: 80 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 11.9, y: 1.3, w: 0.9, h: 0.9,
    fill: { color: ICE, transparency: 70 },
  });

  slide.addText("Redrob AI Hackathon — Senior AI Engineer Role  |  Team: redrob-ranker", {
    x: 0.8, y: 6.7, w: 11, h: 0.5,
    fontSize: 13, color: ICE, fontFace: "Arial",
  });
}

// ─────────────────────────────────────────────
// SLIDE 2 — THE PROBLEM
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: WHITE };

  slide.addText("The Problem: Keyword Matching Lies", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: NAVY, fontFace: "Arial",
  });

  // Left card - trap
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.5, w: 6, h: 5.2, rectRadius: 0.08,
    fill: { color: "FDEFEF" }, shadow: makeShadow(),
  });
  slide.addText("The Trap Built Into This Dataset", {
    x: 0.9, y: 1.8, w: 5.4, h: 0.5,
    fontSize: 18, bold: true, color: "B3261E", fontFace: "Arial",
  });
  slide.addText([
    { text: "A candidate titled \"Marketing Manager\" lists 9 AI keywords as skills", options: { bullet: true, breakLine: true, color: DARK_TEXT } },
    { text: "Zero production AI experience in their career history", options: { bullet: true, breakLine: true, color: DARK_TEXT } },
    { text: "Keyword-based ATS systems rank them in the top 10", options: { bullet: true, breakLine: true, color: DARK_TEXT } },
    { text: "A real ML engineer who never wrote \"RAG\" or \"Pinecone\" gets buried", options: { bullet: true, color: DARK_TEXT } },
  ], {
    x: 0.9, y: 2.4, w: 5.4, h: 4,
    fontSize: 15, fontFace: "Arial", paraSpaceAfter: 10,
  });

  // Right card - what JD actually says
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.9, y: 1.5, w: 5.8, h: 5.2, rectRadius: 0.08,
    fill: { color: "EAFBF8" }, shadow: makeShadow(),
  });
  slide.addText("What the JD Actually Asks For", {
    x: 7.2, y: 1.8, w: 5.2, h: 0.5,
    fontSize: 18, bold: true, color: "027368", fontFace: "Arial",
  });
  slide.addText([
    { text: "Understand the GAP between what's said and what's meant", options: { bullet: true, breakLine: true, color: DARK_TEXT } },
    { text: "Career history shows real production ML/ranking/retrieval work", options: { bullet: true, breakLine: true, color: DARK_TEXT } },
    { text: "Down-weight perfect-on-paper but inactive candidates", options: { bullet: true, breakLine: true, color: DARK_TEXT } },
    { text: "Penalize consulting-only careers & job-hoppers", options: { bullet: true, color: DARK_TEXT } },
  ], {
    x: 7.2, y: 2.4, w: 5.2, h: 4,
    fontSize: 15, fontFace: "Arial", paraSpaceAfter: 10,
  });
}

// ─────────────────────────────────────────────
// SLIDE 3 — ARCHITECTURE OVERVIEW
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("Our Approach: Multi-Signal Weighted Ranking", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: NAVY, fontFace: "Arial",
  });

  slide.addText("No API calls. No GPU. Pure Python on CPU. ~15 seconds for 100,000 candidates.", {
    x: 0.6, y: 1.15, w: 12, h: 0.5,
    fontSize: 15, italic: true, color: SLATE, fontFace: "Arial",
  });

  const components = [
    { label: "Core Skill Match", pct: "35%", desc: "Proficiency, endorsements, duration, assessment scores", color: NAVY },
    { label: "Career Fit", pct: "30%", desc: "Title alignment, AI-role ratio, product vs consulting", color: ACCENT },
    { label: "Behavioral Signals", pct: "20%", desc: "Recency, response rate, GitHub activity, notice period", color: "5B6FD6" },
    { label: "Education", pct: "5%", desc: "Institution tier + degree relevance", color: "94A3B8" },
    { label: "Location", pct: "5%", desc: "Pune/Noida preferred, India, relocation flag", color: "94A3B8" },
    { label: "Nice-to-have Skills", pct: "5%", desc: "XGBoost, LangChain, distributed systems, etc.", color: "94A3B8" },
  ];

  const startX = 0.6;
  const cardW = 1.95;
  const gap = 0.18;
  components.forEach((c, i) => {
    const x = startX + i * (cardW + gap);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.9, w: cardW, h: 2.0, rectRadius: 0.08,
      fill: { color: WHITE }, shadow: makeShadow(),
    });
    slide.addShape(pres.shapes.OVAL, {
      x: x + cardW / 2 - 0.35, y: 2.1, w: 0.7, h: 0.7,
      fill: { color: c.color },
    });
    slide.addText(c.pct, {
      x: x, y: 2.1, w: cardW, h: 0.7,
      align: "center", valign: "middle",
      fontSize: 16, bold: true, color: WHITE, fontFace: "Arial",
    });
    slide.addText(c.label, {
      x: x + 0.08, y: 2.9, w: cardW - 0.16, h: 0.5,
      align: "center", fontSize: 12, bold: true, color: NAVY, fontFace: "Arial",
    });
    slide.addText(c.desc, {
      x: x + 0.1, y: 3.35, w: cardW - 0.2, h: 0.55,
      align: "center", fontSize: 8.5, color: SLATE, fontFace: "Arial",
    });
  });

  // Minus stuffing penalty
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 4.3, w: 12.1, h: 1.0, rectRadius: 0.08,
    fill: { color: "FDEFEF" }, shadow: makeShadow(),
  });
  slide.addText("− Keyword Stuffing Penalty", {
    x: 0.9, y: 4.45, w: 4, h: 0.5,
    fontSize: 15, bold: true, color: "B3261E", fontFace: "Arial",
  });
  slide.addText("Many listed skills but low average endorsements per skill → penalty applied to final score", {
    x: 4.6, y: 4.45, w: 7.8, h: 0.5,
    fontSize: 13, color: DARK_TEXT, fontFace: "Arial", valign: "middle",
  });

  // Formula box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.55, w: 12.1, h: 1.35, rectRadius: 0.08,
    fill: { color: NAVY }, shadow: makeShadow(),
  });
  slide.addText("Final Score = (0.35 × Skills) + (0.30 × Career) + (0.20 × Behavioral) + (0.05 × Education) + (0.05 × Location) + (0.05 × Nice-to-have) − Stuffing Penalty", {
    x: 0.9, y: 5.55, w: 11.5, h: 1.35,
    align: "center", valign: "middle",
    fontSize: 15, bold: true, color: WHITE, fontFace: "Arial",
  });
}

// ─────────────────────────────────────────────
// SLIDE 4 — SKILL SCORING DEEP DIVE
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: WHITE };

  slide.addText("Skill Scoring: Trust, Don't Just Count", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: NAVY, fontFace: "Arial",
  });

  slide.addText("Each skill is weighted by signals that indicate REAL expertise, not just a listed word", {
    x: 0.6, y: 1.15, w: 12, h: 0.5,
    fontSize: 15, italic: true, color: SLATE, fontFace: "Arial",
  });

  slide.addTable([
    [
      { text: "Signal", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 14 } },
      { text: "Weight", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 14 } },
      { text: "Why it matters", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 14 } },
    ],
    ["Proficiency level", "50%", "Advanced > Intermediate > Beginner — self-reported but a real signal"],
    ["Endorsements", "30%", "Capped at 50; high endorsements = peer validation of real skill"],
    ["Duration of use", "20%", "Capped at 3 years; longer use = deeper familiarity"],
    ["Skill assessment score", "+20% bonus", "Redrob's own tested score — strongest trust signal available"],
  ], {
    x: 0.6, y: 1.9, w: 12.1, h: 2.6,
    fontSize: 13, fontFace: "Arial",
    border: { pt: 0.5, color: "E2E8F0" },
    color: DARK_TEXT,
    valign: "middle",
    rowH: 0.6,
  });

  // Bottom: stuffing detection
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 4.8, w: 12.1, h: 2.0, rectRadius: 0.08,
    fill: { color: "EAFBF8" }, shadow: makeShadow(),
  });
  slide.addText("Keyword Stuffing Detector", {
    x: 0.9, y: 5.0, w: 6, h: 0.5,
    fontSize: 17, bold: true, color: "027368", fontFace: "Arial",
  });
  slide.addText([
    { text: "If a candidate lists 10+ skills AND their average endorsements per skill is low →", options: { bullet: true, breakLine: true, color: DARK_TEXT } },
    { text: "penalty = max(0, 0.3 − (avg_endorsements/50) × 0.3) subtracted from final score", options: { bullet: true, color: DARK_TEXT } },
  ], {
    x: 0.9, y: 5.5, w: 11.5, h: 1.2,
    fontSize: 14, fontFace: "Arial", paraSpaceAfter: 8,
  });
}

// ─────────────────────────────────────────────
// SLIDE 5 — CAREER FIT DEEP DIVE
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("Career Fit: Reading Between the Lines", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: NAVY, fontFace: "Arial",
  });

  const cards = [
    {
      title: "Title Alignment (35%)",
      lines: [
        "1.0 — ML/AI Engineer, Data Scientist, NLP/Search/Ranking Engineer",
        "0.6 — Generic \"Engineer\" or \"Scientist\" titles",
        "0.05 — Marketing/HR/Accountant/Sales/Ops Manager etc. (JD disqualifiers)",
      ],
    },
    {
      title: "AI Experience Ratio (30%)",
      lines: [
        "% of total career months spent in AI/ML-relevant roles",
        "Detected via title keywords AND job description text",
        "67%+ of career in AI roles → full score",
      ],
    },
    {
      title: "Product vs Consulting (20%)",
      lines: [
        "% of career at non-consulting companies",
        "TCS/Infosys/Wipro/Accenture/Cognizant/Capgemini/HCL flagged",
        "Entirely consulting-only career → −0.4 penalty (per JD)",
      ],
    },
    {
      title: "Years of Experience (15%)",
      lines: [
        "5-9 yrs → 1.0  (JD's stated sweet spot)",
        "4-5 yrs → 0.8   |   9-12 yrs → 0.7",
        "Job-hopping (avg tenure < 12mo) → up to −0.3 penalty",
      ],
    },
  ];

  const colW = 6.0;
  const colGap = 0.2;
  const rowH = 2.55;
  const rowGap = 0.2;

  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * (colW + colGap);
    const y = 1.5 + row * (rowH + rowGap);

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: colW, h: rowH, rectRadius: 0.08,
      fill: { color: WHITE }, shadow: makeShadow(),
    });
    slide.addText(c.title, {
      x: x + 0.3, y: y + 0.18, w: colW - 0.6, h: 0.45,
      fontSize: 16, bold: true, color: NAVY, fontFace: "Arial",
    });
    slide.addText(
      c.lines.map((l, idx) => ({
        text: l,
        options: { bullet: true, breakLine: idx < c.lines.length - 1, color: DARK_TEXT },
      })),
      {
        x: x + 0.3, y: y + 0.7, w: colW - 0.6, h: rowH - 0.85,
        fontSize: 12.5, fontFace: "Arial", paraSpaceAfter: 6,
      }
    );
  });
}

// ─────────────────────────────────────────────
// SLIDE 6 — BEHAVIORAL SIGNALS
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: WHITE };

  slide.addText("Behavioral Signals: Is This Person Even Available?", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 28, bold: true, color: NAVY, fontFace: "Arial",
  });

  slide.addText("\"A perfect-on-paper candidate who hasn't logged in for 6 months and has 5% recruiter response rate is, for hiring purposes, not actually available.\" — JD", {
    x: 0.6, y: 1.15, w: 12, h: 0.7,
    fontSize: 14, italic: true, color: SLATE, fontFace: "Arial",
  });

  const signals = [
    { name: "Recency", weight: "25%", desc: "≤30 days = 1.0, >365 days = 0.1" },
    { name: "Open to Work", weight: "20%", desc: "Flag true = 1.0, false = 0.3" },
    { name: "Response Rate", weight: "20%", desc: "Direct recruiter response rate value" },
    { name: "Profile Completeness", weight: "10%", desc: "Redrob's completeness score / 100" },
    { name: "GitHub Activity", weight: "10%", desc: "Strong signal for engineers specifically" },
    { name: "Notice Period", weight: "10%", desc: "≤30 days = 1.0 (JD prefers fast joiners)" },
    { name: "Verification", weight: "5%", desc: "Email + phone verified" },
  ];

  const colW = 3.85;
  const colGap = 0.2;
  const rowH = 1.7;
  const rowGap = 0.2;

  signals.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * (colW + colGap);
    const y = 2.1 + row * (rowH + rowGap);

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: colW, h: rowH, rectRadius: 0.08,
      fill: { color: i % 2 === 0 ? "EAFBF8" : "F0F0FB" }, shadow: makeShadow(),
    });
    slide.addText(s.weight, {
      x: x + 0.2, y: y + 0.15, w: 1.4, h: 0.5,
      fontSize: 22, bold: true, color: ACCENT, fontFace: "Arial",
    });
    slide.addText(s.name, {
      x: x + 0.2, y: y + 0.65, w: colW - 0.4, h: 0.4,
      fontSize: 14, bold: true, color: NAVY, fontFace: "Arial",
    });
    slide.addText(s.desc, {
      x: x + 0.2, y: y + 1.05, w: colW - 0.4, h: 0.55,
      fontSize: 10.5, color: SLATE, fontFace: "Arial",
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 7 — RESULTS / TOP CANDIDATES
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("Results: Top Candidates from 100,000", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: NAVY, fontFace: "Arial",
  });

  slide.addTable([
    [
      { text: "Rank", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 13 } },
      { text: "Candidate ID", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 13 } },
      { text: "Score", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 13 } },
      { text: "Profile Summary", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 13 } },
    ],
    ["1", "CAND_0002025", "0.6916", "Senior AI Engineer, 5.9 yrs — strong core skill + career fit"],
    ["2", "CAND_0086022", "0.6852", "Senior Applied Scientist, 5.3 yrs — highest skill match (0.76)"],
    ["3", "CAND_0046064", "0.6848", "Senior NLP Engineer, 8.9 yrs — within ideal experience band"],
    ["4", "CAND_0048558", "0.6765", "Data Scientist, 6.7 yrs — strong career & behavioral signals"],
    ["5", "CAND_0071974", "0.6708", "Senior AI Engineer, 7.8 yrs — well-rounded profile"],
  ], {
    x: 0.6, y: 1.4, w: 12.1, h: 2.6,
    fontSize: 13, fontFace: "Arial",
    border: { pt: 0.5, color: "E2E8F0" },
    color: DARK_TEXT,
    valign: "middle",
    rowH: 0.5,
  });

  // Score distribution stat cards
  const stats = [
    { label: "Max Score", value: "0.69" },
    { label: "P90 Score", value: "0.36" },
    { label: "Median Score", value: "0.27" },
    { label: "Runtime (100K)", value: "~15 sec" },
  ];
  const colW = 2.95;
  const gap = 0.2;
  stats.forEach((s, i) => {
    const x = 0.6 + i * (colW + gap);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 4.4, w: colW, h: 1.5, rectRadius: 0.08,
      fill: { color: WHITE }, shadow: makeShadow(),
    });
    slide.addText(s.value, {
      x, y: 4.55, w: colW, h: 0.7,
      align: "center", fontSize: 30, bold: true, color: ACCENT, fontFace: "Arial",
    });
    slide.addText(s.label, {
      x, y: 5.3, w: colW, h: 0.4,
      align: "center", fontSize: 13, color: SLATE, fontFace: "Arial",
    });
  });

  slide.addText("Score distribution shows a clear, meaningful gradient — not a flat distribution of false positives. The system found a narrow band of strong matches, exactly as the JD expects (\"10 great matches, not 1000 maybes\").", {
    x: 0.6, y: 6.2, w: 12.1, h: 0.9,
    fontSize: 13, italic: true, color: SLATE, fontFace: "Arial",
  });
}

// ─────────────────────────────────────────────
// SLIDE 8 — COMPLIANCE & RUN INSTRUCTIONS
// ─────────────────────────────────────────────
{
  let slide = pres.addSlide();
  slide.background = { color: NAVY };

  slide.addText("Built for the Constraints That Matter", {
    x: 0.6, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: WHITE, fontFace: "Arial",
  });

  const items = [
    { title: "No network during ranking", desc: "Zero API calls. Fully offline scoring." },
    { title: "No GPU required", desc: "Pure Python + standard library logic." },
    { title: "Fast & reproducible", desc: "~15 seconds for 100K candidates, deterministic output." },
    { title: "Explainable by design", desc: "Every candidate gets a human-readable reasoning string." },
  ];

  items.forEach((it, i) => {
    const y = 1.6 + i * 1.15;
    slide.addShape(pres.shapes.OVAL, {
      x: 0.7, y: y + 0.1, w: 0.45, h: 0.45,
      fill: { color: ACCENT },
    });
    slide.addText(String(i + 1), {
      x: 0.7, y: y + 0.1, w: 0.45, h: 0.45,
      align: "center", valign: "middle", fontSize: 16, bold: true, color: WHITE, fontFace: "Arial",
    });
    slide.addText(it.title, {
      x: 1.35, y: y, w: 5.5, h: 0.4,
      fontSize: 17, bold: true, color: WHITE, fontFace: "Arial",
    });
    slide.addText(it.desc, {
      x: 1.35, y: y + 0.42, w: 5.5, h: 0.5,
      fontSize: 13, color: ICE, fontFace: "Arial",
    });
  });

  // Run command box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.0, y: 1.6, w: 5.7, h: 4.3, rectRadius: 0.08,
    fill: { color: "151C4A" }, shadow: makeShadow(),
  });
  slide.addText("Reproduce in one command", {
    x: 7.3, y: 1.8, w: 5.1, h: 0.45,
    fontSize: 16, bold: true, color: ACCENT, fontFace: "Arial",
  });
  slide.addText("pip install -r requirements.txt\n\npython rank.py \\\n  --candidates candidates.jsonl \\\n  --out submission.csv \\\n  --top 100", {
    x: 7.3, y: 2.4, w: 5.1, h: 1.8,
    fontSize: 13, color: WHITE, fontFace: "Courier New",
    fill: { color: "0C1230" },
  });
  slide.addText("Output: submission.csv\ncandidate_id, rank, score, reasoning", {
    x: 7.3, y: 4.4, w: 5.1, h: 0.8,
    fontSize: 12, color: ICE, fontFace: "Arial", italic: true,
  });
  slide.addText("Files: rank.py · requirements.txt · submission_metadata.yaml · README.md", {
    x: 7.3, y: 5.3, w: 5.1, h: 0.5,
    fontSize: 11, color: SLATE, fontFace: "Arial",
  });

  slide.addText("Team: redrob-ranker  |  Redrob AI Hackathon — Intelligent Candidate Discovery & Ranking", {
    x: 0.6, y: 6.9, w: 12, h: 0.4,
    fontSize: 11, color: SLATE, fontFace: "Arial",
  });
}

pres.writeFile({ fileName: "/home/claude/redrob-ranker/deck/redrob_ranker_deck.pptx" })
  .then(() => console.log("PPTX created successfully"))
  .catch(err => console.error(err));
