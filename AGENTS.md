# Sellgar Desktop Storefront

- Next.js App Router, React. Запуск из корня: `yarn dev:desktop_ui`, порт 3010.
- HTTP-контракт витрины принадлежит client gateway (4030): `/v1/products`, `/v1/offers/:uuid`.
- `clients/desktop/src/server/storefront` содержит серверный gateway и mapper.
  Страницы `app` вызывают его; запросы используют `cache: 'no-store'` для актуальных остатков.
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
- Проверка: `yarn workspace @client/desktop exec tsc --noEmit --incremental false --ignoreDeprecations 6.0`,
  `node --experimental-transform-types --test clients/desktop/src/server/storefront/mapper/storefront.mapper.test.ts`.
- Перед изменением Next.js читай `clients/desktop/AGENTS.md` и bundled docs Next.
