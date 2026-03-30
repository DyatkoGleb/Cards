# Implementation Plan: Flashcard Learning App

**Branch**: `001-flashcard-learning-app` | **Date**: 2026-03-30 | **Spec**: `/specs/001-flashcard-learning-app/spec.md`
**Input**: Feature specification from `/specs/001-flashcard-learning-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a mobile flashcard learning experience with weighted repetition, folder-based study sets,
profile metrics, and sentence validation via Gemini while preserving offline-first behavior for
core learning flows. The implementation extends existing React Native screens/hooks/services,
adds stricter data integrity rules (global word uniqueness, partial recovery of corrupted storage),
and formalizes UX/error handling for network-dependent checks.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, React Native 0.84  
**Primary Dependencies**: React Navigation, AsyncStorage, react-native-svg, Gemini HTTP API,
LanguageTool HTTP API  
**Storage**: Local device storage (AsyncStorage) for words/folders/stats/theme/key  
**Testing**: Jest + react-test-renderer, ESLint  
**Target Platform**: iOS and Android mobile clients (RN CLI workflow)  
**Project Type**: Mobile app (single RN app, no new backend)  
**Performance Goals**: Card interactions respond in <100ms on average; sentence check result/error
visible in <=10s for 95% of requests  
**Constraints**: Offline-capable core study flow; network needed only for sentence check; weighted
card selection based on word score; score bounded 0..100; persist last selected training set;
preserve existing two-screen IA  
**Scale/Scope**: Single local user per device, hundreds to low-thousands of cards, two primary
screens plus existing modals/components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Mobile UX Gate**: Confirms touch flow, theme parity, and accessibility labels/roles for
  new interactive elements.
- **Modularity Gate**: Confirms screen/hook/service/type boundaries and explicit TypeScript
  typing for new logic.
- **Local Resilience Gate**: Confirms safe persistence handling, including malformed local data
  fallback behavior.
- **Quality Gate**: Lists lint/test commands and required unit-test coverage for changed
  hooks/services/utils.
- **Integration Reliability Gate**: Defines fallback/degraded behavior and user-facing error
  messages for API/network dependencies.

Gate assessment (pre-design):
- Mobile UX Gate: PASS (plan includes touch controls, theme parity checks, accessibility updates).
- Modularity Gate: PASS (changes localized to screens/hooks/services/utils with typed entities).
- Local Resilience Gate: PASS (partial recovery and section-scoped reset explicitly planned).
- Quality Gate: PASS with action required (add/expand tests for weighted selection and storage recovery).
- Integration Reliability Gate: PASS (Gemini failure modes and fallback messaging specified).

Gate assessment (post-design):
- Mobile UX Gate: PASS (quickstart and contracts define touch, theme, and accessibility validations).
- Modularity Gate: PASS (data model and contracts map to existing screen/hook/service boundaries).
- Local Resilience Gate: PASS (research + contract define section-scoped recovery behavior).
- Quality Gate: PASS (quickstart includes lint/test and target coverage areas).
- Integration Reliability Gate: PASS (contracts include non-blocking error/degraded behavior).

## Project Structure

### Documentation (this feature)

```text
specs/001-flashcard-learning-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
├── config/
├── hooks/
├── navigation/
├── screens/
├── services/
├── theme/
├── types/
└── utils/

__tests__/
└── App.test.tsx

ios/
android/
```

**Structure Decision**: Keep the existing single React Native app structure and implement feature
changes in `src/screens/*`, `src/hooks/*`, `src/services/*`, `src/utils/*`, and `src/types/*`.
No additional backend or multi-project split is introduced.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
