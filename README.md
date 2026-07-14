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
npm run build:web
```

Output attesi:

- `build/android/`: bundle/export Android.
- `build/ios/`: bundle/export iOS.
- `build/web/`: export web statico con manifest PWA e service worker.

Le cartelle `build/android/` e `build/ios/` servono a verificare che l'app venga esportata correttamente per piattaforma. Non sono APK, AAB o build TestFlight/App Store.

Per generare un APK Android installabile tramite EAS:

```bash
npx eas-cli@latest build -p android --profile apk
```

### Web

Genera la versione web statica:

```bash
npm run build:web
```

Per servirla localmente:

```bash
cd build/web
python3 -m http.server 4174 --bind 127.0.0.1
```

Poi aprire `http://127.0.0.1:4174`.

La build web include manifest PWA, icone e service worker. Su browser compatibili, servendo la build da `localhost` o da HTTPS, puo apparire l'azione `Installa app` nella barra o nel menu del browser. Questa installazione e una PWA: apre EZ-MEAL in una finestra app-like, ma non genera un installer nativo `.exe`, `.dmg` o `.pkg`.

### iOS

Verifica che il bundle iOS venga generato correttamente:

```bash
npm run build:ios
```

Per avviare l'app nel simulatore durante lo sviluppo:

```bash
npm run ios
```

Nota: una build installabile/TestFlight richiede Expo/EAS e credenziali Apple Developer.

### Android

Verifica che il bundle Android venga generato correttamente:

```bash
npm run build:android
```

Per avviare l'app su emulatore o dispositivo durante lo sviluppo:

```bash
npm run android
```

Per creare un APK installabile, usare il profilo EAS `apk`:

```bash
npx eas-cli@latest build -p android --profile apk
```

Il repository include anche il workflow EAS `.eas/workflows/android-apk.yml`: dopo aver collegato il repo GitHub al progetto Expo/EAS, ogni push sul branch `android-apk` avvia automaticamente una build APK con lo stesso profilo `apk`.

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
- `IMPORT_EXPORT.md`: formato CSV unico per import/export dati locali.

## Stato

Implementazione MVP parziale completata secondo `docs/tasks.md`:

- Domain core, repository locali, UI shell, CRUD base ricette/ingredienti, planner con piani nominabili/selezionabili, generazione piano, home, tema selezionabile da `Altro`, error handling e logging essenziale.
- Persistenza locale collegata alla UI tramite SQLite; lo stato applicativo viene caricato all'avvio e salvato dopo le modifiche. Le scritture locali sono serializzate per evitare conflitti tra salvataggi pendenti e reset database.
- Nel planner e possibile creare un piano con il FAB `+`, selezionarlo, rinominarlo e cancellarlo con conferma.
- Ogni slot pasto del piano puo contenere piu ricette compatibili, ad esempio un pranzo composto da riso, pollo e frutta; ogni ricetta puo essere rimossa singolarmente.
- `Genera piano ✨` crea una bozza random solo se esiste almeno una ricetta compatibile per colazione, pranzo e cena; la bozza si conferma con `Salva`, mentre se mancano ricette compatibili il piano resta invariato e viene mostrato un messaggio.
- `Altro` include import/export CSV dei dati locali con formato documentato in `IMPORT_EXPORT.md`, inclusi slot pasto con piu ricette.
- Hardening sicurezza MVP completato con `npm audit --omit=dev` a 0 vulnerabilita.
- Logo minimale, icone app Android/iOS/web e asset PWA completati.
- Verifiche correnti: `npm run typecheck`, `npm run test`, `npm run build:web`, `npm run build:ios`, `npm run build:android`, `npm audit --omit=dev`.

Punti aperti:

- Smoke manuale APK mirato dopo `TASK-064`: creare un piano con piu ricette nello stesso pasto, riaprire l'app, esportare CSV e reimportare i dati.
