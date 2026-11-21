# Sellgar Desktop Storefront

- Исходники и Yarn workspace находятся в `code/`; следующие source paths относительны к `code/`.
- Next.js App Router, React. Запуск из `code/`: `yarn dev:desktop_ui`, порт 3100.
- В корне находятся Dockerfile, .github/ и helm/. Helm values и содержимое .env каждой среды принадлежат этому репозиторию; общий chart — инфраструктуре.
- Runtime образа — standalone Next.js на Node.js 24, .env монтируется в /app/clients/desktop/.env и читается командой node --env-file=.env server.js.
- CLIENT_GATEWAY_URL — серверный HTTP endpoint. PUBLIC_CLIENT_GATEWAY_URL и PUBLIC_SOCKET_GATEWAY_URL — только публичные адреса; StorefrontConfigState передаёт их в browser bootstrap. NEXT_PUBLIC_* для конфигурации среды не использовать: эти значения фиксируются сборкой.
- Запросы SSR используют серверный endpoint; imageUrl формируются через отдельный public gateway URL. В snapshot не передаются private env или внутренний адрес gateway.
- HTTP-контракт витрины принадлежит client gateway (4030): `/v1/products`, `/v1/offers/:uuid`.
- Runtime — nested submodule `library/sellgar.app.ui`, UI kit — `library/sellgar.kit.ui`.
- `clients/desktop/src/application` владеет bootstrap и URL/config bindings; `withApp()` подключает Next-адаптер.
- Маршруты Next вызывают `withModule()` для `modules/catalog` и `modules/offer-details`; `layouts/root` подключён через `withLayout()`.
- Общий fallback задаётся через `app.components({ fallback: React.createElement(PageLoader) })`. Серверный `withModule()` ожидает данные и возвращает готовую страницу без дополнительной Suspense-границы; `app/loading.tsx` не используется. Индикатор относится только к браузерному NavigationActivity: `Link` из @sellgar/app/next использует публичный onNavigate next/link, Back/Forward отслеживаются через popstate, ModuleHost завершает ожидание при активации страницы. Layout сохраняется, старый модуль скрывается без размонтирования. Все ссылки витрины используют Link адаптера; прямой next/link и программные next/navigation не передают этот UI-сигнал. HTTP-заголовки и таймеры не используются.
- Корневой layout владеет Scrollbar из кита на высоту viewport. Документ не прокручивается; внутренние списки, включая мини-корзину, используют свои Scrollbar по необходимости.
- `library/domain` следует структуре domain админки: предметные срезы store, cart, product, variant, property, brand, currency, meta; публичные Service/Entity, внутренние Gateway/Mapper и инфраструктура Config/HttpClient. Подключение — только через `DomainBinding`.
- Контроллеры внедряют `StoreServiceInterface`; gateway валидирует внешние ответы через class-transformer/class-validator. Состояния UI и сериализация snapshot принадлежат контроллерам модулей. Запросы выполняются через RequestExecutor и используют `cache: 'no-store'` и AbortSignal loader.
- View читает данные через `useLoaderData()`; начальная гидратация воспроизводит серверный snapshot.
- `pages/home` владеет композицией каталога и просмотром предложения. Общие компоненты витрины находятся в `library/design` (`@library/design`); каталог использует `ProductCard` через публичный фасад пакета. Подготовка данных и ссылок остаётся у страницы, design не зависит от domain, modules или widgets.
- Offer соответствует связи Store–Variant. Цена относится к учётной записи; priceRange оффера приходит из Store. Артикул, уточнения
  и доступное количество находятся в `records[]`, не у offer или catalog variant.
- Публичный Store API отбирает записи с `inventory.available > 0` в SQL.
  Не дублировать фильтрацию остатков на фронте.
- Каждая доступная учетная запись имеет отдельную кнопку «В корзину» при нуле и QuantityStepper из kit при количестве от 1. Степпер меняет количество и удаляет последнюю штуку; клавиатура — ArrowUp/ArrowDown. Радиовыбор записи и общая кнопка не используются.
  Уточнения — произвольные строки,
  не превращать их в фиксированные размеры/цвета.
- Product/Variant properties: определения полей, типизированные `values[]`, опции
  с `code`, дополнения `TEXT/COLOR/IMAGE`. `ICON` — режим TEXT, не вид свойства.
- Изображения variant и дополнений options разрешаются через публичный client gateway.
- Доменный CartService предоставляет HTTP-получение корзины, добавление, изменение количества и удаление позиции через client gateway. Страницы не вызывают его напрямую: они используют публичный CartWidgetServiceInterface из @widget/cart.
- @widget/cart — единый владелец CartStore, команд изменения количества, состояния busy/error и CartChangesHub. CartBindings подключены в DesktopApplication, поэтому все модули получают один экземпляр сервиса на приложение; SSR-приложения изолированы.
- CartApplicationProvider зарегистрирован через app.providers и предзагружает CartWidget существующим WidgetPreloader. CartProvider внутри виджета загружает корзину в prepare и активирует подписки после SessionInitializer; до завершения подготовки runtime не ready. На SSR корзина загружается в request-scoped приложении и сериализуется через CartApplicationState. Браузер восстанавливает снимок до провайдеров без повторного GET.
- Общий CartControl из `@widget/cart/control` размещён в root layout: иконка/счётчик, Popover кита со списком и серверным итогом. UI entrypoint отделён от bootstrap-фасада, чтобы его CSS принадлежал графу страницы Next. Открытие не выполняет загрузок и не создаёт новый экземпляр виджета.
- Виджет работает без визуального host. Его token приватный; страницы используют сервис и не создают собственные WidgetHost/CartStore/CartChangesHub. Для чтения — getSnapshot/subscribe, для команды — setQuantity(recordUuid, quantity, signal). Версию позиции и выбор add/set/remove обрабатывает виджет.
- OfferDetails использует публичный сервис виджета для чтения snapshot и команды setQuantity. Purchase читает CartApplicationState через useApplicationState; команда ждёт useReadyApplication и обращается к общему сервису. Подготовленная корзина доступна уже в SSR-разметке. Локального CartPurchaseController нет. Статус подготовки, отключённые из-за bootstrap кнопки и splash в Next не используются. После готовности приложения переходы между страницами сразу используют текущую корзину.
- HttpClient отправляет cookie и X-Device-Id для запросов корзины. BrowserDeviceService хранит только идентификатор устройства, а credential сессии остается в HttpOnly cookie. Контроллеры и Input корзины не получают ownerUuid, shopUuid или ключи внутренних команд.
- На время команды виджет публикует общий busy/activeRecordUuid/error. pendingAction задаёт направление спиннера: QuantityStepper.loadingAction заменяет нажатый плюс/минус, сохраняя число и размеры. При первом добавлении Button использует inProcess. Занятость передаётся через aria-busy/aria-disabled; повторные команды блокируются общим сервисом. Остаток ограничивает дальнейшее добавление.
- CartChangesHub использует существующий @library/socket-io: приватный /socket.io/carts, cookie-based ticket из SessionContextInterface, cart.created/updated/closed/projection.updated, replay и ACK. schemaVersion=2 несёт полный CartEntity; provider применяет его через общий CartStore без HTTP и глобальной EntityRegistry (SSR-запросы изолированы). ACK следует после применения; retained v1 notifications подтверждаются без revalidation. GET выполняется на серверном старте и при смене сессии; браузерный startup использует переданный снимок. Команда ждёт подтверждённую Cart.version по сокету перед следующей записью.
- SessionContextInterface связывает host-owned SessionService и Hub, не раскрывая credentials или ownerUuid. Смена sessionUuid отменяет старые чтения/записи, очищает Cart и пересоздает socket leases. Framework освобождает провайдеры и subscriptions при остановке приложения.
- Персонализации и обратная связь добавления находятся в OfferPurchase; OfferDetailsComponent получает блок покупки через slot. Заказ и резервирование на фронте не реализованы.
- Kit подключать через публичные entrypoints `@sellgar/kit`, `@sellgar/kit/theme.css` и экспорты шрифтов.
- Изображения витрины используют Image из @library/design: next/image с оптимизацией, стабильной областью, лоадером и состоянием ошибки из кита. Разрешённые источники optimizer заданы в clients/desktop/next.config.ts; изображения публичные и не требуют cookie.
- Проверки: `yarn typecheck`, `yarn lint`, `yarn test:storefront`, `yarn build:desktop_ui`.
- Framework и kit коммитить в собственных repositories до обновления gitlinks desktop; затем обновлять workspace pointer.
- Перед изменением Next.js читай `clients/desktop/AGENTS.md` и bundled docs Next.

## Оформление кода

- Prettier задаёт отступы в 2 пробела, одинарные кавычки, trailing commas и ширину строки 120.
- Группировать импорты с пустой строкой между группами: side-effect imports, `node:`, внешние пакеты, `@sellgar/*`, workspace-пакеты (`@library/*`, `@page/*` и другие), относительные импорты. Внутри группы порядок задаёт `simple-import-sort`; порядок side-effect imports сохранять.
- Отделять блок импортов от объявления, методы и поля класса друг от друга пустой строкой. Декораторы оставлять вместе с их объявлением.
- Внутри метода отделять подготовку значений от следующего этапа и `return` пустой строкой. Связанные последовательные объявления могут оставаться одним блоком.
- Публичные методы располагать перед приватными деталями в порядке чтения сценария. Не вводить комментарии-разделители вместо понятной структуры.
- `yarn format` запускает ESLint autofix для группировки и пустых строк, затем Prettier. `yarn lint` проверяет эти правила без записи. Обе команды ограничены собственными `clients`, `layouts`, `library/design`, `library/domain`, `modules`, `pages`, `widgets`; nested framework/kit и generated output исключены.

## Категории просмотра товара

- `categories` карточки загружаются существующим OfferDetailsController вместе с предложением.
- Каждая категория содержит `categoryUuid` и `items` — актуальный путь от корня до листа из Store.
- Показывать все пути отдельными строками, с переносами длинных названий; без категорий скрывать блок.
- Не выбирать основную ветку и не передавать навигационный контекст категории в URL товара.

## Композиция страницы предложения

- Над основным Card: группа Breadcrumb путей и h1. Breadcrumb использует wrap для длинных путей; без категорий остаётся Каталог → название товара.
- В основном Card две колонки: галерея без миниатюр слева; бренд, варианты, учётные записи с индивидуальной ценой и описание справа. На узком экране колонки складываются вертикально.
- Галерея использует kit Image с fit=contain, для нескольких изображений — kit Button.Icon и индикатор позиции. Пустое изображение заменяется инициалами через Typography.
- Варианты берутся в порядке siblingOffers из BFF: текущий первым, остальные сохраняют свой порядок. Выбор варианта — ссылка с миниатюрой первого изображения через Image из @library/design; название доступно в kit ToolTip и aria-label. Текущий выделен синей обводкой и aria-current. Без изображения показывать текстовое название.
- В учётной записи все уточнения находятся слева в порядке position, разделены «·» и переносятся без обрезки; кнопка/степер xs расположены справа; уточнения и группа действий выровнены по вертикальному центру строки. Артикул скрыт из постоянного отображения и доступен в kit ToolTip по наведению/фокусу на Button.Icon с InformationLineIcon справа от кнопки/степера; интерактивные действия в tooltip не добавлять. Строки переменной высоты разделены отступами и лёгкой заливкой background-surface-neutral со скруглением из токенов кита, без обводки и divider. Постоянное количество «В наличии» не показывается; inventory.available продолжает ограничивать добавление. Описание использует text-base-primary. Единственная запись отображается справа от цены в общей строке покупки, без заливки, обводки и пустой колонки: уточнения при наличии над действиями, кнопка/степер sm, тултип артикула справа. Строка переносится при нехватке ширины. Без уточнений заглушка «Без уточнений» скрыта; aria-label использует артикул. Заливка и xs-контролы относятся только к списку из нескольких записей.
- Атрибуты product/variant показываются отдельным Card ниже основного; пустой блок скрывается. Внутри каждой группы CSS multi-column автоматически балансирует две колонки, на узком экране одну; порядок чтения сверху вниз, затем следующая колонка. Каждая пара название/значение неделима между колонками (break-inside: avoid) и использует Flexbox с ширинами по содержимому; высоты соседних колонок не связываются общей сеткой строк. Typography: заголовок блока body-s, группы caption-l, названия caption-m/regular, значения caption-m/semi-bold; размеры и вес шрифта не переопределяются CSS. Название и значение соединены декоративной точечной линией через CSS-псевдоэлемент.
- Видимые компоненты — Card, Breadcrumb, Image, Badge, Typography, Button и QuantityStepper из @sellgar/kit. Собственный CSS отвечает за композицию и токены; внутренние стили кита не переопределять.

## Общая сессия посетителя

- Next proxy готовит сессию через существующий Client Gateway до SSR, передаёт обновлённые cookie в тот же серверный запрос и возвращает все Set-Cookie браузеру. SessionInitializer использует подготовленный публичный контекст; SessionState восстанавливает его перед browser startup без повторного POST.
- Application SessionService использует POST /v1/auth/session, GET /session, login/logout существующего Client Gateway. Это общий контекст посетителя, независимый от Cart.
- Идентификатор устройства хранится в cookie sellgar.deviceUuid и зеркалируется в прежний localStorage. SSR transport пересылает cookie/user-agent/x-device-id только запросам с withSession; публичный каталог не получает credentials.
- Public context: sessionUuid, nullable userUuid, expiresAt. Секрет остаётся только в HttpOnly cookie; ownerUuid и lifecycle команды не приходят на frontend.
- Session/login/logout сериализованы Web Locks между вкладками. BroadcastChannel уведомляет о смене контекста; подписчики сбрасывают персональные данные при новом sessionUuid или отсутствующей сессии.
- Bootstrap и активность видимой вкладки продлевают гостевой срок; фонового heartbeat нет. Пассивные socket tickets не считаются активностью.
- После logout старый контекст очищается даже при ошибке последующего guest bootstrap. При недоступности Identity новая гостевая идентичность не придумывается на клиенте.
- Требуются современные browser Web Locks/BroadcastChannel, HTTPS в production. Тесты приложения включены в yarn test:storefront.

- Учётные записи приходят из Store в сохранённом порядке order внутри оффера. StoreAccountingRecordEntity сохраняет order; страница не сортирует размеры, даты или UUID самостоятельно.

## Размеры интерфейса

- Во всех собственных стилях размеры, отступы, границы и смещения задаются через существующие токены кита `var(--numbers-X)`. Литералы px разрешены только в условиях `@media`, где CSS custom properties не поддерживаются.
- Типографика задаётся компонентом Typography из кита; не перекрывать её ручным font-size в CSS. Определения токенов внутри самого кита не заменять рекурсивными ссылками.

## Формат стилей

- Для собственных компонентов использовать CSS Modules (`*.module.css`) и нативные возможности CSS. SCSS допустим только при необходимой Sass-логике; Sass-переменные не использовать. Дизайн-значения берутся из CSS custom properties кита.

- Цена записи отображается рядом с её кнопкой/степпером. В каталоге formatPrice отображает полученный priceRange: `1 000 руб. ... 3 000 руб.`; при min=max одна сумма. Frontend не вычисляет минимум/максимум и не использует цену соседней записи.
