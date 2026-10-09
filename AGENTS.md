# mobile-scanner — guía para agentes de IA

Fuente única de verdad para cualquier agente (Claude Code, Gemini CLI / Antigravity, Codex, Cursor).
`CLAUDE.md` y `GEMINI.md` sólo importan este archivo y agregan lo propio de cada herramienta.
**Si cambia una regla del proyecto, se cambia acá, no en los archivos de cada agente.**

## Qué es

App móvil (Expo + React Native) para la manga: lee caravanas electrónicas (EID de 15 dígitos)
desde un bastón lector por **Bluetooth Low Energy**, las agrupa en una **sesión de alta**,
una persona las revisa y se dan de alta en la API con un **alta estricta (todo o nada)**.

Forma parte del ecosistema `proyecto_jhoangel/`:

| Carpeta hermana | Rol |
|---|---|
| `../api-laravel` | API REST multi-tenant (Sanctum + Stancl). Contrato de los endpoints que consume esta app. Tiene su propio `AGENTS.md`. |
| `../Fuse-React-v16.0.0-vitejs-skeleton` | Frontend web (ERP). |
| `../AGENTS.md` | Protocolo global *XIMON \| GANADERO v1* (aplica también acá, resumido abajo). |
| `../planes_por_implementar`, `../planes_implementados` | Planes de implementación en Markdown. |

## Stack

- Expo SDK 52, React Native 0.76, React 18, TypeScript `strict`. **New Architecture desactivada** (`app.json → newArchEnabled: false`).
- **Dev client, no Expo Go** (`expo-dev-client`): hay módulos nativos (BLE, MMKV, Vision Camera).
- BLE: `react-native-ble-plx` · Storage: `react-native-mmkv` (sesiones), `expo-secure-store` (auth) · HTTP: `axios`.
- Navegación: React Navigation 7 (bottom tabs) · Íconos: `lucide-react-native`.
- Tests: Jest + `jest-expo`.

## Comandos

```bash
npx jest                          # tests (sólo src/**/__tests__/**/*.test.ts)
npx tsc --noEmit                  # typecheck (ver "Estado conocido")
npx expo start --dev-client       # Metro; la app se conecta por Wi-Fi
npx expo run:android | run:ios    # sólo si cambió código nativo (plugins, permisos, dependencias nativas)
```

Arranque diario completo y troubleshooting de red/ADB: **`ARRANQUE.md`**.
Prueba end-to-end del lector BLE con el simulador: **`LECTOR_BLE.md`** y `tools/reader-simulator/README.md`.

## Arquitectura

Clean Architecture liviana. Las dependencias apuntan hacia `core`, nunca al revés.

```
src/
├── core/                 # Dominio PURO: TypeScript sin React Native, sin axios, sin MMKV
│   ├── entities/         # RegistrationSession: estado serializable + funciones puras
│   ├── readers/          # ReaderSource (contrato), ReaderProfile, LineAssembler, TagParser
│   │   └── profiles/     # *.json compartidos con el simulador de Python
│   └── __tests__/        # tests unitarios del núcleo
├── infrastructure/       # Adaptadores
│   ├── api/              # ApiClient (axios + interceptor) y un *Api por recurso
│   ├── ble/              # BleReaderSource (implementa ReaderSource), permisos
│   ├── mock/             # MockReaderSource (probar sin Bluetooth)
│   └── storage/          # AuthStore (SecureStore), SessionRepo (MMKV)
└── presentation/
    ├── reader/           # Feature "Lector": ReaderContext (estado + orquestación), screens, components, theme.ts
    ├── screens/          # Tabs Home, Operaciones, Historial (+ pantallas OCR legacy)
    └── components/       # Componentes compartidos
```

Flujo del lector: `ReaderSource.onChunk` → `LineAssembler` (arma líneas a partir de fragmentos BLE)
→ `TagParser` (valida contra `linePattern` del perfil) → `recordReading` en `RegistrationSession`
→ `SessionRepo.save` → lookup periódico contra `/caravans/lookup` → revisión → `/caravans/register-new`.

## Invariantes que no se pueden romper

1. **`src/core` es puro.** Nada de imports de `react-native`, `expo-*`, `axios` ni MMKV. Toda lógica nueva de dominio va ahí, como funciones puras con test.
2. **Perfiles de lector compartidos.** `src/core/readers/profiles/*.json` los lee la app (para recibir) y `tools/reader-simulator` (para emitir). Un cambio de formato tiene que funcionar en los dos lados; `TagParser.test.ts` verifica el ida y vuelta de todos los perfiles. Los perfiles `*_like` son inventados, no specs de fabricantes.
3. **Alta idempotente.** `submissionId` se fija en el primer intento y se reutiliza en cada reintento; `submissionPending` bloquea la edición mientras no se sepa si el servidor registró el alta. No generar un id nuevo en un reintento.
4. **Persistir después de cada lectura.** La sesión se guarda en MMKV en cada cambio: si el teléfono muere en la manga se pierde, como mucho, la lectura en vuelo.
5. **Un animal = un EID.** Leer de nuevo una caravana que ya está en la sesión sólo incrementa `readCount`.
6. **Sólo se dan de alta las `not_found`.** `own_company` (ya registrada) y `other_company` se muestran pero quedan excluidas.
7. **Nuevas fuentes de lectura** (p. ej. Bluetooth Classic/SPP) implementan `ReaderSource`; nada aguas abajo debería cambiar.
8. **Consultar no es dar de alta.** La pantalla *Consultar caravana* toma el bastón con `claimReadings` mientras está enfocada: lo que se lee ahí abre la ficha del animal (`/caravans/lookup` → `GET /caravans/{id}`) y nunca entra en la sesión de alta.

## Convenciones

- **Idioma:** código, identificadores y comentarios en **inglés**. Textos de UI y documentación del repo (`*.md`) en **español rioplatense con voseo** ("Abrí", "elegí", "revisá"). Términos de dominio en español: *caravana, manga, lote, tropa, dentición, rodeo*.
- **Comentarios:** pocos y que expliquen el *por qué* (ver `RegistrationSession.ts`, `SessionRepo.ts`). No narrar lo que el código ya dice.
- **Estilos:** colores y estilos comunes desde `src/presentation/reader/theme.ts` (`colors`, `common`). No hardcodear colores nuevos.
- **Componentes:** pantallas finas que orquestan; subcomponentes en `components/`. Evitar archivos de más de ~250 líneas.
- **API:** siempre a través de `api` de `ApiClient.ts` (agrega `Authorization: Bearer` y `X-Company-ID`). Usar `unwrap`, `isNoAnswer` y `errorMessage` en vez de reimplementarlos. **Nunca hardcodear URLs ni IPs**: `EXPO_PUBLIC_API_URL` en `.env.local` (URL completa, p. ej. `http://192.168.0.42:8000/api`).
- **Tests:** archivos `*.test.ts` en `src/core/__tests__/`. Todo cambio en `core` lleva test.
- **Carpetas nativas:** `ios/` y `android/` son generadas por `expo prebuild` y están en `.gitignore`. No editarlas a mano: los cambios nativos van en `app.json` (plugins/permisos) y se regeneran.
- **Dependencias:** instalar con `npx expo install <pkg>` para respetar las versiones del SDK 52. Una dependencia nativa nueva obliga a recompilar el dev client.

## Estado conocido (no es una regresión)

- **Código OCR legacy:** `infrastructure/ocr/ScannerEngine.ts`, `screens/ScannerScreen.tsx`, `screens/PhotoScannerScreen.tsx`, `storage/LocalRepo.ts`, `api/SyncService.ts`, `entities/Caravana.ts`. Es el escáner por cámara previo al lector BLE. No está en la navegación, pero `HomeScreen`/`HistoryScreen` todavía leen `LocalRepo`.
- **`npx tsc --noEmit` da 5 errores, todos en ese código OCR** (módulos de ML Kit no instalados). Es la línea base: un cambio no debe agregar errores nuevos. Antes de tocar o borrar el código legacy, preguntar.
- Simuladores de iOS y emuladores de Android **no tienen Bluetooth**: el flujo BLE real sólo se prueba en un teléfono físico. Sin teléfono, usar *Simulado en la app* (`MockReaderSource`).

## Forma de trabajo (protocolo XIMON | GANADERO, adaptado)

1. **Análisis crítico** antes de cambios no triviales: riesgos, invariantes afectados, impacto en la API.
2. **Plan** en español con los archivos a tocar y por qué. Si se escribe a un `.md`, diagramas en bloques ` ```mermaid ` nativos y chicos (uno por caso), sin imágenes externas.
3. **Esperar aprobación explícita** (`APROBAR`) para cambios de arquitectura, de contrato con la API, de dependencias nativas o que borren código. Arreglos chicos y acotados no necesitan este paso.
4. **Ejecutar y verificar:** `npx jest` en verde y `npx tsc --noEmit` sin errores nuevos. Reportar lo que no se pudo verificar (p. ej. "no probado en teléfono físico").

Si un cambio necesita un endpoint nuevo o distinto, coordinarlo con `../api-laravel` (y sus tests en `tests/Feature/Caravans`) en lugar de adaptar la app a un contrato supuesto.

## Seguridad

- No leer ni commitear secretos. `.env*.local` está ignorado; `.env.example` es la plantilla.
- Usuario de prueba de desarrollo: `test@example.com` / `password123` (sólo seeders locales).
- Commits y push sólo cuando el usuario lo pida.
