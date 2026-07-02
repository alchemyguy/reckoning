# Reckoning

**Make AI attack your spec instead of flattering it.**

Most AI makes your spec longer. Reckoning makes it survive contact with reality. It runs an **isolated** strongest-case and harshest-case review of your spec — the praise engine and the critic never see each other, so you get a real bull case and a real bear case, not one hedged "balanced" take. And before it shows you anything, **it makes you commit your own assessment first** — then diffs your judgment against the AI's. It ends with a verdict: **proceed / descope / kill**.

Runs entirely on your own Claude Code session. No API key, no account, no per-call cost.

## Install

This is a Claude Code plugin. (Marketplace install instructions — coming with the public release.)

```bash
cd reckoning && npm install
```

## Use

```
/reckon path/to/your-spec.md
```

You'll be asked for your own take first. Then Reckoning dispatches two isolated subagents, validates their output against strict schemas, and renders a severity-ranked verdict.

### Two modes

`/reckon` first asks whether your input is a **raw idea** or an **existing spec**:

- **Raw idea** → Reckoning runs a short clarifying interview, drafts a PRD from your answers (flagging every assumption — no web research yet), shows you the draft, then red-teams it.
- **Existing spec** → it red-teams the spec you provide directly.

Both paths end in the same isolated praise-vs-critic review, the cognitive-forcing pause, and a proceed/descope/kill verdict. See [`examples/forge-pulse/expected-prd.md`](examples/forge-pulse/expected-prd.md) for a Mode A draft PRD (drafted from the interview only — note the empty citations and flagged assumptions) and [`examples/forge-pulse/expected-verdict.md`](examples/forge-pulse/expected-verdict.md) for the verdict.

## Why it's different

- **Isolated adversarial review** — praise and critic run in separate contexts; neither anchors the other.
- **Cognitive forcing** — you commit your judgment before the AI reveals its own. The fix for anchoring on the machine.
- **Structured & severity-ranked** — typed findings, consistent run-to-run, with a real proceed/descope/kill verdict.

## Example

See [`examples/forge-pulse/expected-verdict.md`](examples/forge-pulse/expected-verdict.md) for a real verdict generated from a sample PRD.

## License

MIT
