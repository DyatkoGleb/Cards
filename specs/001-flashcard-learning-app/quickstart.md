# Quickstart: Flashcard Learning App Feature Validation

## Prerequisites
- Node.js >= 22.11.0
- iOS or Android simulator/device configured for React Native CLI
- Dependencies installed (`npm install`)

## Run the app
1. Start Metro:
   - `npm run start`
2. In another terminal, launch platform:
   - `npm run ios`
   - or `npm run android`

## Validate core flows
1. Add 10+ cards with mixed folder assignment and general-set toggle.
2. On Cards screen:
   - Verify card starts with word/translation at ~50/50 distribution.
   - Tap card to reveal opposite side.
   - Use button and swipe actions; confirm score updates and clamps at 0..100.
   - Confirm lower-score cards appear more frequently over a short session.
3. Switch active training set:
   - General set.
   - Specific folder set.
   - Confirm empty-state behavior when selected set has no cards.
4. Restart app and verify previously selected training set is restored.

## Validate profile flows
1. Confirm profile shows:
   - total words
   - daily streak
   - words added this week
   - folders list
   - full words list
2. Edit a card from profile and from card context; verify updates are consistent.
3. Delete a card from profile and verify it is removed from all training sets.

## Validate sentence check
1. Set Gemini API key in profile header.
2. Open sentence-check modal from card.
3. Submit sentence and verify response is either `ok`, corrected text, or clear error message.
4. Disable network and verify non-blocking error behavior.
5. Simulate Gemini failure and verify automatic fallback to LanguageTool before showing final error.

## Validate performance target
1. On a test device, perform 50 interactions (tap reveal + swipe/button scoring).
2. Measure visual feedback latency per interaction using timestamped screen recording.
3. Confirm at least 95% of interactions show visible UI response in <100ms.

## Quality gates
- Run lint: `npm run lint`
- Run tests: `npm test`
- Ensure tests cover:
  - weighted selection behavior
  - score clamping rules
  - malformed storage partial recovery
  - sentence-check error handling path
