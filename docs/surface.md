# Публичная surface и границы контракта

Что входит в публичный контракт; актуальные method/path/fields/shapes — в contract.json и schemas.json.

Читать по теме задачи. Команды и пути исходников приведены относительно корня `questfall-api-contract`.

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

Tracker объединяет заморозку в объект позиции: основной капитал, срок, недельные
награды, Claim и возврат имеют общую историю. `TrackingObject.claim.id` указывает
на выбранную недельную выплату, а `amount` — на её сумму. Опциональный `payout_id`
в `tracking.claim` связывает запрос с этой выплатой; backend проверяет объект и
владельца. Полученная в другой вкладке выплата возвращает прежнюю квитанцию,
не забирая следующую неделю. Старые запросы с `key` и недельные card IDs остаются
совместимыми; `freezing_rewards` сохраняется как alias настройки `freezing`.

`tracking.observe` позволяет вручную включить конкретный объект при выключенном
автодобавлении категории. Для `mining_week`, `gem_week`, `referral_reward` передаётся
ISO week в `id`, для `mining_season` — ISO season; `referral` принимает ID приглашённого
игрока и доступен обеим сторонам связи. `completion`, `gold_purchase`, `gold_freezing`
принимают ID личной записи и проверяют её владельца. `tracking.subscriptions`
возвращает те же идентификаторы для кнопок страниц. Повторное включение удалённой
карточки снимает её mute, начинает историю с текущего состояния и сохраняет общие
настройки источника.

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
входят в его `count`. У каждого профиля `level` и `trust` отражают уровень и
вес голоса на момент голосования; `trust` берётся из сохранённого snapshot
веса, а не из текущего уровня игрока. До публикации финального рейтинга
`rating`, distribution и личности остаются `null`.
