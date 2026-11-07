# Sellgar Desktop Storefront

- Next.js App Router, React. Запуск из корня: `yarn dev:desktop_ui`, порт 3100.
- HTTP-контракт витрины принадлежит client gateway (4030): `/v1/products`, `/v1/offers/:uuid`.
- Runtime — nested submodule `library/sellgar.app.ui`, UI kit — `library/sellgar.kit.ui`.
- `clients/desktop/src/application` владеет bootstrap и URL/config bindings; `withApp()` подключает Next-адаптер.
- Маршруты Next вызывают `withModule()` для `modules/catalog` и `modules/offer-details`; `layouts/root` подключён через `withLayout()`.
- `library/domain` следует структуре domain админки: предметные срезы store, product, variant, property, brand, currency, meta; публичные Service/Entity, внутренние Gateway/Mapper и инфраструктура Config/HttpClient. Подключение — только через `DomainBinding`.
- Контроллеры внедряют `StoreServiceInterface`; gateway валидирует внешние ответы через class-transformer/class-validator. Состояния UI и сериализация snapshot принадлежат контроллерам модулей. Запросы выполняются через RequestExecutor и используют `cache: 'no-store'` и AbortSignal loader.
- View читает данные через `useLoaderData()`; начальная гидратация воспроизводит серверный snapshot.
- `pages/home` содержит каталог и карточку предложения, отдельные компоненты и их стили.
- Offer соответствует связи Store–Variant. Цена относится к offer. Артикул, уточнения
  и доступное количество находятся в `records[]`, не у offer или catalog variant.
- Публичный Store API отбирает записи с `inventory.available > 0` в SQL.
  Не дублировать фильтрацию остатков на фронте.
- Первая доступная учетная запись выбрана по умолчанию. При нескольких записях
  клиент может изменить выбор; при единственной записи список выбора скрыт.
  Уточнения — произвольные строки,
  не превращать их в фиксированные размеры/цвета.
- Product/Variant properties: определения полей, типизированные `values[]`, опции
  с `code`, дополнения `TEXT/COLOR/IMAGE`. `ICON` — режим TEXT, не вид свойства.
- Изображения variant и дополнений options разрешаются через публичный client gateway.
- Корзина, заказ и резервирование не реализованы; выбор записи локален карточке.
- Kit подключать через публичные entrypoints `@sellgar/kit`, `@sellgar/kit/theme.css` и экспорты шрифтов.
- Проверки: `yarn typecheck`, `yarn lint`, `yarn test:storefront`, `yarn build:desktop_ui`.
- Framework и kit коммитить в собственных repositories до обновления gitlinks desktop; затем обновлять workspace pointer.
- Перед изменением Next.js читай `clients/desktop/AGENTS.md` и bundled docs Next.

## Оформление кода

- Prettier задаёт отступы в 2 пробела, одинарные кавычки, trailing commas и ширину строки 120.
- Группировать импорты с пустой строкой между группами: side-effect imports, `node:`, внешние пакеты, `@sellgar/*`, workspace-пакеты (`@library/*`, `@page/*` и другие), относительные импорты. Внутри группы порядок задаёт `simple-import-sort`; порядок side-effect imports сохранять.
- Отделять блок импортов от объявления, методы и поля класса друг от друга пустой строкой. Декораторы оставлять вместе с их объявлением.
- Внутри метода отделять подготовку значений от следующего этапа и `return` пустой строкой. Связанные последовательные объявления могут оставаться одним блоком.
- Публичные методы располагать перед приватными деталями в порядке чтения сценария. Не вводить комментарии-разделители вместо понятной структуры.
- `yarn format` запускает ESLint autofix для группировки и пустых строк, затем Prettier. `yarn lint` проверяет эти правила без записи. Обе команды ограничены собственными `clients`, `layouts`, `library/domain`, `modules`, `pages`; nested framework/kit и generated output исключены.
