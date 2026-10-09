# История изменений API contract

## v15.1.0 — feedback commands and replicas

Compatible additions for the coordinated App/Backend release: feedback command
responses, replica reads and optional comment operation keys. Existing Daily
routes and schemas are unchanged; recurring Daily calendars and reward resources
remain outside this release. Both consumers pin the immutable `v15.1.0` tag.

## v14.3.0 — chat search, GIFs, translation and feedback readership

Compatible additions for the coordinated App/Backend release. Publish the backend
routes and migrations before the App; both consumers pin the immutable `v14.3.0`
contract tag. Publishing this contract does not deploy either consumer.

### Chat translation

- Add verified `GET /chat/translation` and `POST /chat/translate` for manual
  message and draft translation. Existing messages are never rewritten; mention
  identity and links are preserved. Stale edits, writing permissions, input/output
  bounds and per-account rate limits are checked by the backend.

- `ChatTranslationSettings.available` now represents shared provider availability,
  initially optimistic with a configured key. Provider failures disable new inference
  until a scheduled probe succeeds. Healthy service and settings reads never trigger
  probes. Cached client translations stay usable.

### KLIPY chat GIFs

- `chat.create` accepts optional `gif` matching `ChatGif`. GIF-only messages are valid.
  Nullable `ChatMessage.gif` retains provider, slug, exact media/preview URLs, title and
  dimensions. Existing messages and clients may omit the field.
- Optional `ChatReply.gif` identifies GIF replies; deletion clears that flag along with
  text/image. Caption edits preserve the attachment. Replay identity includes GIF metadata.
- Browser requests and media loads go directly to KLIPY. Deploy the backend field/validation
  before the App picker, and release both consumers with the same contract tag.

### Chat search

- Add verified `GET /chat/search` (`q`, optional `before` and `limit`) and
  `ChatSearchPage`. Literal text/public-author substrings of 3–120 characters;
  newest-first pages, 25 by default and at most 50 results. The opaque cursor
  survives deletion of its boundary message. Existing chat history is unchanged.
- Deliver the backend FTS5 migration and route before switching App search.
  Both consumers use the same immutable contract tag.

### Feedback readership

- All verified authors can submit Public or Team-only bug reports and ideas without gaining reader access to other private reports. Founders can submit to Founders, Team can also submit to Founders, and Admins can use every audience.
- Feedback list `counts.mine` spans all owned audiences and statuses; optional `audience_counts` provides Open totals only for permitted reader groups.

- Canonical `FeedbackAudience` with Public, Admins, Team and Founders.
  Reader groups are hierarchical: Admins read Team and Founders; Team reads Founders.
  The former Team & founders audience migrates to Founders, retaining its readers.
- Optional audience on creation (legacy requests default to Public) and exact
  audience filters on public/admin lists. Responses include the effective audience.
- Admin audience command uses `expected_updated`, returning 409 on conflict;
  moderation `/visibility` continues to control `hidden` independently.
- Audience changes revoke inaccessible Tracker subscriptions and deliveries.
  SDK/realtime reads enforce parent access; authors retain access.
- Release: deliver backend/migration before App; pin the same exact new contract
  tag in both consumers and run the normal two-stage release checks.


Записи перенесены из прежнего README без утверждения, что каждая подготовленная версия опубликована. Для активной surface использовать contract.json/schemas.json, для установленного tag — package.json обоих consumers. Читать только нужную версию или тему; local/prepared/next release — исторические пометки, не статус production.

Читать по теме задачи. Команды и пути исходников приведены относительно корня `questfall-api-contract`.

Дата переноса: 2026-10-01. Сохранён исходный текст; пометки готовности требуют отдельной проверки.

## v14.2.0 — unified tracking, analytics and moderation rewards

Compatible additions for App 0.7.03: public anonymous visit snapshots and optional
authentication attribution; individual Tracker subscriptions, observations and
reward claims; per-card attention and claimable counts; feedback thread state;
moderation work rewards; title-based News URLs; bounded chat history around a
message and navigation to unread mentions. Existing endpoint paths and historical
claim receipts remain supported. Gold offers add the 1 USDC package and Daily can
count credited Gold purchases. Prepared locally; publication is confirmed by the
immutable v14.2.0 tag and the coordinated consumer gates.

## v14.1.0 — Tracker, feedback and Gold Freezing refinements

Foreign quest observation — local preparation: the `quest` Tracker category is
retired from object and subscription responses. `type: quest` in observation
remains available to author-team members for existing clients and now follows the containing space. Public quest
observation is rejected; retired cards receive no updates and are omitted from
lists, counters and subscriptions. Historical deliveries remain readable.

Author Space attention — local preparation: per-quest `authoring` cards are retired from active object/subscription categories and retained as hidden history aliases. Team feedback and quest availability alerts share one `space` object. Optional `TrackingUpdate.quest` contains `id`, `title` and `href`; feedback uses the existing public `author` and `comment: discussion`. Routine quest edits/publications do not notify the team; daily reports hold ordinary results. Settings retain `authoring` as an alias for `spaces`.

Moderation identity artwork — local preparation: `TrackingObject.target` is an
optional `TrackingModerationTarget` with subject type, title, image and public
avatar descriptors. Domain images come from the existing cached favicon;
profiles and Author Spaces use uploaded or generated avatars. Omission preserves
older clients and unrelated Tracker objects. No request fields or routes change.

Referral milestones reuse the existing optional `TrackingObject.target` profile
shape for the counterparty's public identity. One stable referral object keeps
all four milestones; titles distinguish Referral and Inviter. Compact event copy
does not repeat the profile name, while original award amounts stay in history.
No fields, enums or routes are added.

Compatible additions: delivery-specific Tracker acknowledgement, activity-day
snapshots, public feedback counts and author level, and instantaneous Freezing
power. Existing clients retain their request and response semantics.

Tracker daily summaries — local preparation: `TrackingUpdate.day` optionally
identifies the actual UTC activity day, independently of delivery time. The
read action accepts optional `updates` (delivery IDs) to acknowledge only the
displayed summary; omitted preserves the existing mark-all-for-object behavior.
Daily summaries are recurring snapshots: only the latest report is exposed for each space; historical deliveries remain stored, with no earlier-day cursor. Each replacement starts
unread; acknowledging the previous delivery cannot mark its replacement read.

## v14.0.0 — combined release preparation

The local release candidate adds Daily tasks, section introductions, Gold
Freezing, Founders invitations and attribution, feedback editing, Dice rerolls,
and Gem/Dice merging. It also supports AVIF instruction media, live Daily
images, exact Gem distribution shares, and referral milestone rewards.

This is a major contract release: `items.maximize` now makes the whole clothing
item permanently Perfect, `GemMaximization` replaces `perks` with `cost` and
`after`, and `PersonalRewards` requires the separate `freezing_gold` total.
Legacy Max Out requests receive a refresh-required 409 unless replaying an
already committed command. Historical receipts and rewards remain readable.

Both package and manifest use `14.0.0`. The immutable Git tag remains pending
the coordinated local contract/App/Backend gates; App and Backend must then pin
that same exact tag from GitHub and pass the second consumer gate stage.

Daily task pictures — local preparation: `DailyChain.image` is an optional
public URL, independent of the action. Omitted or empty means no uploaded
picture. Replacing or clearing the task image applies immediately. Admin uploads
use the admin-only `daily_task` media kind (192px AVIF, at most 96 KiB).
This additive change awaits the coordinated contract tag and consumer release.

Gold purchase additions — local preparation: `GoldPackage.id` accepts `1`
alongside `5`, `10`, `25` and `50`; the new package is 1 USDC for 200 Gold.
`DailyChain.action` adds `gold.purchased`, counted in credited Gold on the
settlement's UTC day, with `/buy-gold` as its action link. No response fields or
routes change. These canonical enum additions need a minor contract release
with synchronized consumer tags when preparing deployment.

Daily live editing — local preparation: saves apply immediately. Progress is
preserved when action and filters match, and starts at zero when either changes.
`DailyTier.key` is opaque and stable across target edits. Reached rewards freeze
their original bundle; disabling tasks or removing targets cannot cancel them.
Hidden unclaimed rewards settle automatically after their original UTC day.
No response fields or HTTP paths change. Contract tagging and full consumer gates
remain part of coordinated release preparation.

### Gold Freezing term completion — local preparation

The position summary adds `GoldFreezingView.current_power`: the sum of all
current principals × multipliers at `asof` (or at opening before the program
starts). APR uses this instantaneous denominator rather than accrued/projected
weekly points. Additions and renewals replace the viewer's previous power.
Annualization uses the regular weekly allocation (`pool.addition`, or
`pool.next` for the initial launch), excludes carry-over and does not compound.
This additive field awaits coordinated contract tagging and consumer release.

`GET /gold/freezing` supports anonymous reads of the weekly pool, points chart
and leaderboard. Guests receive `position:null`, `wallet:0`, zero `own` metrics,
and no personal markers in rows, history or timeline. Authenticated responses
retain the existing shape and personal data; all Gold mutations require sign-in.

Gold Freezing principal returns to the spendable Gold balance automatically at
the end of its 15-week term. A due return makes `GoldFreezingView.position` null
and updates `wallet`; historical weekly points, shares and earned rewards remain
in the existing `own` / leaderboard fields. No principal claim is required.
The personal Tracker receives a `TrackingObject` with open-string kind
`gold_freezing`, positive tone, terminal state, Gold amount and the return reason.
Its `cover` shows frozen Gold; `href` is empty because a personal position has no
detail page.
No response fields or endpoints are added by this lifecycle change. Weekly Gold
rewards keep their separate Claim flow.

### Gem distribution — local preparation

`GemRules` accepts the optional `distribution: weighted | halves | shares` field.
`shares` adds six exact `{numerator, denominator}` fractions in F–A order;
each share applies to the remaining buyers, rounding up, and A receives the
final remainder. Server-derived thresholds may be null for disabled/unreachable
rarities or thresholds above one million buyers. The new default has 2/3 at
F–B, 1/1 at A and thresholds 1/3/9/27/81/243. Omitted distribution retains the
historical weighted policy. `halves` retains thresholds 1/2/4/8/16/32.
Existing stored weeks retain their rule snapshots. This additive schema
change awaits the coordinated contract tag and consumer release.

Optional `GemRules.excluded` is an exact `{numerator, denominator}` ratio for
the bottom-ranked buyers receiving no reward. Apply it first, rounding up,
then allocate F–A among the remaining buyers. Omission in saved `shares` rules
means zero exclusion. Fund count excludes those buyers, while buyer totals,
points and ranks retain them. Thresholds include this first cutoff step.

### Unified feedback thread — local preparation

Ideas and bug reports optionally expose `latest_comment`: the newest ordinary
comment or non-empty team decision message, with the same public author identity.
Comment reads accept `include_updates=true` to include existing team decisions
in chronological pagination. Omission retains the ordinary-comments-only view
for older clients. Decision entries carry `review_index`, `status`, and
`award_gold`; their ID is opaque. Review messages remain in the original audited
updates history, so note edits retain the original reviewer/date and rewards.
The Application posts a team comment and status through the existing atomic
status action, including its existing Gold rules. No storage migration is needed.

### Feedback pages and comments — v13.1.0

Ideas and bug reports have public detail routes. Both support paginated public
comments; creating a comment requires a verified account and an idempotency key.
The `all` list filter includes every visible status. Hidden feedback remains
available only to its author or an admin. New comments appear in the feedback
author's Tracking history.

### User roles — v12.2.0

User profiles (`/auth/me` and custom auth responses), auth session records, public user identities,
and chat authors expose `role: null | "team" | "owner"` for representation and
an independent `admin` boolean for access. Both fields are optional in the
schema during rollout to accept responses from older servers. Only users with
an assigned role receive a badge. Admin routes and chat moderation require
`admin: true` regardless of role.

### Chat moderation — v12.1.0

`POST /chat/reports` remains a verified-account compatibility surface in the
combined v14 release. Deployed App 0.6.03 and existing open tabs still send
`{message, reason?}` and receive `{id, status: open | dismissed | banned}`;
repeat submissions retain the same saved receipt. The new client keeps its
API method while using team moderation in the UI. Report evidence and the
internal administrative review remain stored and readable. Remove this route
and storage only in a later, separately reviewed retirement after producers
have migrated; backend rollout must keep the current public client working.

`POST /admin/chat/messages/delete` accepts an optional `duration` and `reason`.
With a duration, the server deletes the message and bans its author in one
transaction, using the same durations as `POST /admin/chat/bans`. Without a
duration, it only deletes the message. The response remains `{id}`.

### Marketplace search and artwork cache

`GET /marketplace/list` remains public for browsing and structured filters.
Nonblank free-text `q` (or the older `search` alias) requires a registered
PocketBase user token. Anonymous search returns 401 before reading listings;
authenticated search is private and is excluded from the shared CDN cache.

`GET /rpg/artwork` without `keys` provides a short-lived revision check. The
optional `version` query field lets clients request published metadata with a
revision-specific URL. Keyed responses with the current version are cached for
one day in browsers and 30 days at the CDN; legacy or mismatched versions retain
the short TTL. Image file URLs already use immutable one-year caching. A new
publication increments the public artwork revision and moves clients to a new
metadata URL.

### Marketplace categories — v10.3.0

`GET /marketplace/list?categories=…` accepts a comma-separated selection of
Marketplace categories. A clothing item uses its equipment slot (`head`,
`chest`, `hands`, `legs`, `feet`, `outer`); other item kinds use their `kind`
(currently `potion`). An omitted or empty value includes every category,
including future item kinds; `none` returns no listings. Categories are applied
before sorting and pagination, so mixed clothing and potion results form one
ordered list. The existing `kind` and `slots` filters remain available and, when
combined with `categories`, are applied as additional constraints.

### Common Lootbox bulk purchase — v7.5.0 (local preparation)

`POST /lootboxes/buy` принимает необязательный `quantity` от 1 до 100.
Отсутствующее поле означает один сундук для совместимости с прежними клиентами.
Стоимость равна `100 × quantity` Gold; списание и начисление сундуков атомарны.

### Welcome lesson — v7.5.0 (local preparation)

`QuestCard.subtitle?: string` is the short Welcome card/header line. When it is empty, the client uses legacy content. Welcome lessons use `config.player_document` with text, links, image references in `config.content_media`, and optional `callout` blocks. A callout has a title, one of the fixed icons (`shield`, `info`, `warning`, `connection`, `wallet`, `key`, `success`, `reward`, `guide`), and one or more text paragraphs. There is no separate lesson heading; the document starts the explanation. These fields do not change quest IDs, completion settings, rewards or player progress.

`QuestCard.card_image?: string` is the dedicated Welcome card and page icon. The client shows a system icon when it is absent. The large `cover` remains in the API for existing data and regular quests but is no longer displayed on Welcome surfaces. A later, separately rehearsed cleanup will clear unused Welcome cover references after content transfer; it will not delete R2 files.

The first authenticated `quests.feed` response for `tab=feed` may include `welcome: QuestCard[]`. It contains the player's available Welcome quests in timeline order, or an empty array when none remain. Guest responses omit the field and retain shared caching. The Feed caches this personal snapshot with its ordinary cards and renders both in one grid; the dedicated `tab=welcome` route remains available for the full Welcome page.

### Compact league characters — v7.4.0

`GET /mining/leagues?details=summary` returns `LeagueBrowserSummary`: public identity, level, Mining Power, weekly points, seven-day quest count and position. It omits equipment/system cards and returns `selected: null`; selection is client state. Omitted `details` (or `details=full`) preserves the full `LeagueBrowser` response for existing clients. Other details values are rejected.

`GET /mining/leagues/miners/{id}` returns the public `LeagueMinerBuild` on demand: id, Mining Power, six equipment slots and mining systems. It exposes no private inventory, balances or storage snapshot. Unverified or missing users return 404. Both reads retain the existing public/authenticated cache separation.

### Опубликованное оформление предметов

`GET /rpg/artwork?keys=…` принимает до 100 ключей и возвращает `ArtworkCatalog`: версию каталога и только запрошенные опубликованные оформления. Без `keys` возвращается версия и пустой `artworks`. Каждое оформление содержит постоянный ID, редакцию, пять параметров позиционирования и шесть AVIF/WebP-вариантов с фактическими размерами, MIME и объёмом. Черновики, оригиналы и административные операции закрыты и не входят в публичную surface. Старое поле `image` сохраняется.

### Единый протокол ответов — v7.0.0

RPG, Inventory, Profile, награды, пополнение Space и завершение квестов
возвращают квитанцию операции и `effects` с `response_version: 2`. Параметр
можно не передавать; явно указанная неподдерживаемая версия отклоняется до
выполнения команды. Старый HTTP-конверт `player` и альтернативные схемы v1 удалены.
Внутренний `Entities.player` клиента остаётся проекцией для интерфейса.

Новый клиент передаёт `response_version: 2` и `idempotency_key`. Открытые вкладки
App 0.5.43, не передающие оба поля, получают серверный ключ на пользователя и
конкретное решение; повтор запроса не создаёт вторую ставку. Эта переходная ветка
удаляется после прекращения поддержки старых открытых вкладок. Явная версия
2 по-прежнему требует ключ. Автор получает разрешённую ему историю
дела; остальные участники — квитанцию и свой баланс без закрытых авторских данных.
История квеста всегда содержит отдельные изменения личного и Space-кошельков.
Это изменение протокола, без миграции серверных данных и пересчёта прошлых выплат.

В этой же локальной версии удалены неиспользуемые Quest types `question` и
`transaction`, а также режимы Quest config `verification=platform|community`.
Действующий Question имеет тип `text`; Action сохраняет `screenshot|url|confirmation`.
`platform` остаётся видом модерации и маркером её снимков. Исторические Screenshot,
Action без verification и прежние identities продолжают читаться: такие данные
есть в сохранённой истории. Проверка отсутствующих форматов и границы очистки:
[workspace audit](../../docs/architecture/BACKWARD-COMPATIBILITY-AUDIT-2026-09-22.md).

Релизный контракт — неизменяемый tag `v7.0.0`. Оба consumer должны фиксировать
именно этот tag, хранить lockfile и проходить полные проверки из чистого checkout.

`Item` и `EquippedItem` требуют основные метаданные, `aspect` и `perks`.
Значения aspect/perks представлены только `EquipmentValue`
(`raw`, `effective`, `boost`, `boosted`); числовой или строковый ответ, предмет
из одного `id` и строковый perk target больше не поддерживаются. В одежде
обязателен `aspect.id`; у зелья остаются нулевое рассчитанное значение и пустые
perks. Числовые атомы в серверном хранилище остаются текущим внутренним форматом:
presenters уже преобразуют их на границе API. Дополнительные поля допустимы.

### Результаты RPG и экипировка — v6.50.0

Ниже описан прежний допуск v6.50.0; в v7.0.0 он сужен, как указано выше.

`CharacterSystems` описывает результаты всех шести RPG-систем: обязательные
числовые поля, grants и Mining rolls. Схема используется в Character entity. `EquippedItem` задаёт
метаданные надетой одежды, aspect/perks, рассчитанные значения, множители и
связи усилений. Исторические неполные предметы и скалярные значения допустимы;
поля, которые присутствуют, проверяются. Новые поля остаются допустимыми.

JSON-ответы, маршруты и формулы не меняются. Это уточнение существующей
публичной формы; коэффициенты баланса принадлежат серверу. Валидатор теперь
проверяет schema-valued `additionalProperties`, включая каждый элемент
числовых карт и карт связей. Тесты используют синтетические ответы серверного
`helpers/player.view.character` (empty, equipped, veteran, legacy).

### Настройки Stamina — v6.49.0

`GET /rpg/stamina/config` возвращает публичные параметры баланса и начальную
проекцию Stamina. Числа принадлежат серверному каталогу; контракт задаёт только
структуру. `Stamina` дополнена необязательными `decay_per_hour` и
`potion_reference`: клиент проецирует старый snapshot с его собственными
параметрами до получения нового. `PotionEffect.restore_percent` — положительное
число, а не фиксированный список значений баланса.

`decay_per_hour` задаёт абсолютную скорость потери избытка, независимо от `max`.
Клиент использует её из snapshot; смена экипировки не меняет эту скорость.
Текущая серверная формула исключает экипировку и использует вложенные очки
Stamina с их Reserve Mastery. Формула не является частью JSON schema.

### Public quest submissions — v6.47.0

`QuestCard.submission_count?: integer` is the nonnegative number of saved sends
for a quest across every publication and status, including repeat attempts.
It is distinct from unique participants and the existing `completion_count`.
The field is shared by feed, detail, public-space and incremental card responses;
it is optional for compatibility with older servers. This additive release
does not change personal completion state, outcome statistics or rewards.

Публичный версионируемый контракт между
[`questfall-application`](https://github.com/Questfall-HQ/questfall-application)
и [`questfall-pocketbase`](https://github.com/Questfall-HQ/questfall-pocketbase).

Пакет устанавливается напрямую из GitHub и намеренно не публикуется в npm
registry. Поле `private: true` защищает его от случайной публикации.

### Идентификация результата — v6.37.0

`QuestIdentity.version?: 2` явно включает content protocol v10. В этой версии
`account` + `questfall.xyz` использует authenticated Questfall account без
внешней привязки, а новый `submitter` допускает screenshot/url без исходного
аккаунта. Для остальных account/wallet по-прежнему нужен явный `platform_account`.
`submitter` недопустим для confirmation. Поля старого v9 без версии сохраняют
исходную семантику, включая старый `questfall` и внешние claims на questfall.xyz.

Новая версия описывает клиентский watermark на screenshot и сравнение с
сохранённой идентификацией отправки. Старые изображения не меняются. Watermark
не является серверной подписью или доказательством авторства. Индивидуальная
ссылка принимается один раз на весь квест, включая отказы и новые публикации;
сравнивается точный URL после trim. Idempotent replay возвращает прежний receipt.
Клиенты ниже v10 не получают публикации и задания с новой identity policy.

### Пустая награда осколками — v6.36.0

`QuestCompletion.reward.shards` и соответствующее поле ответа v2 допускают
`null`: отложенное начисление уже возвращает его, когда осколки не выдавались.
Поле остаётся необязательным; непустое значение проходит прежнюю строгую схему
`ShardReward`. Расчёт наград и поведение backend не меняются.

### Статус профиля в истории рейтинга — v6.35.0

`QuestRatingHistoryUser.moderation_status?: "active" | "restricted"` описывает
уже возвращаемый backend статус публичного профиля участника голосования.
При `restricted` сервер скрывает исходные имя и аватар. Поле необязательное:
старые ответы и fallback для отсутствующего пользователя остаются валидными.
Схема по-прежнему запрещает неизвестные поля; email и другие приватные данные
не входят в историю. До закрытия раунда distribution и личности остаются `null`.

### Полная обложка квеста — v6.34.0

`media.intent` для `quest_cover_v2` принимает необязательную третью WebP-версию
`original`: целое изображение без обрезки и увеличения, до 3000 пикселей по
длинной стороне и 4 MiB, без исходных метаданных. `thumb` и `display` сохраняют
прежние размеры 2:3 и лимит 512 KiB. Старые загрузки из двух вариантов допустимы.
`MediaAsset.variants.original` доступен после успешного completion вместе с
остальными вариантами и проходит общий attach/backup/delete lifecycle.

`QuestCard` и авторские представления квеста добавляют необязательный
`cover_original` для просмотра по клику. Поле `cover` не меняется. Для старых
R2 assets возвращается `display`, для PocketBase — исходный файл без thumbnail,
затем обложка пространства; при отсутствии изображения — пустая строка.
Сохраняется обложка выбранной публикации, а не новой редакции черновика.

### Вывод старых Action из эксплуатации — v6.33.0

`QuestLifecycle.retired?: boolean` сообщает о старом формате: отдельный
Screenshot либо Action без `identity.kind=account|wallet|questfall` или без
`verification=screenshot|url|confirmation`. Welcome исключён. Поле необязательное,
исторические ответы остаются валидными. Для retired согласованно запрещены
`actions.edit|activate|reactivate|extend|launch_new`, `ready` и соответствующие
`can_*`. Причина доступна в `actions.*.reason`; клиент предлагает создать пустой
Action в том же пространстве. История, архивирование, восстановление в Inactive,
модерация и завершение ранее выданных назначений сохраняются. Сервер проверяет
исходную сохранённую запись до входящих изменений независимо от версии клиента.

### Явный username при выполнении — v6.30.0

Клиент передаёт `content_version=7`. Если в выполнении используется внешний
аккаунт, `platform_account` обязателен: отсутствие поля, пустая строка и пробелы
отклоняются до создания выполнения, claim и списания ресурсов. Username нужно
выбрать или ввести, даже если он совпадает с именем Questfall. Это действует
для всех трёх scoped-способов Action и legacy-форм с полем username.
Сервис по-прежнему берётся из публикации, а уникальность проверяется внутри
канонического сервиса. Подтверждение владения аккаунтом не добавлено.

Это opt-in запроса completion: опубликованная конфигурация не меняется.
Клиенты до v7 сохраняют прежнюю подстановку имени Questfall. Явно unscoped
публикации не получают требование username или привязку сервиса. Повтор уже
принятого запроса остаётся идемпотентным.

### Username для всех способов Action — v6.29.0

Клиент использует `content_version=6`. У `verification=confirmation` теперь
может быть непустой `platform_domain`: сервис фиксируется автором и публикацией,
а `platform_account` закрепляется в существующем реестре при успешной отправке.
Пустое имя использует имя Questfall. Ник уникален внутри канонического сервиса,
а на разных сервисах одинаковые ники могут принадлежать разным пользователям.
Алиасы, атомарность, идемпотентность и сохранение привязки после отказа прежние.
Participant не может заменить сервис в запросе. URL не нужен и игнорируется;
изображения не принимаются. Модератор получает сервис, favicon и внешний ник.

Новый редактор задаёт один общий сервис для Screenshot, Individual link и
Nothing, без отдельной ссылки автора. Participant выбирает сохранённый ник или
вводит новый; кнопка во всех трёх вариантах называется Submit for review.
Confirmation с сервисом скрыт от клиентов ниже v6. Публикации v5 без сервиса
сохраняют прежнее поведение и не получают платформу автоматически.

### Action без вложений — v6.28.0

Клиент передаёт `content_version=5`. Новый `verification=confirmation` означает
подтверждение участником без URL, изображений и внешнего username. Модератор
видит профиль Questfall и проверяет действие по инструкции автора. Авторская
конфигурация фиксирует пустой `platform_domain`; переданные в completion URL,
домен и username игнорируются, непустой `proof_media_ids` отклоняется.
Привязка внешнего аккаунта не создаётся. Применяются существующие транзакция,
идемпотентность и direct judging (`platform` / `quest_initial`), а assignment
возвращает `verification=confirmation`. Клиенты ниже v5 этот вариант не получают.

Новый редактор предлагает три варианта без настроек: один скриншот, личная
ссылка без ограничения сайта и Nothing (`confirmation`). Ссылки и действия
описываются в тексте квеста. Backend сохраняет поддержку прежних публикаций,
включая scoped URL, community, Shared/Personal Link и число скриншотов 1–5.

### Три способа проверки Action — v6.27.0

Клиент передаёт `content_version=4`. Новые `verification=url|community`
не содержат отдельной авторской ссылки: переходы и действия описаны в
`player_document`. `url` требует один `proof_url` без скриншотов; пустой
`platform_domain` допускает любой незаблокированный HTTP(S) сайт без привязки
ника. Заполненный домен ограничивает сайт с учётом известных алиасов, но не
раздел или страницу, и включает существующую привязку username.
`community` требует выбранный автором домен и использует username участника
(или имя Questfall); ссылка и изображения в выполнении не нужны.
`screenshot` сохраняет прежние правила количества и необязательной платформы.

Новые варианты сразу создают `platform` / `quest_initial` moderation case,
без Witness. Assignment передаёт `verification=url|community`, чтобы клиент
проверял готовность соответствующего доказательства. Внутренний pipeline
сохраняет platform semantics; опубликованная конфигурация фиксирует метод.
Клиенты ниже v4 не получают новые публикации и назначения. Старые
`platform/shared|individual` и их ссылки остаются рабочими без переписывания.

### Привязки внешних аккаунтов — v6.26.0

Action с `config.platform_domain` требует `content_version=3`. Поле содержит
канонический домен; пустая строка означает скриншоты без внешней платформы.
Shared определяет его из опубликованной ссылки, Personal задаётся автором.
Backend проверяет совпадение proof URL с платформой с учётом известных алиасов.
При заполненной платформе любая отправка, включая скриншоты, атомарно закрепляет
ник за пользователем; пустой ник использует текущее имя Questfall. Конфликт
откатывает отправку и списания, отклонение модераторами не освобождает привязку.

`ProfileUser.platform_accounts` возвращает только принадлежащие пользователю
привязки из реестра, с единым ключом для алиасов. Публичная конфигурация содержит
`platform_favicon`; `/moderation/domains/resolve` дополнен `platform` и `favicon`.
Это закрепление заявленного username, не подтверждение владения аккаунтом.
Исторические публикации без нового поля сохраняют прежний протокол; для старых
скриншотов платформа автоматически не восстанавливается.

### Точное число скриншотов — v6.25.0

Action с `verification=screenshot` поддерживает `screenshot_count`: целое число
от 1 до 5. Оно фиксируется в публикации и передаётся участнику в публичном config.
Completion требует ровно столько разных `proof_media_ids`; меньшее или большее
число отклоняется до создания submission. Новый редактор всегда задаёт число
(по умолчанию 1). Platform не сохраняет `screenshot_count`. Ранее опубликованный
Action без этого поля сохраняет диапазон 1–5 до новой редакции и публикации.

### Аккаунт участника на платформе — v6.24.0

Screenshot completion принимает необязательный `platform_account`, если имя
на внешней платформе отличается от Questfall. Поле сохраняется вместе с
выполнением, но без привязки аккаунта к домену. В completion-фазе модератор
видит зафиксированное имя Questfall (`participant`) рядом с указанным участником
внешним именем (`account`). Это указание, кого проверять, а не подтверждение
владения аккаунтом. В instructions-фазе оба имени по-прежнему скрыты.

### Единый Action — v6.23.0

Клиент передаёт `content_version=2` на существующих content-aware routes,
включая `/moderation/bypass`. Новые `type=action` задают
`config.verification=screenshot|platform` и `config.link_mode=shared|individual`.
Screenshot принимает точное `screenshot_count` (с v6.25.0) или 1–5 изображений для прежних публикаций без этого поля; URL не нужен, аккаунт необязателен с v6.24.0. Platform принимает
пустой `proof_media_ids` и обязательный `platform_account`: shared использует
единственный опубликованный `target_links[0]`, individual требует `proof_url`
участника. Неприменимые ссылки удаляются из конфигурации при сохранении.

Platform создаёт прямой moderation case `platform`, либо `quest_initial`
для первой проверки материалов. Assignment содержит `verification`, чтобы
completion-фаза первого дела тоже могла работать без изображений. Старые
клиенты не получают новые квесты и назначения; legacy Action и Screenshot
сохраняют прежний протокол и уже опубликованные snapshots.

Приоритет отдаётся уже начатой проверке платформы в той же группе приоритета.
Это сближает проверки во времени, но не гарантирует общий десятиминутный
интервал. После решения оставшиеся назначения отменяются без позднего голоса;
живой результат платформы не становится повторяемым контрольным примером.

### Авторские апелляции — v6.21.0

`GET /author-spaces/quests/case?id=…&root_case_id=…` возвращает проверенное
авторское дело, снимок квеста и абсолютные balance/space effects. Команда видит
дело; владелец или участник с `quests_publish` может подать авторскую апелляцию.
Голоса представлены только взвешенными процентами, без состава комиссии;
нулевая выборка — `null`. Исторические результаты используют зафиксированные голоса.

`POST /moderation/cases/appeal` использует единый протокол ответов:
обязательны актуальный `case_id` и `idempotency_key`. Повтор ключа возвращает
подтверждённую операцию, чужое решение с тем же ключом отклоняется.
`/author-spaces/quests/history`
добавляет ссылки на дело/решение, фазу события и отдельные изменения личного
кошелька пользователя и кошелька пространства. Чужие личные выплаты скрыты;
отсутствующие финансовые данные помечаются как недоступные.

### История submissions по игрокам — v6.21.0

`GET /author-spaces/submissions` принимает необязательный `grouped=1` вместе с
обязательным для этого режима `quest_id`. Без `grouped` сохраняется прежняя
пагинация отдельных submissions. В grouped-режиме backend сначала объединяет
все попытки квеста по пользователю, а затем пагинирует пользователей по дате их
последней попытки.

Каждый `items[]` содержит безопасный публичный `user`, хронологический массив
`attempts` и время `latest`. Попытка сохраняет прежние submission-поля и
добавляет nullable `publication: {id, sequence, starts}`, чтобы клиент мог
разделять историю повторных публикаций. `page.total` означает число уникальных
участников, а `summary` содержит независимые `submissions` и `participants`.

### Адресное состояние — v6.20.0

`response_version=2` — единственный формат для bootstrap, Inventory и
команд; он же используется без параметра. `/auth/me`
возвращает профиль, Balances, Character, inventory summary и Mining summary;
не включает предметы, opening layout, weekly XP или rewards details.
Отказ Mining summary не отменяет восстановление профиля.

`GET /player/state?parts=…` доступен verified пользователям. Whitelist:
`balances`, `character`, `inventory_summary`, `opening`. Неизвестные части
отклоняются; это не произвольная проекция полей базы.

`EntityEffects` содержит `owner`, `server_now`, типизированные `upsert`,
явные `remove` и ключи `invalidate`. Снимок содержит `kind`, `id`, `revision`,
`value`; отсутствующая сущность не меняется. Балансы абсолютные. Все снимки
одной операции согласованы транзакционно; более старые revisions не должны
перезаписывать новые. `server_now` независимо продвигает временные проекции.
Inventory сохраняет `put/delete/reset/revision` и добавляет `base_revision`:
delta применяется только к соответствующей полной локальной коллекции.

Авторские чтения разделены: `mine?view=nav`, `quests`, `quests/load`, `team`,
`activity`. Редактор получает контекст и один квест; список не включает полные
config/history. Старый `/author-spaces/load` не изменён. Ответы author mutations
дополнены необязательными `revision` и `space_update`; старые серверы валидны.

`/mining/rewards/details?parts=week,season,history` и аналогичный авторский
endpoint возвращают только выбранные части. `/author-spaces/rewards/summary`
не включает leaderboard, quests, payouts или withdrawals. Старые полные
rewards endpoints и Mining summary сохранены. Свежесть/error каждой части
независимы; частичный ответ не подтверждает актуальность отсутствующих частей.

### Профиль и Claim Reward — v6.19.0

`GET /auth/me` включает необязательный `mining_rewards: MiningRewardsSummary`.
Профиль, HUD и доступная награда применяются одним ответом без фонового waterfall.
История и leaderboard остаются в отдельном подробном endpoint. Если независимый
расчёт сводки недоступен, профиль по-прежнему возвращается; клиент использует
`/mining/rewards/summary` как fallback. Старые формы Profile остаются валидными.

### Пакетные чтения — v6.18.0

`GET /author-spaces/submissions` принимает необязательный `quest_id`. Квест
должен принадлежать пространству `slug`, иначе ответ `404`; `search` при этом
ищет только среди ответов этого квеста. Права и response shape не изменены.

Публичный optional-auth `GET /mining/rewards/summary` возвращает `server_now`,
`claimable`, `week` и `season`. Периоды содержат прежние скалярные поля,
`competition` и `viewer`, без `history`, `leaderboard`, `series` и `quests`.
Полный `/mining/rewards` остаётся совместимым. HUD и фоновая загрузка используют
summary; подробный экран запрашивает полный ответ. Кэш персональных ответов
не должен смешиваться с гостевыми данными.

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

## v6.15.0 — author quest archive

`POST /author-spaces/quests/archive` (`authorSpaces.quests.archive`) accepts
`{id, archived: boolean}` and returns an `AuthorSpaceRatedQuest`. Verified team
members need `drafts_manage`. Setting the same state again is idempotent and
creates no additional event. Only inactive, previously published quests (including
historical bans) can be archived; never-published drafts remain deletable.

Optional lifecycle fields `section` (`drafts | active | inactive | archive`) and
`archived_at` (Unix milliseconds, zero otherwise), plus `actions.archive` and
`actions.restore`, describe team organization separately from publication and
moderation. Returned quests remain Inactive, even while their DB status is draft.
Archive/restore retain history, money, ratings, user tags and all restrictions.
Restoring never publishes a quest. Archive actions appear in existing event and
quest history responses. Older publication calls remain supported: an explicit
successful publication clears manual archiving; existing records are not moved
to Archive automatically.

## v6.16.0 — author material edit date

Optional `QuestLifecycle.edited_at` is Unix milliseconds of the last recorded
normalized material edit after the latest publication began, shown only while
inactive; zero means no recorded edit. It changes for title, type, description,
verification instructions and config, not cover, Bounty, duration, tags,
moderation or payment updates. Reactivation clears the displayed marker through
the new publication boundary; copying starts independently. Historical dates are
not inferred from `updated`. Older servers may omit the field; older clients can
ignore it. Publication permissions and readiness continue to use existing fields.

## v6.17.0 — cumulative publication time

Optional `AuthorSpaceRatedQuest.published_ms` reports total elapsed publication time in
milliseconds at response time, across all recorded publications of the quest.
Each interval is capped at server time, scheduled end and actual closure.
Pauses and unused prepaid time are excluded; time hidden by moderation still
counts while the publication is running. Extensions lengthen the same interval.
The value is `null` if historical intervals are missing or incomplete, and zero
for a never-published draft. Older servers may omit it; clients show an unknown
total rather than substituting time since the latest activation. No new history
records or database fields are required.

### Personal moderation cases

`GET /moderation/cases` and `GET /moderation/cases/{case_id}` are verified-only,
`private, no-store` reads. Lists include reports submitted/supported by the actor,
their domain proposals, appeals and re-reviews, with legacy reporter/proposer
fallbacks. Merely owning an object or voting never makes a personal case.

List query: `search` (object or any linked case ID), `kind` (one report kind or
`domain_proposal`, default `all`), `scope` (`all`, `progress`, `resolved`, `closed`),
`limit` (default 30, maximum 100), `cursor` (opaque returned `next_cursor`). Order
is newest recorded creation/resolution/own-support event, then case ID descending.
Appeals share the original root; re-reviews only follow parent links in this
read projection and keep their independent settlement roots. Detail IDs may name
any linked stage. The response resolves them to the same original case ID.

`outcome` describes the original complaint/proposal and its appeals; `mode` and
`status` describe the latest stage; `target.status` is the current object state.
Timelines use recorded dates only. Statements and ledger entries are actor-only;
private completion proof is omitted for supporters. `/media/assets/{id}/access`
accepts optional `case_id` to retain evidence access for that complaint's reporter
and previously permitted owners. It does not grant access to unrelated assets.
Appeal confirmations may send optional `expected_case_id`; a changed decision
returns 409 before charging. Existing command shapes remain supported.

New History requests `scope=votes`, returning own votes with empty `chains` and
skipping chain collection. Omitting `scope` preserves the legacy response.

### Personal case list presentation — v6.22.0

Personal case summaries and details add optional `finance_total`, the signed
user ledger total for the whole grouped case (excluding voting rewards), and
`target.image`, a public thumbnail URL or legacy PocketBase file path. Empty
images use a frontend fallback. Private completion proofs are never thumbnails.
The list computes financial totals only for the returned cursor page.

### Published quest identity — v6.32.0

Action config now optionally includes `identity: {kind, instructions}`, where
`kind` is `account`, `wallet`, or `questfall` and `instructions` is a string of at
most 500 characters. It is independent of `verification=screenshot|url|confirmation`.
External identities require `platform_domain` at publication and explicit
`platform_account` at completion. Questfall identity clears the domain and uses
the authenticated participant, ignoring external account input. Only Questfall
identity retains custom author requirements; transient preview state is discarded.

`QuestPublicConfig`, `QuestAuthorConfig`, and `ModerationAssignment` share this
shape. Assignments expose the submitted publication's identity (null for legacy
quests), so later draft edits cannot change review requirements. Clients send
`content_version=9`; older clients are excluded by both SQL feed selection and
runtime checks. Existing publications and v8 account claims retain their protocol.
No new route or storage migration is required.

### Account claims — v6.31.0

Adds verified-only accounts.list/create/submit operations and AccountClaim /
AccountClaimList shapes. Public-code disputes use the new identity_claim
moderation kind, delivered only to content_version >= 8. Wallet proof transfers
only quest identity ownership, never authentication identities. Draft, pending,
transferred, insufficient and superseded statuses are explicit; opening a claim
does not change ownership. Personal claim lists never reveal other claimants.

### Author quest results — v6.38.0

`GET /author-spaces/quests/results?slug=…&id=…` requires verified authentication
and membership of the requested Author Space; foreign quest IDs return 404.
`AuthorQuestResults.total` counts all persisted submission attempts for the quest
across publications and statuses. `series` contains exactly 30 ascending UTC day
buckets, including today and zero days; each count uses submission `created`, not
resolution time. `ratings` counts votes in the latest closed rating round (or the
latest open round when no round has closed), consistent with quest analytics.

`survey` is null for other quest types. For Surveys it contains accepted responses
with a valid integer answer index, matching the displayed publication's question
and ordered options. Historical publications with different questions/options are
excluded; legacy submissions without a material snapshot use the current terms.
Items stay in option order, including zero-vote options; percentages use the
accepted response total. Queries aggregate in SQL without returning raw answers,
proofs, or participant information. Existing analytics remains compatible.

### Quiz answer distribution — v6.41.0

`AuthorQuestResults.quiz` is optional for compatibility with older servers and
null for other quest types. It uses the same `{total, items}` shape as `survey`,
but counts every valid submitted answer, including incorrect and repeated
attempts. Percentages use this attempt total, not unique participants or only
accepted submissions. A historical publication must match the displayed quiz
type, question, ordered options and correct answer index; legacy submissions
without a material snapshot use the current terms. The existing Survey and
daily-series semantics are unchanged.

### Quest comments — v6.39.0


- `POST /quests/comments`: verified, requires `id`, `publication_id`, `text`
  (plain text, 1–2,000 characters) and `idempotency_key` (8–128 ASCII letters,
  digits, underscores or hyphens). Accepts the existing content/moderation
  capability fields; the publication must match the quest shown to this user.
  The same user/key and payload replay the immutable `QuestCommentReceipt`.
- `GET /author-spaces/quests/comments?id=…`: verified membership of the quest's
  Author Space; optional `before` cursor and `limit` (default 30, maximum 50).
  Returns `QuestCommentList` with safe public identities and no private auth data.
- `POST /author-spaces/quests/comments/read`: same membership check, requires
  `id` and up to 50 `comment_ids`; validates all IDs against that quest and marks
  them only for the current author-space member. Returns `QuestCommentSummary`.
- Author quest rows/drafts/mutations optionally include `comments`:
  `{total, unread, latest}`. This is private author data; public quest cards are
  unchanged. No replies, editing or public comment feed are introduced.

### Attribute resets — v6.40.0

`GET /rpg/character/attributes/reset/quote` (verified) returns `AttributeResetQuote`: `gold`, `balance`, effective `league`, `free_reason` (`beginner`, `new_league`, or empty), refundable `points`, `enabled`, `reason`, and opaque `token`.

`POST /rpg/character/attributes/reset` accepts optional `quote_token` alongside `response_version`. It must match the current quote for a paid reset; old clients without a token can still perform free resets. A supplied stale token fails without resetting points or charging Gold. Tokens bind the user, effective league, reset revision and base allocation. A successful reset invalidates the token, including after an identical reallocation. Existing `PlayerResult`/compact effects remain unchanged and include updated balances when Gold is spent.

### Unread feedback in Author Space navigation — v6.42.0

`GET /author-spaces/mine?view=nav` may include `feedback_unread` on each
`AuthorSpaceNav`. It counts unread quest feedback for the authenticated member
across that space, including inactive and archived quests. Other teammates have
independent read receipts. Older responses may omit this additive field.

### Shared feedback handling — v6.44.0

`POST /author-spaces/quests/comments/status` requires verified membership of the
quest's Author Space and `id`, `comment_id`, `status` (`open` or `done`). It returns
`QuestCommentReview`: the updated `comment` and the quest's `comments` summary.
Done is shared by the team and records `done_at` and safe public `done_by` identity;
repeated Done requests preserve that actor/time. Reopen clears them. Opening or
reading feedback never handles it, and existing personal receipts stay compatible.

`QuestComment` adds optional `status`, `done_at`, `done_by`; summaries add optional
`open` / `done` counts, and `AuthorSpaceNav` adds optional `feedback_open`. Existing
notes are Open. `GET /author-spaces/quests/comments` accepts an optional `status`
filter; omitting it still lists all notes. A pagination cursor remains usable
after its note moves between states. Public participant responses are unchanged.

### Question answer distribution — v6.43.0

`AuthorQuestResults.question` is optional for older servers, null for non-text
quests. It contains `total`, `accepted` answer rows and `rejected: {items, page}`.
Each row is `{answer, count, percent}`; only submitted values appear. Configured
allowed answers remain in the quest content, including unused variants.
Percentages use all accepted/rejected text attempts, including retries. Empty
text attempts count; malformed non-string proofs and pending attempts do not.
Answers use completion normalization: trim/collapse whitespace, NFKC, then
lowercase unless case-sensitive. Accepted groups use the author's first matching
label; other groups use normalized text. Groups are classified by the displayed
accepted-answer set and sorted by count descending, then answer ascending.

Only historical publications with the same question, case-sensitivity and
normalized allowed-answer set contribute. Reordering equivalent allowed answers
does not reset statistics. Legacy submissions without a material snapshot use
current terms, as with Survey/Quiz. No participant IDs or other proof fields are
returned. Daily chart and overall submission total keep their existing scope.

Optional query `answers_page` defaults to 1 (invalid/negative values become 1),
with five rejected answer groups per page. `page` uses `{page, per_page, total,
pages}`; out-of-range pages clamp to the final page. Accepted groups (at most 20)
are always included. Clients refresh from page one if totals change while paging.

### Published materials in author results

`authorSpaces.quests.results` accepts optional `publication_id`: `latest` selects
the active publication or the most recent ended publication; an explicit ID
selects that quest's saved publication (a missing or foreign ID returns 404).
Omitting it preserves the previous active-publication/draft behavior.

The optional nullable `publication` contains publication metadata and immutable
`content` for author display, including resolved covers and instructional media.
It is null when omitted or when historical materials were not saved; a requested
publication with no saved materials also returns null answer distributions, never
substituting a changed draft. `total`, daily `series`, and ratings remain quest-wide.
Answer distributions combine publications with matching question/answer conditions,
as before; editing the draft does not change the selected published results.
History publication-start and publication-end events expose optional `publication_id` in both response
versions so the author can inspect earlier materials.

## v6.45.0 — Stamina potions

Adds verified `items.consume` and `items.merge` commands. Merge requires an
explicit `ingredientId` as well as `itemId`. Item now supports clothing and
Stamina potions: potion level is 0 (no levels), slot/wear are empty, and `potion`
contains `type: stamina` and `restore_percent`. Potions cannot be equipped.
Craft quotes include server-derived consumption and merge details. Marketplace
listing reads accept the optional `kind` filter. Player Stamina retains overflow
and exposes optional `quest_cost`, including equipment pressure.

The same release also includes immutable published-quest result snapshots and
history links described above. Both consumers must pin the same exact tag.

History result links belong to closing events (author unpublication, expiry or moderation), alongside any refund. Start events retain their IDs for backward compatibility. The frontend opens these results separately from the inactive draft editor.

### Character: компактные характеристики и Stamina — v6.48.0

Формат ответов и сохранённых персонажей не меняется. Схемы уточняют уже
выдаваемую структуру: `CharacterTraits` содержит шесть строк по семь чисел
(вложенные очки, итоговый атрибут, пять traits в указанном в schema порядке),
`CharacterPoints` — `total`, `used`, `free`, `per_level`. Те же определения
используются в `CharacterState`.

`Stamina` требует `current`, `max`, `recovery`, `updated`, `percent`, `quest_cost`.
`current` может превышать `max`; дробная скорость восстановления допустима.
`CharacterEquipment` проверяет объект `slots` и три числовых веса
(raw/effective/ignored), сохраняя совместимость с историческими полями предметов.
Это уточнение проверки существующих ответов; новые поля запроса, routes и
миграция хранилища не требуются. Именованные доменные операции остаются у
потребителей контракта, игровые формулы в этот пакет не входят.

### Prepared v7: canonical quest content and publication requests

New quests and edited Welcome quests persist player and moderator instruction documents. Plain text remains an authoring input, converted on save. Historical text is materialized by the coordinated database migration.

New publication requests require `pricing_revision` and `idempotency_key`; `bounty-v1` is rejected. No-ID quotes now use `bounty-v3` without opt-in. Stored v1 receipts remain readable; existing paid publications retain v2 extension/refund rules. Direct avatar file uploads are rejected; settings accept `avatar_media_id` from the media upload API. This is prepared locally for the combined release, not published.

### Email linking codes — v7.1.0

Authenticated `POST /auth/link/email/request-otp` accepts `email` and returns
`EmailLink`; `POST /auth/link/email/verify-otp` accepts `email` and `otp` and
returns `AuthSession` with `linked: true`. Issuance never registers a user.
Codes are bound to the initiating account and email, expire after 15 minutes,
and lock after five failed attempts. Resends replace prior linking challenges.
The renewed token must be saved because PocketBase invalidates the old session
on email change. This flow has no sign-in side effect.

Legacy magic-link request/preview/verify routes remain available for older
clients. The verify response adds optional `token`, `record`, and `method` to
`Profile` so new clients can renew their session; ordinary profile reads do
not return them. Deploy compatible backend support before the new frontend.
No storage schema change or user-data migration is required.

### Quest resolution covers — v7.2.0

`QuestResolutionNotice.cover?: string` carries the public cover from the submitted
publication, with the Author Space cover as fallback. It applies to accepted,
rejected and cancelled reviews in both initial Feed and incremental responses.
An empty value means no public cover is available; older servers may omit it.
`QuestUpdate.cover?: string` also carries Welcome quest artwork for completion
and reward notifications. Delivery receipts and acknowledgement semantics are unchanged.

### Consumable merging — local preparation

Verified `POST /items/gems/merge` and `POST /items/dice/merge` accept `itemId`,
1–99 distinct `ingredient_ids`, `expected_updated`, integer `expected_cost`,
and `idempotency_key`. The total count must match the current server quote.
Both use response-version-2 entity effects. `GemMergeResult` / `DiceMergeResult`
return the resulting Item, ledger, recipe and replay flag. Craft quotes expose
`merge.inputs` (2–100), ingredient IDs, cost, availability and resulting Item.

`/items/merge` retains the Potion `itemId`/`ingredientId` shape and additionally
accepts `ingredient_ids`, `expected_updated`, `expected_cost`, `idempotency_key`.
Current clients send all quoted ingredients and concurrency fields. Legacy
requests work only for a two-input recipe; otherwise the server requests a new
confirmation without spending. Idempotent replay precedes current recipe checks.

Defaults are 2 Potions, 5 Gems, 5 Dice. Administrative recipe revisions are private
API; public clients always derive counts from quotes. This addition stays local
with the pending combined contract release.

### Weekly purchase Gems — next release

The Gold program adds weekly standings, non-expiring Claim, immutable purchase
contributions, Gem items and clothing evolution/maximization. Registration alone
is sufficient for Gold purchases and rewards. Point amounts are decimal strings
of integer micropoints. Existing orders may omit the additive `gem_contribution`
field. Gem crafting quotes carry an item revision; mutations require the same
revision and an idempotency key. Existing item actions reject the new Gem kind.

### Referral milestone boxes — next release

`ReferralSummary.milestones` carries the four Common/Uncommon/Rare/Epic rules;
nullable `incoming` carries the viewer's incoming referral, inviter, level and
deadline. `ReferralPerson.milestones` exposes the same progress for owned referrals,
including list rows. These fields are optional during rollout. Awarded stages retain
their timestamp; other states are `pending`, `expired`, or `unavailable` for bindings
that predate the program. The six-month deadline is exclusive. Both participants
receive boxes automatically, with no public grant or Claim operation.

Tracker uses its existing generic `kind = referral_reward` and `currency = lootbox_*`
fields. `cover = resource:lootbox_*` selects the shared resource-art image; `rarity`
is the box rarity. Both personal cards group one referral's stage history and link
to `/referrals/`. Administrative import operations remain outside the public contract.

### Permanent ★ Perfect — next major, local preparation

`items.maximize` changes from a selected perk to the entire clothing item. Its
request is `itemId`, `gemId`, `expected_updated`, `idempotency_key` (plus the usual
response version); `perk_index` is no longer part of the new command. Legacy
requests with that field get 409 and must refresh confirmation, unless replaying
an already committed legacy command. Such replays keep their original receipt.

`GemMaximization.after` replaces the old selectable `perks` list with a complete
Item snapshot (or null when unsupported). Cost is 500 Essence and one A Gem, independent of rarity, level, Crafting and Luck.
`Item`, `EquippedItem` and `TrackingObject` carry optional boolean `perfect`;
absence on historical snapshots means false. Existing snapshots/ledger records
are not rewritten. Backend owns the permanent status and all numeric maxima.

Keep this breaking change local until the combined release: publish a new major
immutable SemVer tag and pin it identically in App and Backend only then, followed
by the second forced-gate stage. Current local file dependencies are deliberate.
