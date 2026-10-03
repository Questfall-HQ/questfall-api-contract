# Подключение и проверка consumers

Exact Git tag, lockfiles, checker и совместное изменение API.

Читать по теме задачи. Команды и пути исходников приведены относительно корня `questfall-api-contract`.

## Подключение

### Установка

Потребители фиксируют Git tag. Если consumer хранит lockfile в Git, обновление
контракта должно коммититься вместе с ним:

```json
{
  "devDependencies": {
    "@questfall/api-contract": "git+https://github.com/Questfall-HQ/questfall-api-contract.git#<immutable-tag>"
  }
}
```

```bash
bun install
bun run node_modules/@questfall/api-contract/bin/check.mjs --application .
bun run node_modules/@questfall/api-contract/bin/check.mjs --backend .
```

Frontend checker сверяет все `get(...)` / `post(...)` вызовы в `src/api.imba`,
включая parameterized media paths, и используемые PocketBase collections.
Backend checker сверяет объявленный контракт с `routerAdd` в `src/**/*.pb.imba`.
Оба parser-а fail closed, если синтаксис API surface изменился и больше не
может быть разобран однозначно.

Конкретный опубликованный tag всегда берётся из `package.json` обоих consumers,
а не копируется из примера README. Рабочая ветка contract может содержать
следующую SemVer-версию до публикации; release существует только после создания
нового неизменяемого Git tag и обновления обоих consumers на один exact tag.

## Изменение контракта

Следовать [общему API flow](../../docs/workflows/api-contract.md): локально
согласованно изменить contract, backend и frontend; при подготовке release
выполнить оба этапа gate и закрепить один неизменяемый exact tag в consumers.
В workspace полный contract gate запускается через
`python3 ../scripts/questfall-gate.py contract --release --force`;
`bun run verify` остаётся штатной командой для CI вне workspace.
