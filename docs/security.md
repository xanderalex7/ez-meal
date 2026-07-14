# Security

Fonte di verita per guardrail, policy, rischi e vincoli di sicurezza di EZ-MEAL. Le misure sono proporzionate a un'app client-only, offline-first, con dati locali e nessun backend nel MVP.

## 1. Principi

- **Security by default**: configurazioni sicure senza interventi manuali.
- **Least privilege**: accedere solo a dati, storage e permessi necessari al flusso corrente.
- **Fail securely**: in caso di errore, non perdere dati, non esporre dettagli tecnici, non confermare salvataggi falliti.
- **Defense in depth**: validazioni nel dominio, repository sicuri, UI chiara per azioni distruttive.
- **Secure by design**: privacy locale, niente account/sync nel MVP, logging minimo e utile.

## 2. Segreti

- Nessun segreto, token, chiave API, certificato privato o credenziale nel codice, nei test, nei log o in Git.
- Il MVP non richiede segreti applicativi.
- Se in futuro servono servizi esterni, usare variabili d'ambiente o secret manager della piattaforma.
- File locali di configurazione con segreti devono essere ignorati da Git.
- Vietato loggare segreti, token, password, PII, payload sensibili, prompt/input utente sensibili o output AI sensibili.

## 3. Autenticazione e sessioni

- Il MVP non prevede account, login, password, token o sessioni utente.
- Non introdurre schermate o stati di autenticazione senza requisito approvato.
- Se in futuro vengono introdotti account o sync:
  - usare token a breve durata e refresh sicuro;
  - proteggere storage di token con meccanismi sicuri di piattaforma;
  - definire logout, scadenza sessione, revoca e recupero account;
  - registrare la decisione in `docs/decisions.md`.

## 4. Autorizzazione

- Il MVP ha un solo attore locale: utente del dispositivo/contesto app.
- Non esistono ruoli applicativi o permessi server-side nel MVP.
- I controlli business restano obbligatori: ricette compatibili con slot, label valide, eliminazioni con impatto gestito.
- Se future API, condivisione o multiutente vengono introdotti, autorizzazione e ownership devono essere definiti prima dell'implementazione.

## 5. Input validation e output handling

- Validare input nel domain layer prima della persistenza.
- Usare whitelist per enum e valori finiti: meal type, tema, stati, azioni.
- Rifiutare o normalizzare stringhe vuote, solo spazi e valori fuori dominio.
- Applicare limiti ragionevoli a campi testuali locali per evitare UI degradata o storage anomalo; soglie da definire.
- Usare query parametrizzate per ogni accesso SQLite.
- Non mostrare stacktrace, query, path locali o dettagli interni all'utente.
- Output UI deve usare rendering testuale sicuro; nessun HTML/script generato da input utente.
- Messaggi utente: chiari, recuperabili, senza dettagli tecnici sensibili.

## 6. Logging ed error handling

Livelli:

| Livello | Uso |
| --- | --- |
| `debug` | Solo sviluppo/test, dettagli tecnici non sensibili. |
| `info` | Eventi significativi: migrazione completata, generazione confermata, preferenza tema aggiornata. |
| `warn` | Condizioni recuperabili: ricette insufficienti, conflitto eliminazione, dati locali inattesi ma gestiti. |
| `error` | Errori tecnici gestiti: fallimento storage, migrazione fallita, eccezione recuperata. |

Policy:

- Log proporzionati alla diagnosi; evitare rumore operativo.
- Vietato loggare segreti, token, password, PII, dati alimentari dettagliati, payload completi, prompt/input utente sensibili, output AI sensibili.
- Preferire conteggi, categorie, error code e ID tecnici non sensibili.
- Errori di validazione non sono errori tecnici: mostrarli in UI, non loggarli come `error`.
- Stacktrace solo in sviluppo/test e mai mostrati all'utente.
- Correlation/request id non necessario nel MVP locale sincrono; introdurlo per future API, sync, import/export o operazioni asincrone multi-step.
- Redaction/masking obbligatori prima di inviare log a qualunque servizio futuro.

## 7. Comunicazioni

- Il MVP non richiede comunicazioni di rete per funzioni core.
- Se future funzioni usano rete:
  - usare solo HTTPS/TLS valido;
  - vietare HTTP e protocolli insicuri;
  - non disabilitare verifica certificati;
  - definire timeout, retry e gestione offline;
  - documentare rischi e decisioni in `docs/decisions.md`.

## 8. Database e filesystem

- Usare query parametrizzate; vietata concatenazione SQL con input utente.
- Validare schema e migrazioni in modo idempotente.
- Limitare accesso al solo storage locale dell'app.
- Non scrivere dati utente in path arbitrari.
- Validare path per eventuali import/export futuri.
- Backup/retention non sono previsti nel MVP; se introdotti, definire cifratura, ambito, retention e consenso.
- Le eliminazioni di ricette/ingredienti referenziati devono seguire policy esplicita e conferma UX quando distruttive.

## 9. API e integrazioni

- Nessuna API o integrazione esterna nel MVP.
- Se introdotte in futuro:
  - validare request e response;
  - applicare timeout e retry controllati;
  - limitare rate e concorrenza;
  - gestire errori senza esporre dettagli interni;
  - non inviare dati locali non necessari;
  - registrare decisioni, rischi e dati scambiati in `docs/decisions.md`.

## 10. Frontend e UX di sicurezza

- Confermare azioni distruttive o massive: eliminazioni, sovrascrittura piano, modifiche con impatto su slot.
- Testo conferma deve spiegare impatto concreto senza allarmismo.
- Errori devono preservare input recuperabile e non far credere che un salvataggio fallito sia riuscito.
- Stati offline/locali devono essere chiari senza suggerire sync inesistente.
- Focus, contrasto e label accessibili aiutano a evitare errori operativi.
- Toast solo per feedback non critico; errori bloccanti restano visibili finche risolti.

## 11. Privacy

- Dati trattati: ricette, ingredienti, piano pasti, preferenze tema; possono rivelare abitudini alimentari.
- Minimizzazione: salvare solo dati necessari al MVP.
- Local-first: nel MVP i dati restano sul dispositivo/contesto locale e non vengono inviati a servizi remoti.
- Nessun account, tracking o analytics richiesti nel MVP.
- Retention: dati conservati finche l'utente li elimina o disinstalla/cancella storage app.
- Se future funzioni esportano, sincronizzano o analizzano dati, richiedono nuova valutazione privacy e decisione documentata.

## 12. Dipendenze

- Usare dipendenze minime, mantenute e coerenti con `docs/architecture.md`.
- Evitare librerie non necessarie per validazioni semplici o logica locale.
- Bloccare versioni tramite lockfile.
- Aggiornare dipendenze con regolarita e verificare breaking changes.
- Rimuovere pacchetti inutilizzati.
- Non usare pacchetti abbandonati, non verificabili o con vulnerabilita note non mitigate.

## 13. Minacce, mitigazioni e rischi residui

| Minaccia | Area | Mitigazioni | Rischio residuo |
| --- | --- | --- | --- |
| Esposizione dati alimentari locali | Privacy, storage | Nessuna rete MVP; logging minimizzato; storage app locale | Accesso fisico o compromissione dispositivo fuori controllo app |
| Corruzione/perdita dati locali | DB | Migrazioni idempotenti; error handling sicuro; test repository | Backup non previsto nel MVP |
| SQL injection locale | DB | Query parametrizzate; validazione input | Basso se repository rispettano policy |
| XSS/rendering input utente su web | Frontend | Rendering testuale sicuro; niente HTML da input utente | Dipende da discipline UI future |
| Log sensibili | Logging | Redaction, divieti espliciti, log a conteggi/ID | Medio se futuri servizi remoti aggiungono telemetria |
| Azioni distruttive accidentali | UX, dati | Conferme, impatto esplicito, stati chiari | Medio finche non definita policy finale cascade/blocco |
| Dipendenze vulnerabili | Supply chain | Dipendenze minime, lockfile, aggiornamenti | Medio, richiede manutenzione continua |
| Rete futura insicura | Comunicazioni | HTTPS/TLS obbligatorio; no SSL disabilitato | Non applicabile nel MVP; rivalutare per sync/API |

## 14. Pratiche vietate

- Segreti hardcoded.
- Segreti o file `.env` sensibili in Git.
- SQL concatenato con input utente.
- SSL/TLS disabilitato o verifica certificati bypassata.
- Stacktrace, query, path o dettagli interni mostrati all'utente.
- Log di segreti, token, password, PII, payload sensibili, dati alimentari dettagliati, prompt/input utente sensibili o output AI sensibili.
- Controlli di validazione disattivati senza decisione documentata.
- Dipendenze obsolete, abbandonate o inutilizzate.
- Invio remoto di dati utente senza requisito, consenso e decisione documentata.
- UI che conferma successo quando salvataggio o persistenza sono falliti.

## Decisioni da registrare

Registrare in `docs/decisions.md` quando definite:

- Policy per eliminazione di ricette/ingredienti referenziati: blocco, cascade o conferma.
- Eventuale cifratura locale se richiesta da futuri requisiti o piattaforme target.
- Qualunque introduzione di account, sync, API, analytics, backup, import/export o servizi remoti.
- Soglie di lunghezza input e policy duplicati ingredienti/ricette se hanno impatti di sicurezza o integrita.
