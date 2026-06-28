# Draft PRD — forge-pulse-fast-feedback-team-heartbeat (v1)

## Problem Statement  _(confidence 95%)_
Engineering teams at startups struggle with four core retrospective failures that make feedback ineffective:

1. **Invisible morale trends**: Teams cannot tell if team health is improving or declining sprint-over-sprint. Current tools provide snapshot views but lack longitudinal visibility into team sentiment patterns.

2. **Pattern blindness**: The same issues resurface repeatedly across multiple retrospectives without resolution. Research shows that 'the biggest problem observed is that some themes come back over and over' and teams lose traction when no movement occurs on prior action items.

3. **Resolution gaps**: Action item completion rates are shockingly low - teams complete only 40-50% of retrospective action items. After implementing visibility features, this improved to 65%, still well below the 80-100% target. More broadly, nearly two-thirds of teams implement fewer than 25% of ideas from their retros.

4. **Psychological safety barriers**: The most common complaint about retrospectives is that people fail to bring up real issues or admit to their problems. People won't speak up unless they feel safe. This creates a blame culture where retrospectives become a waste of time if people aren't honest.

These problems compound over time: low psychological safety → shallow feedback → low action completion → recurring issues → declining morale → even lower psychological safety. Teams need a way to break this cycle.
> ⚠️ No quantitative data on what percentage of startup engineering teams experience these specific problems vs. general agile teams
> ⚠️ Unknown whether these pain points are equally severe across all team sizes 5-10 or concentrated in specific size ranges

## User Personas  _(confidence 90%)_
**Primary Persona: Engineering Team Member (Individual Contributor)**
- Role: Software engineer, designer, QA, or technical product manager
- Team size: 5-10 people per team
- Organization: Startup engineering teams (2-5 teams initially)
- Context: Participates in live retrospective meetings every 1-2 weeks (two-week sprint cycles are most common)
- Pain points: Hesitant to speak up about real problems due to lack of psychological safety; frustrated by same issues recurring without resolution; unclear if their feedback leads to actual change
- Goals: Share honest feedback without fear of blame; see tangible improvements result from retrospectives; understand if team health is trending positively
- Behaviors: Average retrospective participant count is 6 people per board; needs to contribute within 60-90 minute timeboxed meetings; likely to remain silent if not engaged early in the meeting

**Secondary Persona: Retrospective Facilitator (Scrum Master/Team Lead)**
- Role: Scrum master, engineering manager, or team lead
- Responsibilities: Runs retrospective meetings, manages discussion flow, ensures action items get captured and followed up
- Pain points: Difficulty getting honest participation; overhead of tracking incomplete actions across sprints; struggles to demonstrate team health trends to leadership; retrospectives grow stale with repetitive formats
- Goals: Create psychologically safe environment; maximize value within 60-90 minute timebox; ensure action items don't fall through cracks; show leadership that retrospectives drive improvement
- Behaviors: Needs timer and facilitation controls; wants minimal setup overhead; requires visibility into action item completion rates; seeks to prevent discussions from straying off-topic
> ⚠️ Unknown whether startup engineering teams have dedicated Scrum Masters or if engineering managers/team leads facilitate retrospectives
> ⚠️ No data on what percentage of teams rotate facilitator role vs. have dedicated facilitator
> ⚠️ Missing information on whether 5-person vs. 10-person teams have different facilitator needs

## Scope and Non-Goals  _(confidence 85%)_
**IN SCOPE for MVP (1-2 month timeline):**

1. **Fast Capture (Anonymous Notes)**
   - Type, enter, done - zero friction note creation
   - Permanent, complete anonymity (even from facilitator, never store authorship)
   - Upvote mechanism to rank notes without revealing voter identity
   - Basic categorization (e.g., What went well / What needs improvement / Action items)

2. **Action Pulse (Action Tracking)**
   - One-click conversion of themes to action items
   - Auto-carry incomplete actions to next retrospective
   - Owner assignment + due sprint fields only (minimal metadata)
   - Visibility into completion status

3. **Heartbeat Timeline (Historical View)**
   - Dashboard showing all past retrospectives in chronological order
   - Visual representation making improvement or decay visible over time
   - Core to the 'vital signs monitor' metaphor
   - Read-only access to past retro data

4. **Essential Facilitation Features**
   - Facilitator role with special permissions (timer control, topic phase management, voting close)
   - Focus Mode with timer for time-boxed discussions
   - Simple team creation and invite system
   - Web-first application (React or Vue frontend)

**EXPLICITLY OUT OF SCOPE for MVP:**

1. Cross-team analytics or comparisons (fully isolated teams only)
2. Third-party integrations (Jira, Linear, Slack, etc.) - starting fresh
3. Asynchronous/distributed retrospective support (live meetings only)
4. Multiple retrospective format templates (single simple format to start)
5. AI-assisted features (theme clustering suggestions, summaries)
6. Mobile native applications (web-responsive only)
7. Advanced analytics, reporting, or export features
8. Team health scoring algorithms or metrics beyond basic timeline visualization
9. Video conferencing integration
10. Multi-language support or localization
11. Enterprise features (SSO, admin controls, usage analytics)
12. Monetization or pricing (internal tool first)

**NON-GOALS:**

- Not building a general collaboration platform (retro-specific only)
- Not targeting enterprise teams or large organizations (startup focus)
- Not competing on feature breadth (competing on focused simplicity)
- Not trying to replace existing project management tools
- Not attempting to solve async/distributed team challenges in MVP
> ⚠️ Unknown whether 1-2 month timeline is realistic given team size and availability (no information on development team capacity)
> ⚠️ Uncertainty whether 'permanent anonymity' can be technically implemented while preventing vote manipulation (finding-014 shows cryptographic complexity)
> ⚠️ Risk that excluding async features may limit adoption if internal teams have any remote members (finding-032 shows 65% of distributed teams face participation inequities)

## Success Metrics  _(confidence 75%)_
**12-Month Success Criteria (as defined by founder):**

1. **Proven Retention**: Teams use Forge Pulse consistently for 6+ months
   - Measurable as: Monthly active teams (MAT) sustaining usage across 6+ consecutive months
   - Target: <5% monthly churn rate (startup SaaS benchmark suggests 5% monthly churn is normal for startups)
   - Leading indicator: 80%+ week-over-week retention in first month

2. **Demonstrable Team Health Improvement**: The 'vital signs' actually work
   - Measurable as: Action item completion rate increases from baseline 40-50% to target 80%+
   - Measurable as: Reduction in recurring themes (same issue appearing in 3+ consecutive retros)
   - Measurable as: Team sentiment trends positive in Heartbeat Timeline over 3+ month periods
   - Leading indicator: Teams reference historical retros when planning actions (observable in action item descriptions)

**MVP Validation Metrics (1-2 months, internal teams):**

1. **Adoption**: 2-5 internal engineering teams actively using Forge Pulse within 2 weeks of launch
2. **Engagement**: Average 5+ notes per team member per retrospective (indicating psychological safety to contribute)
3. **Action tracking**: 80%+ of retrospectives result in at least 1 action item created (enforcing outcome focus)
4. **Continued usage**: Teams schedule and complete 3+ consecutive retrospectives using the tool (proving it doesn't get abandoned)
5. **Facilitator efficiency**: Retrospective setup time <5 minutes (validating low-friction promise)

**Anti-Metrics (What NOT to optimize for):**

- Number of features shipped (avoiding feature bloat)
- Time spent in retrospectives (efficiency is good, but depth matters more)
- Number of notes created (quality over quantity)
- Cross-team comparisons or velocity metrics (not building performance surveillance tool)

**Known Unknowns:**

- No baseline data on current action item completion rates for target teams
- No established methodology for measuring 'team health improvement' objectively (finding-026 shows 3:1 to 5:1 ROI claims but limited empirical studies)
- Unclear how to quantify 'reduction in recurring themes' without natural language processing
- Missing data on what constitutes 'good' retention for retrospective tools specifically
> ⚠️ No research found on how to objectively measure 'team health improvement' beyond action completion rates and sentiment surveys
> ⚠️ Missing baseline data from target teams on current retrospective effectiveness
> ⚠️ Unknown whether 6-month retention target is realistic given that finding-035 shows several retrospective tools have been discontinued
> ⚠️ No data on whether startup teams typically stick with retrospective tools long-term or frequently switch
> ⚠️ Unclear how to measure 'demonstrable improvement' without longitudinal data - need at least 3 months before any trends visible

## User Stories  _(confidence 85%)_
**As an Individual Contributor:**

1. As a team member, I want to submit honest feedback anonymously so that I can raise real issues without fear of blame or retaliation
   - Acceptance: Notes submitted have no authorship metadata stored, even facilitator cannot see who wrote what
   - Acceptance: Interface provides clear confirmation that submission is anonymous

2. As a team member, I want to upvote feedback I agree with so that important themes rise to the top without revealing who supports what
   - Acceptance: Upvote count increases without displaying voter identities
   - Acceptance: Cannot vote multiple times on same note (prevent manipulation)

3. As a team member, I want to see past retrospectives in a timeline so that I can understand whether our team health is improving or declining
   - Acceptance: Heartbeat Timeline displays all past retros in chronological order
   - Acceptance: Visual indicators show sentiment trend (positive/neutral/negative)

4. As a team member, I want to contribute feedback quickly (type, enter, done) so that I maximize time for discussion rather than mechanics
   - Acceptance: Can submit note in <10 seconds from typing to confirmation
   - Acceptance: No mandatory fields beyond note content

5. As a team member, I want to see which action items from previous retros are still incomplete so that I know what's being carried forward
   - Acceptance: Incomplete actions from previous sprint auto-appear in current retro
   - Acceptance: Visual distinction between new and carried-over actions

**As a Facilitator:**

6. As a facilitator, I want to control discussion timing with a visible timer so that we stay within our 60-90 minute timebox
   - Acceptance: Can set timer for each discussion phase
   - Acceptance: Timer visible to all participants in real-time

7. As a facilitator, I want to convert high-voted themes into action items with one click so that we don't lose momentum translating discussion into outcomes
   - Acceptance: Can select theme and convert to action with single interaction
   - Acceptance: Action item pre-populated with theme text, requires only owner and due sprint

8. As a facilitator, I want to close voting when discussion begins so that we focus on themes that matter most
   - Acceptance: Voting lock prevents new votes after voting phase ends
   - Acceptance: Final vote counts displayed clearly

9. As a facilitator, I want to ensure every retrospective produces at least one action item so that we maintain outcome focus
   - Acceptance: Cannot close/complete retro without creating at least one action
   - Acceptance: Clear prompt if attempting to close without actions

10. As a facilitator, I want to set up a new retrospective in under 5 minutes so that preparation doesn't become a barrier to running retros consistently
    - Acceptance: Can create new retro with team selection and timer settings in <5 clicks
    - Acceptance: No required configuration beyond basics

**As a Team (Collective):**

11. As a team, we want to see patterns across multiple retrospectives so that we can identify systemic issues vs. one-time problems
    - Acceptance: Heartbeat Timeline shows all past retros with theme summaries
    - Acceptance: Can click into any past retro to see full details

12. As a team, we want action items to have clear owners and due dates so that accountability is explicit
    - Acceptance: Every action requires owner assignment and target sprint
    - Acceptance: Overdue actions visually highlighted in timeline

**Edge Cases & Constraints:**

13. As a facilitator, I want to prevent duplicate voting by same person so that results reflect genuine consensus
    - Technical challenge: must prevent duplicate voting while maintaining anonymity (finding-014 notes this creates possibility for voting abuse)

14. As a team member, I want confidence that my anonymity is permanent so that I can trust the system even in contentious situations
    - Acceptance: Clear privacy policy stating authorship never stored, not just hidden
    - Acceptance: Even database administrators cannot reverse-engineer authorship
> ⚠️ Unknown whether 'cannot close retro without at least one action' guardrail will create resentment or force low-quality actions
> ⚠️ Technical feasibility of preventing duplicate voting while maintaining complete anonymity is uncertain (may require compromise)
> ⚠️ No user testing on whether visual 'vital signs' metaphor resonates or confuses users

## Technical Considerations  _(confidence 70%)_
**Architecture Approach:**

1. **Real-Time Collaboration Stack**
   - WebSocket technology required for live retro collaboration (Socket.io library recommended for simplified implementation with automatic reconnection)
   - Node.js backend for WebSocket support
   - React or Vue frontend (both have mature drag-and-drop libraries: React Beautiful DND or Vue.Draggable)
   - When user performs action, client sends message via WebSocket and server broadcasts update to all active clients

2. **Anonymity Implementation**
   - Critical constraint: NEVER store authorship metadata in database, not even encrypted
   - Challenge: Must prevent duplicate voting without tying votes to user IDs
   - Potential approaches from research:
     - Session-based voting tokens (one-time ring signatures allow signing once as member of group)
     - Vote receipts prevent duplicate voting without revealing identity
     - Cryptographic approaches combining secure multi-party computation
   - Risk: Systems that don't track who is voting create possibility for voting abuse
   - Recommendation: Accept some vote manipulation risk in MVP to preserve pure anonymity, monitor for abuse patterns

3. **Data Storage & Retention**
   - Notes: content only, no author field
   - Votes: aggregate count only, no voter identity
   - Actions: owner and due sprint required (this creates accountability tension with anonymity - actions are NOT anonymous)
   - GDPR compliance required: storage limitation principle, data minimization
   - Recommendation: Implement data retention policies (e.g., auto-delete retros older than 12 months unless team explicitly preserves)

4. **Performance Considerations**
   - Target: Support 10 concurrent users per retro session with <100ms latency for note submissions
   - Average 6 participants per board, plan for 10-user peak
   - WebSocket reduces latency vs. HTTP polling
   - Consider: Do we need conflict resolution for simultaneous edits? (Probably not for MVP - notes are append-only)

5. **Security & Privacy**
   - Encryption in transit (TLS/SSL) for all WebSocket connections
   - Encryption at rest for stored retro data
   - Team isolation: users can only access retros for teams they're members of
   - No cross-team data access in MVP (explicit scope constraint)
   - Privacy policy must state: 'Authorship is NEVER stored, cannot be recovered even by administrators'

**Technology Stack Recommendations:**

- Frontend: React (recommended based on finding-012 citing Retrospected's use of React Beautiful DND)
- Backend: Node.js + Express + Socket.io
- Database: PostgreSQL (structured data, good for action tracking and timeline queries)
- Deployment: Cloud-hosted (AWS/GCP) with WebSocket support, GDPR-compliant region (EU if needed)
- Development timeline: 1-3 months feasible for simple products with minimal design complexities

**Known Technical Risks:**

1. Anonymous voting without duplicate prevention is technically complex (may require cryptographic implementation beyond MVP capacity)
2. WebSocket scaling for multiple concurrent retros requires load testing
3. Real-time collaboration bugs are harder to reproduce and debug
4. Permanent anonymity creates forensic challenge if malicious content posted (cannot trace back to author)

**Integration Requirements (Future, Not MVP):**

- Jira/Linear integration for action export is expected feature in competitive landscape
- Slack notifications for action reminders
- Calendar integration for retro scheduling
- Note: Founder explicitly wants to 'start fresh' without integrations for MVP
> ⚠️ Unknown whether team has backend expertise in Node.js + WebSocket implementation
> ⚠️ Uncertain whether completely anonymous voting is technically feasible without sophisticated cryptography (may need to compromise on 'permanent anonymity' for votes vs. notes)
> ⚠️ No information on infrastructure budget or hosting costs for WebSocket-based real-time app
> ⚠️ Missing details on data backup and disaster recovery requirements
> ⚠️ Unknown whether 1-2 month timeline accounts for security review and GDPR compliance validation

## Risks and Open Questions  _(confidence 85%)_
**HIGH-PRIORITY RISKS:**

1. **Anonymity vs. Accountability Tension** (CRITICAL)
   - Risk: Permanently anonymous notes create accountability gap - how to ensure action items get owned if notes are fully anonymous?
   - Research: Finding-031 shows actions need specific owners, but anonymity prevents attribution
   - Mitigation: Separate anonymous feedback (notes) from accountable actions (with owners), accept that action creation happens in facilitated discussion after anonymous input
   - Open question: Will teams create actions from anonymous feedback, or will anonymity reduce action quality?

2. **Free Competitor Dominance** (HIGH)
   - Risk: GoRetro is completely free, Parabol free for 2 teams, Neatro free for 10 members - difficult monetization path
   - Research: Finding-002, finding-003 show established free/freemium tools with strong feature sets
   - Mitigation: Focus on differentiation (Heartbeat Timeline, permanent anonymity, action auto-carry) rather than feature parity; internal validation before monetization decisions
   - Open question: What would teams pay for that free tools don't provide?

3. **Technical Complexity of Anonymous Voting** (HIGH)
   - Risk: Preventing duplicate votes while maintaining pure anonymity requires cryptographic approaches beyond MVP scope
   - Research: Finding-014 shows one-time ring signatures and blockchain-based approaches needed for robust anonymous voting
   - Mitigation: Accept vote manipulation risk in MVP, implement session-based tokens as best-effort solution, monitor abuse
   - Open question: Is perfect vote anonymity worth the technical complexity, or acceptable to compromise?

4. **Low Action Item Completion Baseline** (MEDIUM-HIGH)
   - Risk: Auto-carrying incomplete actions may just highlight failure rather than improve completion (40-50% baseline is very low)
   - Research: Finding-007 shows even with visibility features, completion only reached 65%
   - Mitigation: Combine auto-carry with facilitator prompts for review, consider action item escalation after 2+ carries
   - Open question: What additional features beyond visibility drive action completion to 80%+?

5. **Facilitator Burden** (MEDIUM)
   - Risk: What controls do facilitators really need vs. what creates too much work?
   - Research: Finding-028 shows timer features are standard, but unclear what else is essential
   - Mitigation: Start minimal (timer + voting close + phase control), add features based on internal team feedback
   - Open question: Can we reduce facilitator burden enough that teams self-facilitate effectively?

6. **Remote Work Blind Spot** (MEDIUM)
   - Risk: Scope excludes async features, but finding-032 shows 65% of distributed teams face participation inequities due to time zones
   - Research: One-hour time difference reduces collaboration by 37% vs. co-located teams
   - Mitigation: Target fully co-located or same-timezone remote teams initially, monitor whether any internal teams face remote challenges
   - Open question: What percentage of target startup teams are fully co-located vs. distributed?

7. **Retrospective Tool Market Churn** (MEDIUM)
   - Risk: Finding-035 shows FunRetro, Fraankly, Retro Rabbit, ScatterSpoke, Scrum Toolkit all discontinued/archived
   - Research: Several retrospective tools have failed or been discontinued
   - Mitigation: Focus on retention metrics from day 1, validate sustained usage with internal teams before external launch
   - Open question: What causes retrospective tools to fail - lack of differentiation, insufficient value, or structural market issues?

**MEDIUM-PRIORITY RISKS:**

8. **Historical Data Value Uncertainty**
   - Risk: What patterns actually matter in the timeline view? Will teams reference historical data or ignore it?
   - Mitigation: Instrument analytics on Heartbeat Timeline engagement, A/B test different visualizations
   - Open question: How far back do teams need to see (3 months? 6 months? 12 months?) before data becomes noise?

9. **Competitive Differentiation Sustainability**
   - Risk: Competitors can copy features - Heartbeat Timeline and anonymous voting aren't patentable
   - Research: Finding-005 shows TeamRetro praised for feature-to-price ratio and agility in adding features
   - Mitigation: Build on speed and focus rather than feature exclusivity; target underserved startup segment
   - Open question: Can 'vital signs monitor' metaphor + startup focus sustain differentiation long-term?

10. **MVP Timeline Aggressiveness**
    - Risk: 1-2 months is aggressive for WebSocket-based real-time collaboration app with security requirements
    - Research: Finding-020 shows simple products take 1-3 months, real-time features add 2-3 weeks
    - Mitigation: Use existing libraries (Socket.io, React Beautiful DND), minimize custom development, accept technical debt
    - Open question: Is development team full-time on this or part-time alongside other responsibilities?

**LOW-PRIORITY RISKS:**

11. **Team Size Edge Cases**: Scrum Guide says 10 or fewer, but research suggests 4-5 is optimal. How does UX change for 3-person vs. 10-person teams?

12. **Facilitator Rotation**: Unknown whether teams rotate facilitator role or have dedicated facilitator - UX should support both

13. **GDPR Compliance Validation**: No legal review mentioned in scope - need to validate data retention and anonymity claims meet GDPR requirements

**OPEN QUESTIONS REQUIRING USER RESEARCH:**

1. Do teams actually want to see 6+ months of retrospective history, or is this information overload?
2. What action item metadata is truly necessary? (Owner + due sprint only, or also priority, status, blockers?)
3. How do teams currently track action items - in retro tool, in Jira, in Google Sheets, or not at all?
4. What percentage of target teams already use a dedicated retrospective tool vs. Google Docs/Miro?
5. Will 'cannot close retro without at least one action' guardrail create resentment?
6. Does permanent anonymity reduce or increase psychological safety over time?
7. What does 'team health improvement' look like in practice - how would teams describe success?
> ⚠️ No data on what causes retrospective tools to fail specifically (market, product, or business model issues)
> ⚠️ Missing user research on whether teams value historical timeline data or find it overwhelming
> ⚠️ Unknown whether startup teams are willing to pay for retrospective tools given free alternatives
> ⚠️ No competitive intelligence on whether leading tools plan to add similar 'vital signs' features

## Explicit Assumptions  _(confidence 80%)_
**User Behavior Assumptions:**

1. Startup engineering teams will adopt a new retrospective tool if it demonstrably improves psychological safety and action completion (not validated - assumes pain points are severe enough to overcome switching costs)

2. Permanently anonymous feedback will increase honesty without reducing accountability for actions (assumption based on finding-006 and finding-016 showing 74% of workers more willing to share anonymously, but not proven in agile retro context)

3. Teams will reference historical retrospective data in Heartbeat Timeline rather than focusing only on current sprint (assumption - no data on whether teams actually use historical views)

4. Seeing improvement/decay trends over time will motivate teams to maintain retrospective quality (assumption - 'vital signs monitor' metaphor not user-tested)

5. Teams will complete retros within 60-90 minute timebox with Forge Pulse's fast capture approach (assumption based on finding-018 showing standard timebox, but not validated that fast capture enables this)

**Technical Assumptions:**

6. WebSocket technology can support 10 concurrent users per retro with <100ms latency on standard cloud infrastructure (assumption based on finding-011 showing WebSockets are standard, but no load testing data)

7. Session-based voting tokens provide sufficient duplicate vote prevention without full cryptographic implementation (assumption - accepting some vote manipulation risk)

8. React/Vue drag-and-drop libraries will support theme clustering UX without custom development (assumption based on finding-012, but not prototyped)

9. 1-2 month MVP timeline is achievable with available development team resources (assumption - no information on team size, experience, or availability provided)

**Market Assumptions:**

10. Internal validation with 2-5 teams provides sufficient signal for external launch decisions (assumption - no data on how many teams needed for statistically significant validation)

11. Startup engineering teams (5-10 people) are underserved by existing retrospective tools designed for enterprise (assumption based on finding-019 showing optimal team size, but not proven that existing tools serve this segment poorly)

12. Teams will value focused simplicity over feature breadth in retrospective tools (assumption - contrary to finding-005 showing TeamRetro praised for feature richness)

13. Free/freemium competitors will not copy Forge Pulse's differentiated features (Heartbeat Timeline, auto-carry actions) before product achieves market traction (assumption - features are not protectable IP)

**Business Model Assumptions:**

14. Building as internal tool first allows proving value before monetization decisions (assumption - finding-023 shows 30% of engineering time on internal tools, but unclear if this validates external market)

15. Teams experiencing retention for 6+ months will be willing to pay for premium features or expanded usage (assumption - no pricing research conducted)

16. 12-month timeline to 'demonstrable team health improvement metrics' is sufficient to validate product-market fit (assumption - no benchmarks for retrospective tool validation timelines)

**Regulatory Assumptions:**

17. Not storing authorship metadata satisfies GDPR requirements for anonymous data (assumption - finding-013 shows GDPR requires storage limitation and data minimization, but no legal review conducted)

18. Team members consent to retrospective data collection and storage by joining team (assumption - need explicit consent mechanism and privacy policy)

**Scope Assumptions:**

19. Target startup teams conduct live retrospective meetings, not async (assumption - finding-032 shows 65% of distributed teams have time zone challenges, but assuming this doesn't apply to target segment)

20. Teams have designated facilitator rather than fully self-organized retrospectives (assumption based on founder's description of facilitator role, but may exclude self-organizing teams)

21. Two-week sprints are standard for target teams (assumption based on finding-018 showing two-week sprints most common, but not validated for specific target segment)

22. Teams don't need integration with existing tools in MVP (assumption - finding-022 shows integration is expected, founder preference to 'start fresh' may create adoption barrier)

## Explicit assumptions
- Permanently anonymous feedback increases honesty without reducing accountability (not validated in agile retrospective context)
- Teams will reference historical Heartbeat Timeline data rather than focusing only on current sprint (no usage data)
- 'Vital signs monitor' metaphor resonates with users and motivates improvement (not user-tested)
- 1-2 month MVP timeline achievable with unknown development team capacity and experience
- Internal validation with 2-5 teams sufficient for external launch decisions (no statistical validation)
- Startup teams (5-10 people) underserved by enterprise-focused retrospective tools (not proven)
- Teams will value focused simplicity over feature richness (contradicts some competitive research)
- Session-based voting tokens prevent duplicate votes adequately without cryptography (accepting manipulation risk)
- Target teams conduct live meetings not async (contradicts distributed team data)
- Not storing authorship satisfies GDPR without legal review
- Teams will pay for premium features after 6+ months retention (no pricing research)

## Contradictions flagged
- Founder wants 'focused simplicity' but finding-005 shows TeamRetro praised for feature richness at good price point - suggests market may value breadth over focus
- Scope excludes async features (live meetings only) but finding-032 shows 65% of distributed teams face participation inequities - may exclude significant portion of target market
- Anonymity is core differentiator but finding-014 shows technical complexity of preventing vote manipulation - may need to compromise on 'complete anonymity' promise
- Target is startup teams willing to pay, but finding-002 and finding-003 show free/freemium dominance (GoRetro fully free, Parabol free for 2 teams) - difficult monetization path
- MVP timeline is 1-2 months but finding-020 shows real-time features add 2-3 weeks to 1-3 month baseline - aggressive timeline may be unrealistic
- Founder prefers no integrations ('start fresh') but finding-022 shows Jira/Linear integration is expected feature - may create adoption barrier

