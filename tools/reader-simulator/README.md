# Simulador de lector de caravanas BLE

La MacBook se anuncia como un lector de caravanas electrónicas por Bluetooth Low Energy y emite lecturas como lo haría un bastón en la manga. La app `mobile-scanner` se conecta a ella igual que a un lector real.

## Instalación

```bash
cd mobile-scanner/tools/reader-simulator
/opt/homebrew/bin/python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

**Permiso de Bluetooth:** macOS se lo pide a la **app de terminal** desde la que se lanza el script, y esa app tiene que declarar el uso de Bluetooth. Si no lo declara, macOS corta el proceso con `zsh: abort`.

| Sirven | No sirven |
|---|---|
| iTerm, terminal integrada de VS Code, Cursor o Antigravity | Terminal de macOS, Warp |

La primera vez aparece el pedido de permiso para esa app: aceptalo. Si lo rechazaste, habilitalo en *Ajustes del Sistema → Privacidad y seguridad → Bluetooth*. Tampoco funciona desde un proceso en segundo plano sin ventana.

## Uso

```bash
.venv/bin/python simulate.py --profile gallagher_like --scenario mixed --count 30 --interval 2
```

Sin Bluetooth, para ver qué se emitiría:

```bash
.venv/bin/python simulate.py --profile allflex_like --scenario corrupt --dry-run
```

El simulador espera a que el teléfono se conecte y se suscriba antes de empezar a emitir.

## Perfiles

Los perfiles son los mismos archivos que usa la app: `mobile-scanner/src/core/readers/profiles/*.json`. La app los lee para saber cómo **recibir**; el simulador, para saber cómo **emitir**.

| Perfil | Anuncia | Línea de ejemplo |
|---|---|---|
| `generic_nus` | `SIM-NUS` | `982 000123456789\r\n` |
| `gallagher_like` | `SIM-GAL` | `032000000000001\r\n` |
| `trutest_like` | `SIM-TRU` | `2026-09-24 10:31:05,032000000000001\r\n` |
| `allflex_like` | `SIM-ALX` | `LA 032 000000000001\r` |

> Los perfiles `*_like` imitan formatos plausibles, **no son especificaciones de los fabricantes**. Con un lector real, se crea su perfil con los UUIDs y el formato de su manual.

## Escenarios

| `--scenario` | Qué hace |
|---|---|
| `manual` | Enter = animal nuevo · `r` repite el último · `k` una ya registrada · `x` lectura mala · `q` sale |
| `stream` | `--count` animales nuevos cada `--interval` segundos |
| `repeat` | Cada animal se lee 2 a 4 veces seguidas, como cuando se queda quieto frente a la antena |
| `mixed` | Mezcla nuevos con ya registrados (`--known-ratio`, 0.3 por defecto) |
| `split` | Cada línea llega partida en 2 o 3 fragmentos con pausas |
| `corrupt` | Alrededor de un tercio de las lecturas salen truncadas, con letras o con 14/16 dígitos |
| `disconnect` | Cada `--drop-after` lecturas el lector deja de responder `--drop-seconds` segundos |
| `csv` | Emite las caravanas de `--file` (una por línea, o CSV con la caravana en la primera columna) |

`--seed` repite una corrida aleatoria. `--start` fija la primera caravana nueva; por defecto depende de la hora, para que una segunda corrida no repita caravanas que la primera ya dio de alta.

### Sobre `disconnect`

En macOS un periférico no puede cortar la conexión del teléfono: el escenario retira el servicio y deja de anunciarse, y el teléfono lo ve como un lector que dejó de responder. Para probar un corte total del enlace, cortá el simulador con Ctrl+C y volvé a lanzarlo.

## Caravanas ya registradas

`fixtures/existing_caravans.csv` tiene las caravanas que crea `BleReaderTestCaravansSeeder` en la API:

- `032000000000001` a `032000000000010`: Hacienda Principal. La app debe marcarlas como **ya registradas**.
- `032000000000011` y `032000000000012`: Hacienda Secundaria. Con la sesión iniciada en Hacienda Principal, la app debe marcarlas como **de otra empresa**.

Para recargarlas: `php artisan tenants:seed --class=BleReaderTestCaravansSeeder`.

## Problemas conocidos

- **El teléfono no encuentra el lector:** iOS guarda en caché los servicios de cada dispositivo. Al cambiar de perfil, apagá y prendé el Bluetooth del teléfono.
- **`zsh: abort` al arrancar:** la terminal no declara el uso de Bluetooth (ver Instalación). Usá iTerm o la terminal de VS Code o Cursor.
- **El script queda mudo al arrancar:** el permiso de Bluetooth está denegado (ver Instalación). A los 8 segundos avisa.
