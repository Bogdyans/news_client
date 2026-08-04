# News Editor

Редактор новостных статей на React. Работает поверх [news-server](../server) — REST API с авторизацией, CRUD новостей и загрузкой файлов.

Прод: **https://news-client-phi.vercel.app**

## Что реализовано из задания

| Требование | Статус | Как реализовано                                                                                           |
|---|---|-----------------------------------------------------------------------------------------------------------|
| Добавление картинок | ✅ | Блок «Картинка» — загрузка через `/api/news/:id/attachments`, превью                                      |
| Добавление текста с форматированием (выделение, заголовки) | ✅ | Один текстовый блок = markdown; тулбар вставляет `**bold**`, `*italic*`, `#`/`##`/`###` в позицию курсора |
| Добавление цитат | ✅ | Кнопка «Цитата» в тулбаре текстового блока — вставляет `> `                                               |
| Добавление кусков кода (markdown) | ✅ | Кнопка «Код» — оборачивает выделение в ```` ``` ````                                                      |
| Добавление файлов (pdf, doc и т.п.) | ✅ | Блок «Файл» — тот же upload-эндпоинт, `accept=".pdf,.doc,.docx"`                                          |
| React | ✅ | React 19                                                                                                  |
| Функциональные компоненты, не классы | ✅ | Классовых компонентов нет вообще                                                                          |
| Хуки | ✅ | `useState`, `useEffect`, `useRef`, `useContext`, плюс свой `useAuth()`                                    |
| GitHub | ✅ | этот репозиторий                                                                                          |
| Предпросмотр статьи | ✅ | Переключатель «Предпросмотр» в редакторе — тот же рендер, что и на опубликованной странице                |
| Firebase как backend | ❌ | back задеплоен на render                                                                                        |
| Firebase/now.sh как хостинг | ✅ (Vercel) | `now.sh` — устаревшее имя Vercel; задеплоено на Vercel                                                    |
| SCSS | ✅ | CSS-модули (`*.module.scss`) на каждый компонент                                                          |

## Стек

React 19 · TypeScript (strict) · SCSS-модули · Vite

## Запуск локально

Нужен запущенный [backend](../server) (локально на `:5000` или прод-адрес).

```bash
npm install
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:5000
npm run dev              # http://localhost:5173
```

```bash
npm run build             # tsc -b && vite build → dist/
```

## Переменные окружения

- `VITE_API_BASE_URL` — адрес backend API.

## Структура

```
src/
  api/          обёртка над fetch, типизированные вызовы auth/news
  context/      AuthContext — токен, пользователь, вход/выход
  components/   Layout, ProtectedRoute, StatusBadge
  editor/
    blocks/     модель блоков, сериализация/парсинг markdown,
                редакторы блоков (текст/картинка/файл), read-only рендер
    ArticleBlocksEditor.tsx   тулбар добавления + список блоков
  pages/        Login, Register, ArticlesList, ArticleEditor, ArticleView
  router.tsx    дерево маршрутов (createBrowserRouter + вложенные роуты)
```
