# questfall-api-contract

### Community chat mentions — v7.7.0

`GET /chat/people?q=` ищет только по текущим публичным именам подтверждённых пользователей: минимум четыре символа, максимум десять результатов. Каждый результат содержит публичную идентичность с ID для однозначного выбора тёзок; email не возвращается.

`POST /chat/messages` принимает `mentions` с ID пользователя и границами выбранного `@Имя` в UTF-16 позициях исходного текста. Ответные сообщения содержат актуальные имена авторов, цитат, реакций и упоминаний; при смене имени сохранённый ID остаётся прежним. `ChatStatus.attention_unread` считает непросмотренные сообщения с упоминанием или ответом, один раз на сообщение. `POST /chat/attention/read` отмечает сообщения, которые пользователь увидел в панели; обычный курсор `/chat/read` продолжает отвечать за зелёную точку новых сообщений.

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
[workspace audit](../docs/architecture/BACKWARD-COMPATIBILITY-AUDIT-2026-09-22.md).

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

## Подключение

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
