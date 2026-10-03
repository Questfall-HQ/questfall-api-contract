# questfall-api-contract

Версионируемый публичный контракт Application/PocketBase: HTTP и используемая PocketBase SDK surface.

- `contract.json` — method/path/access, transport и request.
- `schemas.json` — response shapes и canonical enums.
- `src/index.js` — импортируемое представление; `src/check.mjs` и `bin/check.mjs` — consumer checkers.

Рабочие правила — [AGENTS.md](AGENTS.md). При изменении API или подготовке выпуска обязательно читать [workspace API flow](../docs/workflows/api-contract.md).

## Справки по задаче

| Задача | Документ |
| --- | --- |
| <a id="что-зафиксировано"></a>Что входит в контракт | [Границы публичной surface](docs/surface.md) |
| <a id="подключение"></a><a id="установка"></a><a id="изменение-контракта"></a>Exact tag, lockfiles, checker и coordinated release | [Подключение и проверки](docs/usage.md) |
| <a id="feed-compatibility-and-publication-receipts"></a>Publications, attempts, revisions и ACK | [Feed protocol](docs/feed-protocol.md) |
| <a id="v1410--tracker-feedback-and-gold-freezing-refinements"></a><a id="v1400--combined-release-preparation"></a><a id="gold-freezing-term-completion--local-preparation"></a><a id="gem-distribution--local-preparation"></a><a id="unified-feedback-thread--local-preparation"></a><a id="feedback-pages-and-comments--v1310"></a><a id="user-roles--v1220"></a><a id="chat-moderation--v1210"></a><a id="marketplace-search-and-artwork-cache"></a><a id="marketplace-categories--v1030"></a><a id="common-lootbox-bulk-purchase--v750-local-preparation"></a><a id="welcome-lesson--v750-local-preparation"></a><a id="compact-league-characters--v740"></a><a id="опубликованное-оформление-предметов"></a><a id="единый-протокол-ответов--v700"></a><a id="результаты-rpg-и-экипировка--v6500"></a><a id="настройки-stamina--v6490"></a><a id="public-quest-submissions--v6470"></a><a id="идентификация-результата--v6370"></a><a id="пустая-награда-осколками--v6360"></a><a id="статус-профиля-в-истории-рейтинга--v6350"></a><a id="полная-обложка-квеста--v6340"></a><a id="вывод-старых-action-из-эксплуатации--v6330"></a><a id="явный-username-при-выполнении--v6300"></a><a id="username-для-всех-способов-action--v6290"></a><a id="action-без-вложений--v6280"></a><a id="три-способа-проверки-action--v6270"></a><a id="привязки-внешних-аккаунтов--v6260"></a><a id="точное-число-скриншотов--v6250"></a><a id="аккаунт-участника-на-платформе--v6240"></a><a id="единый-action--v6230"></a><a id="авторские-апелляции--v6210"></a><a id="история-submissions-по-игрокам--v6210"></a><a id="адресное-состояние--v6200"></a><a id="профиль-и-claim-reward--v6190"></a><a id="пакетные-чтения--v6180"></a><a id="screenshot-и-content_version1"></a><a id="первая-проверка-и-moderation_version1"></a><a id="author-space-in-initial-moderation-v6130"></a><a id="quest-reports-from-initial-moderation-v6120"></a><a id="v6140--quest-lifecycle-и-bounty-v3"></a><a id="v6150--author-quest-archive"></a><a id="v6160--author-material-edit-date"></a><a id="v6170--cumulative-publication-time"></a><a id="personal-moderation-cases"></a><a id="personal-case-list-presentation--v6220"></a><a id="published-quest-identity--v6320"></a><a id="account-claims--v6310"></a><a id="author-quest-results--v6380"></a><a id="quiz-answer-distribution--v6410"></a><a id="quest-comments--v6390"></a><a id="attribute-resets--v6400"></a><a id="unread-feedback-in-author-space-navigation--v6420"></a><a id="shared-feedback-handling--v6440"></a><a id="question-answer-distribution--v6430"></a><a id="published-materials-in-author-results"></a><a id="v6450--stamina-potions"></a><a id="character-компактные-характеристики-и-stamina--v6480"></a><a id="prepared-v7-canonical-quest-content-and-publication-requests"></a><a id="email-linking-codes--v710"></a><a id="quest-resolution-covers--v720"></a><a id="consumable-merging--local-preparation"></a><a id="weekly-purchase-gems--next-release"></a><a id="referral-milestone-boxes--next-release"></a><a id="permanent--perfect--next-major-local-preparation"></a>Только нужная версия; исторические local/prepared/WIP | [История изменений](docs/CHANGELOG.md) |

Contract working tree может содержать следующую версию. Опубликованный release подтверждается неизменяемым Git tag; consumers должны фиксировать один exact tag и tracked lockfiles.
Установленный tag читать в `package.json` обоих consumers, не копировать номер из старой заметки.

История сохранена отдельно; запись «local preparation» или «next release» не доказывает публикацию.
Старые README-якоря ведут к соответствующей строке таблицы.
