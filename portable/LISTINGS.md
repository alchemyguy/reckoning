# Marketplace listings (Agensi)

Copy for each skill's listing. Upload the zips from `npm run pack:skills` (`portable/dist/<skill>.zip`).

Agensi format notes (checked 2026-10-18):
- Each zip holds one top-level folder with `SKILL.md` at its root, and no symlinks or binaries.
- The security scan rejects minified or obfuscated code. That's why `scripts/reckoning.mjs` is a readable 14 KB bundle, not vendored zod.
- A listing page shows a title and tagline, price, category and tags, a description, "What's inside", a sample session, known limitations, and an FAQ. Installs, ratings and a "security scanned" badge are added by Agensi.
- Their guidance for pricing: **$3–9** for single-purpose skills and **$12–25** for comprehensive multi-file skills. Publishing one or two free skills first builds credibility.
- Comparable listings at the time of checking: "sdd kit" (free; audits specs, ADRs and plans for contradictions) and "Product Manager Engine" (free). Neither has isolated praise vs. critic review, the commit-your-take-first step, or a kill verdict.

**Price: Free for all four skills** (decided 2026-10-18). See "Pricing decision" at the bottom.

---

## reckon (flagship)
- **Price:** Free
- **Title:** Reckon: Make AI Attack Your Spec, Not Flatter It
- **Tagline:** Turns a raw idea or an existing PRD into a proceed / descope / kill verdict. It uses isolated bull-case and bear-case reviews and makes you commit your own take first.
- **Category:** Research & Analysis (alternative: Business & Operations)
- **Tags:** prd, product-management, spec-review, red-team, pre-mortem, idea-validation, product-strategy, decision-making
- **Description:**
  - **Why:** Most AI flatters your spec or hedges into a "balanced" non-answer. Reckon runs two reviewers that never see each other: one builds the strongest case for the spec, the other the harshest case against it. You get a real bull case and a real bear case.
  - **How it works:** (1) Give it a raw idea, and it interviews you and drafts a PRD with every assumption flagged. Or give it an existing spec. (2) You commit your own assessment before seeing any AI output. (3) The isolated praise and critic reviews run. (4) Their output is validated against strict schemas. (5) You get a severity-ranked verdict plus a diff of your judgment against the AI's.
  - **What's inside:** SKILL.md, 3 reference prompts (PRD synthesizer, praise engine, critic), a readable dependency-free validator and renderer (Node 18+), and 2 sample outputs.
  - **Sample session:** use `examples/expected-verdict.md`. Lead with the "Verdict: DESCOPE" banner and the top 3 failure modes.
  - **Known limitations:** No web research yet, so PRDs are drafted only from your answers and citations stay empty. Full isolation needs an agent that supports subagents; on other agents the passes run one after the other, and the output says so. Rendering needs Node 18+; without it, the agent formats the output by hand.
  - **FAQ:**
    - Does it need an API key? No. It runs in your own agent session.
    - Does it work offline? Yes.
    - What does "kill" mean? It's reserved for fundamentally flawed ideas, not fixable problems.

## spec-red-team
- **Price:** Free
- **Title:** Spec Red-Team: Isolated Bull vs. Bear Review for PRDs
- **Tagline:** Paste a spec and get a strongest-case vs. harshest-case review that is severity-ranked and ends in a proceed / descope / kill call.
- **Category:** Research & Analysis
- **Tags:** prd, spec-review, red-team, design-review, rfc, product-management, critique
- **Description:** Mode B of Reckon on its own. Same isolation, same commit-your-take-first step, same verdict. For teams that already have a spec.

## idea-to-prd
- **Price:** Free
- **Title:** Idea to PRD: An Honest Draft With Every Assumption Flagged
- **Tagline:** A short clarifying interview turns a one-liner into a structured PRD with per-section confidence scores. It never invents market data or sources.
- **Category:** Business & Operations (alternative: Technical Documentation)
- **Tags:** prd, product-spec, requirements, product-management, startup, founder
- **Description:** It covers 7 sections: problem, personas, scope and non-goals, success metrics, user stories, technical considerations, and risks. Assumptions and contradictions are listed explicitly, so you know what to validate first.

## spec-premortem
- **Price:** Free
- **Title:** Spec Pre-mortem: Every Way Your Plan Could Fail
- **Tagline:** A harsh critic ranks failure modes by severity and likelihood, runs a market-skeptic check (why care, why now, why win, feature or product), and gives a kill-or-proceed call.
- **Category:** Research & Analysis
- **Tags:** pre-mortem, risk-analysis, devils-advocate, product-strategy, spec-review
- **Description:** The critic half of Reckon on its own. Fast and cheap, and good for a quick gut-check before a planning meeting.

---

## Pricing decision: free (decided 2026-10-18)
All four skills are listed **free**. Reasons:
- They're already free under MIT in this public repo.
- Agensi's terms rule out a clean paid listing: buyer refunds have no time limit (§5.5), and listings may not promote paid versions sold off-platform (§6.3a).
- Agensi advises building credibility with free skills first.

Revenue, if wanted later, comes from a new paid skill that is **not** in this MIT repo, such as Reckon with web research.
