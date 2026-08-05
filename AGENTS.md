# AGENTS.md — questfall-api-contract

Публичный версионируемый контракт между `questfall-application` и
`questfall-pocketbase`.

## Границы

- `contract.json` — единственный источник истины для клиентской custom REST
  surface Questfall.
- `schemas.json` — стабильные публичные JSON shapes и canonical enums.
- `src/index.js` — импортируемое представление контракта без бизнес-логики.
- `src/check.mjs` и `bin/check.mjs` — локальные адаптеры проверки потребителей.
- Контракт не содержит PocketBase storage schema, RPG-формулы, admin/dev routes,
  секреты или backend implementation.

## Совместимость

- Git tags неизменяемы.
- Breaking changes требуют новой major-версии.
- Совместимое расширение surface или schema требует minor-версии.
- Исправление checker без изменения surface требует patch-версии.

## Обязательная Синхронизация

Контракт меняется в той же задаче, которая добавляет, изменяет или удаляет
публичный HTTP method/path, access level, request fields, path/query params,
response shape, canonical enum или используемую frontend PocketBase SDK surface.

- Frontend source для сверки — `questfall-application/src/api.imba`.
- Backend source для сверки — клиентские `routerAdd` routes в
  `questfall-pocketbase/src/**/*.pb.imba`.
- Изменение не завершено, пока локальная версия contract не проходит проверки
  обоих consumers.
- После успешной совместной проверки поднять SemVer, создать новый Git tag и
  зафиксировать этот exact tag в обоих consumers.
- Не перемещать опубликованные tags, не ослаблять checker и не добавлять
  исключения, скрывающие рассинхронизацию.
- Для breaking change применять expand → migrate → contract.

## Проверка

```bash
bun run verify
```

После публикации tag каждый потребитель отдельно обновляет pinned dependency.
Если consumer хранит lockfile в Git, он обновляется в том же коммите.
