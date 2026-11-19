# @library/domain

- Следовать предметной структуре domain Sellgar Admin: `src/classes/<slice>/{domain,application,data}` и `src/infrastructure`.
- Catalog product/variant/property, brand и currency имеют собственных владельцев. Store владеет предложениями, учетными записями, ценами и остатками.
- Product/variant/brand/property здесь — публичные проекции client gateway. Не добавлять отсутствующие admin-only поля и команды.
- Нынешний публичный HTTP API возвращает каталог предложений через `/v1/products` и карточку через `/v1/offers/:uuid`. Эти чтения принадлежат StoreGateway; отдельные CRUD gateways без endpoints не создавать.
- Stable Entity/Service экспортировать через фасад предметного среза и `src/index.ts`. Другой срез использует только публичный фасад.
- Gateway/DTO/Mapper и slice bindings не экспортировать. Подключать пакет через `DomainBinding`.
- Использовать framework `@Entity`/`@EntityCollection` для стабильных идентификаторов и коллекций. UUID, даты, деньги и вложенные ответы валидировать перед возвратом.
- Service не содержит HTTP, UI loading/error flags, console reporting или SSR serialization. Ошибки проходят до owning controller.
- HTTP выполняется через RequestExecutor приложения, с объединением его signal и signal loader. RequestExecutor принадлежит framework application scope; повторно регистрировать его в домене нельзя.
- ConfigBinding получает адрес gateway от application host. HttpClient сохраняет `cache: 'no-store'` и преобразует HTTP/transport ошибки в исключения framework.
- CartGateway владеет /v1/cart и /v1/cart/items. Публичные команды передают recordUuid, quantity и version; владелец, магазин и idempotencyKey определяются backend gateway. Ответы валидируются в CartEntity/CartItemMutationEntity, деньги сохраняются строками.
- Изображение позиции Cart берётся из `imageUuid` проекции сервиса. CartGateway подготавливает `imageUrl` через существующий публичный `/v1/files/:uuid`; socket-адаптер делает то же перед публикацией снимка. URL сохраняется при SSR-гидратации. Карточки Offer для миниатюр не запрашиваются.
- DeviceServiceInterface — технический порт; DomainBinding получает реализацию от host. HttpClient добавляет X-Device-Id и credentials для session-запросов. Сессия хранится только в HttpOnly cookie.
- Заказы, изменение складских остатков и admin-only auth/CRUD находятся вне текущего контракта.
