# Sellgar Storefront

Серверная витрина на Next.js. Исходники и Yarn workspace находятся в `code/`.
Node.js — 24+, Yarn — 4.18.0. Локальные команды:

```bash
git submodule update --init --recursive
cd code
yarn install --immutable
yarn dev:desktop_ui
```

## Структура

```text
code/                         исходники, workspace, lockfile и библиотеки
helm/
  values.app.yaml             общие параметры приложения
  dev/values.yaml             dev ConfigMap с .env и параметры среды
  prod/values.yaml            prod параметры; ingress пока отключён
.github/workflows/
  ci.yml                      build → smoke → publish
  production.yml              ручное продвижение проверенного release
Dockerfile                    builder и standalone Node.js runtime
```

Общий chart Deployment/Service/Ingress/ConfigMap находится в
`sellgar.infrastructure/charts/application`. В `helm/` витрины шаблоны Kubernetes
не дублируются. Инфраструктурный Application при подключении выбирает SHA chart,
SHA этих values и digest образа из успешного CI.

## Конфигурация при запуске

Образ собирается без настроек среды. ConfigMap из `helm/<environment>/values.yaml`
монтирует `.env` в `/app/clients/desktop/.env`. Node.js читает его до старта Next:

```text
node --env-file=.env server.js
```

Переменные:

| Переменная | Назначение |
|---|---|
| `CLIENT_GATEWAY_URL` | адрес client gateway для серверных запросов SSR и proxy |
| `PUBLIC_CLIENT_GATEWAY_URL` | доступный браузеру адрес client gateway |
| `PUBLIC_SOCKET_GATEWAY_URL` | доступный браузеру адрес socket gateway |

`PUBLIC_*` — явный список публичных полей, передаваемых через существующий
ApplicationSnapshot. Браузер восстанавливает настройки до создания bindings.
`NEXT_PUBLIC_*` не используется для средовых настроек: Next фиксирует эти значения
во время build. Внутренний endpoint и остальные переменные не сериализуются.
URL изображений формируются через публичный gateway и при SSR.

Секреты не записываются в ConfigMap, Git, build args или image. Если серверу
понадобится секрет, он должен подключаться в pod из Kubernetes Secret отдельно
от публичного ConfigMap. В текущем приложении секретных настроек нет;
подключение Secret этим этапом не добавляется. Env процесса имеет приоритет
над значениями файла. При изменении ConfigMap checksum
общего chart запускает rollout; существующий Node процесс .env не перечитывает.

Dev values задают публичный origin `http://dev.sellgar.io`. Серверный
`CLIENT_GATEWAY_URL` пока пуст: backend развёртывается отдельным этапом.
До его подключения `/` и `/offers/*` возвращают HTTP 503 без изменения cookie;
`/healthz` проверяет сам Next.js сервер и остаётся доступным. При подключении
backend нужно заполнить серверный URL и настроить ingress его существующих
путей `/v1` и socket gateway `/socket.io`. TLS настраивается отдельным этапом.
Ingress витрины предназначен для `/` на `dev.sellgar.io`; более длинный `/admin`
продолжает обслуживать админку. Prod ingress не включён до настройки адресов.

## CI и выпуск

`development` публикует dev-кандидат, `release/*` — release-кандидат. Каждый запуск
сначала собирает образ, затем проверяет именно его, затем публикует в GHCR.
Smoke использует изолированный gateway fixture и запускает **один образ с двумя
разными .env**, проверяя SSR, session cookie, предзагрузку корзины, статические
assets и отсутствие private env в HTML. Контейнер работает как UID 1000,
с read-only root filesystem и отдельными writable volumes для /tmp и Next cache.

После merge release в master кнопка `Release to production` принимает ID CI
запуска release, проверяет совпадение дерева исходников и продвигает прежний digest
без пересборки. Затем открывается back-merge PR master → development.
CI формирует release manifest; автоматическая запись инфраструктурного Git пока
не подключена, как и у админки. Credentials Kubernetes в GitHub не передаются.

## Проверки

Из `code/`: `yarn lint`, `yarn typecheck`, `yarn test:storefront`, `yarn build:desktop_ui`.
Из корня:

```bash
python3 -B -m unittest discover -s .github/scripts -p 'test_*.py'
docker build -t sellgar-storefront:local .
python3 -B .github/scripts/smoke-image.py sellgar-storefront:local
```

Подробности приложения — в [code/clients/desktop/README.md](code/clients/desktop/README.md).
