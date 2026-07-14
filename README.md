# EZ-MEAL

App offline-first per pianificare colazione, pranzo e cena a partire da ricette e ingredienti disponibili.

## Stack

- React Native + Expo SDK 54
- TypeScript
- Target: iOS, Android, web

## Prerequisiti

- Node.js 26.x e npm installati. Versioni piu vecchie, ad esempio Node 18, possono far fallire Metro con `configs.toReversed is not a function`.
- Per iOS: macOS con Xcode installato, Command Line Tools configurati e almeno un simulatore iOS disponibile.
- Per Android: Android Studio installato, Android SDK configurato, un emulatore disponibile o un dispositivo fisico collegato con debug USB attivo.
- Per provare rapidamente su telefono reale: app Expo Go installata sul dispositivo.

Nota compatibilita Expo Go: il progetto usa Expo SDK 54 per funzionare con la versione di Expo Go disponibile sul telefono di sviluppo.

## Setup iniziale

Aprire un terminale nella cartella del progetto e installare le dipendenze:

```bash
npm install
```

Se si usa `nvm`, selezionare Node 26 prima di eseguire i comandi del progetto:

```bash
nvm install 26
nvm use 26
node -v
```

`node -v` deve mostrare una versione `v26.x.x`. Se `npm` o `node` non sono riconosciuti, installare Node.js 26 e riaprire il terminale.

## Avvio in sviluppo

Avviare Expo:

```bash
npm run start
```

Da qui si puo:

- premere `w` per aprire la versione web;
- premere `i` per aprire il simulatore iOS, se Xcode e disponibile;
- premere `a` per aprire Android, se Android Studio/emulatore o dispositivo sono disponibili;
- scansionare il QR code con Expo Go per provare l'app su telefono.

Se Expo Go mostra `UnexpectedServerData: Unexpected server error: No returned query result`, avviare Expo senza chiamate ai servizi remoti:

```bash
npm run start:offline
```

Poi scansionare il nuovo QR code. Questo errore arriva dal client Expo/servizi Expo, non dai dati locali dell'app.

Se Expo Go segnala che il progetto richiede una versione piu nuova di Expo Go, verificare di avere reinstallato l'app dal Play Store e rilanciare Metro dopo `npm install`. Il progetto e stato allineato a SDK 54 proprio per evitare l'incompatibilita con Expo Go disponibile sul dispositivo.

Dopo il downgrade o se Expo Go continua a leggere un manifest vecchio, svuotare la cache Metro:

```bash
npm run start:offline:clear
```

Comandi diretti equivalenti:

```bash
npm run web
npm run ios
npm run android
```

## Verifiche locali

Prima di considerare una modifica pronta, eseguire:

```bash
npm run typecheck
npm run test
```

Controllo sicurezza dipendenze:

```bash
npm audit --omit=dev
```

## Build/export

Le build locali vengono generate nella cartella `build/`, separando Android e iOS:

```bash
npm run build:android
npm run build:ios
```

Output attesi:

- `build/android/`: bundle/export Android.
- `build/ios/`: bundle/export iOS.

Queste cartelle servono a verificare che l'app venga esportata correttamente per piattaforma. Non sono ancora APK, AAB o build TestFlight/App Store: per quelli servono una configurazione EAS o pipeline native dedicate.

### Web

Genera una versione statica web in una cartella temporanea:

```bash
npx expo export --platform web --output-dir /private/tmp/ez-meal-web-export
```

Per servirla localmente, dalla cartella generata:

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Poi aprire `http://127.0.0.1:4174`.

### iOS

Verifica che il bundle iOS venga generato correttamente:

```bash
npm run build:ios
```

Per avviare l'app nel simulatore durante lo sviluppo:

```bash
npm run ios
```

Nota: una build installabile/TestFlight richiede configurazione Expo/EAS e credenziali Apple Developer. In questo repository non e ancora presente una configurazione `eas.json`.

### Android

Verifica che il bundle Android venga generato correttamente:

```bash
npm run build:android
```

Per avviare l'app su emulatore o dispositivo durante lo sviluppo:

```bash
npm run android
```

Nota: una build installabile APK/AAB richiede configurazione Expo/EAS oppure una pipeline Android nativa dedicata. In questo repository non e ancora presente una configurazione `eas.json`.

## Struttura corrente

- `App.tsx`: entry UI iniziale.
- `index.ts`: entry Expo.
- `app/`: area route/layout prevista dall'architettura.
- `metro.config.js`: configurazione Expo Metro, include asset `.wasm` richiesti da `expo-sqlite` su web.
- `src/domain/`: tipi, regole e use case puri.
- `src/data/`: persistenza locale, repository, mapping e migrazioni.
- `src/features/`: feature UI per home, planner, ricette, ingredienti e impostazioni.
- `src/shared/`: componenti, tema, errori, logging e utility condivise.
- `src/test/`: fixture e builder per test.
- `assets/`: asset app e logo.
- `docs/`: fonte operativa per requisiti, architettura, design, sicurezza e task.

## Documentazione

- `docs/requirements.md`
- `docs/architecture.md`
- `docs/design.md`
- `docs/security.md`
- `docs/tasks.md`

## Stato

Implementazione MVP parziale completata secondo `docs/tasks.md`:

- Domain core, repository locali, UI shell, CRUD base ricette/ingredienti, planner con piani nominabili/selezionabili, generazione piano, home, tema selezionabile da `Altro`, error handling e logging essenziale.
- Persistenza locale collegata alla UI tramite SQLite; lo stato applicativo viene caricato all'avvio e salvato dopo le modifiche.
- Nel planner e possibile creare un piano con il FAB `+`, selezionarlo, rinominarlo e cancellarlo con conferma.
- `Genera piano ✨` crea una bozza random solo se esiste almeno una ricetta compatibile per colazione, pranzo e cena; la bozza si conferma con `Salva`, mentre se mancano ricette compatibili il piano resta invariato e viene mostrato un messaggio.
- Hardening sicurezza MVP completato con `npm audit --omit=dev` a 0 vulnerabilita.
- Verifiche correnti: `npm run typecheck`, `npm run test`, export web, `npm run build:ios`, `npm run build:android`, `npm audit --omit=dev`.

Punti aperti:

- Smoke runtime finale guidato su Expo Go (`TASK-027`).
