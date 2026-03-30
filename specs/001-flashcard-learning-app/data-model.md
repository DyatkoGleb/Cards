# Data Model: Flashcard Learning App

## WordCard
- Description: Canonical learning item containing a word and translation pair.
- Fields:
  - `id`: string, unique identifier.
  - `word`: string, required, trimmed, normalized for uniqueness checks.
  - `translation`: string, required, trimmed, normalized for uniqueness checks.
  - `score`: number, integer in range 0..100.
  - `createdAt`: string (ISO date-time).
  - `showInGeneralSet`: boolean.
  - `folderIds`: string[] (references `Folder.id`).
- Validation rules:
  - `(word, translation)` pair MUST be globally unique after normalization.
  - `score` MUST stay within 0..100.
- State transitions:
  - Correct answer: `score = min(100, score + 1)`.
  - Incorrect answer: `score = max(0, score - 3)`.

## Folder
- Description: User-defined collection used to scope study sessions.
- Fields:
  - `id`: string, unique identifier.
  - `name`: string, required, unique per user after trim.
  - `createdAt`: string (ISO date-time).
- Relationships:
  - One folder references many `WordCard`.
  - One `WordCard` may belong to many folders.

## TrainingSet
- Description: Active set of cards used on Cards screen.
- Fields:
  - `mode`: enum `general | folder`.
  - `folderId`: string | null.
  - `cardIds`: string[] resolved from mode/filter rules.
- Rules:
  - `general` includes cards with `showInGeneralSet = true`.
  - `folder` includes cards linked to selected folder.
  - Card ordering is weighted-random by inverse score.

## UserStats
- Description: Profile metrics shown to the learner.
- Fields:
  - `totalWords`: number.
  - `streak`: number.
  - `lastVisitDate`: string (`YYYY-MM-DD`) | null.
  - `wordsAddedThisWeek`: number (derived metric).
- Rules:
  - Streak increments once per day on first app open.
  - Streak resets when a calendar day is skipped.

## SentenceCheckRequest
- Description: Input payload for sentence validation action from a card.
- Fields:
  - `word`: string, current studied word.
  - `sentence`: string, required, non-empty after trim.

## SentenceCheckResult
- Description: User-facing result of sentence validation.
- Fields:
  - `status`: enum `ok | corrected | error`.
  - `message`: string (either "ok", corrected sentence, or error text).

## AppPreferences
- Description: Local user preferences and API configuration.
- Fields:
  - `theme`: enum `light | dark`.
  - `geminiApiKey`: string | null.
- Rules:
  - Preference load failures recover by section-scoped default values.
