---
target: Карточка товара каталога Sellgar
total_score: 21
max_score: 32
na_heuristics: 5,10
p0_count: 0
p1_count: 1
target_identity: "file:/home/sellgar/projects/my/sellgar.workspace/frontend/sellgar.ui.desktop/library/design/src/product-card/product-card.tsx"
target_fingerprint: "sha256:9bafce9b8f8a195593a86ef8557a9a192153840d4706414760b6ffaadea528ae"
target_path: /home/sellgar/projects/my/sellgar.workspace/frontend/sellgar.ui.desktop/library/design/src/product-card/product-card.tsx
timestamp: 2026-11-17T20-33-59Z
slug: library-design-src-product-card-product-card-tsx
---
Method: dual-agent (A: card_critique_design · B: card_critique_evidence)

# ProductCard / каталог Sellgar

Вывод: карточка компактная; бейдж следует за фактическим названием с отступом 8px. Разные высоты бейджей под одно- и двухстрочными названиями соответствуют естественному потоку. Оценка наблюдаемого каталога 21/32 (включает демоданные), приемлемо с необходимыми улучшениями.

| Эвристика | Балл | Факт |
|---|---:|---|
| Видимость состояния | 3 | Количество, пустое состояние и ошибка определены |
| Соответствие реальному миру | 2 | API/smoke wording in fixture data |
| Контроль и свобода | 3 | Native photo/title navigation |
| Последовательность | 4 | Kit Typography/Image/Badge and repeated spacing |
| Предотвращение ошибок | n/a | No mutation/input within tile |
| Узнаваемость | 2 | 4/5 images missing, three indistinguishable offers |
| Эффективность | 2 | Two focus stops per offer and repeated link names |
| Минимализм | 3 | Compact text group; empty media dominates fixtures |
| Восстановление | 2 | Generic refresh-later error copy; runtime failure not induced |
| Справка | n/a | Not required for browse/open tile |

Specificity: coherent Sellgar kit styling; current catalog feels like a fixture because of missing photos and API/smoke content. Preserve pinned body-s/caption-m, blue badges, no description/status/button and natural title flow.

Strengths:
- Photo -> price -> name/brand -> personalization is clear.
- 224px media region and 192px Image stable across loaded/missing image states; CLS was not measured.
- Blue badge contrast 8.31:1; text contrast18.23:1.
- No horizontal overflow at375px.

Priority Issues:
1. P1 fixture content: four of five image regions show initials; first three offers have same visible name/brand/price/variant and distinct hrefs. Supply factual images and distinguishable fixture content before rejudging image proportions. Sources: pages/home/src/formatter/offer.formatter.ts:14, pages/home/src/home/home.tsx:44; product-card.tsx:22-27. Suggested command impeccable clarify.
2. P2 keyboard focus: reproduced2px focus outline #b4c7f8 on white has contrast1.68:1. Choose an appropriate stronger kit focus token; do not add a local arbitrary color. Source product-card/default.module.css:28,58. Suggested command impeccable audit.
3. P2 accessible link names: image and title links omit variant, so blue/green offers have ambiguous names in a links list. Include relevant variant in existing link accessible names. Source product-card.tsx:21,36-43. Suggested command impeccable harden.
4. P2 source-supported risk, not reproduced: long personalization label can exceed tile; kit Badge flex0 0 auto and fixedheight20 have no width/ellipsis policy. Verify real long labels and solve at appropriate kit contract boundary. Sources product-card.tsx:42-43, localSCSS64-69, kit status/badge/default.module.css. Suggested command impeccable harden.
5. P3 source-supported hover mismatch: entire article border responds to hover but only image/title navigate. Align feedback and actual navigation region without adding a Details button. Source product-card/default.module.css:12; product-card.tsx:20-45. Live hover not exercised. Suggested command impeccable polish.

Cognitive load moderate (2/8 failures): recognition and cross-page memory for indistinguishable fixtures; otherwise compact groups and little choice clutter. Five offers alone do not justify filters.
Emotional journey: calm orderly first impression, photograph reassures; repeated initial placeholders create unfinished-store impression.
Persona red flags: Jordan sees development data/empty media; Riley must open indistinguishable offers; Sam encounters duplicate names and weak keyboard focus.
Minor observations: isolated count badge lacks explicit product label; appended brand may be truncated with a long name (not reproduced); last desktop row326px vs firstrow342px is ordinary per-row grid stretch, no reserved title blank line. Mobile cards326px and no overflow.
Questions to consider: prioritize reusable component fixes vs dataset readiness; choose top confirmed defects vs all including long-label stress scenario.

Detector: exit0 and[]; no false positives. CLI emitted stream-fd warnings but completed. Browser read-only; no overlay injection or live server. Desktop1280x720 and mobile375x812; viewport restored, independent tabs closed, no cart/source/data mutation.
