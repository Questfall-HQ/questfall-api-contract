# AGENTS.md — questfall-api-contract

Следовать [workspace AGENTS.md](../AGENTS.md). При изменении публичной surface
и подготовке её выпуска читать [общий API flow](../docs/workflows/api-contract.md).

## Границы

- `contract.json` — источник клиентской custom REST surface;
  `schemas.json` — публичные JSON shapes и canonical enums.
- `src/index.js` — импортируемое представление без бизнес-логики;
  `src/check.mjs` и `bin/check.mjs` — адаптеры проверки consumers.
- Не включать storage schema, RPG-формулы, секреты, backend implementation
  и internal admin/dev routes, которые Application не вызывает.

## Проверка и версия

Локально проверять конкретный риск; полный workspace gate при подготовке release
или явном запросе: `python3 ../scripts/questfall-gate.py contract --release --force`.
Git tags неизменяемы. Breaking change — major; совместимое расширение — minor;
исправление checker без изменения surface — patch. Установка tag, lockfiles
и повторные consumer gate выполняются по общему API flow.
