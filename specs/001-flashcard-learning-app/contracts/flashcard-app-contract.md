# Interface Contract: Flashcard App Flows

## Scope
This document defines functional UI/service contracts for the mobile app feature set.
The project does not expose a public backend API in this phase; contracts are interaction-level.

## Contract 1: Score update interaction
- Trigger: User marks card as correct/incorrect using button or swipe.
- Input:
  - `cardId` (existing card)
  - `result` in `{correct, incorrect}`
- Output:
  - Updated card score constrained to `0..100`
  - Persisted state update visible on next card render
- Errors:
  - If persistence fails, show non-blocking error notice; app remains usable.

## Contract 2: Training set selection
- Trigger: User selects `general` set or a concrete folder.
- Input:
  - `mode` in `{general, folder}`
  - `folderId` when mode is `folder`
- Output:
  - Active card pool filtered by mode
  - Empty-state message when filtered pool is empty
  - Last selected mode/folder restored on next app launch

## Contract 3: Word create/update/delete
- Create input:
  - `word`, `translation`, `folderIds[]`, `showInGeneralSet`
- Update input:
  - `cardId`, editable fields above
- Delete input:
  - `cardId`
- Rules:
  - `(word, translation)` pair is globally unique.
  - Duplicate add reuses existing card and updates folder membership/settings.
- Output:
  - Profile lists and card pools reflect changes without restart.

## Contract 4: Sentence check flow
- Trigger: User submits sentence in card modal.
- Input:
  - `word`, `sentence`, optional configured API key
- Output:
  - One of: `status=ok|corrected|error` with displayable `message`
- Reliability:
  - Primary check uses Gemini.
  - On quota/billing/service failure, fallback check uses LanguageTool.
  - Only if both providers fail, return recoverable `error` and do not block learning flows.

## Contract 5: Local data recovery
- Trigger: App startup or storage read operation.
- Input:
  - Persisted sections (`words`, `folders`, `stats`, `preferences`)
- Output:
  - Valid sections are preserved.
  - Corrupted section resets to defaults with user notification.
