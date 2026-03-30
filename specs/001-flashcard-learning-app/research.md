# Phase 0 Research: Flashcard Learning App

## Decision 1: Weighted repetition strategy
- Decision: Use inverse-weighted random selection where lower score increases selection likelihood.
- Rationale: Matches clarified requirement "lower weight appears more often" and preserves
  variability so cards do not repeat deterministically.
- Alternatives considered:
  - Fixed queues by score bucket: predictable but less adaptive.
  - Pure random ignoring score: violates product requirement.

## Decision 2: Global uniqueness for word cards
- Decision: Enforce global uniqueness by normalized pair `(word, translation)` across the full
  dictionary; folders store references to existing cards.
- Rationale: Prevents duplicate cards and conflicting edits/deletes, simplifies profile metrics.
- Alternatives considered:
  - Per-folder uniqueness: duplicates across folders inflate totals and complicate edits.
  - Unlimited duplicates: high data inconsistency risk.

## Decision 3: Corrupted local data recovery
- Decision: On malformed persisted payloads, attempt partial recovery and reset only the corrupted
  section to defaults, with a user-facing notice.
- Rationale: Preserves as much learner progress as possible while guaranteeing app startup.
- Alternatives considered:
  - Full reset on any parse error: excessive data loss.
  - Silent ignore: hides failures and may cause inconsistent behavior.

## Decision 4: Gemini dependency handling
- Decision: Keep sentence check network-dependent with explicit error states and fallback/degraded
  behavior from existing service logic.
- Rationale: Network quality is variable; core study loop must remain fully usable offline.
- Alternatives considered:
  - Blocking main flow until network recovers: unacceptable UX regression.
  - Removing AI check: out of scope for this feature.

## Decision 5: Test focus for this feature
- Decision: Prioritize unit tests for weighted selection and storage recovery logic, plus regression
  checks for sentence-check error paths.
- Rationale: These are the highest-risk behavioral changes and directly tied to constitution gates.
- Alternatives considered:
  - UI-only snapshot expansion: insufficient to validate logic-heavy behavior.

## Implementation deviations log
- Added normalized sentence-check result contract (`ok | corrected | error`) with display message,
  instead of prior union shape with `{ok:boolean}` and `{error}` fields.
- Implemented persisted training-set selection (`general` or specific folder) in local storage.
- Added baseline focused unit tests for scoring rules, storage recovery, folder dedupe, and fallback
  chain behavior to keep CI stable without deep RN gesture integration tests.
