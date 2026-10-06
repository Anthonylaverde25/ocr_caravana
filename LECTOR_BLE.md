# Lector de caravanas BLE — cómo probarlo

Flujo: el simulador de la Mac (o un lector real) emite caravanas por Bluetooth → la app las junta en una sesión → una persona las revisa → se dan de alta en la API con un alta estricta (todo o nada).

## 1. API en la red local

El teléfono llega a la API por la IP de la Mac, y el tenant se resuelve por dominio, así que esa IP tiene que ser un dominio del tenant de desarrollo.

```bash
cd api-laravel
ipconfig getifaddr en0                 # IP de la Mac, p. ej. 192.168.1.50
# en .env: DEV_LAN_HOST=192.168.1.50
php artisan db:seed                    # registra la IP como dominio del tenant (no borra datos)
php artisan tenants:migrate            # tabla caravan_registration_submissions
php artisan tenants:seed --class=BleReaderTestCaravansSeeder
php artisan serve --host=0.0.0.0 --port=8000
```

Usuario de prueba: `test@example.com` / `password123`.

## 2. App en un teléfono físico

Los simuladores de iOS y los emuladores de Android **no tienen Bluetooth**: hace falta un teléfono real conectado por cable.

```bash
cd mobile-scanner
cp .env.example .env.local             # y poné la IP de la Mac en EXPO_PUBLIC_API_URL
npx expo prebuild                      # aplica los permisos de Bluetooth a ios/ y android/
npx expo run:ios --device              # o: npx expo run:android --device
```

## 3. Simulador del lector

Ver `tools/reader-simulator/README.md`. Resumen:

```bash
cd tools/reader-simulator
.venv/bin/python simulate.py --profile gallagher_like --scenario mixed --count 20 --interval 3
```

## 4. Recorrido en la app

1. Pestaña **Lector** → iniciar sesión.
2. **Nueva sesión**: lote destino (obligatorio), categoría, raza, sexo de la tropa, dentición por defecto y fecha de ingreso. Todo animal leído hereda estos datos.
3. **Lector**: elegir *Lector Bluetooth* y el mismo perfil que usa el simulador → *Buscar lectores* → *Conectar*. Con *Simulado en la app* se prueba sin Bluetooth.
4. **Lectura en manga**: las caravanas aparecen en vivo y se verifican contra el sistema cada 4 segundos. Una caravana leída varias veces cuenta como un solo animal.
5. **Revisión**: sólo las **Nuevas** se dan de alta. *Ya registrada* y *De otra empresa* quedan excluidas. Por animal se corrige el sexo, la dentición y el peso, o se quita la lectura.
6. **Dar de alta**: si el teléfono pierde la señal durante el envío, la sesión se bloquea y sólo permite *Reintentar envío*, que no duplica el alta.

## Tests

```bash
npx jest                                                   # núcleo de la app
cd ../api-laravel && php artisan test tests/Feature/Caravans # endpoints
```
