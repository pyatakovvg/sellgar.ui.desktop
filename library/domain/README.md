# Domain

Пакет использует предметную структуру domain Sellgar Admin и публичный контракт
client gateway. Его HTTP-ответы отличаются от admin API: нельзя подставить
admin Entity с обязательными полями, которых публичная витрина не возвращает.

| Срез       | Владеет                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `store`    | Предложения, учетные записи, остатки, история цены, список и карточка предложения, Service/Gateway/Mapper/binding |
| `product`  | Публичная проекция товара, поля и значения свойств                                                                |
| `variant`  | Публичная проекция варианта и его изображения                                                                     |
| `property` | Определения свойств, опции и дополнения                                                                           |
| `brand`    | Публичная проекция бренда                                                                                         |
| `currency` | Валюта                                                                                                            |
| `meta`     | Метаданные выдачи                                                                                                 |

В каждом срезе есть один `index.ts`; другие срезы импортируют только этот фасад.
Срезам без операций не нужны пустые services, gateways и bindings. Конкретные
адаптеры и mapper не экспортируются из пакета.

`DomainBinding` подключает конфигурацию, HTTP-клиент и StoreBinding. Framework
предоставляет RequestExecutor в application scope. Gateway объединяет signal
RequestExecutor с signal loader и возвращает проверенные Entity; ошибки
не превращаются в успешные пустые ответы. Деньги остаются строками.

Контроллеры модулей владеют `failedToLoad`, состоянием отсутствующего предложения
и преобразованием Entity в plain snapshot для Next. Домен не импортирует UI.

Проверки из корня desktop:

```sh
yarn exec tsc -p library/domain/tsconfig.json --ignoreDeprecations 6.0
yarn test:storefront
yarn typecheck
yarn lint
yarn build:desktop_ui
```
