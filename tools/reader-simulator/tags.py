"""ISO 11784 electronic tags: 3 digits of country (032 = Argentina) + 12 of national id."""

from __future__ import annotations

import csv
import random
import time
from pathlib import Path

COUNTRY_AR = "032"
FIXTURE_EXISTING = Path(__file__).parent / "fixtures" / "existing_caravans.csv"

# The seeder owns 032000000000001..012; generated tags stay far above that range.
_NEW_TAG_FLOOR = 100_000


class NewTagSequence:
    """New, never-registered tags.

    The default start depends on the clock, so a second run does not replay the tags a
    previous run already registered (they would come back as ALREADY REGISTERED).
    """

    def __init__(self, start: int | None = None) -> None:
        self._next = start if start is not None else _NEW_TAG_FLOOR + int(time.time()) % 900_000_000

    def next(self) -> str:
        national = self._next
        self._next += 1
        return f"{COUNTRY_AR}{national:012d}"


def load_existing(path: Path = FIXTURE_EXISTING) -> list[dict[str, str]]:
    with path.open(encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def load_tag_file(path: Path) -> list[str]:
    """One tag per line, or a CSV whose first column is the tag. Header lines are skipped."""
    tags: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        first = line.split(",")[0].strip()
        if first.isdigit():
            tags.append(first)
    return tags


def corrupt(eid: str, rng: random.Random) -> str:
    """A reading a real reader can produce on a bad pass: truncated, noisy or off by a digit."""
    variants = [
        eid[: rng.randint(6, 12)],               # truncated
        eid[:7] + "A" + eid[8:],                  # noise in the middle
        eid[:-1],                                 # 14 digits
        eid + str(rng.randint(0, 9)),             # 16 digits
    ]
    return rng.choice(variants)
