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

## Проверка

```bash
bun run verify
```

После публикации tag каждый потребитель отдельно обновляет pinned dependency и
`bun.lock`.
