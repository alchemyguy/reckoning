# Draft PRD — forge-pulse-fast-feedback-team-heartbeat (v1)

## Problem  _(confidence 55%)_
Engineering teams run retrospectives but **most action items die** before the next sprint. The founder believes the root causes are (1) low psychological safety, so real issues go unspoken, and (2) no durable follow-through on the actions that do get raised.

- Pain is felt most by **individual contributors** who don't feel safe raising problems.
- Existing retro tools focus on the meeting, not on what happens after.
> ⚠️ ASSUMPTION: root-cause claims come from the founder's intuition, not validated user research.

## User Personas  _(confidence 50%)_
- **IC engineer (primary):** wants to raise real concerns without fear of attribution.
- **Team lead / facilitator:** runs the retro and is accountable for follow-through.
> ⚠️ ASSUMPTION: persona pain points are inferred from the interview, not from interviews with real target users.

## Scope & Non-Goals  _(confidence 60%)_
**In scope (MVP):** anonymous feedback capture, simple upvoting, action items with owners.

**Non-goals:** multiple retro formats, cross-team analytics, third-party integrations.
> ⚠️ ASSUMPTION: credible anonymity can be delivered in the MVP — not yet validated technically.

## Success Metrics  _(confidence 40%)_
- **Action completion rate** rises from an assumed baseline of ~40-50% to **70%+** within 3 months of adoption.
- **Participation:** a majority of team members submit at least one note per retro.
> ⚠️ VAGUE_METRIC: baseline completion rate is assumed, not measured.
> ⚠️ UNKNOWN: no instrumentation plan for measuring completion.

## User Stories  _(confidence 65%)_
1. As an IC, I can submit a retro note **anonymously** so I can be honest.
2. As a team, we can **upvote** notes so the most important themes rise.
3. As a facilitator, I can turn a theme into an **action item with an owner and due date**.

## Technical Considerations  _(confidence 45%)_
- Real-time collaboration during the retro implies **WebSockets**.
- **Anonymity** is the hard part: the data model must not store authorship in a way a facilitator or admin could reverse.
- Duplicate-vote prevention without identity is an open problem.
> ⚠️ ASSUMPTION: WebSockets are required — not yet validated against actual usage patterns.
> ⚠️ UNKNOWN: anonymous duplicate-vote prevention approach is undecided.

## Risks & Open Questions  _(confidence 50%)_
- The product may be **solving a culture problem with tooling** — tracking actions more visibly may not make teams complete them.
- Free, established retro tools may be "good enough," making willingness-to-pay unclear.
- Open question: who is the buyer, and is this a standalone product or a feature?
> ⚠️ RISK: tooling may not fix an organizational/culture problem.
> ⚠️ UNKNOWN: willingness to pay and the buyer are undetermined.

## Explicit assumptions
- The core problem is low psychological safety plus poor follow-through (founder's hypothesis, unvalidated).
- Teams will trust an anonymity guarantee enough to speak freely.
- A standalone tool is worth adopting over existing free retro tools.

## Contradictions flagged
- Notes are meant to be permanently anonymous, yet action items have named owners — an owner may be inferable from the note that spawned the action.

