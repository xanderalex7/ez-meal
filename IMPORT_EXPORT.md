# Import/export CSV

Questo documento definisce il formato CSV unico per esportare e importare i dati locali di EZ-MEAL.

Il documento deve essere comprensibile sia da persone sia da LLM: leggendo questa specifica deve essere possibile creare direttamente un CSV valido con ingredienti, ricette, preferenze e uno o piu piani gia pronti.

## Obiettivo

EZ-MEAL usa un solo file CSV UTF-8 come fonte di verita per import/export. Il formato e leggero, leggibile in editor testuali, apribile in Excel/LibreOffice e non richiede librerie XLSX nell'APK Android.

## File

Nome consigliato:

```text
ez-meal-export.csv
```

Il file contiene righe di tipo diverso. La colonna `record_type` indica come interpretare ogni riga.

## Regole CSV

- Encoding: UTF-8.
- Separatore colonne: virgola `,`.
- Prima riga obbligatoria: header esatto definito in questo documento.
- Fine riga: `LF` o `CRLF`.
- Valori vuoti: cella vuota.
- Booleani: `true` o `false`.
- Date/ora: ISO 8601 UTC, esempio `2026-07-04T12:00:00.000Z`.
- Date giorno: ISO `YYYY-MM-DD`, esempio `2026-06-29`.
- Liste: valori separati da punto e virgola `;`, senza spazi, esempio `lunch;dinner`.
- Escape CSV: valori con virgola, virgolette o newline devono essere racchiusi tra virgolette doppie; le virgolette interne si raddoppiano.
- Gli ID sono stringhe stabili usate per collegare righe diverse.
- L'ordine consigliato delle righe e: `metadata`, `preference`, `ingredient`, `recipe`, `recipe_ingredient`, `meal_plan`, `meal_slot`.

## Header obbligatorio

Il CSV deve usare esattamente queste colonne, in questo ordine:

```csv
record_type,id,parent_id,key,name,value,available,meal_types,date,meal_type,recipe_id,week_start_date,created_at,updated_at,notes
```

## Tipi di riga

| `record_type` | Scopo |
| --- | --- |
| `metadata` | Versione formato e informazioni generali. |
| `preference` | Preferenze utente: lingua e tema. |
| `ingredient` | Ingredienti disponibili. |
| `recipe` | Ricette e tag pasto. |
| `recipe_ingredient` | Collegamento tra ricette e ingredienti. |
| `meal_plan` | Piano settimanale. |
| `meal_slot` | Singolo slot pasto di un piano. |

## Colonne per tipo riga

### metadata

Usare una riga per ogni metadato.

| Colonna | Obbligatoria | Valori | Note |
| --- | --- | --- | --- |
| `record_type` | Si | `metadata` | Tipo riga. |
| `id` | Si | `format`, `export` | Chiave metadato. |
| `key` | Si | `schema_version`, `app_name`, `exported_at` | Nome metadato. |
| `value` | Si | string | Valore metadato. |

Righe minime richieste:

```csv
metadata,format,,schema_version,,1,,,,,,,,,
metadata,export,,app_name,,EZ-MEAL,,,,,,,,,
metadata,export,,exported_at,,2026-07-14T10:00:00.000Z,,,,,,,,,
```

### preference

Usare una riga per preferenza.

| Colonna | Obbligatoria | Valori | Note |
| --- | --- | --- | --- |
| `record_type` | Si | `preference` | Tipo riga. |
| `id` | Si | `language`, `themeMode` | ID preferenza. |
| `key` | Si | uguale a `id` | Ridondante ma leggibile. |
| `value` | Si | `it`, `en`, `system`, `light`, `dark` | `language`: `it`/`en`; `themeMode`: `system`/`light`/`dark`. |
| `updated_at` | Si | ISO datetime | Ultimo aggiornamento. |

Esempio:

```csv
preference,language,,language,,it,,,,,,,,2026-07-14T10:00:00.000Z,
preference,themeMode,,themeMode,,system,,,,,,,,2026-07-14T10:00:00.000Z,
```

### ingredient

| Colonna | Obbligatoria | Valori | Note |
| --- | --- | --- | --- |
| `record_type` | Si | `ingredient` | Tipo riga. |
| `id` | Si | string | ID ingrediente. |
| `name` | Si | string non vuota | Nome ingrediente. |
| `available` | Si | `true`, `false` | Disponibilita locale. |
| `created_at` | Si | ISO datetime | Creazione. |
| `updated_at` | Si | ISO datetime | Ultimo aggiornamento. |

Esempio:

```csv
ingredient,ingredient-1,,,Pomodoro,,true,,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
ingredient,ingredient-2,,,Pasta,,true,,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
```

### recipe

| Colonna | Obbligatoria | Valori | Note |
| --- | --- | --- | --- |
| `record_type` | Si | `recipe` | Tipo riga. |
| `id` | Si | string | ID ricetta. |
| `name` | Si | string non vuota | Nome ricetta. |
| `meal_types` | Si | `breakfast`, `lunch`, `dinner` separati da `;` | Almeno un valore. |
| `created_at` | Si | ISO datetime | Creazione. |
| `updated_at` | Si | ISO datetime | Ultimo aggiornamento. |
| `notes` | No | string | Note opzionali. |

Esempio:

```csv
recipe,recipe-1,,,Pasta al pomodoro,,,lunch;dinner,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
```

### recipe_ingredient

Usare una riga per ogni ingrediente presente in una ricetta.

| Colonna | Obbligatoria | Valori | Note |
| --- | --- | --- | --- |
| `record_type` | Si | `recipe_ingredient` | Tipo riga. |
| `id` | Si | string | ID univoco relazione, consigliato: `recipeId__ingredientId`. |
| `parent_id` | Si | string | ID ricetta, deve esistere in una riga `recipe`. |
| `value` | Si | string | ID ingrediente, deve esistere in una riga `ingredient`. |

Esempio:

```csv
recipe_ingredient,recipe-1__ingredient-1,recipe-1,,,ingredient-1,,,,,,,,,
recipe_ingredient,recipe-1__ingredient-2,recipe-1,,,ingredient-2,,,,,,,,,
```

### meal_plan

| Colonna | Obbligatoria | Valori | Note |
| --- | --- | --- | --- |
| `record_type` | Si | `meal_plan` | Tipo riga. |
| `id` | Si | string | ID piano. |
| `name` | Si | string non vuota | Titolo piano. |
| `week_start_date` | Si | `YYYY-MM-DD` | Lunedi della settimana del piano. |
| `created_at` | Si | ISO datetime | Creazione. |
| `updated_at` | Si | ISO datetime | Ultimo aggiornamento. |

Esempio:

```csv
meal_plan,plan-current,,,Piano settimanale,,,,,,,2026-06-29,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
```

### meal_slot

Ogni piano deve avere 21 righe `meal_slot`: 7 giorni x 3 pasti.

| Colonna | Obbligatoria | Valori | Note |
| --- | --- | --- | --- |
| `record_type` | Si | `meal_slot` | Tipo riga. |
| `id` | Si | string | ID slot, consigliato: `planId__date__mealType`. |
| `parent_id` | Si | string | ID piano, deve esistere in una riga `meal_plan`. |
| `date` | Si | `YYYY-MM-DD` | Giorno dello slot. |
| `meal_type` | Si | `breakfast`, `lunch`, `dinner` | Tipo pasto. |
| `recipe_id` | No | string o lista `;` | Vuoto se slot non assegnato; se presente contiene uno o piu ID ricetta separati da `;`, tutti esistenti in righe `recipe`. |

Esempio:

```csv
meal_slot,plan-current__2026-06-29__breakfast,plan-current,,,,,,2026-06-29,breakfast,,,,,
meal_slot,plan-current__2026-06-29__lunch,plan-current,,,,,,2026-06-29,lunch,recipe-1,,,,
meal_slot,plan-current__2026-06-29__dinner,plan-current,,,,,,2026-06-29,dinner,recipe-1,,,,
```

Esempio slot con piu ricette gia definite nel file:

```csv
meal_slot,plan-current__2026-06-29__lunch,plan-current,,,,,,2026-06-29,lunch,recipe-riso;recipe-pollo;recipe-frutta,,,,
```

## Esempio completo minimo

Questo esempio contiene:

- lingua italiana;
- tema di sistema;
- 2 ingredienti;
- 1 ricetta pranzo/cena;
- 1 piano settimanale con 21 slot;
- pranzo e cena del lunedi assegnati alla ricetta.

```csv
record_type,id,parent_id,key,name,value,available,meal_types,date,meal_type,recipe_id,week_start_date,created_at,updated_at,notes
metadata,format,,schema_version,,1,,,,,,,,,
metadata,export,,app_name,,EZ-MEAL,,,,,,,,,
metadata,export,,exported_at,,2026-07-14T10:00:00.000Z,,,,,,,,,
preference,language,,language,,it,,,,,,,,2026-07-14T10:00:00.000Z,
preference,themeMode,,themeMode,,system,,,,,,,,2026-07-14T10:00:00.000Z,
ingredient,ingredient-1,,,Pomodoro,,true,,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
ingredient,ingredient-2,,,Pasta,,true,,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
recipe,recipe-1,,,Pasta al pomodoro,,,lunch;dinner,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
recipe_ingredient,recipe-1__ingredient-1,recipe-1,,,ingredient-1,,,,,,,,,
recipe_ingredient,recipe-1__ingredient-2,recipe-1,,,ingredient-2,,,,,,,,,
meal_plan,plan-current,,,Piano settimanale,,,,,,,2026-06-29,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,
meal_slot,plan-current__2026-06-29__breakfast,plan-current,,,,,,2026-06-29,breakfast,,,,,
meal_slot,plan-current__2026-06-29__lunch,plan-current,,,,,,2026-06-29,lunch,recipe-1,,,,
meal_slot,plan-current__2026-06-29__dinner,plan-current,,,,,,2026-06-29,dinner,recipe-1,,,,
meal_slot,plan-current__2026-06-30__breakfast,plan-current,,,,,,2026-06-30,breakfast,,,,,
meal_slot,plan-current__2026-06-30__lunch,plan-current,,,,,,2026-06-30,lunch,,,,,
meal_slot,plan-current__2026-06-30__dinner,plan-current,,,,,,2026-06-30,dinner,,,,,
meal_slot,plan-current__2026-07-01__breakfast,plan-current,,,,,,2026-07-01,breakfast,,,,,
meal_slot,plan-current__2026-07-01__lunch,plan-current,,,,,,2026-07-01,lunch,,,,,
meal_slot,plan-current__2026-07-01__dinner,plan-current,,,,,,2026-07-01,dinner,,,,,
meal_slot,plan-current__2026-07-02__breakfast,plan-current,,,,,,2026-07-02,breakfast,,,,,
meal_slot,plan-current__2026-07-02__lunch,plan-current,,,,,,2026-07-02,lunch,,,,,
meal_slot,plan-current__2026-07-02__dinner,plan-current,,,,,,2026-07-02,dinner,,,,,
meal_slot,plan-current__2026-07-03__breakfast,plan-current,,,,,,2026-07-03,breakfast,,,,,
meal_slot,plan-current__2026-07-03__lunch,plan-current,,,,,,2026-07-03,lunch,,,,,
meal_slot,plan-current__2026-07-03__dinner,plan-current,,,,,,2026-07-03,dinner,,,,,
meal_slot,plan-current__2026-07-04__breakfast,plan-current,,,,,,2026-07-04,breakfast,,,,,
meal_slot,plan-current__2026-07-04__lunch,plan-current,,,,,,2026-07-04,lunch,,,,,
meal_slot,plan-current__2026-07-04__dinner,plan-current,,,,,,2026-07-04,dinner,,,,,
meal_slot,plan-current__2026-07-05__breakfast,plan-current,,,,,,2026-07-05,breakfast,,,,,
meal_slot,plan-current__2026-07-05__lunch,plan-current,,,,,,2026-07-05,lunch,,,,,
meal_slot,plan-current__2026-07-05__dinner,plan-current,,,,,,2026-07-05,dinner,,,,,
```

## Prompt operativo per creare un CSV

Per generare un CSV valido, seguire questi passi:

1. Scrivere sempre l'header obbligatorio.
2. Aggiungere tre righe `metadata`: `schema_version`, `app_name`, `exported_at`.
3. Aggiungere due righe `preference`: `language` e `themeMode`.
4. Creare una riga `ingredient` per ogni ingrediente.
5. Creare una riga `recipe` per ogni ricetta.
6. Per ogni ingrediente della ricetta, creare una riga `recipe_ingredient`.
7. Creare una riga `meal_plan` per ogni piano.
8. Per ogni piano, creare esattamente 21 righe `meal_slot`.
9. Ogni `meal_slot.recipe_id` deve essere vuoto oppure contenere uno o piu ID ricetta separati da `;`.
10. Ogni ID in `meal_slot.recipe_id` deve puntare a una ricetta esistente.
11. Ogni ricetta assegnata a uno slot deve contenere il `meal_type` dello slot tra i propri `meal_types`.

## Validazioni import

L'import deve fallire senza modificare il database se:

- manca l'header obbligatorio;
- manca una colonna obbligatoria;
- `schema_version` non e `1`;
- `record_type` contiene valori non documentati;
- un ID obbligatorio e vuoto;
- un nome obbligatorio e vuoto;
- `available` non e `true` o `false`;
- `meal_type` o `meal_types` contiene valori diversi da `breakfast`, `lunch`, `dinner`;
- `language` non e `it` o `en`;
- `themeMode` non e `system`, `light` o `dark`;
- una data non rispetta il formato previsto;
- una relazione punta a ingredienti, ricette o piani inesistenti;
- una ricetta assegnata a uno slot non e compatibile con il `meal_type` dello slot;
- `meal_slot.recipe_id` contiene ID duplicati nello stesso slot;
- un piano non ha esattamente 21 slot;
- un piano contiene duplicati per la stessa coppia `date` + `meal_type`;
- esistono ID duplicati per lo stesso `record_type`.

## Strategia import consigliata

1. Leggere tutto il CSV in memoria.
2. Separare le righe per `record_type`.
3. Validare struttura, valori e riferimenti.
4. Costruire un modello applicativo completo.
5. Mostrare riepilogo import: numero ingredienti, ricette, piani, slot assegnati e preferenze.
6. Scrivere sul database solo dopo validazione completa.

## Compatibilita

- Versione corrente formato: `1`.
- Nuove colonne opzionali possono essere aggiunte solo aggiornando questo documento.
- Nuovi `record_type` devono essere ignorati solo se dichiarati opzionali in una versione futura del formato.
