# IGA-Ready — Подготовка к ИГА

## Описание

Двуязычное (русский/кыргызский) приложение для подготовки к ИГА, 9 класс, Кыргызстан.
Охватывает: Алгебру, Геометрию, Русский язык, Кыргыз тили.

## Архитектура приложения (artifacts/iga-ready)

- **Фреймворк**: React + Vite + Tailwind v4
- **Хранилище**: localStorage (`iga_ready_progress`, `iga_analytics`, `iga_admin`)
- **Математика**: KaTeX через react-katex + MathText компонент
- **Состояния**: landing | exam | results | drill_selector | mistake_review | topic_list | learn_topic | admin

## Данные (artifacts/iga-ready/src/data/)
- `questions.ts`: Алгебра 143+ вопросов (P1/P2/P3), Геометрия 136 вопросов, Русский 30 вопросов
- `kyrgyz_questions.ts`: Кыргыз тили 30 вопросов Part1 (фонетика, сөз курамы, зат атооч, этиш, сөз түркүмдөрү, синтаксис, лексика)
- `topics.ts`: Алгебра 23 темы, Геометрия 32 темы, Русский 6 тем, Кыргыз тили 8 тем (ky_phonetics, ky_word_structure, ky_noun, ky_verb, ky_adj, ky_parts_of_speech, ky_sentence, ky_lexicology)

## Ключевые функции
- **Экзамен**: Полный тест с таймером, кнопка "назад" между вопросами
- **Изучение темы**: При открытии из экзамена — состояние экзамена сохраняется, можно вернуться
- **Учебник**: KaTeX-формулы, примеры, типичные ошибки
- **Прогресс**: серия дней, статистика по темам, ошибки
- **Админ-панель**: 7 кликов по логотипу → пароль `iga2025` → аналитика сессий
- **Темы**: Светлая/тёмная через CSS переменные

## Workspace

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
