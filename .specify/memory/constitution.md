<!--
Sync Impact Report
- Version change: 0.0.0 -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Mobile-First Learning Experience
  - Template Principle 2 -> II. Type-Safe Modular Boundaries
  - Template Principle 3 -> III. Resilient Local-First Data
  - Template Principle 4 -> IV. Quality Gates for Every Change
  - Template Principle 5 -> V. Reliable AI/Network Integrations
- Added sections:
  - Product & Technical Constraints
  - Delivery Workflow & Definition of Done
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ⚠ pending: .specify/templates/commands/*.md (directory not present)
- Deferred TODOs:
  - None
-->
# eng_cards_2 Constitution

## Core Principles

### I. Mobile-First Learning Experience
All user-facing changes MUST preserve a fast, touch-friendly learning flow on iOS and
Android, including theme parity (light/dark) and accessible interaction targets. Critical
actions (add/edit/delete/check sentence, review card) MUST expose accessibility labels/roles
and clear user feedback for loading and errors. Rationale: this product is a daily learning
tool; UX friction or inaccessible controls directly reduces retention.

### II. Type-Safe Modular Boundaries
Application logic MUST remain split by responsibility: screens orchestrate, hooks manage
state/lifecycle, services handle external integrations, and shared types/utilities stay in
dedicated modules. New behavior MUST be typed with explicit TypeScript interfaces/types and
MUST avoid circular or implicit cross-layer coupling. Rationale: modular, typed boundaries
keep feature growth safe and maintainable in a React Native codebase.

### III. Resilient Local-First Data
Core user data (words, stats, theme, local settings) MUST continue to function offline and
MUST persist safely via AsyncStorage (or an approved successor). Reads from persisted storage
MUST fail safely with defaults on malformed payloads; no startup/runtime crash from corrupted
local data is acceptable. Rationale: learning continuity depends on local reliability.

### IV. Quality Gates for Every Change
Every feature or bug-fix PR MUST pass linting and automated tests relevant to changed logic.
When behavior changes in hooks/services/utils, unit tests for that behavior MUST be added or
updated in the same change set. Manual verification steps for user journeys MUST be documented
in spec/plan artifacts before implementation starts. Rationale: current test surface is small;
strict gates prevent regressions.

### V. Reliable AI/Network Integrations
External API features MUST provide deterministic fallback or explicit degraded behavior. For
sentence checking, Gemini integration MUST validate key/quota failures and fall back to
LanguageTool (or return a clear recoverable error) without blocking core app usage. Network
errors MUST be translated into user-understandable messages. Rationale: third-party APIs are
variable; learning workflows must remain robust.

## Product & Technical Constraints

- Runtime stack MUST remain React Native + TypeScript unless an amendment approves migration.
- Primary targets are iOS and Android mobile clients; web support is out of scope by default.
- Secrets such as user API keys MUST never be committed and MUST remain in local secure app
  storage patterns.
- Feature specs MUST define edge-case behavior for offline mode, malformed local data, and
  third-party API outages.

## Delivery Workflow & Definition of Done

1. Write/update spec with prioritized user stories, acceptance scenarios, and edge cases.
2. Complete plan with Constitution Check gates before implementation.
3. Implement by independent story slices, preserving typed module boundaries.
4. Run and pass lint + tests; add/adjust tests for changed hook/service/util behavior.
5. Validate mobile UX (theme parity + accessibility labels for new interactive controls).
6. Record fallback/degraded-path verification for network-dependent behavior.

## Governance

This constitution is the highest-priority engineering policy for this repository. In case of
conflict, this document supersedes local conventions and template defaults.

Amendment process:
1. Propose changes in a pull request that includes rationale, impacted principles, and any
   required template updates.
2. Obtain approval from maintainers responsible for mobile architecture and release quality.
3. Include a migration note when an amendment changes existing workflow expectations.

Versioning policy (semantic versioning):
- MAJOR: Principle removals/redefinitions or governance changes that break prior process.
- MINOR: New principle/section or materially expanded mandatory guidance.
- PATCH: Clarifications, wording improvements, typo or formatting-only updates.

Compliance review expectations:
- Every implementation plan MUST include a Constitution Check against all five principles.
- Every PR review MUST verify compliance or explicitly document justified exceptions.
- Periodic audits MAY sample recent specs/plans/tasks for constitutional conformance.

**Version**: 1.0.0 | **Ratified**: 2026-03-30 | **Last Amended**: 2026-03-30
