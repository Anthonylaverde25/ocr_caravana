# Arrancar el escáner en el teléfono

Antes de empezar, la Mac y el teléfono tienen que estar en el mismo Wi-Fi.

## 1. Levantar el backend (terminal 1)

```bash
cd ~/Desktop/proyecto_jhoangel/api-laravel
php artisan serve --host=0.0.0.0 --port=8000
```

Hace falta `--host=0.0.0.0`: sin eso, el teléfono no llega a la Mac.

## 2. Levantar Metro (terminal 2)

```bash
cd ~/Desktop/proyecto_jhoangel/mobile-scanner
npx expo start --dev-client
```

## 3. Abrir la app en el teléfono

Abrí la app **mobile-scanner** (no Expo Go) y elegí el servidor `http://192.168.0.42:8081`.
Si no aparece en la lista, escaneá el QR que muestra la terminal 2.

Para verificar que quedó bien, la pantalla de login tiene que decir `Servidor: http://192.168.0.42:8000/api`.

---

## Si algo falla

| Síntoma | Solución |
|---|---|
| No conecta / *Network error* | Revisá la IP de la Mac con `ipconfig getifaddr en0`. Si ya no es `192.168.0.42`, seguí la fila de abajo. |
| Cambió la IP | 1) Actualizala en `mobile-scanner/.env.local` (`EXPO_PUBLIC_API_URL`).<br>2) Actualizala en `api-laravel/.env` (`DEV_LAN_HOST`).<br>3) Corré `php artisan db:seed --class=DatabaseSeeder` en `api-laravel`.<br>4) Reiniciá Metro con `npx expo start --dev-client --clear`. |
| *Tenant could not be identified* | Es el paso 3 de la fila anterior: la IP nueva no está registrada en el tenant. |
| La app no está instalada o cambió código nativo (plugins, permisos) | Con el teléfono conectado por USB o ADB, corré `npx expo run:android` en `mobile-scanner`. |

---

## ADB (sólo para instalar o recompilar)

El arranque diario **no usa ADB**: la app se conecta a Metro y a Laravel por Wi-Fi.
ADB hace falta sólo para `npx expo run:android` o para ver logs nativos.

1. En el teléfono, activá *Opciones de desarrollador → Depuración inalámbrica*.
2. Revisá si ya está conectado con `~/Library/Android/sdk/platform-tools/adb devices`. Normalmente se reconecta solo.
3. Si no aparece: `adb connect 192.168.0.51:PUERTO`. Usá el puerto de la pantalla principal de *Depuración inalámbrica*, que cambia cada vez que se activa.
4. Sólo si `connect` es rechazado (se perdió la vinculación): `adb pair 192.168.0.51:PUERTO CÓDIGO`, con el puerto y el código de *Vincular dispositivo con código de sincronización*. Después, volvé al paso 3.

`adb pair` se hace una sola vez por cada combinación de Mac y teléfono. No se repite cada día.
