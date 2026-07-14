# Tasks

Fonte di verita per ordine di lavoro, avanzamento e task verificabili di EZ-MEAL. Stato corrente: MVP implementato su Expo SDK 54 per compatibilita Expo Go del dispositivo di sviluppo; verifiche automatiche, audit, localizzazione UI, logo minimale, icone app cross-platform, PWA web ed export web/iOS/Android in `build/` completati; restano hardening dati su APK Android e smoke test finale guidato su Expo Go/APK.

## 1. Strategia MVP

MVP minimo utilizzabile: app Expo/React Native avviabile su iOS, Android e web; dati locali persistenti; gestione ricette e ingredienti; piano settimanale modificabile; generazione randomica compatibile con label pasto; home con pasti di oggi; tema chiaro/scuro; validazioni, error handling, logging e guardrail di sicurezza proporzionati.

Requisiti MVP coperti: `REQ-001..REQ-012`, `NFR-002`, `NFR-003`, `NFR-007`, `NFR-009`.

## 2. Criteri di ordinamento

1. Valore utente: prima funzioni che rendono l'app consultabile e modificabile.
2. Dipendenze tecniche: setup, domain, storage, UI feature.
3. Riduzione rischio: persistenza offline, validazioni, compatibilita piattaforme, sicurezza logging.
4. Verificabilita: ogni incremento deve avere test o verifica manuale oggettiva.
5. Vertical slices: preferire flussi completi utilizzabili a layer isolati non integrati.

## 3. Milestone incrementali

| Milestone | Stato | Obiettivo funzionante |
| --- | --- | --- |
| M0 - Bootstrap | DONE | Progetto avviabile, test eseguibili, README base. |
| M1 - Domain core | DONE | Regole pasti, ricette, ingredienti e piano testate senza UI/storage reale. |
| M2 - Persistenza locale | DONE | Ricette, ingredienti, piani e preferenze salvati e riletti localmente. |
| M3 - Gestione dati utente | DONE | CRUD ricette e ingredienti funzionanti con validazioni e feedback. |
| M4 - Pianificazione | DONE | Piano settimanale consultabile/modificabile e generazione randomica funzionante. |
| M5 - Home e tema | DONE | Home giornaliera, navigazione principale e tema chiaro/scuro. |
| M6 - Hardening MVP | IN_PROGRESS | Test principali, accessibilita, sicurezza, README, logo minimale, icone app cross-platform, PWA web ed export iOS/Android completati; restano hardening dati su APK Android e smoke test finale guidato su Expo Go/APK. |
| M7 - Refinement UX MVP | DONE | Preferenza tema esplicita, testi italiani UTF-8, tag pasto distintivi, refinement card/azioni, generazione piano con bozza salvabile, refinement Ricette e azioni/layout Piano completati. |
| M8 - Localizzazione | DONE | Selezione lingua e traduzioni IT/EN completate. |

## 4. Stato avanzamento

| Stato | Significato |
| --- | --- |
| `TODO` | Non iniziato. |
| `IN_PROGRESS` | In lavorazione attiva. |
| `DONE` | Criteri di completamento e verifica soddisfatti. |
| `BLOCKED` | Bloccato; indicare motivo minimo. |
| `DEFERRED` | Rinviato; indicare motivo minimo. |

Snapshot corrente: `TASK-001` - `TASK-026`, `TASK-028` - `TASK-056`, `TASK-058` e `TASK-061` sono completati lato sviluppo con test automatici/verifiche asset/build; `TASK-057` ha fix e test completati ma resta in verifica manuale su APK Android installato; restano `TASK-027` come smoke test MVP finale guidato su Expo Go/APK e `TASK-059`/`TASK-060`/`TASK-062`/`TASK-063` come improvement post-MVP.

## 5. Task

### TASK-001 - Bootstrap progetto Expo

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Creare app Expo/React Native TypeScript con target web, iOS e Android. |
| Dipendenze | Nessuna |
| Requisiti | REQ-011, NFR-003 |
| Documenti | `docs/architecture.md`, `docs/security.md` |
| Criteri completamento | App avviabile; struttura base coerente; nessun segreto introdotto; README con prerequisiti e comandi avvio/test/build. |
| Verifica/test | Comandi install, avvio web e test base eseguiti con esito positivo. |
| Logging essenziale | Nessun logging applicativo richiesto; console setup senza dati sensibili. |
| Code docs/README | README aggiornato; commenti non necessari salvo configurazioni non ovvie. |

### TASK-002 - Struttura cartelle e convenzioni

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Creare struttura `app/`, `src/domain`, `src/data`, `src/features`, `src/shared`, `src/test` secondo architettura. |
| Dipendenze | TASK-001 |
| Requisiti | NFR-005 |
| Documenti | `docs/architecture.md` |
| Criteri completamento | Cartelle presenti; alias/import coerenti se usati; nessuna dipendenza circolare introdotta; README descrive struttura. |
| Verifica/test | Build/typecheck o test base conferma import validi. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README aggiornato con struttura progetto. |

### TASK-003 - Test harness

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Configurare test unit/component con supporto TypeScript e fixture builder. |
| Dipendenze | TASK-001, TASK-002 |
| Requisiti | NFR-005 |
| Documenti | `docs/architecture.md` |
| Criteri completamento | Test runner configurato; cartelle test presenti; esempio unit test e component test minimi passano; README include comando test. |
| Verifica/test | Esecuzione test completa con esito positivo. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README aggiornato con comando test. |

### TASK-004 - Tipi e costanti dominio pasti

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Definire `MealType`, label UI e regole per colazione/pranzo/cena. |
| Dipendenze | TASK-003 |
| Requisiti | REQ-001, REQ-002, REQ-006 |
| Documenti | `docs/requirements.md`, `docs/architecture.md` |
| Criteri completamento | Enum/tipi centralizzati; mapping label italiano coerente; whitelist dominio disponibile. |
| Verifica/test | Unit test su meal type validi/non validi e label. |
| Logging essenziale | Non richiesto. |
| Code docs/README | TSDoc solo se mapping interno/UI non ovvio. |

### TASK-005 - Domain ricette

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Definire entita ricetta, validazioni nome/label e risultati errore. |
| Dipendenze | TASK-004 |
| Requisiti | REQ-005, REQ-006 |
| Documenti | `docs/requirements.md`, `docs/security.md` |
| Criteri completamento | Nome non vuoto; almeno una label; errori tipizzati; nessun dettaglio tecnico per UI. |
| Verifica/test | Unit test input valido, nome vuoto, label assente, label non valida. |
| Logging essenziale | Errori validazione non loggati come errori tecnici. |
| Code docs/README | Commenti solo su vincoli dominio non immediati. |

### TASK-006 - Domain ingredienti

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Definire entita ingrediente e validazioni minime. |
| Dipendenze | TASK-004 |
| Requisiti | REQ-007, REQ-008 |
| Documenti | `docs/requirements.md`, `docs/security.md` |
| Criteri completamento | Nome obbligatorio; disponibilita rappresentabile; duplicati lasciati a decisione futura. |
| Verifica/test | Unit test su nome valido, vuoto e normalizzazione spazi. |
| Logging essenziale | Non loggare contenuti ingredienti in validazione. |
| Code docs/README | Commenti solo su assunzioni non ovvie. |

### TASK-007 - Domain piano settimanale

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Definire settimana, giorni, slot e compatibilita ricetta-slot. |
| Dipendenze | TASK-004, TASK-005 |
| Requisiti | REQ-002, REQ-003, REQ-006 |
| Documenti | `docs/requirements.md`, `docs/architecture.md` |
| Criteri completamento | Settimana con 7 giorni; ogni giorno 3 slot; slot vuoti ammessi; assegnazione solo se label compatibile. |
| Verifica/test | Unit test creazione settimana, slot vuoti, assegnazione compatibile/incompatibile. |
| Logging essenziale | Non richiesto per funzioni pure. |
| Code docs/README | TSDoc su regole calendario se non ovvie. |

### TASK-008 - Generatore randomico dominio

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Implementare generazione settimanale randomica compatibile con label pasto. |
| Dipendenze | TASK-007 |
| Requisiti | REQ-004 |
| Documenti | `docs/requirements.md`, `docs/architecture.md`, `docs/security.md` |
| Criteri completamento | Genera 7x3 slot quando possibile; non assegna ricette incompatibili; segnala slot scoperti; comportamento testabile con random controllato. |
| Verifica/test | Unit test con ricette complete, insufficienti, assenti e seed/mock random. |
| Logging essenziale | Il use case applicativo dovra loggare solo conteggi/slot scoperti, non dettagli alimentari. |
| Code docs/README | Commento breve su trade-off random se non immediato. |

### TASK-009 - Decisione calendario e cancellazioni

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Registrare decisioni su primo giorno settimana e policy eliminazione ricette/ingredienti referenziati. |
| Dipendenze | TASK-007 |
| Requisiti | REQ-003, REQ-005, REQ-007 |
| Documenti | `docs/architecture.md`, `docs/security.md`, `docs/decisions.md` |
| Criteri completamento | `docs/decisions.md` contiene decisioni con motivazione, alternative e impatto; task dipendenti aggiornati se necessario. |
| Verifica/test | Review documentale: decisioni risolvono punti aperti citati in architecture/security. |
| Logging essenziale | Decisione indica eventuali eventi da loggare per conflitti/cancellazioni. |
| Code docs/README | README non richiesto salvo impatto su uso app. |

### TASK-010 - Storage SQLite schema e migrazioni

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Definire schema locale, apertura DB e migrazioni idempotenti per ricette, ingredienti, piani, preferenze. |
| Dipendenze | TASK-005, TASK-006, TASK-007 |
| Requisiti | REQ-009, REQ-010 |
| Documenti | `docs/architecture.md`, `docs/security.md` |
| Criteri completamento | Schema creato; migrazioni ripetibili; query parametrizzate; nessun path arbitrario; README include note storage/config se necessarie. |
| Verifica/test | Integration test migrazione su DB vuoto e gia migrato. |
| Logging essenziale | Log `info` migrazione completata; `error` su fallimento senza dati sensibili. |
| Code docs/README | Commenti su migrazioni non ovvie; README aggiornato se cambia setup. |

### TASK-011 - Repository locali

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Implementare repository per ricette, ingredienti, piano e preferenze. |
| Dipendenze | TASK-010 |
| Requisiti | REQ-005, REQ-007, REQ-010, REQ-012 |
| Documenti | `docs/architecture.md`, `docs/security.md` |
| Criteri completamento | CRUD locale disponibile; mapping DB-domain separato; errori persistence tipizzati; query parametrizzate. |
| Verifica/test | Integration test salva/rilegge/modifica/elimina entita e preferenze. |
| Logging essenziale | Log `error` solo per failure storage; niente payload completi o dati alimentari dettagliati. |
| Code docs/README | TSDoc sui repository principali se responsabilita non ovvie. |

### TASK-012 - UI shell e navigazione

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Creare layout app, navigazione principale e placeholder funzionali per aree MVP. |
| Dipendenze | TASK-001, TASK-002 |
| Requisiti | REQ-011 |
| Documenti | `docs/architecture.md`, `docs/design.md` |
| Criteri completamento | Navigazione mobile/web coerente; route home, piano, ricette, ingredienti, settings; nessuna landing page. |
| Verifica/test | Component/UI test navigazione base; verifica manuale web/mobile viewport. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README aggiorna entry point principali se utile. |

### TASK-013 - Design tokens e componenti base

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Implementare token colore/spacing/tipografia e componenti base condivisi. |
| Dipendenze | TASK-012 |
| Requisiti | REQ-012, NFR-008 |
| Documenti | `docs/design.md` |
| Criteri completamento | Token light/dark disponibili; Button/Input/Card/Alert/Toast/Badge minimi; stati focus/disabled/error dove rilevanti. |
| Verifica/test | Component test stati principali; controllo contrasto manuale su colori chiave. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Commenti solo su token non ovvi; README non richiesto. |

### TASK-014 - Feature ricette CRUD

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Implementare lista, creazione, modifica ed eliminazione ricette con label pasto. |
| Dipendenze | TASK-005, TASK-011, TASK-013 |
| Requisiti | REQ-005, REQ-006 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Form validato; lista aggiornata dopo salvataggio; errori vicino al campo; eliminazione gestisce impatti secondo decisione. |
| Verifica/test | Component/UI test creazione valida, label mancante, modifica, eliminazione. |
| Logging essenziale | Log `warn` per conflitti eliminazione; no log dettagli ricetta. |
| Code docs/README | Commenti su flusso conflitti se non ovvio; README aggiorna funzionalita principale se utile. |

### TASK-015 - Feature ingredienti CRUD

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Implementare lista, creazione, modifica ed eliminazione ingredienti disponibili. |
| Dipendenze | TASK-006, TASK-011, TASK-013 |
| Requisiti | REQ-007, REQ-008 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Form validato; lista aggiornata; nome vuoto bloccato; impatti eliminazione gestiti. |
| Verifica/test | Component/UI test creazione valida, nome vuoto, modifica, eliminazione. |
| Logging essenziale | Log `warn` per conflitti eliminazione; no log dettagli ingrediente. |
| Code docs/README | Commenti su assunzioni disponibilita se non ovvie. |

### TASK-016 - Piano settimanale consultabile

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Visualizzare settimana con sette giorni e tre slot pasto modificabili. |
| Dipendenze | TASK-007, TASK-011, TASK-013 |
| Requisiti | REQ-002 |
| Documenti | `docs/requirements.md`, `docs/design.md` |
| Criteri completamento | Settimana vuota mostra slot vuoti; settimana salvata mostra assegnazioni; layout responsive senza overlap. |
| Verifica/test | UI test rendering settimana vuota e con dati; verifica mobile/web. |
| Logging essenziale | Non richiesto per lettura riuscita; errori storage gestiti da repository. |
| Code docs/README | README aggiorna modalita uso piano se utile. |

### TASK-017 - Assegnazione ricetta a slot

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Consentire assegnazione, sostituzione e rimozione ricetta da slot pasto. |
| Dipendenze | TASK-014, TASK-016 |
| Requisiti | REQ-003, REQ-006 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Lista solo compatibili o incompatibili chiaramente bloccate; rimozione torna a slot vuoto; persistenza confermata. |
| Verifica/test | UI/integration test assegnazione compatibile, incompatibile, rimozione e riapertura piano. |
| Logging essenziale | Log `warn` solo per tentativi incompatibili gestiti lato use case se rilevanti; no payload dettagliati. |
| Code docs/README | Commenti solo su compatibilita non ovvia. |

### TASK-018 - Generazione randomica piano UI

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Esporre generazione randomica del piano con conferma e segnalazione slot scoperti. |
| Dipendenze | TASK-008, TASK-016, TASK-017 |
| Requisiti | REQ-004 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Azione genera piano; conferma prima di sovrascrivere; slot scoperti visibili; piano persistito dopo conferma. |
| Verifica/test | UI/integration test generazione completa, insufficiente, assenza ricette, conferma sovrascrittura. |
| Logging essenziale | Log `info` generazione confermata con conteggi; `warn` slot scoperti; nessun dettaglio ricetta. |
| Code docs/README | Commento su trade-off generazione se necessario; README aggiorna funzionalita principale. |

### TASK-019 - Home giornaliera

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Mostrare nella home colazione, pranzo e cena del giorno corrente. |
| Dipendenze | TASK-016, TASK-017 |
| Requisiti | REQ-001 |
| Documenti | `docs/requirements.md`, `docs/design.md` |
| Criteri completamento | Home legge data corrente; mostra ricette assegnate o stati vuoti modificabili; refresh dopo modifiche piano. |
| Verifica/test | Unit test clock controllato; UI test giorno con pasti e giorno vuoto. |
| Logging essenziale | Non richiesto per lettura riuscita; errori storage mostrano messaggio sicuro. |
| Code docs/README | README aggiorna descrizione flusso principale se utile. |

### TASK-020 - Tema chiaro/scuro

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Applicare tema chiaro/scuro con preferenza sistema o locale. |
| Dipendenze | TASK-013, TASK-011 |
| Requisiti | REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/architecture.md` |
| Criteri completamento | Tema applicato a schermate MVP; preferenza persistita se prevista; fallback leggibile. |
| Verifica/test | Component/UI test tema light/dark su shell App tramite `useColorScheme` mockato OK; repository test preferenza tema con fallback `system` OK; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 42 test passati. Verifica contrasto manuale resta coperta da TASK-032. |
| Logging essenziale | Log `info` opzionale su preferenza aggiornata senza dati utente sensibili. |
| Code docs/README | README aggiorna nota tema se configurabile. |

### TASK-021 - Error handling e messaggi sicuri

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Uniformare errori applicativi, feedback UI e fallback sicuri. |
| Dipendenze | TASK-011, TASK-014, TASK-015, TASK-017 |
| Requisiti | REQ-005, REQ-007, REQ-009, REQ-010 |
| Documenti | `docs/architecture.md`, `docs/security.md`, `docs/design.md` |
| Criteri completamento | Validation/Persistence/Conflict error gestiti; no stacktrace utente; input preservato su errori recuperabili. |
| Verifica/test | Test unit error mapping; UI test errore validazione e errore repository simulato. |
| Logging essenziale | `error` solo per failure tecniche; masking/redaction rispettati. |
| Code docs/README | Commenti su mapping errori se non ovvio. |

### TASK-022 - Logging applicativo essenziale

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Implementare logging locale proporzionato per migrazioni, generazione, conflitti e persistence failure. |
| Dipendenze | TASK-010, TASK-018, TASK-021 |
| Requisiti | NFR-005, NFR-007 |
| Documenti | `docs/architecture.md`, `docs/security.md` |
| Criteri completamento | Livelli coerenti; nessun dato sensibile; log non rumorosi; debug disabilitabile. |
| Verifica/test | Test o review su logger/redaction; simulazione failure storage. |
| Logging essenziale | Questo task definisce il logging minimo richiesto dai flussi. |
| Code docs/README | README include `LOG_LEVEL` se configurabile. |

### TASK-023 - Accessibilita e responsive pass

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Verificare accessibilita e layout responsive delle schermate MVP. |
| Dipendenze | TASK-014, TASK-015, TASK-018, TASK-019, TASK-020 |
| Requisiti | NFR-008, REQ-011, REQ-012 |
| Documenti | `docs/design.md` |
| Criteri completamento | Label input; touch target minimi; focus visibile web; stati non solo colore; nessun overlap mobile/web. |
| Verifica/test | Checklist manuale mobile/tablet/desktop; component test dove possibile. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README non richiesto salvo note accessibilita utili. |

### TASK-024 - Verifica offline e persistenza tra sessioni

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Verificare funzioni MVP senza rete e dati disponibili dopo riapertura app. |
| Dipendenze | TASK-014, TASK-015, TASK-018, TASK-019 |
| Requisiti | REQ-009, REQ-010, NFR-002, NFR-009 |
| Documenti | `docs/requirements.md`, `docs/security.md` |
| Criteri completamento | CRUD e piano funzionano offline; dati persistono dopo chiusura/riapertura; nessuna dipendenza backend introdotta; UI collegata a SQLite tramite persistence adapter applicativo. |
| Verifica/test | `npm run typecheck`; `npm run test -- --runInBand`; `npx expo export --platform web --output-dir /private/tmp/ez-meal-web-export`; test `appPersistence` su load e snapshot delete parametrizzate. |
| Logging essenziale | Log errori storage solo se falliscono letture/scritture; no log dati personali. |
| Code docs/README | README aggiorna nota offline-first e dati locali. |

### TASK-025 - Hardening sicurezza MVP

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Pass finale sui guardrail security applicabili prima del rilascio MVP. |
| Dipendenze | TASK-021, TASK-022, TASK-024 |
| Requisiti | NFR-006, NFR-007 |
| Documenti | `docs/security.md` |
| Criteri completamento | Nessun segreto; query parametrizzate; no stacktrace utente; no log sensibili; dipendenze inutilizzate rimosse; pratiche vietate assenti; override npm mirate su `uuid` e `postcss` mantengono audit pulito senza rialzare Expo SDK. |
| Verifica/test | `npm run typecheck`; `npm run test -- --runInBand`; `npx expo export --platform web --output-dir /private/tmp/ez-meal-web-export`; `npm audit --omit=dev` -> 0 vulnerabilita. |
| Logging essenziale | Confermare che log siano diagnostici, minimi e redatti. |
| Code docs/README | README aggiornato se cambia configurazione o comando audit/test. |

### TASK-026 - README MVP completo

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Consolidare README per nuovo lettore e uso operativo MVP. |
| Dipendenze | TASK-001, TASK-003, TASK-024 |
| Requisiti | NFR-005 |
| Documenti | `docs/architecture.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | README include scopo, stack, prerequisiti, comandi, configurazione non segreta, struttura, entry point, offline-first, rimandi docs. |
| Verifica/test | Review README contro guidance architecture; comandi documentati eseguiti o marcati chiaramente. |
| Logging essenziale | Documentare `LOG_LEVEL` se presente. |
| Code docs/README | README stesso aggiornato. |

### TASK-027 - Smoke test MVP finale guidato su Expo Go

| Campo | Valore |
| --- | --- |
| Stato | TODO |
| Priorita | MUST |
| Descrizione | Validare manualmente su Expo Go i flussi principali MVP come vertical slice completa, con checklist guidata dall'assistente ed esecuzione sul dispositivo reale da parte dell'utente. |
| Dipendenze | TASK-014, TASK-015, TASK-018, TASK-019, TASK-020, TASK-025, TASK-026, TASK-028, TASK-029, TASK-032, TASK-033, TASK-034, TASK-036, TASK-037, TASK-038, TASK-039, TASK-040, TASK-041, TASK-042, TASK-043, TASK-044, TASK-045, TASK-046, TASK-054, TASK-055, TASK-056, TASK-057, TASK-058 |
| Requisiti | REQ-001..REQ-012 |
| Documenti | Tutti i docs principali |
| Criteri completamento | Su Expo Go l'utente completa la checklist MVP: avvio app; reset database locale; creazione ingredienti; blocco duplicati; creazione ricette con multiselect; cancellazioni referenziate con conferma; creazione/selezione/rinomina/cancellazione piani; assegnazione/sostituzione/rimozione pasti; generazione piano con ricette insufficienti e sufficienti; anteprima piano random modificabile/salvabile; home aggiornata; scroll/tastiera/navbar utilizzabili; scelta tema sistema/chiaro/scuro funzionante; testi italiani corretti; tag pasto distintivi e leggibili; riapertura app con dati persistiti. |
| Verifica/test | Precondizioni automatiche: `npm run typecheck` OK; `npm run test -- --runInBand` OK; `npm run build:android` OK; `npm run build:ios` OK. Verifica manuale: assistente guida i passaggi, utente esegue su Expo Go e riporta esito `PASS/FAIL` per ogni sezione; eventuali anomalie generano nuovi task mirati. |
| Logging essenziale | Verificare assenza log rumorosi/sensibili durante flusso. |
| Code docs/README | README aggiornato con stato MVP verificato se rilevante. |

### TASK-028 - Refactor leggibilita navbar con tab selezionato

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Migliorare la navbar quando `Piano` e selezionato: gli altri bottoni devono restare chiaramente leggibili e distinguibili. Valutare sfondo navbar, stato selezionato diverso, separatori, contrasto, padding o altra soluzione coerente con `docs/design.md`. |
| Dipendenze | TASK-012, TASK-013, TASK-020 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/tasks.md` |
| Criteri completamento | Tutti i tab sono leggibili quando `Piano` e attivo; stato selezionato evidente ma non copre/indebolisce gli altri bottoni; contrasto adeguato in tema chiaro/scuro; layout stabile senza overlap nei test automatici. |
| Verifica/test | `npm run typecheck` OK; `npm run test -- --runInBand` OK; export Android OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Aggiornare `docs/design.md` solo se si introduce una nuova regola visuale riutilizzabile; README non richiesto. |

### TASK-029 - Refactor spaziatura bottoni navbar

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Ridisegnare la distribuzione spazio della navbar per evitare che `Ingredienti` vada a capo nel bottone e per dare spazio equilibrato a tutti i tab. Valutare label abbreviate, icone, scroll/overflow, dimensioni font, layout a due righe controllato o altra soluzione coerente con UX mobile. |
| Dipendenze | TASK-028 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/tasks.md` |
| Criteri completamento | Nessuna label della navbar va a capo in modo non intenzionale; `Ingredienti` resta leggibile e visivamente curato; touch target minimi preservati; layout stabile su larghezze mobile strette e desktop/web. |
| Verifica/test | `npm run typecheck` OK; `npm run test -- --runInBand` OK; export Android OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Aggiornare `docs/design.md` se la soluzione introduce convenzioni nuove per tab/navbar; README non richiesto. |

### TASK-030 - Refactor leggibilita tag pasto non selezionati

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Rendere leggibili i tag `Colazione`, `Pranzo` e `Cena` quando non sono selezionati, evitando testo chiaro su sfondo chiaro. |
| Dipendenze | TASK-013, TASK-014, TASK-020 |
| Requisiti | REQ-006, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/tasks.md` |
| Criteri completamento | I button `secondary` usano testo ad alto contrasto su sfondo chiaro; i tag pasto non selezionati restano leggibili; nessuna regressione sui button primary/danger/ghost. |
| Verifica/test | `npm run typecheck` OK; `npm run test -- --runInBand` OK con test UI dedicato; export Android OK. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README non richiesto; test componente aggiornato. |

### TASK-031 - Build locali in cartella build

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Standardizzare i comandi di export locale per generare output Android e iOS rispettivamente in `build/android` e `build/ios`. |
| Dipendenze | TASK-001, TASK-026 |
| Requisiti | REQ-011, NFR-005 |
| Documenti | `docs/architecture.md`, `README.md` |
| Criteri completamento | Script npm dedicati presenti; cartelle `build/android` e `build/ios` generate; README spiega comandi e natura degli output; nessun segreto introdotto. |
| Verifica/test | `npm run typecheck` OK; `npm run test -- --runInBand` OK; `npm run build:android` OK; `npm run build:ios` OK; output presenti in `build/android` e `build/ios`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README aggiornato con comandi build/export. |

### TASK-032 - Audit contrasti testo/background

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Verificare e correggere i contrasti tra scritte e background su tutte le schermate, componenti e stati principali dell'app. |
| Dipendenze | TASK-013, TASK-020, TASK-028, TASK-030 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/tasks.md` |
| Criteri completamento | Testi, label, placeholder, badge, bottoni, tab, stati vuoti/errori e superfici light/dark risultano leggibili tramite token dinamici; nessuna combinazione testo/sfondo chiara-su-chiara o scura-su-scura nota nei test automatici; eventuali nuove regole colore aggiornate in `docs/design.md`. |
| Verifica/test | `rg` conferma assenza di `lightColors` nelle UI visibili; `npm run typecheck` OK; `npm run test -- --runInBand` OK; `npm run build:android` OK; `npm run build:ios` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | `docs/design.md` aggiornato con regola token light/dark dinamici; README non richiesto. |

### TASK-033 - Audit e fix scroll schermate

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Verificare e correggere lo scroll degli elementi e delle schermate: al momento lo scroll non sembra funzionare in nessuna area dell'app. |
| Dipendenze | TASK-012, TASK-014, TASK-015, TASK-016, TASK-018, TASK-019 |
| Requisiti | REQ-011, NFR-008 |
| Documenti | `docs/design.md`, `docs/architecture.md`, `docs/tasks.md` |
| Criteri completamento | Liste, form e contenuti lunghi sono contenuti nella shell scrollabile; navbar/footer non bloccano contenuti nei test automatici; tastiera gestita con `KeyboardAvoidingView`, buffer dinamico moderato e bottom navbar nascosta durante input. |
| Verifica/test | UI test conferma `ScrollView`, `KeyboardAvoidingView` e navbar nascosta/riapparsa su eventi tastiera nella shell; `npm run typecheck` OK; `npm run test -- src/test/__tests__/ui.test.tsx src/test/__tests__/App.test.tsx --runInBand` OK; `npm run test -- --runInBand` OK, 38 test passati; `npm run build:android` OK; `npm run build:ios` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | `docs/design.md` aggiornato con regola generale per contenuto centrale scrollabile; README non richiesto. |

### TASK-034 - Ricette con ingredienti selezionabili e modifica

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Estendere la creazione ricetta: oltre a nome e tag pasto, l'utente deve poter selezionare uno o piu ingredienti tra quelli presenti tramite multiselect dropdown ricercabile e scrollabile, con massimo 6 ingredienti visibili. Le ricette devono essere editabili/cancellabili e la lista ingredienti deve essere visibile nella card della ricetta. |
| Dipendenze | TASK-014, TASK-015, TASK-024, TASK-032, TASK-033, TASK-038 |
| Requisiti | REQ-005, REQ-006, REQ-008, REQ-010, NFR-008 |
| Documenti | `docs/requirements.md`, `docs/architecture.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | FAB `+` apre creazione ricetta; form ricetta mostra ingredienti disponibili in un multiselect dropdown filtrabile tramite campo ricerca, scrollabile e limitato a 6 voci visibili; salvataggio persiste associazioni ricetta-ingredienti; card ricetta mostra la lista ingredienti associati in modo leggibile e compatto; modifica consente aggiornare nome, tag pasto e ingredienti; cancellazione resta confermata/gestita secondo policy; stati vuoti ingredienti chiari; contrasto e scroll gestiti dai componenti condivisi. |
| Verifica/test | Shell test aggiornato per creazione ricetta con filtro ingredienti, rendering ingredienti nella card e modifica ricetta; test specifico multiselect dropdown con filtro, role checkbox e scroll limitato a 6 voci; `npm run typecheck` OK; `npm run test -- src/test/__tests__/ui.test.tsx src/test/__tests__/App.test.tsx --runInBand` OK; `npm run test -- --runInBand` OK; repository/persistence coprono salvataggio `ingredientIds`. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Log `warn` solo per conflitti cancellazione o associazioni non valide; no log nomi ricette/ingredienti completi. |
| Code docs/README | Aggiornare README se cambia il flusso principale; commenti solo su mapping/policy non ovvie. |

### TASK-035 - Modello dominio e persistenza piani multipli

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Ridefinire il piano come entita multipla con titolo editabile, giorni lunedi-domenica e tre pasti giornalieri. Esempi titolo: `Piano deficit calorico`, `Piano bulk`. |
| Dipendenze | TASK-007, TASK-010, TASK-011, TASK-024 |
| Requisiti | REQ-001, REQ-002, REQ-003, REQ-010 |
| Documenti | `docs/requirements.md`, `docs/architecture.md`, `docs/security.md` |
| Criteri completamento | Esiste una collezione di piani nel modello applicativo; ogni piano ha ID, titolo, settimana lunedi-domenica e slot colazione/pranzo/cena; dati persistono offline; migrazione aggiunge `title` ai database esistenti e inizializza dati assenti in modo sicuro. Modifica titolo da UI demandata a TASK-036. |
| Verifica/test | Unit/domain test struttura piano; migration test upgrade colonna `title`; repository test save/list/find piani con titolo; persistence test load lista piani; `npm run typecheck` OK; `npm run test -- --runInBand` OK. |
| Logging essenziale | Log `info` migrazione piani completata con soli conteggi; `error` storage senza payload sensibili. |
| Code docs/README | Aggiornare README se cambia il modello d'uso; commento breve su migrazione se non immediata. |

### TASK-036 - UI gestione piani selezionabili, editabili e cancellabili

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Consentire all'utente di creare, selezionare, consultare, modificare e cancellare piani disponibili per nome. |
| Dipendenze | TASK-035, TASK-032, TASK-033, TASK-038 |
| Requisiti | REQ-001, REQ-002, REQ-003, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Schermata Piano mostra lista/selettore piani; piano selezionato consultabile; titolo piano editabile; FAB `+` apre il form di creazione e il bottone `Aggiungi` crea un piano vuoto dal titolo inserito; cancellazione piano richiede conferma e lascia uno stato valido; UI usa componenti condivisi leggibili e scrollabili. |
| Verifica/test | UI test creazione, selezione, rinomina e cancellazione piano OK con nuovo form aperto da FAB; `npm run typecheck` OK; `npm run test -- src/test/__tests__/ui.test.tsx src/test/__tests__/App.test.tsx --runInBand` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Log `info` solo per eventi operativi non sensibili se utili; `warn` per cancellazione piano confermata senza dettagli pasti. |
| Code docs/README | README aggiornato con nuovo flusso piani. |

### TASK-037 - Assegnazione pasti nei piani da ricette compatibili

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Nei giorni del piano selezionato, permettere di scegliere per ogni slot pasto solo ricette con tag compatibile: colazione per colazione, pranzo per pranzo, cena per cena. |
| Dipendenze | TASK-034, TASK-035, TASK-036 |
| Requisiti | REQ-003, REQ-004, REQ-006, REQ-011, NFR-008 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Ogni giorno lunedi-domenica mostra tre pasti con intestazione giorno settimana, non data ISO; selezione ricetta filtra per tag corrispondente; ricette incompatibili non sono assegnabili; rimozione/sostituzione pasto disponibile; azioni slot compatte e colorate: icona `+` verde per assegnare, doppia freccia gialla per cambiare, icona cestino/bin rossa per rimuovere; stato vuoto spiega mancanza di ricette compatibili; modifiche persistono nel piano selezionato. |
| Verifica/test | Unit/domain test compatibilita slot-ricetta OK; repository/persistence coprono salvataggio assegnazioni nel piano; UI shell test assegnazione e rimozione slot con azioni iconiche e intestazione `Lunedì` OK; `npm run typecheck` OK; `npm run test -- src/test/__tests__/App.test.tsx src/test/__tests__/mealPlan.test.ts --runInBand` OK; `npm run test -- --runInBand` OK; `npm run build:android` OK; `npm run build:ios` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Log `warn` per tentativi incompatibili gestiti, senza nomi ricette/piani completi. |
| Code docs/README | Aggiornare README se cambia il flusso operativo del piano. |

### TASK-038 - Floating action button coerente per creazione

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Introdurre un floating action button con `+` come pattern coerente per creare piani, ricette e ingredienti. |
| Dipendenze | TASK-012, TASK-013, TASK-032, TASK-033 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/architecture.md` |
| Criteri completamento | Esiste componente/pattern FAB riutilizzabile; il FAB `+` e presente in alto a destra nelle schermate Piano, Ricette e Ingredienti; il FAB apre il form inline al posto del campo sempre visibile; il salvataggio avviene con bottone `Aggiungi` sotto al campo; su Ricette/Ingredienti sostituisce i bottoni testuali sempre visibili; touch target minimo rispettato; non copre contenuti o navbar; accessibile con label specifica; funziona in light/dark tramite token condivisi. |
| Verifica/test | Component/UI test presenza, accessibilita e posizione top-right FAB OK; shell test usa FAB per aprire form e creare ingrediente/ricetta/piano OK; `npm run typecheck` OK; `npm run test -- src/test/__tests__/ui.test.tsx src/test/__tests__/App.test.tsx --runInBand` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | `docs/design.md` aggiornato con convenzione FAB; README non richiesto salvo cambio flusso principale. |

### TASK-039 - Generazione automatica random piano

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Ridefinire `Genera piano` come azione automatica random che crea/compila un piano solo quando sono disponibili abbastanza ricette compatibili. La label deve comunicare automazione, preferibilmente `Genera piano ✨` se supportato correttamente. |
| Dipendenze | TASK-034, TASK-035, TASK-037 |
| Requisiti | REQ-004, REQ-006, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Azione `Genera piano ✨` distinta dal FAB `+` di creazione manuale; genera randomicamente un piano completo solo se esistono ricette sufficienti per coprire lunedi-domenica con colazione/pranzo/cena; in caso di ricette insufficienti non genera piano parziale e mostra messaggio chiaro su cosa manca; ricette assegnate rispettano tag pasto; piano generato ha titolo modificabile; comportamento testabile con random controllato. |
| Verifica/test | Label `Genera piano ✨` coperta da test shell; unit test disponibilita ricette sufficiente/insufficiente per ogni tag pasto OK; unit test random controllato OK; unit test piano invariato se mancano ricette compatibili OK; UI test messaggio ricette insufficienti OK; `npm run typecheck` OK; `npm run test -- src/test/__tests__/generateWeeklyPlan.test.ts src/test/__tests__/App.test.tsx src/test/__tests__/mealPlan.test.ts --runInBand` OK; `npm run test -- --runInBand` OK; `npm run build:android` OK; `npm run build:ios` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Log `info` generazione riuscita con soli conteggi; `warn` ricette insufficienti con conteggi per tag, senza nomi ricette. |
| Code docs/README | README aggiornato con comportamento all-or-nothing di `Genera piano ✨`. |

### TASK-040 - Cancellazioni referenziate con conferma esplicita

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Gestire cancellazione di ingredienti usati da ricette e ricette usate da piani senza cascade silenziose o riferimenti pendenti. |
| Dipendenze | TASK-034, TASK-035, TASK-037 |
| Requisiti | REQ-003, REQ-005, REQ-007, REQ-008, REQ-011 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Primo tentativo su ingrediente referenziato mostra impatto e non cancella; conferma esplicita rimuove l'ingrediente dalle ricette e poi cancella; primo tentativo su ricetta pianificata mostra impatto e non cancella; conferma esplicita rimuove la ricetta da tutti i piani e poi cancella; nessun piano conserva `recipeId` pendenti; messaggi chiari e azioni distruttive evidenziate. |
| Verifica/test | UI shell test ingredienti referenziati OK; UI shell test ricetta pianificata OK; unit/appModel test conferma che una ricetta cancellata viene rimossa da tutti i piani OK; `npm run typecheck` OK; `npm run test -- src/test/__tests__/appModel.test.ts src/test/__tests__/App.test.tsx --runInBand` OK; `npm run test -- --runInBand` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Nessun log con nomi ingredienti/ricette; eventuali warning solo con conteggi. |
| Code docs/README | README non richiesto salvo cambio flusso utente principale. |

### TASK-041 - Reset database locale da Impostazioni

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Aggiungere nella tab `Altro` un'azione per resettare il database locale del dispositivo, utile per sviluppo, test e recupero da stati locali corrotti. |
| Dipendenze | TASK-010, TASK-011, TASK-012, TASK-024 |
| Requisiti | REQ-009, REQ-010, REQ-011 |
| Documenti | `docs/security.md`, `docs/design.md`, `docs/architecture.md` |
| Criteri completamento | `Altro` mostra opzione reset database locale; primo tap mostra conferma e non cancella; secondo tap cancella ingredienti, ricette, piani e preferenze locali; piano iniziale viene ricreato; UI mostra esito o errore; azione distruttiva evidenziata. |
| Verifica/test | Persistence test reset tabelle e piano iniziale OK; UI shell test doppia conferma OK; `npm run typecheck` OK; `npm run test -- src/test/__tests__/appPersistence.test.ts src/test/__tests__/App.test.tsx --runInBand` OK; `npm run test -- --runInBand` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Log `warn` per reset richiesto/completato senza dati utente; log `error` su fallimento senza payload sensibili. |
| Code docs/README | README non richiesto salvo uso fuori sviluppo. |

### TASK-042 - Preferenza tema in tab Altro

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | In `Altro`, permettere all'utente di scegliere esplicitamente tra tema `Sistema`, `Chiaro` e `Scuro`, con applicazione immediata e persistenza locale della preferenza. |
| Dipendenze | TASK-020, TASK-024, TASK-032, TASK-041 |
| Requisiti | REQ-010, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/architecture.md` |
| Criteri completamento | `Altro` mostra un controllo chiaro per la preferenza tema; `Sistema` segue `useColorScheme`; `Chiaro` e `Scuro` forzano il tema indipendentemente dal device; la scelta viene salvata e riletta al riavvio; reset database ripristina il default previsto; testi e stati sono accessibili e leggibili. |
| Verifica/test | Repository/persistence test preferenza tema OK; UI test selezione `Sistema`/`Chiaro`/`Scuro` e applicazione shell OK; reset database ripristina `system`; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 49 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non loggare preferenze utente salvo errori tecnici senza payload sensibili. |
| Code docs/README | README aggiornato solo se cambia il comportamento documentato del tema. |

### TASK-043 - Audit testi italiani UTF-8

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Verificare e correggere tutti i testi visibili in italiano, inclusi accenti, apostrofi, maiuscole/minuscole, messaggi di errore, empty state, conferme e label accessibili, garantendo encoding UTF-8 corretto. |
| Dipendenze | TASK-021, TASK-023, TASK-032, TASK-041, TASK-042 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/security.md` |
| Criteri completamento | Nessun testo visibile presenta mojibake, accenti mancanti dove necessari o formulazioni innaturali; terminologia coerente tra Home, Ricette, Ingredienti, Piano e Altro; messaggi distruttivi restano chiari; label accessibili descrivono l'azione reale; eventuali stringhe tecniche non vengono mostrate all'utente. |
| Verifica/test | Audit stringhe visibili app con correzione accenti (`già`, `è`, `più`, giorni settimana UTF-8); test aggiornati per label corrette; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 46 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README aggiornato solo se emergono istruzioni utente da correggere. |

### TASK-044 - Colori distintivi tag pasto

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Dare ai tag `Colazione`, `Pranzo` e `Cena` colori distintivi e coerenti con la palette, differenziati dai colori base e sufficientemente in risalto in tema chiaro/scuro. |
| Dipendenze | TASK-013, TASK-030, TASK-032, TASK-043 |
| Requisiti | REQ-006, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md` |
| Criteri completamento | Ogni meal tag ha token colore dedicati per background/bordo/testo in light e dark; colori distinguibili tra loro e dai button base; contrasto leggibile negli stati selezionato/non selezionato; uso coerente in Ricette, Piano e ogni altro punto in cui appaiono i tag. |
| Verifica/test | Component/UI test verifica token distintivi meal tag e leggibilita base; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 46 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | `docs/design.md` aggiornato con token/regola dei tag pasto; README non richiesto. |

### TASK-045 - Genera piano con bozza random salvabile

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | MUST |
| Descrizione | Modificare `Genera piano ✨`: deve creare una bozza random del piano popolando gli slot con ricette compatibili; l'utente puo salvare la bozza con un bottone `Salva`. |
| Dipendenze | TASK-034, TASK-035, TASK-037, TASK-039, TASK-040 |
| Requisiti | REQ-001, REQ-003, REQ-004, REQ-006, REQ-011, REQ-012 |
| Documenti | `docs/requirements.md`, `docs/design.md`, `docs/security.md` |
| Criteri completamento | Tap su `Genera piano ✨` verifica disponibilita ricette sufficiente; se sufficiente mostra una bozza completa non ancora persistita come piano definitivo; il bottone `Salva` conferma la bozza sul piano selezionato; premere di nuovo `Genera piano ✨` rigenera random la bozza; le modifiche puntuali agli slot agiscono sulla bozza se presente; in caso di ricette insufficienti resta il messaggio chiaro gia previsto e il piano non viene modificato. |
| Verifica/test | Unit test generatore random con random controllato OK; appModel test bozza non persistita fino a `Salva` OK; UI test ricette insufficienti invariato OK; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 50 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Log `info` solo per bozza generata/salvata con conteggi; `warn` ricette insufficienti con conteggi per tag; nessun nome ricetta o piano nei log. |
| Code docs/README | README aggiornato con nuovo comportamento di `Genera piano ✨`; commenti solo su stato bozza se non immediato. |

### TASK-046 - Refinement card e azioni UI

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Rifinire card e azioni UI su Piano, Ricette e Ingredienti per ridurre rumore visivo e rendere più coerenti gerarchia, tag e comandi distruttivi. |
| Dipendenze | TASK-034, TASK-037, TASK-038, TASK-040, TASK-043, TASK-044 |
| Requisiti | REQ-003, REQ-005, REQ-007, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/security.md` |
| Criteri completamento | I tag pasto hanno larghezza centralizzata e testo su singola riga; nel Piano il tag pasto e compatto e la ricetta e il testo principale; ogni card giorno ha divider sotto il giorno settimana; Ingredienti non mostra metadati non informativi come `Disponibile`; Ricette e Ingredienti usano icona cestino condivisa al posto della scritta `Elimina`; lo stato di conferma distruttiva e visivamente evidente; in Ricette `Modifica` e cestino restano affiancati e allineati a destra. |
| Verifica/test | `npm run typecheck` OK; `npm run test -- --runInBand` OK, 47 test passati; test UI/App coprono tag compatti, larghezza tag, icona cestino accessibile, flussi di conferma e allineamento azioni ricetta. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README non richiesto; componenti condivisi aggiornati dove utile. |

### TASK-047 - Ordinamento inverso lista ricette

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | In Ricette, mostrare le card in ordine inverso di inserimento/modifica coerentemente con Ingredienti, così l'ultima ricetta aggiunta è immediatamente visibile in alto. |
| Dipendenze | TASK-014, TASK-034, TASK-046 |
| Requisiti | REQ-005, REQ-011, REQ-012 |
| Documenti | `docs/design.md` |
| Criteri completamento | La lista Ricette mostra prima gli elementi più recenti; modifica/eliminazione continuano a funzionare; empty state invariato; comportamento coerente con Ingredienti. |
| Verifica/test | UI/App test ordine ricette reverse OK; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 51 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README non richiesto. |

### TASK-048 - Stati selezione tag pasto in Ricette

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Rendere chiaramente distinguibili i tag pasto selezionati/deselezionati nel form Ricette: colore distintivo solo quando selezionati, stato deselezionato neutro/grigio. |
| Dipendenze | TASK-030, TASK-034, TASK-044 |
| Requisiti | REQ-006, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md` |
| Criteri completamento | I tag selezionati usano i colori pasto distintivi; i tag non selezionati usano stile neutro leggibile in light/dark; accessibilità `selected` invariata; nessun testo va a capo. |
| Verifica/test | UI/App test stati selezionato/deselezionato OK; contrasto base verificato; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 51 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Aggiornare `docs/design.md` solo se cambiano token/regole UI. |

### TASK-049 - Apertura multiselect ingredienti senza tastiera al primo tap

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | In mobile, al primo tap su `Cerca ingredienti` nel form Ricette aprire la tendina multiselect senza mostrare la tastiera; al tap successivo sul campo permettere la ricerca testuale con tastiera. |
| Dipendenze | TASK-034, TASK-033 |
| Requisiti | REQ-005, REQ-008, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md` |
| Criteri completamento | Primo tap apre dropdown scrollable senza tastiera; secondo tap/focus esplicito apre tastiera e filtra digitando; comportamento non rompe web/test; dropdown resta max 6 ingredienti visibili; accessibilità e focus restano comprensibili. |
| Verifica/test | Component/UI test apertura dropdown prima della tastiera e filtro OK; verifica manuale mobile demandata a `TASK-027`; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 52 test passati. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README non richiesto. |

### TASK-050 - Bottoni principali Piano full width su mobile

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Nella vista Piano, rendere full width su mobile il bottone `Genera piano ✨` e trattare il nome del piano selezionato come titolo/testo, non come bottone quando non serve selezionare tra più piani. |
| Dipendenze | TASK-036, TASK-039, TASK-045 |
| Requisiti | REQ-003, REQ-004, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md` |
| Criteri completamento | Su mobile `Genera piano ✨` occupa tutta la larghezza disponibile senza testo troncato; il nome del piano selezionato è visibile come titolo/testo in alto e non appare come bottone quando esiste un solo piano; se esistono più piani resta una selezione chiara ma non confondibile con il titolo; nessun overlap con FAB/navbar. |
| Verifica/test | UI/style test titolo piano e `Genera piano ✨` full width OK; verifica manuale mobile demandata a `TASK-027`; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 53 test passati. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README non richiesto. |

### TASK-051 - Eliminazione piano con icona cestino rossa

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Sostituire il bottone testuale `Elimina piano` con un bottone coerente con le altre azioni distruttive: icona cestino condivisa, colore rosso, conferma esplicita invariata. |
| Dipendenze | TASK-036, TASK-040, TASK-046 |
| Requisiti | REQ-003, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/security.md` |
| Criteri completamento | Azione elimina piano usa icona cestino rossa condivisa; label accessibile chiara; stato conferma resta evidente; non si può eliminare l'ultimo piano; comportamento distruttivo invariato; azioni piano allineate a destra. |
| Verifica/test | UI/App test elimina piano con nuova label accessibile e azioni piano allineate a destra OK; conferma doppio tap invariata OK; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 53 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Log esistente invariato; nessun dato utente nei log. |
| Code docs/README | README non richiesto. |

### TASK-052 - Rinomina piano con icona matita bianca

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Sostituire il bottone testuale `Rinomina` del piano con un bottone icona coerente con le azioni slot: icona matita bianca, fill/stile allineato ai bottoni icona esistenti. |
| Dipendenze | TASK-036, TASK-046, TASK-051 |
| Requisiti | REQ-003, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md` |
| Criteri completamento | Azione rinomina piano usa icona matita con colori coerenti col bottone swap: icona/bordo bianchi in dark e sfondo surface; label accessibile chiara; touch target adeguato; feedback `Titolo piano aggiornato.` invariato; UI resta leggibile in light/dark. |
| Verifica/test | UI/App test rinomina piano con nuova label accessibile e colori coerenti col bottone swap OK; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 53 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | README non richiesto. |

### TASK-053 - Localizzazione italiano/inglese e selezione lingua

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | In `Altro`, aggiungere la possibilità di cambiare lingua tra italiano e inglese tramite bandierine; tutte le stringhe visibili e label accessibili devono avere traduzione IT/EN. |
| Dipendenze | TASK-012, TASK-021, TASK-023, TASK-041, TASK-042, TASK-043 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/architecture.md` |
| Criteri completamento | Esiste un dizionario centralizzato IT/EN per testi UI, messaggi, empty state, conferme distruttive, label accessibili e placeholder; `Altro` mostra selettore lingua con bandierine; cambio lingua applicato subito e persistito localmente; default italiano; reset database ripristina default previsto; nessuna stringa utente resta hardcoded fuori dal meccanismo di traduzione salvo nomi dominio/dati inseriti dall'utente. |
| Verifica/test | UI test cambio lingua IT/EN da `Altro` OK; repository/persistence test preferenza lingua OK; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 54 test passati. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non loggare lingua scelta salvo errori tecnici senza payload sensibili. |
| Code docs/README | README aggiornato solo se cambia configurazione/uso rilevante; commenti non necessari salvo helper i18n non ovvi. |

### TASK-054 - Verifica icona app Android, iOS e web

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Verificare che l'icona ufficiale dell'app sia configurata e visibile dove previsto su Android, iOS e web; aggiungere o correggere gli asset mancanti se una piattaforma mostra icone placeholder/default. |
| Dipendenze | TASK-031, TASK-053, TASK-056 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `README.md`, `app.json` |
| Criteri completamento | `app.json` referenzia asset icona validi per Android adaptive icon, iOS app icon e web favicon; i file referenziati esistono in `assets/`; APK Android installato mostra icona corretta nel launcher; web mostra favicon corretta; configurazione iOS pronta per build senza placeholder; eventuali nuove icone rispettano il logo ufficiale e funzionano su sfondi chiari/scuri. |
| Verifica/test | Asset app derivati dal logo minimale generati per `assets/icon.png`, `assets/splash-icon.png`, `assets/favicon.png`, Android adaptive foreground/background/monochrome; `file` conferma dimensioni/formati attesi; controllo visuale icona principale e foreground Android OK; `npx expo config --type public` OK; `npm run build:android` OK; export web in `build/web` OK; `npm run typecheck` OK. Verifica launcher APK/iOS runtime demandata a smoke finale/rebuild. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Aggiornare README solo se cambiano comandi, asset richiesti o note di build/installazione. |

### TASK-055 - PWA installabile da web

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | COULD |
| Descrizione | Rendere la versione web installabile come Progressive Web App, così i browser compatibili possono mostrare l'azione `Installa app`/download nella barra o nel menu senza creare un installer desktop nativo. |
| Dipendenze | TASK-031, TASK-054 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/architecture.md`, `README.md`, `app.json` |
| Criteri completamento | Build web include manifest valido con nome, short name, theme/background color coerenti e icone richieste; esiste service worker/caching minimo compatibile col target Expo web senza rompere persistenza locale; app servita via HTTPS o ambiente locale valido risulta installabile su browser supportati; installazione desktop apre EZ-MEAL in finestra app con icona corretta; comportamento mobile web resta utilizzabile. |
| Verifica/test | `public/manifest.webmanifest`, `public/service-worker.js` e icone PWA 192/512/maskable creati; registrazione manifest/service worker configurata solo su web; `node --check public/service-worker.js` OK; parse manifest OK; `npm run build:web` OK e copia file PWA in `build/web`; server locale su `127.0.0.1:4174` conferma `200 OK` per manifest, service worker e icone; `npm run typecheck` OK; `npm run test -- --runInBand` OK, 54 test passati. Verifica visiva del prompt installazione su Chrome/Edge demandata a smoke/manuale se necessaria. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Aggiornare README con differenza tra PWA installabile e app desktop nativa, comandi build/serve web e prerequisito HTTPS per installazione reale. |

### TASK-056 - Logo minimale ufficiale

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Definire e produrre il logo ufficiale di EZ-MEAL con approccio da Senior Brand/Product Designer: semplice, minimal, riconoscibile, adatto a frontend, documentazione, icone app e PWA. |
| Dipendenze | TASK-044, TASK-053 |
| Requisiti | REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md`, `docs/requirements.md`, `assets/logo/` |
| Criteri completamento | Logo coerente con scopo app e tono visuale; massimo 3 colori; nessun cliche AI/robot/circuiti; leggibile su sfondo chiaro e scuro; funziona in piccolo come icona/favicon e in grande come logo; asset esportati almeno in `assets/logo/logo.png`, `assets/logo/logo-dark.png`, `assets/logo/logo-light.png`, `assets/logo/logo-icon.png` e, se gestibile localmente, `assets/logo/logo.svg`; varianti trasparenti dove possibile. |
| Verifica/test | Controllo visuale manuale su logo orizzontale, variante dark e icona OK; file SVG/PNG richiesti presenti; PNG generati a dimensioni corrette (`960x240` logo, `512x512` icona); audit colori SVG conferma massimo tre colori per variante; `npm run typecheck` OK. Aggiornamento asset app demandato a `TASK-054`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | `docs/design.md` aggiornato con regole logo; README non richiesto. |

### TASK-057 - Hardening persistenza e reset database su APK Android

| Campo | Valore |
| --- | --- |
| Stato | IN_PROGRESS |
| Priorita | MUST |
| Descrizione | Su Android usando l'APK installato, il reset database locale non funziona; verificare e correggere reset, aggiornamento piano e intero flusso dati persistente in runtime release Android. |
| Dipendenze | TASK-010, TASK-011, TASK-024, TASK-035, TASK-041, TASK-045 |
| Requisiti | REQ-001, REQ-002, REQ-003, REQ-004, REQ-009, REQ-010, REQ-011 |
| Documenti | `docs/architecture.md`, `docs/security.md`, `README.md` |
| Criteri completamento | Reset database da tab `Altro` funziona su APK Android con doppia conferma e ripristina stato iniziale coerente; ingredienti, ricette, piani, lingua e tema vengono eliminati/ripristinati secondo policy; creazione/modifica/cancellazione ingredienti e ricette persiste dopo chiusura/riapertura; creazione/rinomina/cancellazione piano e assegnazione/sostituzione/rimozione pasti persistono; generazione piano e salvataggio bozza aggiornano il piano corretto; errori SQLite/repository non mandano l'app in crash e mostrano messaggi sicuri. |
| Verifica/test | Fix codice completato: scritture SQLite serializzate con coda interna; reset sequenziale dopo eventuali snapshot pendenti; save/delete snapshot eseguiti in ordine lineare; test aggiunto per reset durante salvataggio in corso; `npm run typecheck` OK; `npm run test -- src/test/__tests__/appPersistence.test.ts --runInBand` OK; `npm run test -- --runInBand` OK, 55 test passati con warning `act(...)` noti; `npm run build:android` OK. Pendente: rebuild APK EAS e checklist manuale Android installato: reset, CRUD dati, aggiornamento piano, riapertura app. |
| Logging essenziale | Loggare solo eventi tecnici utili a diagnosi reset/persistenza senza includere nomi ricette, ingredienti o dati utente; nessun payload sensibile. |
| Code docs/README | Aggiornare README solo se cambiano comandi build/installazione, note Android o procedura di verifica APK. |

### TASK-058 - Icona matita per modifica ricette

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | In Ricette, sostituire il bottone testuale `Modifica` con il bottone icona matita gia usato nella schermata Piano, mantenendolo affiancato al cestino e allineato a destra. |
| Dipendenze | TASK-046, TASK-052 |
| Requisiti | REQ-005, REQ-011, REQ-012, NFR-008 |
| Documenti | `docs/design.md` |
| Criteri completamento | Il bottone modifica ricetta usa la stessa icona matita/stile base del Piano; label accessibile specifica `Modifica ricetta {{name}}`; azioni Ricette restano allineate a destra e affiancate; comportamento di apertura form modifica invariato; testo visibile `Modifica` non e piu mostrato nella card ricetta. |
| Verifica/test | UI/App test aggiornati per usare label accessibile della matita; test stile conferma coerenza con bottone Piano; `npm run typecheck` OK; `npm run test -- --runInBand` OK. Verifica runtime finale demandata a `TASK-027`. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Estratto `PencilIconButton` condiviso in `src/shared/ui`; README non richiesto. |

### TASK-059 - Improvement ottimizzazione peso APK e bundle

| Campo | Valore |
| --- | --- |
| Stato | TODO |
| Priorita | COULD |
| Descrizione | Analizzare e migliorare il peso della build Android/APK riducendo asset, bundle e dipendenze non necessarie senza cambiare comportamento utente. |
| Dipendenze | TASK-031, TASK-054, TASK-055, TASK-057 |
| Requisiti | REQ-011, NFR-003, NFR-008 |
| Documenti | `docs/architecture.md`, `README.md`, `package.json`, `app.json`, `assets/`, `build/` |
| Criteri completamento | Dimensione bundle/APK misurata prima e dopo; asset immagine/logo/icon auditati per dimensioni e duplicazioni; dipendenze runtime verificate e rimosse solo se inutilizzate; configurazione build controllata per minificazione/tree shaking/asset inclusion compatibili con Expo; nessuna regressione su icone, PWA, SQLite e avvio app; eventuali limiti non risolvibili documentati. |
| Verifica/test | `npm run typecheck` OK; `npm run test -- --runInBand` OK; `npm run build:android` OK; se disponibile, nuova build EAS APK confrontata con la precedente; checklist manuale APK: avvio, icona, reset database, CRUD, piano, PWA/web non regressi se toccati asset condivisi. |
| Logging essenziale | Non richiesto salvo errori build/diagnostica senza dati utente. |
| Code docs/README | Aggiornare README solo se cambiano comandi build, note EAS o raccomandazioni per produrre APK leggero. |

### TASK-060 - Improvement audit componenti duplicati e action buttons

| Campo | Valore |
| --- | --- |
| Stato | TODO |
| Priorita | COULD |
| Descrizione | Controllare tutta la repo per individuare componenti UI duplicati o implementazioni ripetute, con attenzione speciale ai bottoni che eseguono action come aggiungi, modifica, elimina, assegna, rimuovi, cambia/swap e salva. |
| Dipendenze | TASK-013, TASK-038, TASK-046, TASK-051, TASK-052, TASK-058 |
| Requisiti | REQ-011, REQ-012, NFR-007, NFR-008 |
| Documenti | `docs/design.md`, `docs/architecture.md`, `src/shared/ui/`, `src/features/` |
| Criteri completamento | Audit dei componenti UI completato; duplicazioni reali censite; action buttons convergono su componenti condivisi quando il comportamento/stile e equivalente; varianti legittime restano motivate; accessibilita, label, colori e stati pressed/disabled restano coerenti; nessun refactor ampio non necessario. |
| Verifica/test | `rg`/review manuale su componenti e bottoni action; test UI aggiornati solo se cambiano label/struttura; `npm run typecheck` OK; `npm run test -- --runInBand` OK; smoke manuale mirato su Ricette, Ingredienti, Piano e Altro. |
| Logging essenziale | Non richiesto. |
| Code docs/README | Aggiornare `docs/design.md` solo se emergono nuove regole di riuso componenti; README non richiesto salvo variazioni operative. |

### TASK-061 - Improvement modalita lettura/modifica piano

| Campo | Valore |
| --- | --- |
| Stato | DONE |
| Priorita | SHOULD |
| Descrizione | Rendere la schermata Piano coerente con una modalita lettura/modifica: in lettura il piano e consultabile senza controlli di modifica; in modifica compaiono i controlli necessari e il bottone matita diventa un bottone salva con icona floppy disk verde. |
| Dipendenze | TASK-036, TASK-037, TASK-045, TASK-050, TASK-052 |
| Requisiti | REQ-003, REQ-004, REQ-011, REQ-012 |
| Documenti | `docs/design.md`, `src/features/planner/`, `src/shared/ui/` |
| Criteri completamento | Quando il piano e salvato/consultato appare il bottone modifica con icona matita; quando si entra in modifica, al suo posto appare il bottone salva con contorno verde e icona floppy disk verde; in lettura spariscono campo modifica titolo piano, bottoni di modifica dei pasti, rimozione/swap/assegnazione e controlli non necessari; in modifica il titolo e i pasti restano editabili; `Genera piano ✨` appare solo quando il piano selezionato e vuoto; il salvataggio riporta la vista in lettura mantenendo le modifiche; stati vuoti e accessibilita restano chiari. |
| Verifica/test | UI test aggiunti/aggiornati per toggle lettura/modifica Piano, presenza matita vs salva, assenza controlli modifica in lettura, visibilita `Genera piano ✨` solo su piano vuoto e assenza su piano popolato; App flow aggiornato per entrare in modifica prima di assegnare/renominare/generare; `npm run typecheck` OK; `npm run test -- src/test/__tests__/App.test.tsx src/test/__tests__/ui.test.tsx --runInBand` OK, 17 test passati; `npm run test -- --runInBand` OK, 56 test passati con warning `act(...)` noti. Smoke manuale runtime demandato a `TASK-027`. |
| Logging essenziale | Non richiesto salvo errori di persistenza gia coperti da app persistence. |
| Code docs/README | Estratto `SaveIconButton` condiviso in `src/shared/ui`; README non richiesto. |

### TASK-062 - Improvement test workflow EAS APK su branch android-apk

| Campo | Valore |
| --- | --- |
| Stato | IN_PROGRESS |
| Priorita | SHOULD |
| Descrizione | Verificare operativamente che il workflow EAS configurato in `.eas/workflows/android-apk.yml` parta quando si pusha sul branch `android-apk` e produca davvero un APK installabile su Expo/EAS. Owner operativo: utente. |
| Dipendenze | TASK-031, TASK-057 |
| Requisiti | REQ-011, NFR-008 |
| Documenti | `.eas/workflows/android-apk.yml`, `eas.json`, `README.md`, Expo/EAS dashboard |
| Criteri completamento | Repo GitHub collegato correttamente al progetto Expo/EAS; push su branch `android-apk` ricevuto da EAS Workflows; workflow `Build Android APK` avviato automaticamente; job usa profilo `apk` di `eas.json`; output finale e un file `.apk` e non `.aab`; link download disponibile nella dashboard/log EAS; APK installabile su Android. |
| Verifica/test | Utente esegue push su `android-apk`; controlla nella dashboard Expo/EAS che il workflow parta; verifica esito build e formato artifact `.apk`; scarica/installa APK su Android; aggiorna task con esito, link build o nota errore. |
| Logging essenziale | Non loggare token, credenziali Expo/GitHub o dati sensibili nei log/README. |
| Code docs/README | Owner: utente. Aggiornare README solo se emergono passaggi mancanti per collegamento GitHub/EAS, trigger branch o recupero APK. |

### TASK-063 - Import/export DB locale tramite Excel/CSV

| Campo | Valore |
| --- | --- |
| Stato | TODO |
| Priorita | COULD |
| Descrizione | Aggiungere la possibilita di esportare e importare il database locale dell'app tramite file Excel/CSV, includendo ingredienti, ricette, piani settimanali e preferenze utente di lingua/tema. |
| Dipendenze | TASK-010, TASK-011, TASK-034, TASK-035, TASK-041, TASK-057 |
| Requisiti | REQ-003, REQ-004, REQ-005, REQ-007, REQ-010, REQ-011, REQ-012 |
| Documenti | `docs/security.md`, `README.md`, `IMPORT_EXPORT.md`, `src/data/`, `src/features/` |
| Criteri completamento | Definita struttura stabile del file di export/import per Excel e/o CSV; esportazione include ingredienti, ricette, piani, lingua e tema; import valida formato, versioning schema, campi obbligatori, duplicati, riferimenti tra ricette/ingredienti e piani/ricette; import gestisce errori senza corrompere i dati esistenti; utente vede riepilogo/feedback prima o dopo import; privacy e sicurezza rispettate; `IMPORT_EXPORT.md` spiega struttura, colonne/sheet, valori ammessi, esempi minimi e regole di compatibilita. |
| Verifica/test | Unit/integration test per serializer/parser, validazioni, riferimenti mancanti, duplicati e preferenze; test repository/persistence se import scrive DB; `npm run typecheck` OK; `npm run test -- --runInBand` OK; smoke manuale export -> import su dataset reale; file generato apribile in Excel/LibreOffice o parser CSV previsto. |
| Logging essenziale | Loggare solo eventi tecnici import/export e conteggi, senza contenuto di ingredienti, ricette, piani o preferenze utente. |
| Code docs/README | Creare `IMPORT_EXPORT.md`; aggiornare README con link al documento e istruzioni operative se la funzionalita viene implementata. |

## 6. Regole di aggiornamento

- Aggiornare lo stato del task nello stesso branch/PR della modifica.
- Segnare `IN_PROGRESS` quando il lavoro inizia.
- Segnare `DONE` solo dopo completamento criteri, verifica/test e aggiornamenti README/code docs rilevanti.
- Segnare `BLOCKED` con motivo minimo e dipendenza mancante.
- Segnare `DEFERRED` con motivazione breve e, se utile, collegamento a `DEBT-*` o `FUTURE-*`.
- Non chiudere task con test non eseguiti senza indicare rischio residuo.
- Quando una scelta cambia architettura, sicurezza o UX, aggiornare anche `docs/decisions.md` se significativo.

## 7. Testing

- Unit test obbligatori per domain rules, validazioni e generatore.
- Integration test obbligatori per repository, migrazioni e persistenza.
- Component/UI test per form, stati vuoti/errori, home, piano e tema.
- Flow/E2E o smoke manuale per MVP completo.
- Mock controllati per clock, random e repository quando serve verificabilita deterministica.

## 8. Sicurezza integrata

- Ogni task con storage usa query parametrizzate e gestione errori sicura.
- Ogni task con logging deve rispettare redaction e divieto di dati sensibili.
- Ogni task con azioni distruttive deve includere conferma o gestione impatto.
- Ogni task con rete futura va bloccato finche non esiste requisito e decisione documentata.

## 9. Debito tecnico

| ID | Stato | Descrizione | Motivo rinvio | Rientro |
| --- | --- | --- | --- | --- |
| DEBT-001 | TODO | Definire soglie numeriche per performance e dimensioni dataset personali. | Requirements indicano soglie da definire. | Prima di ottimizzazioni o rilascio pubblico. |
| DEBT-002 | DONE | Policy duplicati ingredienti/ricette definita e applicata: nomi unici case-insensitive dopo trim. | Risolto in `createAppActions` con test modello dedicati. | `npm run typecheck` OK; `npm run test -- --runInBand` OK, 45 test passati. |
| DEBT-003 | TODO | Valutare cifratura locale aggiuntiva. | Non richiesta nel MVP; rischio principale e accesso fisico dispositivo. | Se requisiti/privacy evolvono. |

## 10. Funzionalita future

| ID | Stato | Descrizione | Motivo esclusione MVP |
| --- | --- | --- | --- |
| FUTURE-001 | DEFERRED | Lista della spesa. | Evoluzione futura in requirements. |
| FUTURE-002 | DEFERRED | Preferenze alimentari, calorie, porzioni, statistiche. | Escluse dal MVP. |
| FUTURE-003 | DEFERRED | Account, cloud sync, backup remoto. | Esclusi dal MVP e richiedono nuova security/privacy review. |
| FUTURE-004 | DEFERRED | Import/export dati tramite Excel/CSV. | Tracciato in `TASK-063`; richiede struttura file documentata, validazioni, path validation e policy privacy. |
| FUTURE-005 | DEFERRED | Notifiche e condivisione. | Escluse dal MVP. |

## 11. Tracciabilita

| Requisito | Task principali | Decisioni future |
| --- | --- | --- |
| REQ-001 | TASK-019, TASK-027, TASK-035, TASK-036, TASK-045, TASK-057 | Calendario locale se impatta "oggi" |
| REQ-002 | TASK-007, TASK-016, TASK-027, TASK-035, TASK-036, TASK-057 | Primo giorno settimana |
| REQ-003 | TASK-007, TASK-017, TASK-027, TASK-035, TASK-036, TASK-037, TASK-040, TASK-045, TASK-046, TASK-050, TASK-051, TASK-052, TASK-057 | Policy conflitti/cancellazioni |
| REQ-004 | TASK-008, TASK-018, TASK-027, TASK-037, TASK-039, TASK-045, TASK-050, TASK-057 | `Genera piano` e automazione random; creazione manuale tramite FAB `+`; bozza random salvabile |
| REQ-005 | TASK-005, TASK-014, TASK-034, TASK-040, TASK-046, TASK-047, TASK-049, TASK-058 | Eliminazione ricette referenziate |
| REQ-006 | TASK-004, TASK-005, TASK-014, TASK-017, TASK-030, TASK-034, TASK-037, TASK-039, TASK-044, TASK-045, TASK-048 | Nessuna |
| REQ-007 | TASK-006, TASK-015, TASK-040, TASK-046 | Eliminazione ingredienti referenziati |
| REQ-008 | TASK-006, TASK-015, TASK-034, TASK-040, TASK-049 | Uso ingredienti nella generazione |
| REQ-009 | TASK-010, TASK-024, TASK-025, TASK-057 | Nessuna rete MVP |
| REQ-010 | TASK-010, TASK-011, TASK-024, TASK-034, TASK-035, TASK-042, TASK-057 | Cifratura/backup futuri |
| REQ-011 | TASK-001, TASK-012, TASK-023, TASK-027, TASK-031, TASK-032, TASK-033, TASK-036, TASK-037, TASK-038, TASK-039, TASK-042, TASK-043, TASK-044, TASK-045, TASK-046, TASK-047, TASK-048, TASK-049, TASK-050, TASK-051, TASK-052, TASK-053, TASK-054, TASK-055, TASK-056, TASK-057, TASK-058 | Limitazioni piattaforma |
| REQ-012 | TASK-013, TASK-020, TASK-023, TASK-030, TASK-032, TASK-036, TASK-038, TASK-039, TASK-042, TASK-043, TASK-044, TASK-045, TASK-046, TASK-047, TASK-048, TASK-049, TASK-050, TASK-051, TASK-052, TASK-053, TASK-054, TASK-055, TASK-056, TASK-058 | Preferenza tema e lingua |
