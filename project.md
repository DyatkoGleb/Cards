# Анализ фронтенд кодовой базы: eng_cards_2

## 📁 Структура проекта

### Дерево директорий (до 3-го уровня)

```text
.
├── src
│   ├── components
│   │   ├── AddWordModal
│   │   ├── Icons
│   │   └── SentenceCheckModal
│   ├── config
│   ├── hooks
│   ├── navigation
│   ├── screens
│   │   ├── CardsScreen
│   │   └── ProfileScreen
│   ├── services
│   ├── theme
│   ├── types
│   └── utils
├── ios
│   ├── eng_cards_2
│   ├── eng_cards_2.xcodeproj
│   └── eng_cards_2.xcworkspace
├── android
│   ├── app
│   │   └── src
│   └── gradle
│       └── wrapper
├── __tests__
├── App.tsx
├── index.js
└── package.json
```

### Назначение директорий

- `src/components` — переиспользуемые UI-компоненты и модальные блоки (ввод с подсказками, кнопки, иконки, модалки). Здесь собран повторяемый визуальный и интерактивный слой.
- `src/screens` — экранные контейнеры уровня фич (`CardsScreen`, `ProfileScreen`), которые оркестрируют бизнес-логику, состояние и сборку интерфейса.
- `src/hooks` — кастомные хуки для доменной логики и персистентности (`useWordStorage`, `useGeminiKey`, `useThemePersistence`, `useSuggestions`).
- `src/services` — интеграция с внешними API (проверка предложений через Gemini/LanguageTool), инкапсуляция сетевой логики.
- `src/navigation` и `src/AppNavigator.tsx` — навигационный каркас на `@react-navigation` с нижними табами.
- `src/theme` — токены и общие стили (палитры, layout-константы, стили иконок/модалок).
- `src/types` — типы доменных сущностей и контрактов пропсов.
- `src/utils` — утилиты (даты, weighted random, ключи хранения).
- `ios`, `android` — нативные проекты React Native.
- `__tests__` — базовые тесты (пока минимальный smoke-test рендера приложения).

### Принципы организации кода

- Основной подход: **feature + layer hybrid**.
  - Feature-уровень: экраны и их локальные стили (`screens/*`).
  - Layer-уровень: общие кросс-фичевые слои (`components`, `hooks`, `services`, `theme`, `types`, `utils`).
- Архитектура ближе к **простому модульному React Native SPA**, без строгой DDD/clean architecture, но с разумным разделением UI/данных/интеграций.

## 🛠 Технологический стек

| Категория | Технология | Версия | Роль в проекте |
|---|---|---:|---|
| UI runtime | React | 19.2.3 | Компонентная модель |
| Mobile framework | React Native | 0.84.0 | Кросс-платформенный мобильный UI |
| Язык | TypeScript | ^5.8.3 | Типизация компонентов и доменных моделей |
| Навигация | `@react-navigation/native`, `@react-navigation/bottom-tabs` | ^7.1.31 / ^7.15.2 | Контейнер навигации и tab-based UX |
| Персистентность | `@react-native-async-storage/async-storage` | ^3.0.1 | Локальное хранение слов, статистики, темы, API-ключа |
| Сборка JS | Metro | RN 0.84.0 (`@react-native/metro-config`) | Бандлинг для RN |
| Трансформация | Babel (`@react-native/babel-preset`) | 0.84.0 | Транспиляция TS/JS |
| Линтинг | ESLint (`@react-native/eslint-config`) | eslint ^8.19.0 | Код-стайл и базовые проверки |
| Форматирование | Prettier | 2.8.8 | Единообразный формат |
| Тесты | Jest + react-test-renderer | ^29.6.3 / 19.2.3 | Smoke unit-тест рендера |
| SVG | `react-native-svg` | ^15.15.3 | Рендер векторных иконок |
| Safe areas | `react-native-safe-area-context` | ^5.7.0 | Корректная вёрстка на устройствах с вырезами |

### Сборка и развертывание

- Используется **классический RN CLI workflow** (`react-native run-ios`, `react-native run-android`, `react-native start`).
- Отдельного web-бандлера (Vite/Webpack/Next.js) нет, что ожидаемо для mobile-only React Native проекта.
- CI/CD конфигурации (`.github/workflows`, fastlane) не обнаружены.

### CSS/стилизация

- В проекте нет CSS/Sass/Tailwind (это RN): используется **`StyleSheet.create` + inline style objects**.
- Темизация реализована через объект `palette` и проброс в компоненты.

## 🏗 Архитектура

### Компонентная архитектура

- Корневой `App.tsx` хранит глобальное состояние (слова, статистика, тема) и прокидывает его вниз в навигацию.
- `BottomTabs` собирает экраны и модалку добавления слова, выступает как composition root для пользовательского потока.
- Экраны содержат orchestration-логику, а мелкие UI-блоки вынесены в переиспользуемые компоненты.

Пример композиции корня:

```tsx
const { words, stats, addWord, deleteWord, editWord, updateStreak } = useWordStorage();
const [isDark, setIsDark] = useState(true);
const palette = useMemo(() => (isDark ? darkPalette : lightPalette), [isDark]);

<AppNavigator
  words={words}
  stats={stats}
  addWord={addWord}
  deleteWord={deleteWord}
  editWord={editWord}
  updateStreak={updateStreak}
  palette={palette}
  isDark={isDark}
  toggleTheme={() => setIsDark(v => !v)}
/>
```

### Паттерны разделения логики

- **Custom hooks** — основной паттерн:
  - `useWordStorage` (домен + персистентность),
  - `useGeminiKey` (секрет пользователя + синхронизация runtime-кеша),
  - `useThemePersistence` (восстановление темы),
  - `useSuggestions` (UI-подсказки).
- HOC/render-props не используются; ставка на функции и композицию.

Пример хука подсказок:

```tsx
export function useSuggestions(source: string[], value: string, limit = 5) {
  return useMemo(() => {
    if (!value.trim()) return [];
    const lower = value.toLowerCase();
    return source.filter(v => v.toLowerCase().includes(lower)).slice(0, limit);
  }, [source, value, limit]);
}
```

### Управление состоянием

- Внешнего state manager (Redux/Zustand/MobX) нет.
- Состояние строится на `useState/useEffect/useCallback/useMemo` + локальная персистентность в AsyncStorage.
- Подход хорош для текущего масштаба, но при росте фич потребуется централизованный store или контекстные модули.

Пример persistence-паттерна:

```tsx
const persistWords = async (next: WordPair[]) => {
  setWords(next);
  await AsyncStorage.setItem(WORDS_KEY, JSON.stringify(next));
};

const addWord = useCallback(async (word: string, translation: string) => {
  const updated = [...words, newWord];
  await persistWords(updated);
  await persistStats({ ...stats, totalWords: updated.length });
}, [words, stats]);
```

### API-слой и работа с данными

- `services/checkSentence.ts` реализует **fallback-стратегию**:
  1) Gemini (если пользователь ввёл ключ),
  2) fallback на LanguageTool при quota/billing-ошибках.
- Возвращаемый результат типизирован дискриминирующим union-типом (`ok true/false` или `error`).

Пример fallback-логики:

```tsx
if (getGeminiApiKey()) {
  const geminiResult = await checkWithGemini(word, text);
  if ('error' in geminiResult && geminiResult.error.includes('quota')) {
    return checkWithLanguageTool(text);
  }
  return geminiResult;
}
return checkWithLanguageTool(text);
```

### Роутинг и навигация

- `NavigationContainer` + `createBottomTabNavigator`.
- Особенность: центральный таб `Add` реализован как кастомная кнопка, а не обычный экран, и управляет отдельной модалкой.

### Ошибки и loading-состояния

- Наиболее выражены в проверке предложений: `loading`, disable submit, `ActivityIndicator`.
- Ошибки API преобразуются в user-friendly сообщения (включая “Нет сети”, невалидный Gemini-ключ).
- Глобального error boundary нет.

## 🎨 UI/UX и стилизация

### Подходы к стилизации

- Комбинируются:
  - `StyleSheet.create` в `.styles.ts(x)` файлах,
  - динамические inline-стили (цвета из палитры, pressed-состояния, interpolations).
- Используется единый набор токенов (`palette`, `layout`), что создаёт основу мини design-system.

### UI-kit / дизайн-система

- Формального отдельного UI-kit нет, но есть повторно используемые примитивы:
  - `ModalWithKeyboard`,
  - `InputWithSuggestions`,
  - `ThemeToggle`,
  - общие стили `modalStyles`, `iconButtonStyles`,
  - набор SVG-иконок.

### Адаптивность

- Для RN адаптивность реализована через flex-layout, safe-area и динамические размеры текста.
- В `CardsScreen` есть отдельная логика для размера шрифта и фраз:

```tsx
function getWordFontSize(text: string): number {
  if (text.length <= 12) return 42;
  if (text.length <= 18) return 34;
  if (text.length <= 24) return 28;
  return 18;
}
```

### Темизация

- Реализованы светлая/тёмная палитры (`lightPalette`, `darkPalette`) и переключатель темы.
- Тема персистится в AsyncStorage и восстанавливается при старте через `useThemePersistence`.
- Тема прокидывается пропсом `palette` по дереву компонентов.

### Доступность (a11y)

- Специальные атрибуты `accessibilityLabel/accessibilityRole` не обнаружены.
- Есть базовая UX-доступность (крупные touch-target, контраст в рамках палитры), но a11y-практики требуют улучшения.

## ✅ Качество кода

### Линтеры и форматирование

- ESLint: минимальная конфигурация `extends: '@react-native'`.
- Prettier: `singleQuote`, `trailingComma: all`, `arrowParens: avoid`.
- Stylelint не используется (и не обязателен для RN).

### Нейминг и организация

- Именование в целом консистентное: `PascalCase` для компонентов, `camelCase` для функций/переменных.
- Файловая структура понятная и предсказуемая.
- Комментарии есть, в том числе русскоязычные пояснения для доменной логики.

### TypeScript типизация

- База хорошая: типы домена (`WordPair`, `Stats`, `Palette`) и пропсы экранов/компонентов описаны.
- Есть места с неидеальной строгостью:
  - `Tab = createBottomTabNavigator()` без явных route-параметров;
  - часть async-процессов не имеет централизованного typed-error слоя.

### Тесты

- Присутствует только базовый тест рендера `App`.
- Unit-тесты для `utils/services/hooks` отсутствуют.
- Integration/e2e не найдены.

### Документация в коде

- JSDoc/комментарии используются для ключевых частей (типы, алгоритм weighted random, тема).
- README краткий и содержит только запуск.

### Сильные стороны качества

- Простая и читаемая архитектура.
- Наличие typed-domain моделей и выделенных хуков.
- Осмысленная fallback-логика внешнего API.

### Области для улучшения

- Расширить тестовое покрытие (минимум: `useWordStorage`, `checkSentence`, `pickWeightedIndex`).
- Добавить a11y-атрибуты в интерактивные элементы.
- Добавить CI-пайплайн с lint + test.
- Защитить обработку `JSON.parse` через try/catch в `useWordStorage` (сейчас потенциальный crash на битых данных).

## 🔧 Ключевые компоненты

### 1) `useWordStorage` (`src/hooks/useWordStorage.ts`)

- **Роль:** центральный слой данных приложения (слова, статистика, streak, CRUD, персистентность).
- **API:** `words`, `stats`, `loading`, `addWord`, `deleteWord`, `editWord`, `updateStreak`.
- **Интеграции:** `AsyncStorage`, date-utils.

Пример:

```tsx
const updateStreak = async () => {
  const today = getTodayString();
  if (stats.lastVisitDate === today) return;

  let nextStreak = 1;
  if (stats.lastVisitDate && isYesterday(stats.lastVisitDate)) {
    nextStreak = stats.streak + 1;
  }

  const nextStats = { ...stats, streak: nextStreak, lastVisitDate: today };
  setStats(nextStats);
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
};
```

### 2) `CardsScreen` (`src/screens/CardsScreen/CardsScreen.tsx`)

- **Роль:** главный учебный экран карточек (flip, swipe, scoring, редактирование, sentence check).
- **Основные пропсы:** `words`, `updateStreak`, `palette`, `isDark`, `toggleTheme`, `editWord`.
- **Интеграции:** `PanResponder`, `Animated`, `useSuggestions`, `SentenceCheckModal`, weighted-random.

Пример:

```tsx
const panResponder = useMemo(() =>
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
    onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      if (g.dx > 80) updateScore(1);
      else if (g.dx < -80) updateScore(-3);
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  }), [currentIndex, words]
);
```

### 3) `ProfileScreen` (`src/screens/ProfileScreen/ProfileScreen.tsx`)

- **Роль:** профиль пользователя, статистика, список слов, редактирование/удаление, управление Gemini API key.
- **Основные пропсы:** `words`, `stats`, `deleteWord`, `editWord`, `palette`.
- **Интеграции:** `useGeminiKey`, `InputWithSuggestions`, `Alert`, `ModalWithKeyboard`.

Пример:

```tsx
const handleSave = async () => {
  if (!editing) return;
  if (!word.trim()) return setError('Введите слово');

  const exists = words.some(
    w => w.id !== editing.id && w.word.toLowerCase() === word.trim().toLowerCase()
  );
  if (exists) return setError('Это слово уже есть');

  await editWord(editing.id, word.trim(), translation.trim());
  setModalVisible(false);
  setEditing(null);
};
```

### 4) `checkSentence` (`src/services/checkSentence.ts`)

- **Роль:** изолированный сервис проверки английского предложения.
- **API:** `checkSentence(word, sentence): Promise<CheckResult>`.
- **Интеграции:** Gemini API, LanguageTool API, runtime Gemini key cache.

Пример:

```tsx
if (!res.ok) {
  const err = await res.text();
  if (res.status === 403 || res.status === 400) {
    return { error: 'Неверный или неактивный API ключ Gemini' };
  }
  return { error: err || `Ошибка ${res.status}` };
}
```

### 5) `AddWordModal` (`src/components/AddWordModal/AddWordModal.tsx`)

- **Роль:** добавление пары слово-перевод с авто-дополнением и дедупликацией по слову.
- **Основные пропсы:** `words`, `visible`, `onClose`, `palette`, `addWord`, `editWord`.
- **Интеграции:** `useSuggestions`, `InputWithSuggestions`, `ModalWithKeyboard`.

Пример:

```tsx
if (existingWord) {
  await editWord(existingWord.id, word, translation, existingWord.score ?? 0);
  closeModal();
  return;
}

await addWord(word, translation);
closeModal();
```

## 📋 Выводы и рекомендации

### Итоговая оценка

- Проект выглядит как **middle-friendly**:
  - для junior понятен по структуре и размеру;
  - для middle интересен интеграцией API, тематизацией, gesture-UX и персистентностью.

### Сильные стороны

- Чистая модульная структура и хорошее разделение ответственности.
- Логичная типизация доменных сущностей.
- Практичная UX-логика карточек (weighted random + swipe scoring).
- Интересное нестандартное решение: **двухступенчатая проверка предложения** (Gemini с fallback на LanguageTool).
- Базовая темизация реализована без усложнения архитектуры.

### Риски/техдолг

- Низкое тестовое покрытие (фактически smoke-only).
- Нет CI/CD и pre-commit хуков.
- Нет выраженного a11y слоя.
- Потенциальные edge-cases при чтении повреждённых JSON из AsyncStorage.
- Проп-дриллинг (`palette`, callbacks) может расти с масштабом.

### Приоритетные улучшения

1. Добавить unit-тесты для `useWordStorage`, `checkSentence`, `pickWeightedIndex`.
2. Ввести базовый CI (lint + test) и coverage-report.
3. Добавить `accessibilityLabel/Role` для кнопок, модалок и критических action-элементов.
4. Усилить отказоустойчивость при чтении из AsyncStorage (безопасный parse, fallback defaults).
5. Рассмотреть `Context`/легковесный store для темы и части глобальных данных при дальнейшем росте функциональности.

### Что недоступно/не найдено

- Конфигурации CI/CD и pre-commit hooks не обнаружены.
- E2E/integration-тесты не обнаружены.
- Отдельной продуктовой документации по архитектуре в репозитории нет (кроме краткого README).

