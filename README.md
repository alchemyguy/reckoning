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

## Why it's different

- **Isolated adversarial review** — praise and critic run in separate contexts; neither anchors the other.
- **Cognitive forcing** — you commit your judgment before the AI reveals its own. The fix for anchoring on the machine.
- **Structured & severity-ranked** — typed findings, consistent run-to-run, with a real proceed/descope/kill verdict.

## Example

See [`examples/forge-pulse/expected-verdict.md`](examples/forge-pulse/expected-verdict.md) for a real verdict generated from a sample PRD.

## License

MIT
