# Git Tagging Cheatsheet

Guida rapida per salvare versioni stabili del progetto con tag Git, ad esempio `v1.0.0`.

## Quando creare un tag

Crea un tag quando una versione e stabile, testata e installabile.

Esempi:

- `v1.0.0`: prima versione stabile.
- `v1.0.1`: fix piccolo senza nuove funzionalita.
- `v1.1.0`: nuova funzionalita compatibile.
- `v2.0.0`: cambio importante o non compatibile.

## Prima di taggare

Verifica branch, stato repo e ultimo commit.

```bash
git branch --show-current
git status
git log --oneline -5
```

La working tree dovrebbe essere pulita:

```text
nothing to commit, working tree clean
```

## Creare un tag locale

Usa tag annotati, cosi il tag contiene autore, data e messaggio.

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
```

## Verificare il tag locale

```bash
git tag
git show v1.0.0
```

## Pushare il tag su GitHub

```bash
git push origin v1.0.0
```

Oppure, per pushare tutti i tag locali non ancora remoti:

```bash
git push origin --tags
```

Preferisci il push del singolo tag quando stai pubblicando una release precisa.

## Verificare che il tag sia remoto

```bash
git ls-remote --tags origin
```

Per cercare un tag specifico:

```bash
git ls-remote --tags origin v1.0.0
```

Se compare una riga con `refs/tags/v1.0.0`, il tag e su GitHub.

## Spostarsi su una versione taggata

Solo per consultare o testare una versione:

```bash
git checkout v1.0.0
```

Questo porta in detached HEAD. Per tornare al branch principale:

```bash
git checkout main
```

## Creare un branch da un tag

Utile se devi correggere una versione stabile gia rilasciata.

```bash
git checkout -b hotfix/v1.0.1 v1.0.0
```

## Eliminare un tag creato per errore

Eliminare tag locale:

```bash
git tag -d v1.0.0
```

Eliminare tag remoto:

```bash
git push origin :refs/tags/v1.0.0
```

Usalo solo se il tag e sbagliato e non deve rappresentare una release valida.

## Flusso consigliato per EZ-MEAL

1. Finire sviluppo e smoke test su APK.
2. Portare le modifiche su `main`.
3. Verificare repo pulita.
4. Creare tag annotato.
5. Pushare tag singolo.
6. Verificare tag remoto.

Comandi tipici:

```bash
git checkout main
git pull
git status
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
git ls-remote --tags origin v1.0.0
```

