# Workflow di sviluppo e release

Questo documento descrive il flusso operativo corrente di EZ-MEAL per sviluppo, versionamento, tagging e build APK Android.

## Principi

- `main` e la fonte stabile del progetto.
- I tag `vX.Y.Z` devono essere creati solo da commit stabili su `main`.
- I branch di sviluppo partono da `main` e rientrano in `main` solo dopo verifiche.
- `android-apk` e un branch tecnico per generare APK installabili tramite pipeline EAS.
- Non sviluppare direttamente su `android-apk`.

## Branch attuali

| Branch | Scopo |
| --- | --- |
| `main` | Stato stabile, versioni ufficiali e tag. |
| `android-apk` | Trigger pipeline EAS per APK Android installabile. |
| `feature/*`, `task/*`, `fix/*` | Branch temporanei di sviluppo staccati da `main`. |

## 1. Iniziare uno sviluppo

Partire sempre da `main` aggiornata:

```bash
git checkout main
git pull
```

Creare un branch dedicato:

```bash
git checkout -b feature/nome-lavoro
```

Esempi:

```bash
git checkout -b feature/new-logo
git checkout -b task/multi-recipe-slots
git checkout -b fix/today-weekday
```

## 2. Lavorare sul branch

Durante lo sviluppo:

```bash
npm run typecheck
npm run test
```

Se la modifica riguarda Expo, asset, icone o configurazione app:

```bash
npx expo config --type public
```

Commitare il lavoro sul branch:

```bash
git status
git add .
git commit -m "descrizione modifica"
```

## 3. Portare il lavoro su main

Quando il branch e pronto:

```bash
git checkout main
git pull
git merge feature/nome-lavoro
```

Rilanciare le verifiche principali:

```bash
npm run typecheck
npm run test
npx expo config --type public
```

Pushare `main`:

```bash
git push origin main
```

## 4. Preparare una release

Su `main`, aggiornare versione e build number:

```bash
npm run version:bump -- 1.2.1
```

Il comando aggiorna:

- `package.json`
- `package-lock.json`
- `app.json > expo.version`
- `app.json > expo.android.versionCode`
- `app.json > expo.ios.buildNumber`

Eseguire le verifiche:

```bash
npm run typecheck
npm run test
npx expo config --type public
```

Commitare la release:

```bash
git status
git add package.json package-lock.json app.json README.md tagging.md WORKFLOW.md scripts
git commit -m "release: bump version"
git push origin main
```

## 5. Creare e pubblicare il tag

Creare il tag locale dalla versione corrente:

```bash
npm run version:tag
```

Il comando verifica che le versioni siano allineate e crea un tag annotato `vX.Y.Z`.

Pushare il tag:

```bash
npm run version:tag:push
```

In alternativa, dopo `npm run version:tag`, usare il comando manuale stampato dallo script:

```bash
git push origin v1.2.1
```

Verificare il tag remoto:

```bash
git ls-remote --tags origin v1.2.1
```

Se compare `refs/tags/v1.2.1`, il tag e stato pubblicato.

## 6. Generare APK Android installabile

Il branch `android-apk` serve solo a triggerare la pipeline APK.

Dopo che `main` e stabile, pushata e taggata:

```bash
git checkout android-apk
git pull
git merge main
git push origin android-apk
```

Il push su `android-apk` avvia la pipeline EAS configurata per generare un APK installabile.

Controllare la dashboard Expo/EAS e scaricare l'APK prodotto.

## 7. Regole operative

- Non creare tag da branch feature.
- Non taggare prima di aver committato il bump versione.
- Non sviluppare direttamente su `android-apk`.
- Non usare `android-apk` come branch stabile: la stabilita appartiene a `main`.
- Se un tag esiste gia e punta a un commit sbagliato, fermarsi e valutare prima di cancellarlo o ricrearlo.
- Ogni build APK dovrebbe essere riconducibile a una versione presente su `main`.

## Future

Questi branch/workflow non sono ancora parte del flusso effettivo. Verranno spostati nel workflow principale quando saranno creati e configurati.

### Branch store release

Possibile branch futuro:

```text
store-release
```

Scopo:

- generare build destinate agli store;
- Android Play Store: AAB tramite profilo EAS production;
- iOS App Store/TestFlight: build iOS tramite profilo EAS production.

Flusso previsto:

```bash
git checkout store-release
git pull
git merge main
git push origin store-release
```

La pipeline associata dovrebbe produrre build store, non APK manuali.

### Branch separati per store

Se servira separare ulteriormente le piattaforme, si potranno valutare branch dedicati:

```text
android-store
ios-store
```

Per ora non sono necessari.

