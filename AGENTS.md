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
