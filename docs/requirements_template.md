# Requirements Template

Scopo: definire lo standard per scrivere `docs/requirements.md`. Questo documento non contiene requisiti del progetto.

## 1. Principi di scrittura

Ogni requisito deve essere:

- **Chiaro**: comprensibile senza interpretazioni implicite.
- **Atomico**: descrive un solo bisogno o comportamento.
- **Non ambiguo**: evita termini vaghi come "semplice", "veloce", "intuitivo" senza criteri misurabili.
- **Verificabile**: permette di stabilire oggettivamente se e soddisfatto.
- **Testabile**: traducibile in test, checklist o scenario osservabile.
- **Tracciabile**: collegabile a task, decisioni, test, rischi e modifiche future.

Scrivere requisiti orientati al risultato atteso, non alla soluzione tecnica.

## 2. Separazione concettuale

| Elemento | Significato | Esempio di formulazione |
| --- | --- | --- |
| Requisito | Comportamento, capacita o bisogno che il sistema deve soddisfare. | "Il sistema deve consentire a un utente di..." |
| Vincolo | Limite imposto al sistema o al progetto. | "Il sistema deve operare entro..." |
| Assunzione | Condizione considerata vera finche non smentita. | "Si assume che..." |
| Regola di dominio | Regola stabile del contesto applicativo. | "Un elemento e valido solo se..." |
| Criterio di accettazione | Evidenza osservabile che conferma il requisito. | "Dato..., quando..., allora..." |

## 3. Formato requisito

Usare una scheda compatta per ogni requisito.

```md
### REQ-001 - Titolo breve

| Campo | Contenuto |
| --- | --- |
| ID | REQ-001 |
| Titolo | Titolo breve e univoco |
| Descrizione | Cosa deve essere possibile fare o garantire, senza indicare implementazioni |
| Motivazione | Perche il requisito esiste e quale bisogno copre |
| Attori | Utenti, ruoli o sistemi coinvolti |
| Precondizioni | Condizioni necessarie prima del flusso |
| Flusso principale | Sequenza essenziale del comportamento atteso |
| Alternative/errori | Varianti, eccezioni, input non validi o fallimenti attesi |
| Regole di dominio | Regole applicabili al requisito |
| Criteri di accettazione | Given/When/Then o checklist osservabile |
| Impatti | Sicurezza, dati, privacy, integrazioni, performance, accessibilita, operativita; solo se rilevanti |
| Priorita | MUST, SHOULD o COULD |
| Stato | Draft, Approved, Changed o Deprecated |
| Tracciabilita | Link futuri a task, decisioni, test, rischi |
```

## 4. ID e classificazioni

- **ID requisito**: `REQ-001`, `REQ-002`, `REQ-003`; progressivo, stabile, mai riutilizzato.
- **Priorita**:
  - `MUST`: necessario per il risultato minimo accettabile.
  - `SHOULD`: importante ma rinviabile con impatto controllato.
  - `COULD`: utile, opzionale o migliorativo.
- **Stato**:
  - `Draft`: proposto, non ancora approvato.
  - `Approved`: valido e pronto per pianificazione/implementazione.
  - `Changed`: modificato dopo approvazione; indicare tracciabilita.
  - `Deprecated`: non piu valido; non cancellare se gia tracciato.

## 5. Criteri di accettazione

Preferire Given/When/Then:

```md
- Given [contesto iniziale]
  When [azione o evento]
  Then [risultato osservabile]
```

In alternativa usare checklist verificabili:

```md
- [ ] Il comportamento produce un risultato osservabile.
- [ ] Gli errori previsti sono gestiti.
- [ ] Le regole di dominio rilevanti sono rispettate.
```

Ogni criterio deve essere osservabile, binario o misurabile.

## 6. Tracciabilita

Ogni requisito deve poter essere collegato in futuro a:

- `docs/tasks.md`: task di implementazione o verifica.
- `docs/decisions.md`: decisioni rilevanti.
- Test: manuali, automatici, end-to-end o di accettazione.
- Rischi: incertezze, dipendenze o punti critici.

Formato suggerito:

```md
Tracciabilita: tasks TBD; decisions TBD; tests TBD; risks TBD
```

## 7. Impatti trasversali

Compilare solo gli impatti rilevanti per il requisito. Non forzare sezioni vuote.

| Area | Quando indicarla |
| --- | --- |
| Sicurezza | Autorizzazioni, abuso, integrita o protezione del sistema |
| Dati | Creazione, modifica, cancellazione, conservazione o qualita dati |
| Privacy | Dati personali, consenso, minimizzazione o visibilita |
| Integrazioni | Sistemi esterni, import/export, API o sincronizzazione |
| Performance | Tempi, limiti, volumi, carico o responsivita |
| Accessibilita | Uso tramite tecnologie assistive o requisiti inclusivi |
| Operativita | Monitoraggio, supporto, manutenzione, backup o ripristino |

## 8. Esempio minimo

### REQ-001 - Creazione elemento

| Campo | Contenuto |
| --- | --- |
| ID | REQ-001 |
| Titolo | Creazione elemento |
| Descrizione | Il sistema deve consentire a un utente autorizzato di creare un nuovo elemento con i dati minimi richiesti. |
| Motivazione | Permettere l'inserimento controllato di nuove informazioni nel sistema. |
| Attori | Utente autorizzato |
| Precondizioni | L'utente ha accesso alla funzione di creazione. |
| Flusso principale | L'utente avvia la creazione, inserisce i dati richiesti, conferma, e il sistema rende disponibile il nuovo elemento. |
| Alternative/errori | Se i dati obbligatori mancano o non sono validi, il sistema impedisce la conferma e indica il problema. |
| Regole di dominio | Un elemento valido deve includere tutti i campi obbligatori definiti dal dominio. |
| Criteri di accettazione | Given un utente autorizzato e dati validi, When conferma la creazione, Then il nuovo elemento e disponibile nel sistema. |
| Impatti | Dati: nuovo record persistito; Privacy: solo se l'elemento contiene dati personali. |
| Priorita | MUST |
| Stato | Draft |
| Tracciabilita | tasks TBD; decisions TBD; tests TBD; risks TBD |
