"""Reader profiles shared with the app (src/core/readers/profiles/*.json).

The app reads a profile to know how to RECEIVE; the simulator reads the very same file to
know how to EMIT. Keeping a single source means both sides can never disagree by a typo.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

PROFILES_DIR = Path(__file__).resolve().parents[2] / "src" / "core" / "readers" / "profiles"


@dataclass(frozen=True)
class ReaderProfile:
    code: str
    display_name: str
    advertised_name: str
    service_uuid: str
    notify_characteristic_uuid: str
    write_characteristic_uuid: str | None
    line_terminator: str
    chunk_size: int
    line_template: str

    def format_line(self, eid: str, now: datetime | None = None) -> str:
        """Writes a 15-digit tag the way this reader would, without the terminator."""
        if len(eid) != 15 or not eid.isdigit():
            raise ValueError(f"'{eid}' no es una caravana de 15 dígitos")
        return self.format_line_raw(eid, now)

    def format_line_raw(self, eid: str, now: datetime | None = None) -> str:
        """Same layout, for a deliberately broken reading that must still look like this reader."""
        moment = now or datetime.now()
        return (
            self.line_template.replace("{datetime}", moment.strftime("%Y-%m-%d %H:%M:%S"))
            .replace("{country}", eid[:3])
            .replace("{national}", eid[3:])
            .replace("{eid}", eid)
        )


def available_codes() -> list[str]:
    return sorted(p.stem for p in PROFILES_DIR.glob("*.json"))


def load_profile(code: str) -> ReaderProfile:
    path = PROFILES_DIR / f"{code}.json"
    if not path.exists():
        raise SystemExit(f"Perfil '{code}' inexistente. Disponibles: {', '.join(available_codes())}")

    raw = json.loads(path.read_text(encoding="utf-8"))
    if len(raw["advertisedName"]) > 10:
        # bless drops the service UUID from the advertisement when the name is longer, and
        # the app filters its scan by that UUID: the reader would be invisible.
        raise SystemExit(f"advertisedName de '{code}' supera 10 caracteres.")

    return ReaderProfile(
        code=raw["code"],
        display_name=raw["displayName"],
        advertised_name=raw["advertisedName"],
        service_uuid=raw["serviceUuid"],
        notify_characteristic_uuid=raw["notifyCharacteristicUuid"],
        write_characteristic_uuid=raw.get("writeCharacteristicUuid"),
        line_terminator=raw["lineTerminator"],
        chunk_size=int(raw["chunkSize"]),
        line_template=raw["lineTemplate"],
    )
