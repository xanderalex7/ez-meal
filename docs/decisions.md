# Decisions

Decisioni tecniche e di prodotto rilevanti per EZ-MEAL.

## DEC-001 - Inizio settimana

| Campo | Contenuto |
| --- | --- |
| Decisione | La settimana applicativa inizia di lunedi. |
| Motivazione | Coerente con l'uso calendario locale italiano/europeo e con la pianificazione settimanale di pasti. |
| Alternative | Domenica come inizio settimana; configurazione utente. Scartate per ridurre complessita MVP. |
| Impatto | I piani settimanali usano `weekStartDate` riferito al lunedi; eventuale preferenza calendario diventa evoluzione futura. |

## DEC-002 - Eliminazione ricette referenziate

| Campo | Contenuto |
| --- | --- |
| Decisione | Se una ricetta e assegnata a uno o piu slot, l'eliminazione richiede conferma e rimuove l'assegnazione dagli slot coinvolti. |
| Motivazione | Mantiene il dato locale consistente senza bloccare l'utente nella gestione delle ricette. |
| Alternative | Bloccare eliminazione; eliminare senza conferma. Il blocco e piu rigido, l'eliminazione silenziosa e rischiosa. |
| Impatto | UI deve mostrare impatto concreto; repository/use case devono pulire gli slot referenziati; log solo conteggi/ID tecnici se necessario. |

## DEC-003 - Eliminazione ingredienti referenziati

| Campo | Contenuto |
| --- | --- |
| Decisione | Se un ingrediente e collegato a ricette, l'eliminazione richiede conferma e rimuove il collegamento dalle ricette coinvolte. |
| Motivazione | Gli ingredienti sono contesto modificabile dall'utente; la rimozione non deve cancellare ricette intere. |
| Alternative | Bloccare eliminazione; mantenere riferimenti orfani. Scartate per ergonomia e consistenza dati. |
| Impatto | UI deve indicare quante ricette saranno aggiornate; repository/use case devono evitare riferimenti orfani. |
