# questfall-api-contract

Публичный версионируемый контракт между
[`questfall-application`](https://github.com/Questfall-HQ/questfall-application)
и [`questfall-pocketbase`](https://github.com/Questfall-HQ/questfall-pocketbase).

Пакет устанавливается напрямую из GitHub и намеренно не публикуется в npm
registry. Поле `private: true` защищает его от случайной публикации.

## Что зафиксировано

- custom REST routes, используемые главным приложением;
- access level каждого route;
- transport и обязательные поля request;
- стабильный response schema для критичных domain objects;
- canonical public enums для items и inventory sync;
- публичный mining league overview: период, weekly league или global season competition, ranking, progression, reward history и каталог лиг с реальными totals по участникам и Mining Points;
- verified Team-visible Author Space rewards read model: независимые weekly/seasonal pools, валютные live projections, накопленные payout receipts и история owner withdrawals;
- минимальная PocketBase SDK surface, используемая клиентом.

Текущая surface охватывает auth/profile, live Quest Feed и completion/rating,
public и owner Author Space flows, media upload lifecycle, player/RPG/economy,
lootboxes, marketplace и Mining leagues. Chest Shards входят в публичный
`player`/reward snapshot; `player.character.mining` также содержит серверное
время, Flow window, Mining Power, Boost и совокупный HUD multiplier. Admin publishing и settlement routes остаются
internal и намеренно не попадают в client contract.

Контракт не раскрывает внутреннюю PocketBase schema, admin/dev routes,
RPG-формулы или реализацию actions. `additionalProperties: true` в schema
сознательно разрешает additive response fields без breaking release.

В rating-flow поле `rating` у completion обязательно только пока системное
назначение возвращает `requires_rating: true`. Первая структурно валидная
попытка фиксирует один неизменяемый голос даже при `accepted: false`, поэтому
ответ на отклонённую попытку может содержать числовой `rating_vote`. Повторные
попытки того же назначения идут с `requires_rating: false`; обычные прохождения
по-прежнему возвращают `rating_vote: null`.

После закрытия rating round `quests.ratings` возвращает итоговый `round.rating`,
который включает все canonical votes, а каждый distribution bin содержит
`users` — безопасные публичные профили ровно тех canonical voters, которые
входят в его `count`. До публикации финального рейтинга `rating`, distribution
и личности остаются `null`.

## Подключение

### Screenshot и content_version=1

Новые клиенты согласуют поддержку `content_version=1` в затронутых запросах
Фида, деталей/выполнения, авторской формы и назначения/голоса модерации.
`QuestType` и `ModerationCaseKind` включают `screenshot`. Требуется ровно
`screenshot_count` (1–5) private `submission_image` IDs, без ссылки/аккаунта.
Общий evidence shape расширен до пяти; Action по-прежнему требует 1–4.

`QuestContentDocument` — `{version:1,content:{type:"doc",content:[...]}}`.
Изображения содержат `media_id` и `caption`, никогда URL или binary.
`player_document` публичный, `moderator_document` доступен только команде
автора и назначенному модератору. Media purposes разделены на публичный
`quest_instruction_image` и приватный `moderator_instruction_image`.
Сопутствующий `content_media` содержит разрешённые в этом ответе media assets;
подписанные URL не являются частью сохранённого документа.

Без content_version=1 сервер не выдаёт Screenshot и задания с изображениями
в инструкциях. Текстовое сохранение старым клиентом не может затереть v1.
Публикации и moderation snapshots неизменяемы относительно нового черновика.
Screenshot consensus: +20/−40 Silver до общего рыночного множителя, без
Witness Credit, включая controls; Action Witness → Judge не меняется.

### Первая проверка и moderation_version=1

`moderation_version=1` включает новые авторские Feed-версии Action/Screenshot,
первичный `quest_initial`, этап `instructions`/`completion`, три решения
`approve`/`reject`/`instructions_invalid`, `waiting_instructions` и `cancelled`.
`POST /moderation/assignments/continue` принимает assignment_id и идемпотентно
открывает доказательства без голоса. `POST /moderation/decisions` принимает
assignment_id, decision и explanation (12–2000 символов для плохой инструкции).
Старый `/moderation/votes` с boolean approve продолжает обслуживать бинарные
кейсы. До continue assignment не содержит proof media/URL или участника, и
приватный media API также закрывает доказательства.

Публикация мгновенная; первый доступный кейс приоритетен, остальные submissions
ждут решения по материалам. Первичный кейс завершается сразу при консенсусе.
Бинарный — на общей десятиминутной границе либо досрочно, когда оставшиеся
активные голоса уже не могут изменить исход; неразрешённая ничья требует
дополнительных назначений. Окно также определяет рыночную цену.
Первичная экономика +20/−40 × рыночный множитель,
без Witness Credit. Отмена по инструкции содержит `compensation` с фактическими
`max(1, floor(snapshot.points × 0.5))` недельными MP; это не успех, не
возврат Stamina и не сезонный/completion зачёт. Уведомления используют прежний
ack-протокол; неподдерживающий клиент не подтверждает скрытые результаты и
не теряет активные обязательства. Новые публикации/назначения ему не выдаются,
ошибка обновления при новой активации возникает до списания средств.

Старые опубликованные версии сохраняют legacy-правила. Пересмотр одобренной
инструкции, новые апелляции и дополнительные санкции Bounty 1 не добавляются.

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

1. Сначала изменить `contract.json` / `schemas.json` и выполнить
   `bun run verify`.
2. Согласованно обновить backend и frontend.
3. Для breaking rollout использовать expand → migrate → contract: сначала
   backend принимает старую и новую форму, затем переключается frontend, и
   только после этого удаляется старая форма.
4. Создать неизменяемый Git tag и обновить pinned tag в потребителях.

Версия 6.8 добавила приватный `quests.feedViewer` для совместимого сценария
публичной CDN-кэшируемой страницы с персональным overlay. Этот endpoint остаётся
доступным. Текущий клиент использует публичный Feed для гостей, а при известной
авторизованной сессии сразу запрашивает персональный Feed; последующие обновления
передаются через `quests.feedChanges`. `quests.ratings` также поддерживает
опциональные `limit` и `cursor`; без параметров сохраняется legacy-ответ.

Совместимое расширение Feed добавляет опциональные `publication_id` у карточки
и viewer patch, а также `viewer.attempt = {used, remaining, next, multiplier}`.
Новые поля опциональны на время rollout, поэтому старые ответы остаются валидными.
`publication_id` обозначает immutable snapshot показанного содержания; пустая
строка используется для Welcome и legacy-квестов без publication. Если приватный
просмотр использует другую публикацию, overlay возвращает полную карточку в
`upsert`, чтобы её содержание и состояние попыток относились к одной версии.

`attempt.used` считает попытки пользователя в выбранной публикации, `remaining`
— оставшиеся доступные попытки, `next` — номер следующей попытки. При pending,
completed, exhausted или другой блокировке `remaining`, `next` и `multiplier`
равны нулю. Для обычных повторных попыток множитель равен 1 / 0.8 / 0.6 / 0.4 /
0.2; у survey он остаётся 1. Action и Welcome event имеют одну попытку, а
недоступные transaction-квесты возвращают `next: 0`. Успешный квест
остаётся завершённым для пользователя при последующих публикациях. `points`
учитывает множитель следующей попытки; `base_points` сохраняет полную персональную
проекцию исходного Bounty. Клиент использует эти серверные значения после
повторного открытия и загрузки страницы, а не восстанавливает попытки из памяти.

`assignment_revision` остаётся непрозрачной персональной revision. Помимо
назначений, её могут менять состояния квестов, подписки и предпочтения,
влияющие на Feed. Потребитель сравнивает её как revision персонального overlay;
он не должен выводить из её изменения факт выдачи нового задания на рейтинг.

В `quests.feedChanges`, `quests.feedViewer` и ответе выдачи rating assignments
`order` описывает только текущие первые `limit` карточек. `remove` содержит
только известные клиенту квесты, которые действительно перестали быть доступны.
Смещение ниже первых карточек само по себе не удаляет уже загруженный квест.
Сервер отдельно проверяет доступность не более 50 `known_ids` и обновляет
изменившиеся карточки за пределами `order`, в том числе при истечении assignment.
Поэтому `upsert` и `cards` допускают до 100 карточек: максимум 50 в начале ленты
и 50 ранее загруженных. `order`, `patches`, `remove` и входной `known_ids`
сохраняют ограничение 50. Клиент применяет `upsert` также к карточкам за пределами
`order` и сохраняет курсор уже загруженного продолжения.

`quests.complete` принимает опциональный строковый `publication_id` показанной
карточки. Сервер сверяет его с выбранной действующей публикацией либо сохранённой
публикацией ещё действительного rating assignment внутри транзакции. При
расхождении сервер возвращает HTTP 409 с `data.code: "publication_changed"`
до расходования попытки или записи голоса. Клиент обновляет detail и предлагает
заново проверить содержание и ответ. Старый клиент без этого поля сохраняет
прежнее поведение; повтор уже выполненной idempotent операции возвращает её
сохранённый результат.

Для надёжной доставки completion notifications новый клиент передаёт
`notice_mode: "ack"` в `quests.feed` и `quests.feedChanges`. Такие чтения
возвращают `quest_updates` без отметки о просмотре. `QuestResolutionNotice`
сохраняет прежние поля `status`, `title`, `placement`, `points` и добавляет
опциональные `id` и `resolved`. `id` — непрозрачный receipt конкретного решения;
при последующем пересмотре решения receipt меняется. Клиент дедуплицирует
уведомления по receipt и после их принятия в UI передаёт до 50 receipt-строк
в `notice_ack_ids` следующего `quests.feedChanges`. ACK идемпотентен и применим
только к текущему решению собственного submission: запоздавший ACK не скрывает
более позднее решение. Без `notice_mode` сохраняется legacy consume-on-read.

### Author Space in initial moderation (v6.13.0)

`ModerationAssignment.author` is an optional nullable `QuestAuthor`. New
`quest_initial` cases capture the public Author Space name, avatar and karma
when created, and preserve that metadata in reference controls. Both review
steps can display it; participant identity and proof remain hidden until
`continue`. Older cases without this snapshot resolve their public author
metadata when read. Binary assignments can omit the field or return `null`.

### Quest reports from initial moderation (v6.12.0)

`POST /moderation/quests/report` accepts `assignment_id`, `category`, `explanation`
(12–2000 characters), and `moderation_version=1`; `content_version` is optional.
The verified user must own an active `quest_initial` assignment. Quest policy
categories and the existing report Stamina cost apply. The response is a
`ModerationMutation` retaining the assignment and its current proof-access phase;
reporting does not vote, release the assignment, or expose the quest/control source.
A private receipt makes retries idempotent. Controls accept the same action and
cost without creating a report against their source quest. The existing
`POST /quests/report` with a quest `id` remains unchanged.

## v6.14.0 — quest lifecycle и bounty-v3

Добавлены необязательный `lifecycle` в авторском квесте, приватный пагинируемый
`authorSpaces.quests.history`, необязательный ключ идемпотентности duplicate и
quote `pricing_version`. В bounty-v3 quote обязательны `discount_balance` и
`discount_applied` (базовые Silver/сутки до Karma). Старые bounty-v1/v2 схемы и
вызовы сохраняются. Без-ID quote без opt-in остаётся v1; v2 действует для
продления старой активной публикации. Lifecycle описывает фактическую видимость,
независимые ограничения, review, финансовые последствия и разрешения действий.
