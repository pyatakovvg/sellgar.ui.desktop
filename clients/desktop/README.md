# Sellgar Desktop

Next.js App Router с runtime `@sellgar/app/next` и UI kit `@sellgar/kit`.
Требования: Node.js 24+ и Yarn 4.18.0.
Команды выполняются из корня desktop-репозитория.

```sh
git submodule update --init --recursive
yarn install --immutable
yarn dev:desktop_ui
```

Приложение: `http://localhost:3100`.

## Структура

- `library/sellgar.app.ui` и `library/sellgar.kit.ui` — Git submodules,
  ветка `master`; parent фиксирует конкретные commits.
- `clients/desktop/src/application` — фабрика `DesktopApplication` и
  application bindings. `withApp()` подключает её в `next.config.ts`.
- `clients/desktop/src/app` — маршруты Next; `/` и `/offers/[uuid]`
  подключают framework-модули через `withModule()`.
- `modules/catalog` и `modules/offer-details` — declarations, bindings,
  controllers/loaders и view. View читает результат через `useLoaderData()`.
- `layouts/root` — framework Layout, подключённый через `withLayout()`.
- `pages/home` — существующие presentation-компоненты витрины.
- `library/domain` — доменный пакет по структуре админки: публичный Service,
  Entity отдельных предметных срезов и внутренний Store Gateway/Mapper. Config и HttpClient подключаются
  через абстрактные порты в DomainBinding. HTTP проходит через RequestExecutor приложения. Внешние ответы валидируются;
  модели содержат отдельные учетные записи, цены и свойства.

SSR выполняет loader в request-scoped приложении, а Next-адаптер передает
plain snapshot в браузер. Сериализация и error-state принадлежат controller; доменные Service возвращают проверенные Entity и отклоняют ошибочные запросы. Гидратация использует этот результат; повторное
чтение API при начальной гидратации не требуется. Переходами владеет Next.

SSR обращается к client gateway по `CLIENT_GATEWAY_URL`, затем
`NEXT_PUBLIC_CLIENT_GATEWAY_URL`, затем `http://localhost:4030`.
Явная клиентская ревалидация использует публичный
`NEXT_PUBLIC_CLIENT_GATEWAY_URL` с тем же локальным fallback.
Все чтения используют `cache: 'no-store'` и signal текущего loader.

Тема и шрифты kit подключаются в корневом Next layout. Компоненты используют
публичные `Typography`, `Badge`, `Radio`; CSS Modules ссылаются на tokens kit.

## Проверки

```sh
yarn typecheck
yarn lint
yarn test:storefront
yarn build:desktop_ui
yarn workspace @sellgar/app typecheck:core
yarn workspace @sellgar/app typecheck:next
```

При обновлении библиотек сначала публикуется child commit, затем gitlinks
в desktop, затем pointer desktop в workspace.
