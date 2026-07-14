# Architecture

Fonte di verita delle scelte tecniche e strutturali di EZ-MEAL. Le scelte qui definite servono i requisiti in `docs/requirements.md`.

## 1. Overview

EZ-MEAL e un'app client-only, offline-first, con dati locali e nessun backend nel MVP. La UI espone home giornaliera, piano settimanale, ricette, ingredienti e tema; la logica applicativa valida regole di dominio e coordina persistenza locale.

| Driver | Scelta architetturale | Requisiti |
| --- | --- | --- |
| iPhone, Android, web | Codebase React Native unica con supporto web | REQ-011, NFR-003 |
| Offline e dati locali | Storage locale transazionale | REQ-009, REQ-010, NFR-002, NFR-007 |
| Regole pasto/ricetta | Domain layer puro e testabile | REQ-003, REQ-004, REQ-006 |
| MVP piccolo | Client monolitico modulare, nessun servizio remoto | REQ-001..REQ-012 |
| Tema chiaro/scuro | Design tokens e preferenza tema locale/sistema | REQ-012 |

## 2. Stack tecnologico

| Area | Scelta | Motivazione |
| --- | --- | --- |
| Linguaggio | TypeScript | Tipizzazione per entita, use case, validazioni e refactoring sicuro. |
| Framework app | React Native con Expo | Copre iOS, Android e web con una codebase e riduce complessita operativa MVP. |
| Navigazione | Expo Router | Routing file-based coerente con Expo e sufficiente per le schermate previste. |
| Persistenza | SQLite locale tramite libreria Expo compatibile | Dati strutturati, query locali, transazioni, offline nativo. |
| Stato UI | React state/hooks; Context solo per stato globale minimo | Evita dipendenze non necessarie; sufficiente per tema e stato schermata. |
| Form e validazioni | Validazioni TypeScript/funzioni pure nel domain layer | Le regole sono poche e testabili senza introdurre librerie dedicate. |
| Date | Utility interne basate su API standard | Settimana/giorno sono semplici; librerie date solo se emergono requisiti locali complessi. |
| Test | Jest + React Native Testing Library | Unit test di dominio e test componenti/interazioni principali. |
| Servizi esterni | Nessuno nel MVP | Offline-first, privacy locale, nessun account/sync richiesto. |

Punti aperti: soglie prestazionali numeriche, gestione duplicati ingredienti, primo giorno settimana e uso vincolante degli ingredienti nella generazione randomica.

## 3. Architettura applicativa

Layer consentiti:

| Layer | Responsabilita | Dipendenze consentite |
| --- | --- | --- |
| `app` | Route, layout, composizione schermate | `features`, `shared/ui`, `shared/theme` |
| `features` | Schermate e controller UI per dominio funzionale | `domain`, `data`, `shared` |
| `domain` | Entita, tipi, regole, validazioni, use case puri | Nessuna dipendenza da UI o storage |
| `data` | Repository, mapping storage, migrazioni, persistenza locale | `domain`, driver SQLite |
| `shared` | UI base, tema, logging, errori, utility comuni | Nessuna dipendenza da feature |

Regole:

- La UI non accede direttamente al database.
- I repository non contengono logica di presentazione.
- Le regole di compatibilita pasto/ricetta vivono nel domain layer.
- I use case espongono risultati espliciti: successo, validazione fallita, errore tecnico.
- Nessun modulo MVP dipende da rete o servizi remoti.

## 4. Struttura progetto

```text
/
  app/                         # Route Expo: home, planner, recipes, ingredients, settings
  src/
    domain/
      mealTypes.ts             # colazione/pranzo/cena
      recipes/                 # entita, validazioni, use case ricette
      ingredients/             # entita, validazioni, use case ingredienti
      planning/                # piano settimanale, slot, generazione
    data/
      db/                      # apertura DB, schema, migrazioni
      repositories/            # implementazioni repository locali
      mappers/                 # conversione DB <-> domain
    features/
      home/
      planner/
      recipes/
      ingredients/
      settings/
    shared/
      ui/
      theme/
      errors/
      logging/
      utils/
    test/
      fixtures/
      builders/
  docs/
```

Convenzioni:

- File e cartelle in `camelCase` o `kebab-case` secondo convenzione Expo locale; scegliere una sola convenzione al bootstrap.
- Componenti React in `PascalCase`.
- Tipi dominio con nomi espliciti: `Recipe`, `Ingredient`, `MealPlan`, `MealSlot`.
- Use case con verbo: `createRecipe`, `assignRecipeToSlot`, `generateWeeklyPlan`.

## 5. Componenti principali

| Componente | Responsabilita | Requisiti |
| --- | --- | --- |
| Home feature | Carica data corrente e slot del giorno; mostra stati pieni/vuoti | REQ-001 |
| Planner feature | Visualizza settimana, modifica slot, avvia generazione | REQ-002, REQ-003, REQ-004 |
| Recipe feature | CRUD ricette e label pasto | REQ-005, REQ-006 |
| Ingredient feature | CRUD ingredienti disponibili | REQ-007, REQ-008 |
| Theme feature | Applica tema chiaro/scuro e default leggibile | REQ-012 |
| Planning domain | Regole settimana, slot, compatibilita ricetta/pasto, generatore randomico | REQ-002, REQ-003, REQ-004 |
| Local repositories | Persistono e leggono dati locali | REQ-009, REQ-010 |
| Validation module | Normalizza input e restituisce errori utente | REQ-005, REQ-007 |

## 6. Modello dati

Entita domain-level:

| Entita | Campi principali | Relazioni |
| --- | --- | --- |
| `Recipe` | `id`, `name`, `mealTypes[]`, `ingredientIds[]`, `notes?`, `createdAt`, `updatedAt` | Molti-a-molti con `Ingredient`; usata da `MealSlot` |
| `Ingredient` | `id`, `name`, `available`, `createdAt`, `updatedAt` | Molti-a-molti con `Recipe` |
| `MealPlan` | `id`, `weekStartDate`, `days[]`, `createdAt`, `updatedAt` | Contiene 7 `PlanDay` |
| `PlanDay` | `date`, `slots[]` | Contiene 3 `MealSlot` |
| `MealSlot` | `date`, `mealType`, `recipeIds[]` | Punta a zero o piu `Recipe` compatibili |
| `UserPreference` | `themeMode` | Locale, nessun account |

Regole dati:

- `mealType` ammette solo `breakfast`, `lunch`, `dinner` internamente; etichette UI localizzate in italiano.
- Uno slot puo avere zero, una o piu ricette.
- Ogni ricetta assegnata deve includere il `mealType` dello slot.
- La stessa ricetta non deve essere duplicata nello stesso slot.
- Le eliminazioni che impattano piani o relazioni devono produrre esito esplicito: blocco, cascade controllato o conferma utente. La policy finale va registrata in `docs/decisions.md`.

## 7. Flussi applicativi

Home giornaliera:

```text
App start -> resolve today -> load week plan -> extract today slots -> load linked recipes -> render slots/stati vuoti
```

Modifica slot:

```text
Open planner -> select slot -> list compatible recipes not already assigned -> validate assignment -> append recipe to slot -> optionally remove single recipes -> save slot -> refresh week and home data
```

Generazione piano:

```text
User requests generation -> load recipes -> group by mealType -> fill 7x3 slots with compatible random recipes -> report uncovered slots -> persist after confirmation
```

Salvataggio ricetta:

```text
Recipe form -> normalize input -> validate name and mealTypes -> save recipe -> refresh recipe list and compatible planner options
```

## 8. Error handling e logging

Errori applicativi:

- `ValidationError`: input mancante, label assente, ricetta incompatibile.
- `NotFoundError`: entita richiesta non presente.
- `PersistenceError`: fallimento lettura/scrittura locale.
- `DomainConflictError`: eliminazione o modifica con impatti su piani/relazioni.

Regole:

- Gli errori di validazione mostrano messaggi utente specifici e non vengono loggati come errori tecnici.
- Gli errori di persistenza sono gestiti con messaggio utente non tecnico e log diagnostico.
- I use case restituiscono errori tipizzati; evitare eccezioni non gestite nei componenti UI.
- Nessun log deve contenere dati alimentari dettagliati se non necessario alla diagnosi.

Osservabilita MVP:

- Logging locale/console in sviluppo.
- Nessun servizio remoto di monitoraggio nel MVP.
- Correlation/request id non necessario per flussi sincroni locali; introdurlo solo per future operazioni multi-step asincrone, import/export o sync.

## 9. Configurazione

Configurazioni previste:

| Chiave | Uso | Segreto |
| --- | --- | --- |
| `APP_ENV` | Ambiente applicativo: development/test/production | No |
| `LOG_LEVEL` | Verbosita log in sviluppo/test | No |
| `DB_NAME` | Nome storage locale | No |

Regole:

- Nessun segreto richiesto nel MVP.
- Non committare valori sensibili se introdotti in futuro.
- Dettagli su segreti, privacy e hardening devono stare in `docs/security.md`.

## 10. Performance e scalabilita

Misure giustificate dai requisiti:

- Query locali indicizzate su `weekStartDate`; gli slot sono salvati nel JSON del piano con `date`, `mealType`, `recipeIds[]`.
- Caricamento home limitato alla settimana corrente e alle ricette referenziate.
- Generazione piano eseguita in memoria su dataset personale, senza rete.
- Componenti lista per ricette/ingredienti preparati a dataset personali realistici.
- Migrazioni DB incrementali e idempotenti.

Soglie numeriche da definire quando `docs/requirements.md` specifichera volumi e tempi.

## 11. Testing strategy

| Tipo | Target | Criteri |
| --- | --- | --- |
| Unit | Domain rules, validazioni, generatore randomico | Coprire compatibilita label, slot vuoti, ricette insufficienti, input non validi |
| Repository integration | Persistenza locale e migrazioni | Salvare/rileggere ricette, ingredienti, piani, preferenze |
| Component | Home, planner, form ricetta/ingrediente | Stati pieni/vuoti, errori validazione, tema base |
| Flow test | Modifica slot, generazione piano, riapertura dati | Verificare requisiti MUST principali |
| Mock | Storage e clock | Clock controllato per home giornaliera; repository fake per UI |

La logica di dominio deve essere testabile senza rendering UI e senza database reale.

## 12. Convenzioni di sviluppo

- Preferire funzioni pure per regole di dominio.
- Usare tipi espliciti per `Result`, errori, ID e `MealType`.
- Evitare dipendenze circolari tra layer.
- Evitare librerie per problemi gia coperti dallo stack o da poche funzioni interne.
- Separare DTO/storage model dal modello di dominio quando i formati divergono.
- Centralizzare costanti di dominio: tipi pasto, stati vuoti, error codes.
- Ogni nuova scelta architetturale non ovvia va registrata in `docs/decisions.md`.
- Documentare codice solo dove aumenta comprensione di vincoli, trade-off o assunzioni.

## 13. Code documentation policy

- Commenti in inglese.
- Breve Javadoc/TSDoc sulle classi o moduli applicativi principali quando espongono responsabilita non ovvie.
- Commenti su metodi o passaggi solo per logica non immediata, vincoli di dominio, trade-off o assunzioni.
- Evitare commenti banali o duplicativi rispetto a nomi di classi, metodi e variabili.
- I commenti non sostituiscono nomi chiari, tipi espliciti e test.

## 14. Logging policy

Livelli:

- `debug`: dettagli temporanei utili in sviluppo, disabilitati in produzione.
- `info`: eventi applicativi significativi, es. migrazione completata o generazione piano confermata.
- `warn`: condizioni recuperabili, es. ricette insufficienti per coprire tutti gli slot.
- `error`: fallimenti tecnici gestiti, es. errore persistenza.

Regole:

- Loggare confini del sistema: apertura storage, migrazioni, salvataggi falliti.
- Loggare decisioni operative rilevanti: generazione con slot scoperti, conflitti su eliminazione.
- Evitare log di ingresso/uscita metodo, duplicati, temporanei o rumorosi.
- Non loggare contenuti personali estesi; usare conteggi, ID tecnici o categorie quando bastano.
- Usare correlation/request id solo se vengono introdotti flussi multi-step asincroni, API o sync.

## 15. README guidance

`README.md` dovrebbe includere, quando disponibili:

- Scopo sintetico del progetto.
- Stack scelto e motivazione breve.
- Prerequisiti locali.
- Comandi di installazione, avvio, test e build.
- Configurazione essenziale senza segreti.
- Struttura progetto e entry point principali.
- Rimandi a `docs/requirements.md`, `docs/architecture.md`, `docs/security.md`, `docs/tasks.md`, `docs/decisions.md`.
- Note su offline-first, dati locali e piattaforme target.

## 16. Decisioni architetturali

Registrare in `docs/decisions.md` le decisioni con questo formato minimo:

| Campo | Contenuto |
| --- | --- |
| Decisione | Scelta tecnica o strutturale |
| Motivazione | Requisiti e vincoli che la rendono necessaria |
| Alternative | Opzioni considerate e motivo dello scarto |
| Impatto | Effetti su sviluppo, test, performance, operativita o evoluzione |

Decisioni gia da registrare:

- React Native + Expo per target iOS/Android/web.
- SQLite locale per persistenza offline strutturata.
- Nessun backend o servizio remoto nel MVP.
- Domain layer puro separato da UI e storage.
- Policy finale per eliminazione ricette/ingredienti referenziati.
- Definizione calendario: primo giorno settimana e gestione locale/date.
