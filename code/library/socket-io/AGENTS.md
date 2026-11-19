# Socket.IO Transport

## Назначение

`@library/socket-io` предоставляет конфигурируемые разделяемые Socket.IO
соединения. Каждый transport `path` создаёт отдельное физическое Engine.IO/WebSocket
соединение, которое существует, пока есть хотя бы одна активная подписка.

## Границы

- Публичная точка входа: `src/index.ts`.
- Пакет не знает про domain entities, React и feature packages.
- Один `SocketIOConnection` соответствует паре Socket.IO endpoint + transport `path`.
- Первый вызов `get()` для пары endpoint + path определяет transport options
  разделяемого соединения.
- Для одного event регистрируется один transport dispatcher. Каждая подписка
  создаёт отдельный lease и получает отдельную доставку, включая одинаковый handler.
- `subscribe()` регистрирует обработчик до запуска соединения.
- Первая подписка запускает соединение, освобождение последней останавливает его.
- Socket.IO Manager выполняет штатный reconnect. Пакет повторно вызывает `connect()`
  только когда автоматический reconnect не активен, но спрос ещё существует.
- URL, transport path, event names, auth payload и domain-specific event payload принадлежат
  concrete adapter-у приложения, а не этому пакету.
- Общий wire-контракт `realtime.event.v1` и его `channel`, используемые всеми
  concrete adapters, принадлежат `@library/socket-io`; domain-specific payload
  остаётся у своего provider-а.
- `subscribeDelivery()` централизованно валидирует envelope, сериализует delivery,
  маршрутизирует по `eventType`, отправляет ACK текущего соединения после handlers
  и делает reconnect при ошибке.
- Lease от `subscribeDelivery()` может хранить непрозрачный subscription context.
  Transport отправляет context с `subscriptionId` и `revision` при изменении,
  повторяет актуальное состояние после reconnect и сообщает об освобождении lease.
- Формат context и источник его изменений принадлежат concrete Hub. Пакет не
  подписывается на router/location и не интерпретирует фильтры.

## Проверка

- Transport перенесен из административного @library/socket-io; provider-specific validation и tests принадлежат modules/offer-details. Витрина добавляет только carts в список допустимых каналов envelope. Endpoint приходит из существующего domain ConfigInterface; auth/URL не расширяют transport API.
- Проверки: yarn typecheck, yarn test:storefront, yarn lint.
- При изменении public API запустить typecheck/build потребителей.
