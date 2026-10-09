"""The Mac acting as a BLE chute reader (GATT peripheral) through CoreBluetooth, via bless."""

from __future__ import annotations

import asyncio
import threading
import time
import logging

from bless import (  # type: ignore
    BlessServer,
    GATTAttributePermissions,
    GATTCharacteristicProperties,
)

from profiles import ReaderProfile

log = logging.getLogger("reader-simulator")

# CoreBluetooth refuses a notification when its transmit queue is full; retry a few times.
_SEND_RETRIES = 20
_SEND_RETRY_SECONDS = 0.05
_GAP_BETWEEN_CHUNKS_SECONDS = 0.01


class SimulatedReader:
    def __init__(self, profile: ReaderProfile) -> None:
        self.profile = profile
        self._server: BlessServer | None = None

    async def start(self) -> None:
        _check_bluetooth_authorization()
        # bless blocks until CoreBluetooth reports "powered on". Without permission that never
        # happens and the process would hang in silence, so say what is going on.
        hint = threading.Timer(8.0, lambda: log.warning(
            "El Bluetooth no responde. Revisá que esté encendido y que la Terminal tenga permiso en "
            "Ajustes del Sistema → Privacidad y seguridad → Bluetooth. Ctrl+C para salir."
        ))
        hint.daemon = True
        hint.start()
        try:
            self._server = BlessServer(name=self.profile.advertised_name)
        finally:
            hint.cancel()
        self._server.read_request_func = lambda characteristic, **_: characteristic.value
        # Real readers accept commands on a write characteristic; the simulator only logs them.
        self._server.write_request_func = self._on_write

        await self._server.add_new_service(self.profile.service_uuid)
        await self._server.add_new_characteristic(
            self.profile.service_uuid,
            self.profile.notify_characteristic_uuid,
            GATTCharacteristicProperties.read | GATTCharacteristicProperties.notify,
            None,
            GATTAttributePermissions.readable,
        )
        if self.profile.write_characteristic_uuid:
            await self._server.add_new_characteristic(
                self.profile.service_uuid,
                self.profile.write_characteristic_uuid,
                GATTCharacteristicProperties.write | GATTCharacteristicProperties.write_without_response,
                None,
                GATTAttributePermissions.writeable,
            )
        await self._server.start()
        log.info("Anunciando '%s' (%s) servicio %s", self.profile.advertised_name,
                 self.profile.display_name, self.profile.service_uuid)

    async def stop(self) -> None:
        if self._server is not None:
            await self._server.stop()

    async def wait_for_subscriber(self) -> None:
        assert self._server is not None
        if await self._server.is_connected():
            return
        log.info("Esperando que el teléfono se conecte y se suscriba…")
        while not await self._server.is_connected():
            await asyncio.sleep(0.25)
        log.info("Teléfono suscripto.")

    async def log_subscription_changes(self) -> None:
        """Logs every time the phone drops and comes back, which wait_for_subscriber only sees once.

        A phone that keeps reconnecting looks fine from here otherwise: the first subscription is
        logged and nothing after it.
        """
        assert self._server is not None
        connected = await self._server.is_connected()
        ever_connected = connected
        since = time.monotonic()
        while True:
            await asyncio.sleep(0.25)
            now = await self._server.is_connected()
            if now == connected:
                continue
            held = time.monotonic() - since
            if not now:
                log.warning("Teléfono desuscripto tras %.1f s conectado.", held)
            elif ever_connected:
                log.info("Teléfono suscripto otra vez (estuvo %.1f s sin suscripción).", held)
            # The first subscription is already logged by wait_for_subscriber.
            ever_connected = ever_connected or now
            connected, since = now, time.monotonic()

    async def send_line(self, text: str) -> None:
        payload = (text + self.profile.line_terminator).encode("ascii", errors="replace")
        size = self.profile.chunk_size
        await self.send_chunks([payload[i:i + size] for i in range(0, len(payload), size)], 0.0)

    async def send_split(self, text: str, pieces: int, gap_seconds: float) -> None:
        payload = (text + self.profile.line_terminator).encode("ascii", errors="replace")
        cut = max(1, len(payload) // pieces)
        chunks = [payload[i:i + cut] for i in range(0, len(payload), cut)]
        # A piece longer than the chunk size would still be cut by the air interface.
        size = self.profile.chunk_size
        await self.send_chunks([c[i:i + size] for c in chunks for i in range(0, len(c), size)], gap_seconds)

    async def send_chunks(self, chunks: list[bytes], gap_seconds: float) -> None:
        assert self._server is not None
        characteristic = self._server.get_characteristic(self.profile.notify_characteristic_uuid)
        for chunk in chunks:
            characteristic.value = bytearray(chunk)
            for _ in range(_SEND_RETRIES):
                if self._server.update_value(self.profile.service_uuid, self.profile.notify_characteristic_uuid):
                    break
                await asyncio.sleep(_SEND_RETRY_SECONDS)
            else:
                log.warning("Fragmento no enviado (cola llena): %r", chunk)
            await asyncio.sleep(gap_seconds or _GAP_BETWEEN_CHUNKS_SECONDS)

    async def drop(self, seconds: float) -> None:
        """The reader stops answering: services withdrawn and advertising stopped.

        A CoreBluetooth peripheral cannot force a central off the link; the phone sees the
        service invalidated. For a full link loss, stop the process (Ctrl+C) instead.
        """
        assert self._server is not None
        manager = self._server.peripheral_manager_delegate.peripheral_manager
        log.info("Lector sin respuesta durante %.0f s…", seconds)
        await self._server.stop()
        manager.removeAllServices()
        await asyncio.sleep(seconds)
        # start() re-adds the services it already knows and advertises again.
        await self._server.start()
        log.info("Lector disponible otra vez.")

    def _on_write(self, characteristic, value, **_) -> None:
        log.info("Comando recibido del teléfono: %r", bytes(value))


# CBManagerAuthorization values.
_NOT_DETERMINED, _RESTRICTED, _DENIED = 0, 1, 2


def _check_bluetooth_authorization() -> None:
    from CoreBluetooth import CBManager  # type: ignore

    status = CBManager.authorization()
    if status in (_RESTRICTED, _DENIED):
        raise SystemExit(
            "macOS no permite el Bluetooth a esta Terminal. Habilitalo en Ajustes del Sistema → "
            "Privacidad y seguridad → Bluetooth y volvé a abrir la Terminal."
        )
    if status == _NOT_DETERMINED:
        log.info("macOS va a pedir permiso para usar el Bluetooth: aceptalo.")
