# Reckoning — Spec Red-Team Workflow (Design)

- **Date:** 2026-06-27
- **Status:** Approved — name locked, proceeding to implementation plan
- **Name:** **Reckoning** (locked). Plugin id `reckoning`, command `/reckon`, repo `<handle>/reckoning`.
- **Form:** Claude Code plugin (commands + skills + agents), distributed as an open-source repo
- **Source material:** reuses the agent prompts and Zod schemas from the existing `prd-system` repo (`apps/api/src/agents/prompts/*`, `apps/api/src/agents/schemas/*`)

> **Why "Reckoning":** it names the differentiator — you *reckon* your own view, then face the reckoning (cognitive forcing). Namespace is clear in the AI/dev space; the only collisions are dead/unrelated (a dormant JS calendar lib on npm, a 13★ invoicing SaaS on GitHub), and a marketplace-distributed plugin needs neither the bare npm name nor the org handle.

---

## 1. Summary

A Claude Code plugin that **makes AI attack your spec instead of flattering it.** You give it a raw idea or an existing PRD/spec; it runs a genuinely adversarial review — a strongest-case and a harshest-case generated in *isolation* — forces you to commit your own judgment first, then ends with a verdict: **proceed / descope / kill**, with reasons. All inference runs on the user's own interactive Claude Code session.

## 2. Problem & motivation

People feed half-baked specs to coding agents, which then build the wrong thing confidently and fast. The fix is a quality gate between "idea" and "build": an adversarial review that finds the unmeasurable success criteria, contradictory requirements, scope fantasies, missing edge cases, and weak market premises *before* tokens are spent building on them. Most AI tools *generate* specs and are sycophantic; this one *attacks* them.

## 3. Prior art & positioning

**Spec generation (mature, complementary — not us):** GitHub Spec Kit (~93k★), OpenSpec (~52k★), GSD (~61k★), Kiro, BMAD, Cursor rules. They produce/structure specs to drive coding agents; Kiro adds SMT-based contradiction checks. Reckoning runs *after* these, not against them.

**Spec/idea critique (direct overlap — exists):**
- `pm-skills` `/red-team-prd` — closest direct competitor; adversarially stress-tests a PRD and ranks assumptions by cheapest test (Cagan/Torres/Savoia frameworks).
- Intent's "Critique" persona — purpose-built spec reviewer before implementation agents run.
- ChatPRD — generates PRDs and "identifies holes"; SaaS, PM audience, light critique.
- Claude Code adversarial plugins (`devils-advocate`, `objection`, `claude-devils-advocate`) — critique **code/work**, not **specs/ideas**.

**Conclusion:** "AI red-teams your PRD" is **not** blue ocean. Three elements of this design have **no match** in the scan and are the wedge:
1. **Cognitive forcing** — commit your own assessment, reveal AI's, diff them. Nothing else does this.
2. **Architecturally-enforced isolation** — Praise and Critic run in separate contexts that cannot see each other (not a single persona, not a dialogue).
3. **Packaged end-to-end verdict** — isolated bull vs bear → structured market-skeptic verdict → proceed/descope/kill, as one Claude-Code-native workflow.

**Positioning / launch headline:** lead with **cognitive forcing** ("the spec tool that makes *you* commit first, then runs an isolated bull-vs-bear and hands you a verdict"). Do **not** launch as a generic "AI red-teams your PRD" tool — that lane is occupied.

## 4. Goals / Non-goals

**Goals**
- Two entry modes (raw idea, existing spec) sharing one critique core.
- Genuinely isolated Praise and Critic subagents (separate contexts, zero shared state).
- Cognitive-forcing pause: capture the user's own assessment before revealing AI output; diff at the end.
- Structured, severity-ranked output validated against schemas.
- A real verdict: proceed / descope / kill, with rationale.
- Optional deep web research (user toggle).
- Runs on the user's own Claude Code session — no API key, no token, no per-call cost to the author, no ToS grey area.
- Installable as an open-source Claude Code plugin.

**Non-goals (v1)**
- No standalone web app, MongoDB, WebSocket, auth, or .docx export (all dropped from the original system).
- No multi-tenant SaaS / hosted service.
- No hash-chained cryptographic decision log (optional lightweight disk artifacts only).
- No cross-client MCP server in v1 (planned as a *follow-up* launch, same engine).

## 5. Modes & options

**Mode A — Idea → spec → critique** (input: a raw idea)
1. Clarifying questions (AskUserQuestion) → answers.
2. [if research toggled] web research → findings.
3. Synthesize a draft PRD.
4. → critique core.

**Mode B — Critique an existing spec** (input: file path or pasted text)
1. Load + normalize the spec into the shared PRD schema.
2. [if research toggled] web research on the domain.
3. → critique core.

**Research toggle:** off = fast critique on spec + model knowledge (seconds–minutes, no external deps). on = Researcher agent does web searches first (richer, evidence-backed, minutes-long, depends on host web tools).

## 6. End-to-end flow

```
/reckon
  → Step 0: detect/ask mode (idea | spec); ask research toggle (on | off)
  → Mode A: questions → [research] → synthesize draft PRD
    Mode B: load + normalize spec → [research]
  → Step 1: COGNITIVE-FORCING PAUSE
       "Before I show you anything: what do YOU think works, and what worries you?"
       (captured and sealed; AI output not yet generated/shown)
  → Step 2: ISOLATED ADVERSARIAL FAN-OUT (parallel, zero shared state)
       Praise agent (can't see Critic) ┐
       Critic + Market-Skeptic (can't see Praise) ┘
  → Step 3: SYNTHESIS
       severity-ranked report + DIFF (user's assessment vs AI's)
  → Step 4: OUTPUT
       markdown verdict in-session; [optional] write ./reckoning/<slug>/ artifacts
```

## 7. Architecture & components

Fresh OSS repo (not entangled with the old web app). Plugin layout:

```
reckoning/
├── .claude-plugin/plugin.json     # manifest
├── commands/reckon.md             # /reckon entry point
├── skills/reckoning/SKILL.md      # orchestrator: mode logic, research toggle, fan-out, pause, synthesis
├── agents/                        # isolation layer — each agent = separate dispatched subagent
│   ├── researcher.md
│   ├── synthesizer.md             # drafts PRD from idea + answers + research
│   ├── praise-engine.md
│   └── critic-assassin.md         # critic + market skeptic combined
├── schemas/                       # structured-output contracts (ported from prd-system)
│   ├── questions, research, prd, praise, critical
├── examples/forge-pulse/          # shipped demo run (the launch hook)
├── README.md
└── LICENSE
```

**Four units, one job each:**
- **Agents = isolation.** Praise and Critic are *dispatched subagents* (separate context windows), not prompt sections. Enforced by the subagent mechanism, not by instruction.
- **Skill = orchestration.** The flow, the mode branch, the research toggle, the cognitive-forcing pause, and the synthesis live here.
- **Schemas = contracts.** Every agent returns typed JSON, validated before rendering; this is what makes output consistent and scannable.
- **Renderer = output.** Severity-ranked markdown verdict in-session + optional disk artifacts.

The two modes converge on one critique core, so the breadth (both modes + optional research) stays modular instead of sprawling.

## 8. Structured output schemas (ported from existing repo)

- **questions** — typed question objects (text/radio/multiselect/textarea) for Mode A.
- **research** — findings (title, content, confidence, sources), competitors, blind spots.
- **prd** — sections (problem, personas, scope, metrics, risks…) with confidence + flags.
- **praise** — strengths (strength_level, do_not_regress), non-obvious insights.
- **critical** — failure_modes / scale_pain / user_confusion_risks / engineering_regrets (each: severity × likelihood × section × consequence), market_skeptic (why_care / why_now / why_win / feature_vs_product verdicts), kill_recommendation.

## 9. What makes it good (differentiators)

1. **Adversarial isolation, enforced by architecture** — real strongest-case AND harshest-case, not one hedged "balanced" pass.
2. **Cognitive forcing against automation bias** — commit before reveal, then diff. The novel, ownable element; survived the competitive scan with no match.
3. **Structured, severity-ranked output** — scannable, sortable, consistent run-to-run → demoable and trustworthy.
4. **Takes a position** — proceed/descope/kill with rationale, not vibes.
5. **Zero auth / zero cost / zero ToS grey area** — inference is the user's own interactive Claude Code session (the lane unaffected by the June 15 2026 Agent-SDK billing change).
6. **Optional provenance** — seal the run to disk; the lightweight version of the original hash-chain idea, minus the ceremony.

## 10. Build order (milestones)

1. **Critique core + Mode B (existing spec), research off.** Smallest runnable thing: load spec → cognitive-forcing pause → isolated Praise/Critic fan-out → synthesis → verdict. Validate output on the existing `forge-pulse` PRD.
2. **Mode A (idea → questions → synthesize PRD → critique).**
3. **Research toggle** (Researcher agent + web tools).
4. **Polish:** disk artifacts, README with demo, examples, packaging/manifest.
5. **(Follow-up launch) thin MCP server** wrapping the same core for cross-client reach.

## 11. Open questions

- **Disk artifacts default** — write `./reckoning/<slug>/` by default, or opt-in via flag? (Leaning opt-in.)
- **Mode B normalization** — critique the spec as-is, or first map it into the PRD schema for consistent section anchoring? (Leaning: light normalization.)

## 12. Out of scope (explicitly)

Web app, Mongo, WebSocket, CASL auth, .docx export, hash-chained decision log, multi-tenant SaaS, hosted inference / API-key billing. These were the over-engineered ceremony of the original system; the engine (prompts + schemas + isolated orchestration) is the only part carried forward.
