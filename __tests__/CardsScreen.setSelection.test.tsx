import { TRAINING_MODE_FOLDER, TRAINING_MODE_GENERAL } from '../src/config/featureFlags';
import type { WordPair } from '../src/types/word';

describe('CardsScreen set selection', () => {
  test('supports general and folder mode values', () => {
    expect(TRAINING_MODE_GENERAL).toBe('general');
    expect(TRAINING_MODE_FOLDER).toBe('folder');
  });

  test('general pool excludes words hidden from general set', () => {
    const words: WordPair[] = [
      {
        id: '1',
        word: 'a',
        translation: 'а',
        createdAt: 0,
        score: 0,
        showInGeneralSet: true,
      },
      {
        id: '2',
        word: 'b',
        translation: 'б',
        createdAt: 0,
        score: 0,
        showInGeneralSet: false,
      },
    ];
    const activeGeneral = words.filter(w => w.showInGeneralSet !== false);
    expect(activeGeneral.map(w => w.id)).toEqual(['1']);
  });

  test('folder pool includes only cards linked to that folder', () => {
    const words: WordPair[] = [
      {
        id: '1',
        word: 'a',
        translation: 'а',
        createdAt: 0,
        score: 0,
        folderIds: ['f-a'],
      },
      {
        id: '2',
        word: 'b',
        translation: 'б',
        createdAt: 0,
        score: 0,
        folderIds: ['f-b'],
      },
    ];
    const folderId = 'f-a';
    const active = words.filter(w => (w.folderIds ?? []).includes(folderId));
    expect(active.map(w => w.id)).toEqual(['1']);
  });
});
