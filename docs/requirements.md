# Requirements

Fonte di verita del comportamento atteso di EZ-MEAL. Il documento definisce cosa deve fare il sistema, non come implementarlo.

## 1. Vision

| Area | Contenuto |
| --- | --- |
| Scopo | Aiutare l'utente a creare e mantenere un piano alimentare settimanale usando ricette e ingredienti disponibili. |
| Problema | Pianificare i pasti richiede tempo e spesso non considera cio che l'utente ha gia a disposizione. |
| Utenti target | Persone che vogliono organizzare colazione, pranzo e cena in modo semplice, anche senza rete. |
| Valore atteso | Riduzione dello sforzo di pianificazione, migliore uso degli ingredienti disponibili, consultazione rapida del piano giornaliero e settimanale. |

## 2. Ambito

| Categoria | Incluso |
| --- | --- |
| MVP | Home giornaliera; piano settimanale; generazione randomica del piano da ricette disponibili; gestione ricette; gestione ingredienti; funzionamento offline; dati locali; supporto tema chiaro/scuro. |
| Esclusioni | Account utente, sincronizzazione cloud, condivisione, spesa automatica, nutrizione/calorie, import da fonti esterne, notifiche, pagamenti. |
| Evoluzioni future | Lista della spesa, filtri avanzati, preferenze alimentari, statistiche, backup/sync opzionale, import/export dati. |

## 3. Attori e casi d'uso

| Attore | Caso d'uso | Flusso principale | Alternative/errori |
| --- | --- | --- | --- |
| Utente | Consultare pasti di oggi | Apre l'app e vede colazione, pranzo e cena del giorno corrente. | Se un pasto non e pianificato, vede uno stato vuoto modificabile. |
| Utente | Modificare piano settimanale | Seleziona settimana/giorno/pasto e assegna o rimuove una ricetta. | Se nessuna ricetta e compatibile, il sistema segnala assenza di opzioni. |
| Utente | Generare piano settimanale | Richiede generazione randomica e ottiene assegnazioni compatibili con le ricette disponibili. | Se le ricette sono insufficienti, il sistema genera il possibile e segnala i pasti scoperti. |
| Utente | Gestire ricette | Crea, visualizza, modifica o elimina una ricetta con ingredienti e label pasto. | Dati obbligatori mancanti impediscono il salvataggio. |
| Utente | Gestire ingredienti | Crea, visualizza, modifica o elimina ingredienti disponibili. | Ingredienti usati da ricette o piani richiedono gestione esplicita dell'impatto. |
| Utente | Usare app offline | Usa le funzioni principali senza rete dopo installazione. | Se una funzione richiede rete in futuro, deve essere marcata come non disponibile offline. |

## 4. Funzionalita principali

| Funzione | Input | Output | Vincoli di dominio | Attori |
| --- | --- | --- | --- | --- |
| Home giornaliera | Data corrente, piano settimanale | Pasti di oggi divisi in colazione, pranzo, cena | Ogni giorno ha tre slot pasto standard | Utente |
| Piano settimanale | Settimana, giorni, pasti, ricette | Piano consultabile e modificabile | Solo ricette compatibili con la label del pasto | Utente |
| Generazione randomica | Ricette disponibili, slot settimana | Proposta di piano settimanale | Non assegnare ricette incompatibili con il pasto | Utente |
| Ricette | Nome, ingredienti, label pasto, dettagli opzionali | Ricetta salvata e riusabile | Almeno una label pasto richiesta | Utente |
| Ingredienti | Nome e dati descrittivi minimi | Ingrediente salvato e riusabile | Nome ingrediente obbligatorio e distinguibile | Utente |
| Tema | Preferenza utente o sistema | Interfaccia chiara/scura | Contenuto leggibile in entrambi i temi | Utente |

## 5. User stories

- Come utente, voglio vedere subito i pasti di oggi, in modo da sapere cosa mangiare senza aprire il piano completo.
- Come utente, voglio modificare i pasti della settimana, in modo da adattare il piano alle mie necessita.
- Come utente, voglio generare un piano settimanale randomico, in modo da risparmiare tempo nella pianificazione.
- Come utente, voglio gestire ricette con label di pasto, in modo da usarle solo nei contesti corretti.
- Come utente, voglio gestire gli ingredienti disponibili, in modo da basare il piano su cio che posso usare.
- Come utente, voglio usare l'app senza rete, in modo da accedere ai dati in qualunque momento.
- Come utente, voglio usare tema chiaro o scuro, in modo da avere una lettura confortevole.

## 6. Requisiti funzionali

### REQ-001 - Home giornaliera

| Campo | Contenuto |
| --- | --- |
| ID | REQ-001 |
| Titolo | Home giornaliera |
| Descrizione | Il sistema deve mostrare nella schermata principale i pasti pianificati per la data corrente: colazione, pranzo e cena. |
| Motivazione | Dare accesso immediato alle informazioni piu utili del giorno. |
| Attori | Utente |
| Precondizioni | Esiste o puo esistere un piano per la settimana corrente. |
| Flusso principale | L'utente apre l'app; il sistema determina la data corrente; il sistema mostra i tre slot pasto del giorno con eventuale ricetta assegnata. |
| Alternative/errori | Se uno slot non ha ricetta, il sistema mostra uno stato vuoto; se non esiste un piano, il sistema mostra tre slot vuoti. |
| Regole di dominio | Gli slot standard sono colazione, pranzo e cena. |
| Criteri di accettazione | Given un piano con pasti per oggi, When l'utente apre la home, Then vede colazione, pranzo e cena con le ricette assegnate. Given nessuna ricetta assegnata, When l'utente apre la home, Then lo slot vuoto e distinguibile. |
| Impatti | Dati: lettura del piano locale. Accessibilita: contenuto leggibile e comprensibile. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-002 - Consultazione piano settimanale

| Campo | Contenuto |
| --- | --- |
| ID | REQ-002 |
| Titolo | Consultazione piano settimanale |
| Descrizione | Il sistema deve consentire all'utente di visualizzare il piano settimanale organizzato per giorni e pasti. |
| Motivazione | Permettere controllo e pianificazione dell'intera settimana. |
| Attori | Utente |
| Precondizioni | Nessuna; un piano assente equivale a settimana vuota. |
| Flusso principale | L'utente apre il piano settimanale; il sistema mostra i giorni della settimana; per ogni giorno mostra colazione, pranzo e cena. |
| Alternative/errori | Se la settimana non contiene pasti assegnati, il sistema mostra slot vuoti modificabili. |
| Regole di dominio | Ogni settimana contiene sette giorni; ogni giorno contiene tre slot pasto standard. |
| Criteri di accettazione | Given una settimana con assegnazioni, When l'utente apre il piano, Then vede i pasti organizzati per giorno. Given settimana vuota, When l'utente apre il piano, Then vede tutti gli slot senza ricetta. |
| Impatti | Dati: lettura piano locale. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-003 - Modifica piano settimanale

| Campo | Contenuto |
| --- | --- |
| ID | REQ-003 |
| Titolo | Modifica piano settimanale |
| Descrizione | Il sistema deve consentire all'utente di assegnare, sostituire o rimuovere una ricetta da uno slot pasto del piano settimanale. |
| Motivazione | Rendere il piano adattabile alle preferenze e disponibilita dell'utente. |
| Attori | Utente |
| Precondizioni | Esiste almeno una ricetta per poter assegnare uno slot; la rimozione non richiede ricette disponibili. |
| Flusso principale | L'utente seleziona uno slot; sceglie una ricetta compatibile; conferma; il sistema aggiorna lo slot. |
| Alternative/errori | Se non esistono ricette compatibili, il sistema informa l'utente; se l'utente rimuove una ricetta, lo slot torna vuoto. |
| Regole di dominio | Una ricetta puo essere assegnata a uno slot solo se include la label del tipo pasto dello slot. |
| Criteri di accettazione | Given uno slot pranzo e una ricetta con label pranzo, When l'utente assegna la ricetta, Then lo slot mostra quella ricetta. Given una ricetta senza label pranzo, When l'utente modifica uno slot pranzo, Then la ricetta non e selezionabile o e segnalata come incompatibile. |
| Impatti | Dati: modifica del piano locale. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-004 - Generazione randomica piano

| Campo | Contenuto |
| --- | --- |
| ID | REQ-004 |
| Titolo | Generazione randomica piano |
| Descrizione | Il sistema deve consentire all'utente di generare automaticamente un piano settimanale randomico usando le ricette disponibili e compatibili con ciascun pasto. |
| Motivazione | Ridurre il tempo necessario per creare un piano iniziale. |
| Attori | Utente |
| Precondizioni | Esiste almeno una ricetta salvata. |
| Flusso principale | L'utente richiede la generazione; il sistema valuta gli slot della settimana; assegna ricette compatibili; presenta il piano risultante. |
| Alternative/errori | Se le ricette sono insufficienti, il sistema compila gli slot possibili e segnala quelli rimasti vuoti; se non esistono ricette, il sistema non genera il piano e informa l'utente. |
| Regole di dominio | La generazione deve rispettare le label pasto delle ricette; non deve assegnare una ricetta a un pasto incompatibile. |
| Criteri di accettazione | Given ricette compatibili per tutti i pasti, When l'utente genera il piano, Then gli slot della settimana ricevono ricette compatibili. Given ricette insufficienti, When l'utente genera il piano, Then gli slot non coperti restano vuoti e sono segnalati. |
| Impatti | Dati: creazione o sovrascrittura di assegnazioni del piano; l'utente deve poter distinguere l'effetto dell'azione prima o dopo la conferma. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-005 - Gestione ricette

| Campo | Contenuto |
| --- | --- |
| ID | REQ-005 |
| Titolo | Gestione ricette |
| Descrizione | Il sistema deve consentire all'utente di creare, visualizzare, modificare ed eliminare ricette. |
| Motivazione | Le ricette sono la base per compilare manualmente o automaticamente il piano. |
| Attori | Utente |
| Precondizioni | Nessuna per creare o consultare; per modificare/eliminare deve esistere una ricetta. |
| Flusso principale | L'utente apre le ricette; crea o seleziona una ricetta; inserisce o modifica dati; salva; il sistema rende la ricetta disponibile. |
| Alternative/errori | Se dati obbligatori mancano o non sono validi, il sistema impedisce il salvataggio e segnala il problema; se elimina una ricetta usata nel piano, il sistema gestisce o segnala l'impatto. |
| Regole di dominio | Una ricetta deve avere nome e almeno una label tra colazione, pranzo, cena; gli ingredienti collegati sono opzionali nell'MVP salvo diversa decisione futura. |
| Criteri di accettazione | Given dati validi, When l'utente salva una ricetta, Then la ricetta compare nell'elenco. Given assenza di label pasto, When l'utente salva, Then il sistema impedisce il salvataggio. |
| Impatti | Dati: creazione, modifica, cancellazione ricette. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-006 - Label pasto ricette

| Campo | Contenuto |
| --- | --- |
| ID | REQ-006 |
| Titolo | Label pasto ricette |
| Descrizione | Il sistema deve consentire di associare a ogni ricetta una o piu label pasto tra colazione, pranzo e cena. |
| Motivazione | Permettere filtraggio e assegnazione coerente delle ricette nel piano. |
| Attori | Utente |
| Precondizioni | L'utente sta creando o modificando una ricetta. |
| Flusso principale | L'utente seleziona una o piu label; salva la ricetta; il sistema usa le label per compatibilita e generazione piano. |
| Alternative/errori | Se nessuna label e selezionata, il sistema impedisce il salvataggio della ricetta. |
| Regole di dominio | Le label valide sono colazione, pranzo, cena; una ricetta puo avere piu label. |
| Criteri di accettazione | Given una ricetta con label cena, When l'utente modifica uno slot cena, Then la ricetta e compatibile. Given la stessa ricetta senza label pranzo, When l'utente modifica uno slot pranzo, Then la ricetta non e compatibile. |
| Impatti | Dati: attributi classificativi delle ricette. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-007 - Gestione ingredienti

| Campo | Contenuto |
| --- | --- |
| ID | REQ-007 |
| Titolo | Gestione ingredienti |
| Descrizione | Il sistema deve consentire all'utente di creare, visualizzare, modificare ed eliminare ingredienti disponibili. |
| Motivazione | Gli ingredienti disponibili sono il contesto su cui orientare la pianificazione. |
| Attori | Utente |
| Precondizioni | Nessuna per creare o consultare; per modificare/eliminare deve esistere un ingrediente. |
| Flusso principale | L'utente apre gli ingredienti; crea o seleziona un ingrediente; inserisce o modifica dati; salva; il sistema aggiorna l'elenco. |
| Alternative/errori | Se il nome manca o non e valido, il sistema impedisce il salvataggio; se elimina un ingrediente collegato a ricette, il sistema gestisce o segnala l'impatto. |
| Regole di dominio | Un ingrediente deve avere un nome; nomi vuoti non sono validi. |
| Criteri di accettazione | Given un nome ingrediente valido, When l'utente salva, Then l'ingrediente compare nell'elenco. Given nome vuoto, When l'utente salva, Then il sistema impedisce il salvataggio. |
| Impatti | Dati: creazione, modifica, cancellazione ingredienti. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-008 - Uso ingredienti disponibili

| Campo | Contenuto |
| --- | --- |
| ID | REQ-008 |
| Titolo | Uso ingredienti disponibili |
| Descrizione | Il sistema deve permettere di distinguere gli ingredienti disponibili e usarli come informazione rilevante nella pianificazione. |
| Motivazione | Allineare il piano alimentare a cio che l'utente ha a disposizione. |
| Attori | Utente |
| Precondizioni | Esistono ingredienti registrati. |
| Flusso principale | L'utente mantiene l'elenco ingredienti; il sistema rende questa informazione disponibile nelle funzioni di pianificazione. |
| Alternative/errori | Se non sono presenti ingredienti, il sistema permette comunque gestione ricette e piano ma non puo basare scelte sugli ingredienti. |
| Regole di dominio | La disponibilita ingredienti e un'informazione gestita dall'utente. |
| Criteri di accettazione | Given ingredienti registrati, When l'utente consulta o pianifica, Then il sistema puo mostrare o usare la disponibilita come informazione. Given nessun ingrediente, When l'utente pianifica, Then il sistema non blocca la pianificazione. |
| Impatti | Dati: disponibilita ingredienti; Privacy: dati locali sulle abitudini alimentari. |
| Priorita | SHOULD |
| Stato | Draft |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-009 - Funzionamento offline

| Campo | Contenuto |
| --- | --- |
| ID | REQ-009 |
| Titolo | Funzionamento offline |
| Descrizione | Il sistema deve rendere disponibili le funzioni MVP senza richiedere connessione di rete dopo l'installazione. |
| Motivazione | Garantire utilizzo affidabile e coerente con la visione offline-first. |
| Attori | Utente |
| Precondizioni | L'app e installata e avviabile sul dispositivo o accessibile nel contesto previsto. |
| Flusso principale | L'utente usa home, piano, ricette, ingredienti e tema senza connessione; il sistema legge e salva dati localmente. |
| Alternative/errori | Se in futuro una funzione richiede rete, deve essere esclusa dal nucleo MVP o indicata come non disponibile offline. |
| Regole di dominio | Le funzioni MVP non dipendono da servizi remoti per consultazione e modifica dati. |
| Criteri di accettazione | Given assenza di rete, When l'utente apre l'app, Then puo consultare e modificare dati gia locali. Given assenza di rete, When l'utente crea una ricetta, Then il sistema la salva localmente. |
| Impatti | Affidabilita: continuita senza rete. Dati: persistenza locale. Operativita: nessuna dipendenza operativa da backend per MVP. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-010 - Persistenza locale dati

| Campo | Contenuto |
| --- | --- |
| ID | REQ-010 |
| Titolo | Persistenza locale dati |
| Descrizione | Il sistema deve conservare localmente piano, ricette, ingredienti e preferenze in modo che siano disponibili tra sessioni successive. |
| Motivazione | Evitare perdita dati e supportare uso offline. |
| Attori | Utente |
| Precondizioni | L'utente ha creato o modificato dati. |
| Flusso principale | L'utente salva dati; chiude e riapre l'app; il sistema mostra i dati salvati. |
| Alternative/errori | Se il salvataggio non riesce, il sistema segnala l'errore senza far credere che i dati siano stati conservati. |
| Regole di dominio | I dati utente del MVP sono locali al dispositivo o contesto di utilizzo. |
| Criteri di accettazione | Given una ricetta salvata, When l'utente riapre l'app, Then la ricetta e ancora disponibile. Given una modifica al piano salvata, When l'utente riapre il piano, Then la modifica e presente. |
| Impatti | Dati: conservazione locale; Privacy: dati non inviati a servizi remoti nel MVP. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-011 - Compatibilita piattaforme

| Campo | Contenuto |
| --- | --- |
| ID | REQ-011 |
| Titolo | Compatibilita piattaforme |
| Descrizione | Il sistema deve essere disponibile per iPhone, Android e web con funzioni MVP equivalenti. |
| Motivazione | Rendere il prodotto accessibile dai canali previsti dalla visione. |
| Attori | Utente |
| Precondizioni | L'utente accede da una piattaforma supportata. |
| Flusso principale | L'utente usa le funzioni MVP dalla piattaforma scelta; il comportamento essenziale resta coerente. |
| Alternative/errori | Limitazioni specifiche di piattaforma devono essere documentate e non compromettere il nucleo MVP. |
| Regole di dominio | Le tre piattaforme target sono iPhone, Android e web. |
| Criteri di accettazione | Given una piattaforma target, When l'utente usa home, piano, ricette e ingredienti, Then le funzioni MVP sono disponibili. |
| Impatti | Compatibilita: esperienza funzionalmente coerente tra piattaforme. |
| Priorita | MUST |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

### REQ-012 - Tema chiaro/scuro

| Campo | Contenuto |
| --- | --- |
| ID | REQ-012 |
| Titolo | Tema chiaro/scuro |
| Descrizione | Il sistema deve supportare visualizzazione in tema chiaro e scuro. |
| Motivazione | Migliorare comfort visivo e coerenza con preferenze utente o dispositivo. |
| Attori | Utente |
| Precondizioni | L'utente usa l'app in un contesto che supporta preferenza tema o selezione tema. |
| Flusso principale | Il sistema presenta l'interfaccia nel tema applicabile mantenendo contenuti e azioni leggibili. |
| Alternative/errori | Se la preferenza non e disponibile, il sistema usa un tema predefinito leggibile. |
| Regole di dominio | Entrambi i temi devono mantenere equivalenza funzionale. |
| Criteri di accettazione | Given tema scuro attivo, When l'utente apre home, piano, ricette o ingredienti, Then testi e controlli sono leggibili. Given tema chiaro attivo, When l'utente usa le stesse funzioni, Then il comportamento resta invariato. |
| Impatti | Accessibilita: contrasto e leggibilita. |
| Priorita | SHOULD |
| Stato | Approved |
| Tracciabilita | tasks Da definire; decisions Da definire; tests Da definire; risks Da definire |

## 7. Requisiti non funzionali

| ID | Area | Requisito | Priorita |
| --- | --- | --- | --- |
| NFR-001 | Prestazioni | Le schermate MVP devono aprirsi con tempi percepiti come immediati per dataset personali ordinari; soglie numeriche da definire. | SHOULD |
| NFR-002 | Affidabilita | I dati salvati localmente non devono andare persi in caso di chiusura e riapertura ordinaria dell'app. | MUST |
| NFR-003 | Compatibilita | Le funzioni MVP devono essere disponibili su iPhone, Android e web. | MUST |
| NFR-004 | Scalabilita locale | Il sistema deve restare usabile con un numero personale realistico di ricette, ingredienti e settimane pianificate; soglie da definire. | SHOULD |
| NFR-005 | Manutenibilita | I comportamenti principali devono essere descritti da requisiti tracciabili e testabili. | MUST |
| NFR-006 | Sicurezza | Nel MVP non devono essere richiesti account, credenziali o trasmissione remota di dati personali. | SHOULD |
| NFR-007 | Privacy | I dati alimentari dell'utente devono restare locali nel MVP. | MUST |
| NFR-008 | Accessibilita | Testi, stati vuoti, errori e controlli principali devono essere percepibili e comprensibili. | SHOULD |
| NFR-009 | Operativita | Il nucleo MVP non deve dipendere da servizi remoti per funzionare dopo installazione/accesso iniziale previsto. | MUST |

## 8. Input, output e validazioni di dominio

| Entita | Input minimi | Output | Validazioni |
| --- | --- | --- | --- |
| Ricetta | Nome, almeno una label pasto | Ricetta disponibile per consultazione, piano e generazione | Nome non vuoto; almeno una label valida; label solo tra colazione/pranzo/cena |
| Ingrediente | Nome | Ingrediente disponibile nell'elenco | Nome non vuoto; duplicati da definire |
| Slot pasto | Giorno, tipo pasto, ricetta opzionale | Assegnazione nel piano | Tipo pasto valido; ricetta compatibile con tipo pasto |
| Piano settimanale | Settimana, sette giorni, slot pasto | Piano consultabile e modificabile | Ogni giorno usa gli slot standard; slot vuoti ammessi |
| Tema | Preferenza tema o default | Interfaccia chiara/scura | Contenuti leggibili nel tema applicato |

## 9. Regole di dominio, policy, assunzioni e vincoli

### Regole di dominio

- I tipi pasto standard sono `colazione`, `pranzo`, `cena`.
- Ogni giorno del piano contiene i tre tipi pasto standard.
- Ogni settimana contiene sette giorni.
- Una ricetta e compatibile con uno slot solo se include la label del tipo pasto.
- Una ricetta deve avere un nome e almeno una label pasto.
- Un ingrediente deve avere un nome.
- Gli slot pasto possono restare vuoti.

### Policy

- Le funzioni MVP devono essere utilizzabili offline.
- I dati del MVP devono restare locali.
- Le azioni che possono rimuovere dati o modificare molte assegnazioni devono rendere chiaro l'impatto all'utente.

### Assunzioni

- "Ingredienti disponibili" indica ingredienti gestiti manualmente dall'utente.
- La generazione randomica usa le ricette salvate e rispetta le label pasto; l'uso stretto degli ingredienti nella generazione e da definire.
- Non sono richiesti profili nutrizionali, calorie, porzioni o inventario con quantita nell'MVP.
- Non sono richiesti account, login o sincronizzazione nel MVP.
- La settimana puo essere rappresentata secondo calendario locale dell'utente; dettagli da definire.

### Vincoli

- L'app deve essere disponibile per iPhone, Android e web.
- L'app deve funzionare senza rete per le funzioni MVP dopo installazione/accesso iniziale previsto.
- I dati devono essere salvati localmente e ottimizzati per uso personale.
- Il documento non prescrive architettura, database, API, librerie o pattern applicativi.

## 10. Tracciabilita

| Oggetto | Collegamenti futuri |
| --- | --- |
| Requisiti funzionali | `docs/tasks.md`: Da definire; `docs/decisions.md`: Da definire; test: Da definire; rischi: Da definire |
| Requisiti non funzionali | `docs/tasks.md`: Da definire; `docs/decisions.md`: Da definire; test: Da definire; rischi: Da definire |
| Regole di dominio | `docs/tasks.md`: Da definire; `docs/decisions.md`: Da definire; test: Da definire; rischi: Da definire |
