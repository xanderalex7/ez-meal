# Design

Fonte di verita per UI/UX e design system di EZ-MEAL. Questo documento definisce regole visive e di esperienza, non mockup, schermate o implementazione.

## 1. Principi di design

- **Quotidiano e calmo**: interfaccia pratica, leggibile, adatta a consultazione frequente.
- **Pianificazione rapida**: priorita a scansione, modifica veloce e stati chiari.
- **Offline confidence**: i dati locali devono sembrare sempre disponibili e affidabili.
- **Densita moderata**: mostrare abbastanza informazione senza creare affollamento.
- **Tono visivo**: fresco, domestico, ordinato; evitare estetica medicale, fitness aggressiva o food delivery.
- **Cosa evitare**: hero marketing, decorazioni invadenti, palette monocromatiche, gradienti dominanti, testi istruttivi lunghi, card annidate, stati vuoti vaghi.

## 2. Layout

Breakpoints logici:

| Target | Larghezza | Regole |
| --- | --- | --- |
| Mobile | `< 768px` | Navigazione bottom/tab; contenuto a colonna singola; azioni primarie persistenti o facilmente raggiungibili. |
| Tablet | `768-1199px` | Colonna principale con pannelli secondari quando utili; liste e dettagli affiancabili. |
| Desktop/web | `>= 1200px` | Contenuto centrato max `1180px`; sidebar o tab laterali ammessi; evitare larghezze testo eccessive. |

Spaziatura:

- Base spacing: `4px`; scala: `4, 8, 12, 16, 24, 32, 48`.
- Padding schermata: mobile `16px`, tablet `24px`, desktop `32px`.
- Gap tra sezioni: `24-32px`; gap tra elementi correlati: `8-12px`.
- Raggio: `8px` massimo per card e controlli principali; `999px` solo per badge, switch e pill funzionali.
- Touch target minimo: `44x44px`.

Struttura:

- Schermate operative, non landing page.
- Titolo pagina breve, azione primaria visibile, contenuto principale subito sotto.
- Il contenuto centrale deve essere scrollabile quando supera lo spazio disponibile; header/navbar non devono rendere campi, liste o azioni irraggiungibili.
- Usare card solo per elementi ripetuti, modali o contenitori funzionali; non annidare card.
- Stati vuoti devono occupare lo spazio del contenuto, non diventare pagine illustrative.

## 3. Palette

Usare token semantici, non colori hardcoded nei componenti.

| Token | Light | Dark | Uso |
| --- | --- | --- | --- |
| `color.primary` | `#2F7D5C` | `#6CCF9D` | Azioni primarie, selezione attiva |
| `color.secondary` | `#D97706` | `#F6B35B` | Evidenze leggere, pasti/ingredienti |
| `color.accent` | `#5B6EE1` | `#9AA7FF` | Link, focus speciali, info secondaria |
| `color.background` | `#FAFAF7` | `#121412` | Sfondo app |
| `color.surface` | `#FFFFFF` | `#1B1F1B` | Card, pannelli, input |
| `color.surfaceAlt` | `#F0F3EC` | `#242A24` | Sezioni leggere, stati vuoti |
| `color.text` | `#1E241F` | `#F2F5EF` | Testo principale |
| `color.textMuted` | `#687267` | `#AEB7AC` | Testo secondario |
| `color.border` | `#DDE3DA` | `#394238` | Bordi e separatori |
| `color.success` | `#27834F` | `#65C98E` | Conferme |
| `color.warning` | `#B86B00` | `#F2B84B` | Attenzioni recuperabili |
| `color.error` | `#C2413A` | `#FF8A82` | Errori e azioni distruttive |
| `color.info` | `#2563A8` | `#75A7E8` | Informazioni contestuali |

Regole:

- Il colore primario non deve dominare l'intera UI.
- Componenti condivisi e schermate devono usare token light/dark dinamici; vietato fissare colori light-only in UI visibile.
- Usare colore + testo/icona, mai solo colore, per stati e validazioni.
- Dark mode non e inversione automatica: usare token dedicati.

## 4. Tipografia

Font:

- Usare il font di sistema della piattaforma per performance e coerenza nativa.
- Evitare font decorativi.

Gerarchia:

| Stile | Size | Line height | Peso | Uso |
| --- | --- | --- | --- | --- |
| Display | 28 | 34 | 700 | Titoli pagina mobile solo quando necessario |
| H1 | 24 | 30 | 700 | Titoli principali |
| H2 | 20 | 26 | 650 | Sezioni principali |
| H3 | 17 | 23 | 650 | Titoli card/list item |
| Body | 16 | 24 | 400 | Testo standard, input |
| Body small | 14 | 20 | 400 | Metadati, helper |
| Caption | 12 | 16 | 500 | Badge, label compatte |

Regole:

- Letter spacing `0`.
- Non scalare font con viewport width.
- Evitare blocchi di testo lunghi nelle superfici operative.
- I label dei form devono restare visibili o chiaramente associati al campo.

## 5. Componenti

| Componente | Regole |
| --- | --- |
| Pulsanti | Primario per azione principale; secondario per alternative; ghost/icon per azioni leggere. Includere icone dove aiutano. Stato disabled visibile con motivo vicino se non ovvio. |
| Input | Label persistente, helper/error sotto campo, bordo semantico solo su focus/error. Placeholder non sostituisce label. |
| Select | Usare per set finiti; per label pasto preferire segmented control o checkbox se multi-selezione. |
| Checkbox/switch | Checkbox per scelte multiple; switch per impostazioni binarie immediate, es. tema se manuale. Per ingredienti associati a una ricetta usare un multiselect dropdown ricercabile e scrollabile, con massimo 6 ingredienti visibili prima dello scroll; non usare una serie di pulsanti primari. |
| Card | Solo item ripetuti o pannelli funzionali. Contenere titolo, metadati, azioni essenziali. Radius max `8px`. |
| Tabelle | Solo web/desktop per dati confrontabili; su mobile trasformare in lista strutturata. |
| Modali/dialog | Usare per conferme distruttive, selezioni focalizzate o form brevi. Titolo chiaro, azioni esplicite, dismiss sicuro. |
| Menu | Per azioni secondarie non frequenti. Non nascondere azioni primarie. |
| Navbar/sidebar | Mobile: bottom tabs per aree principali con superficie dedicata, stato selezionato ad alto contrasto, touch target minimi e label su singola riga senza wrapping non intenzionale. Tablet/desktop: sidebar o top tabs coerenti. |
| FAB | Usare `+` in alto a destra per aprire il form inline di creazione in Piano, Ricette e Ingredienti; quando il form e aperto il salvataggio avviene con bottone `Aggiungi` sotto al campo; nelle schermate Ricette/Ingredienti sostituisce il bottone testuale sempre visibile; label accessibile specifica; non deve coprire contenuti, navbar o azioni critiche. |
| Alert | Messaggi persistenti per problemi che bloccano o richiedono attenzione. |
| Toast | Feedback breve per salvataggi e azioni non bloccanti; non usarli per errori critici. |
| Badge | Label pasto, stato ingredienti, compatibilita. Testo breve, colore semantico, non solo cromatico. |

## 6. Icone e immagini

- Usare icone lineari coerenti, stroke uniforme, dimensioni `20-24px`.
- Preferire icone note per azioni: aggiungi, modifica, elimina, conferma, chiudi, calendario, lista.
- Ogni icon button deve avere label accessibile.
- Immagini non necessarie per MVP operativo; se introdotte, devono rappresentare ricette/ingredienti reali o contenuti utente, non decorazione generica.
- Evitare illustrazioni decorative negli stati vuoti; usare testo breve + azione.

## 7. UX guidelines

Form:

- Un form salva solo dati validi.
- Errori vicino al campo, in linguaggio utente, senza codici tecnici.
- Campi obbligatori riconoscibili; non usare solo asterisco senza spiegazione.
- Azione primaria allineata al flusso: salva, conferma, genera.

Validazione e feedback:

- Validare input obbligatori prima del salvataggio.
- Dopo salvataggio riuscito, aggiornare subito UI e dare feedback discreto.
- Se non esistono ricette compatibili, spiegare cosa manca e offrire azione utile.
- Se la generazione lascia slot vuoti, mostrare conteggio e slot interessati.

Loading:

- Per letture locali brevi preferire skeleton leggero o stato stabile.
- Evitare spinner full-screen salvo inizializzazione inevitabile.
- I controlli devono prevenire doppie conferme durante salvataggi.

Empty state:

- Dire cosa manca e quale azione risolve.
- Esempio tono: "Nessuna ricetta per pranzo" + azione "Aggiungi ricetta".
- Gli slot pasto vuoti devono essere chiaramente modificabili.

Errori:

- Errori utente: specifici e recuperabili.
- Errori tecnici: messaggio semplice, azione retry se possibile.
- Non perdere input inserito dopo errore recuperabile.

Conferme distruttive:

- Richiedere conferma per eliminazioni e sovrascritture estese.
- Testo deve indicare impatto concreto: ricette, ingredienti o slot coinvolti.
- Azione distruttiva usa `color.error`; azione sicura resta secondaria.

## 8. Accessibilita

- Contrasto minimo WCAG AA: `4.5:1` testo normale, `3:1` testo grande e icone informative.
- Focus visibile su web e navigazione tastiera.
- Tutti gli input hanno label programmatica.
- Icon button con nome accessibile.
- Non affidare stati solo al colore.
- Supportare dimensioni testo di sistema quando possibile senza overlap.
- Touch target minimo `44x44px`.
- Ordine di lettura coerente con layout visivo.
- Testi alternativi per immagini informative; immagini decorative devono essere ignorabili.
- Layout responsive senza contenuti tagliati o sovrapposti.

## 9. Animazioni

- Durata standard: `120-200ms`; transizioni complesse max `300ms`.
- Usare animazioni per feedback, apertura/chiusura, cambio stato.
- Evitare animazioni continue o decorative.
- Rispettare preferenze reduce motion.
- Nessuna animazione deve bloccare azioni frequenti.

## 10. Consistenza

Do:

- Usare token di colore, spacing, radius e tipografia.
- Riutilizzare componenti condivisi per azioni, form, card, alert e badge.
- Mantenere label pasto coerenti: `Colazione`, `Pranzo`, `Cena`.
- I tag pasto devono usare colori distintivi ma coerenti con la palette: `Colazione` caldo/ambra, `Pranzo` verde, `Cena` indaco; ogni variante deve avere token separati per light/dark con contrasto leggibile per background, bordo e testo.
- Usare stesso pattern per stati: loading, empty, error, success.
- Mantenere navigazione coerente tra mobile e web.

Don't:

- Non introdurre colori o font locali in una singola feature.
- Non creare varianti pulsante non documentate.
- Non annidare card.
- Non nascondere errori in toast temporanei se bloccano il flusso.
- Non usare testo lungo per spiegare funzioni ovvie.
- Non duplicare componenti simili con nomi diversi.

## 11. Regole di implementazione UI

- Tutte le UI devono usare componenti e token condivisi in `src/shared/ui` e `src/shared/theme`.
- Nuovi colori, font, spacing, radius o varianti componente richiedono aggiornamento di questo file.
- Le feature possono comporre componenti, non ridefinire stile base.
- Ogni componente condiviso deve coprire stati principali: default, hover/focus se applicabile, disabled, loading, error quando rilevante.
- Le schermate devono rispettare i requisiti di accessibilita e responsive definiti qui.
- Le scelte UX non ovvie o che cambiano comportamento utente devono essere tracciate in `docs/decisions.md` quando rilevanti.
