---
description: "Task list for flashcard learning app feature"
---

# Tasks: Flashcard Learning App

**Input**: Design documents from `/specs/001-flashcard-learning-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests for behavior changes in hooks/services/utils and key UI flows affected by score logic, storage recovery, and sentence-check error handling.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare test harness and shared constants for feature work

- [X] T001 Add feature constants scaffold for score/range and training modes in `src/config/featureFlags.ts`
- [X] T002 [P] Add baseline accessibility label map for cards/profile actions in `src/config/accessibility.ts`
- [X] T003 [P] Create Jest test file for weighted/random behavior in `__tests__/weightedRandom.test.ts`
- [X] T004 [P] Create Jest test file for storage recovery behavior in `__tests__/useWordStorage.recovery.test.tsx`
- [X] T005 [P] Create Jest test file for sentence-check failure paths in `__tests__/checkSentence.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared domain constraints and persistence safeguards before story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Add normalized uniqueness and score clamp helpers in `src/utils/wordRules.ts`
- [X] T007 [P] Extend storage key contracts for folders/set selection in `src/utils/storageKeys.ts`
- [X] T008 Implement typed folder/training-set entities in `src/types/word.ts`
- [X] T009 [P] Extend app-level types for stats/preferences/recovery notices in `src/types/app.ts`
- [X] T010 Implement section-scoped AsyncStorage recovery and defaults in `src/hooks/useWordStorage.ts`
- [X] T011 [P] Add weighted selection helper aligned to inverse score requirement in `src/utils/weightedRandom.ts`
- [X] T012 Add shared error mapping for network/key failures in `src/services/checkSentence.ts`
- [X] T013 Wire shared configuration exports in `src/types/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Изучение карточек (Priority: P1) 🎯 MVP

**Goal**: Deliver card training flow with 50/50 side start, score actions, swipe parity, and weighted repetition.

**Independent Test**: With 10+ cards, verify reveal-on-tap, button/swipe scoring parity, 0..100 clamp, and lower-score cards appearing more frequently.

### Tests for User Story 1

- [X] T014 [P] [US1] Add unit tests for score clamp and inverse-weight behavior in `__tests__/weightedRandom.test.ts`
- [X] T015 [P] [US1] Add Cards screen behavior test coverage for reveal and score actions in `__tests__/CardsScreen.scoring.test.tsx`

### Implementation for User Story 1

- [X] T016 [US1] Add 50/50 front-side selection and reveal state handling in `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T017 [P] [US1] Align swipe handlers with button score outcomes in `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T018 [P] [US1] Apply weighted next-card selection in session loop in `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T019 [US1] Add score update API with clamp enforcement in `src/hooks/useWordStorage.ts`
- [X] T020 [P] [US1] Update Cards screen styles for reveal/feedback states in `src/screens/CardsScreen/CardsScreen.styles.ts`
- [X] T021 [US1] Add accessibility labels/roles for card actions and swipe alternatives in `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T054 [US1] Make main learning card fill available vertical space between header content and bottom navigation in `src/screens/CardsScreen/CardsScreen.tsx` and `src/screens/CardsScreen/CardsScreen.styles.ts`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Управление словами и папками (Priority: P2)

**Goal**: Enable folder-based word organization, global word uniqueness, general-set toggle, and training set switching.

**Independent Test**: Create folders and words with mixed visibility; verify add/edit/delete and set switching between general and folder-specific pools.

### Tests for User Story 2

- [X] T022 [P] [US2] Add uniqueness and folder membership tests in `__tests__/useWordStorage.folders.test.tsx`
- [X] T023 [P] [US2] Add training set filter tests for general/folder pools in `__tests__/CardsScreen.setSelection.test.tsx`
- [X] T043 [P] [US2] Add persistence test for last selected training set across relaunch in `__tests__/CardsScreen.setSelection.test.tsx`

### Implementation for User Story 2

- [X] T024 [US2] Extend storage model for folders and card-folder relations in `src/hooks/useWordStorage.ts`
- [X] T025 [P] [US2] Implement global `(word, translation)` dedupe on add/edit in `src/hooks/useWordStorage.ts`
- [X] T026 [US2] Add folder and general-toggle inputs to add/edit flow in `src/components/AddWordModal/AddWordModal.tsx`
- [X] T027 [P] [US2] Add training set picker (general/folder) to cards UI in `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T044 [US2] Persist and restore active training set selection in `src/screens/CardsScreen/CardsScreen.tsx` and `src/utils/storageKeys.ts`
- [X] T028 [US2] Update profile list actions to preserve folder links on edit/delete in `src/screens/ProfileScreen/ProfileScreen.tsx`
- [X] T029 [P] [US2] Update word/folder type exports for new fields in `src/types/word.ts`
- [X] T050 [US2] Add folder creation flow with plus button near "Folders" and modal in `src/screens/ProfileScreen/ProfileScreen.tsx`, then wire new folder availability into word-add modal in `src/components/AddWordModal/AddWordModal.tsx` and `src/navigation/BottomTabs.tsx`
- [X] T051 [US2] Add profile tabs "Words" and "Folders" with tab-specific content switching in `src/screens/ProfileScreen/ProfileScreen.tsx` and `src/screens/ProfileScreen/ProfileScreen.styles.tsx`
- [X] T052 [US2] Make profile search sticky and add right-side "scroll to top" arrow action near search in `src/screens/ProfileScreen/ProfileScreen.tsx` and `src/screens/ProfileScreen/ProfileScreen.styles.tsx`
- [X] T053 [US2] Prefill add-word modal field from profile search query when no results found (word vs translation by detected input language) in `src/screens/ProfileScreen/ProfileScreen.tsx`, `src/components/AddWordModal/AddWordModal.tsx`, and `src/navigation/BottomTabs.tsx`

**Checkpoint**: User Stories 1 and 2 work independently with consistent dictionary management

---

## Phase 5: User Story 3 - Профиль и проверка предложений (Priority: P3)

**Goal**: Finalize profile metrics (including streak and weekly additions), Gemini key management, and sentence-check feedback flow.

**Independent Test**: Verify profile metrics render correctly, key can be set, and sentence-check returns ok/correction/error without blocking other flows.

### Tests for User Story 3

- [X] T030 [P] [US3] Add profile stats computation tests (streak + weekly additions) in `__tests__/useWordStorage.stats.test.tsx`
- [X] T031 [P] [US3] Add sentence-check service tests for ok/corrected/error paths in `__tests__/checkSentence.test.ts`
- [X] T045 [P] [US3] Add fallback-chain tests Gemini -> LanguageTool -> error in `__tests__/checkSentence.test.ts`

### Implementation for User Story 3

- [X] T032 [US3] Implement weekly-added metric derivation in storage hook in `src/hooks/useWordStorage.ts`
- [X] T033 [P] [US3] Update profile stats presentation and key controls in `src/screens/ProfileScreen/ProfileScreen.tsx`
- [X] T034 [US3] Connect sentence-check modal states to refined service error mapping in `src/components/SentenceCheckModal/SentenceCheckModal.tsx`
- [X] T046 [US3] Normalize sentence-check response contract (`ok|corrected|error` + message) in `src/services/checkSentence.ts`
- [X] T047 [US3] Implement deterministic fallback chain Gemini -> LanguageTool in `src/services/checkSentence.ts`
- [X] T035 [P] [US3] Strengthen Gemini key persistence/read flow in `src/hooks/useGeminiKey.ts`
- [X] T036 [US3] Add accessibility labels and loading/error announcements in sentence-check/profile controls in `src/screens/ProfileScreen/ProfileScreen.tsx`

**Checkpoint**: All user stories are independently functional and testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality gates and finalize release readiness

- [X] T037 [P] Run full lint from project root and resolve findings in `package.json` script `lint` and changed files under `src/`
- [X] T038 [P] Run full test suite from project root and fix regressions in `package.json` script `test` and files under `__tests__/`
- [X] T039 Validate quickstart scenarios end-to-end from `specs/001-flashcard-learning-app/quickstart.md`
- [X] T040 Verify theme parity and accessibility labels across updated screens in `src/screens/CardsScreen/CardsScreen.tsx` and `src/screens/ProfileScreen/ProfileScreen.tsx`
- [X] T041 Validate degraded network behavior for sentence check in `src/services/checkSentence.ts` and `src/components/SentenceCheckModal/SentenceCheckModal.tsx`
- [X] T048 Validate fallback behavior (Gemini fail, LanguageTool success/fail) in `src/services/checkSentence.ts` and `specs/001-flashcard-learning-app/quickstart.md`
- [X] T049 Validate p95 card interaction feedback target (<100ms) using manual timing protocol in `specs/001-flashcard-learning-app/quickstart.md` and `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T042 Update feature notes and decisions in `specs/001-flashcard-learning-app/research.md` if implementation deviations occur

---

## Phase 7: Follow-up Scope (Profile modal, edit flows, compact modals, transcription)

**Purpose**: Add post-MVP UX and data improvements requested after initial story completion.

### Tasks

- [X] T055 [US3] Add "Check sentence" action to existing word details modal opened from profile word tap in `src/screens/ProfileScreen/ProfileScreen.tsx` and `src/components/SentenceCheckModal/SentenceCheckModal.tsx`
- [X] T056 [P] [US2] Ensure all word edit entry points (Cards and Profile flows) include folder selector and general-list visibility toggle in `src/components/AddWordModal/AddWordModal.tsx`, `src/screens/CardsScreen/CardsScreen.tsx`, and `src/screens/ProfileScreen/ProfileScreen.tsx`
- [X] T057 [US2] Apply/verify filtering logic so words marked hidden are excluded from general training pool while still available in folder-specific pools in `src/hooks/useWordStorage.ts` and `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T058 [US2] Compact add/edit modal layout and make it keyboard-safe with scrollable content when viewport is constrained in `src/components/AddWordModal/AddWordModal.tsx` and `src/components/ModalWithKeyboard.tsx`
- [X] T059 [P] [US2] Add regression tests for edit-flow controls (folder + hide-from-general) and profile modal sentence-check entry in `__tests__/CardsScreen.setSelection.test.tsx`, `__tests__/useWordStorage.folders.test.tsx`, and `__tests__/checkSentence.test.ts`
- [X] T060 [US3] Add asynchronous transcription enrichment job triggered after successful word creation in `src/hooks/useWordStorage.ts` and `src/services/`
- [X] T061 [P] [US3] Implement external transcription API service with timeout/error mapping and response normalization in `src/services/transcriptionService.ts`
- [X] T062 [US3] Persist transcription/status fields in word model and storage hydration path in `src/types/word.ts`, `src/types/app.ts`, and `src/hooks/useWordStorage.ts`
- [X] T063 [US3] Display transcription loading/success/failure states in profile/cards word UI and provide retry action for failed fetch in `src/screens/ProfileScreen/ProfileScreen.tsx` and `src/screens/CardsScreen/CardsScreen.tsx`
- [X] T064 [P] [US3] Add unit tests for transcription async flow (success, timeout, fail, retry) in `__tests__/useWordStorage.stats.test.tsx` or a new `__tests__/useWordStorage.transcription.test.tsx`

**Checkpoint**: Follow-up UX/data scope is complete and independently verifiable.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion; proceed in priority order for MVP, parallel if team capacity allows
- **Polish (Phase 6)**: Depends on completion of selected user stories
- **Follow-up (Phase 7)**: Depends on completion of US2/US3 baseline implementation from Phases 4-5

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and defines MVP
- **US2 (P2)**: Starts after Phase 2; integrates with US1 card pool but remains independently testable
- **US3 (P3)**: Starts after Phase 2; reuses profile/storage/services and remains independently testable

### Within Each User Story

- Tests for the story are written/updated before or alongside implementation
- Hook/service logic precedes UI wiring
- UI integration precedes final validation

### Parallel Opportunities

- Setup tasks marked `[P]` can run concurrently
- Foundational tasks `T007`, `T009`, `T011`, `T012` can run in parallel after `T006`
- In US1, `T017`, `T018`, `T020` can run in parallel after `T016`
- In US2, `T025`, `T027`, `T029` can run in parallel after `T024`
- In US3, `T033`, `T035` can run in parallel after `T032`
- In Phase 7, `T056`, `T059`, and `T061` can run in parallel after agreeing on updated `Word` fields/contracts (`T062`)

---

## Parallel Example: User Story 1

```bash
# Parallelizable US1 tests
Task: "T014 [US1] weightedRandom and score clamp tests in __tests__/weightedRandom.test.ts"
Task: "T015 [US1] cards scoring behavior test in __tests__/CardsScreen.scoring.test.tsx"

# Parallelizable US1 implementation after base UI state update
Task: "T017 [US1] swipe/button scoring parity in src/screens/CardsScreen/CardsScreen.tsx"
Task: "T018 [US1] weighted next-card selection in src/screens/CardsScreen/CardsScreen.tsx"
Task: "T020 [US1] visual feedback states in src/screens/CardsScreen/CardsScreen.styles.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1)
3. Validate US1 independently via its test criteria
4. Demo/release MVP slice

### Incremental Delivery

1. Foundation (Phases 1-2)
2. US1 (card learning core)
3. US2 (word/folder management)
4. US3 (profile + sentence check robustness)
5. Polish and cross-cutting validation
6. Follow-up scope (profile modal sentence-check action, compact modal UX, transcription enrichment)

### Parallel Team Strategy

1. One developer finalizes foundational storage/type contracts
2. One developer drives Cards flow (US1), one drives folders/profile CRUD (US2), one handles sentence-check/profile metrics (US3)
3. Converge in Phase 6 for integrated validation
