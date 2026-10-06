"""Chute scenarios. Each one yields events; the peripheral turns them into BLE notifications.

    Line(text)            a complete reading, sent in chunks of the profile's chunk size
    Split(text, pieces)   a reading deliberately cut in pieces with pauses between them
    Pause(seconds)        nothing on the air
    Drop(seconds)         the reader stops answering (service withdrawn), then comes back
"""

from __future__ import annotations

import asyncio
import random
import sys
from dataclasses import dataclass
from typing import AsyncIterator, Callable

from profiles import ReaderProfile
from tags import NewTagSequence, corrupt, load_existing, load_tag_file


@dataclass(frozen=True)
class Line:
    text: str


@dataclass(frozen=True)
class Split:
    text: str
    pieces: int
    gap_seconds: float


@dataclass(frozen=True)
class Pause:
    seconds: float


@dataclass(frozen=True)
class Drop:
    seconds: float


Event = Line | Split | Pause | Drop


@dataclass
class ScenarioOptions:
    count: int
    interval: float
    known_ratio: float
    drop_after: int
    drop_seconds: float
    file: str | None
    seed: int | None
    start: int | None


def _known_tags() -> list[str]:
    return [row["identification"] for row in load_existing()]


async def manual(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    """Enter = new animal · r = repeat last · k = already registered · x = bad read · q = quit."""
    sequence = NewTagSequence(opts.start)
    known = _known_tags()
    last: str | None = None
    loop = asyncio.get_running_loop()
    print("[manual] Enter=nueva · r=repetir · k=ya registrada · x=lectura mala · q=salir")

    while True:
        key = (await loop.run_in_executor(None, sys.stdin.readline)).strip().lower()
        if key == "q":
            return
        if key == "r" and last:
            eid = last
        elif key == "k":
            eid = rng.choice(known)
        elif key == "x":
            yield Line(profile.format_line_raw(corrupt(sequence.next(), rng)))
            continue
        else:
            eid = sequence.next()
        last = eid
        yield Line(profile.format_line(eid))


async def stream(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    sequence = NewTagSequence(opts.start)
    for _ in range(opts.count):
        yield Line(profile.format_line(sequence.next()))
        yield Pause(opts.interval)


async def repeat(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    """The antenna sees the same animal several times while it stands in the chute."""
    sequence = NewTagSequence(opts.start)
    for _ in range(opts.count):
        eid = sequence.next()
        for _ in range(rng.randint(2, 4)):
            yield Line(profile.format_line(eid))
            yield Pause(rng.uniform(0.2, 0.8))
        yield Pause(opts.interval)


async def mixed(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    sequence = NewTagSequence(opts.start)
    known = _known_tags()
    for _ in range(opts.count):
        eid = rng.choice(known) if rng.random() < opts.known_ratio else sequence.next()
        yield Line(profile.format_line(eid))
        yield Pause(opts.interval)


async def split(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    sequence = NewTagSequence(opts.start)
    for _ in range(opts.count):
        yield Split(profile.format_line(sequence.next()), rng.randint(2, 3), rng.uniform(0.05, 0.3))
        yield Pause(opts.interval)


async def corrupt_reads(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    """Roughly one bad read in three, interleaved with good ones."""
    sequence = NewTagSequence(opts.start)
    for _ in range(opts.count):
        eid = sequence.next()
        text = profile.format_line_raw(corrupt(eid, rng)) if rng.random() < 0.35 else profile.format_line(eid)
        yield Line(text)
        yield Pause(opts.interval)


async def disconnect(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    sequence = NewTagSequence(opts.start)
    for n in range(1, opts.count + 1):
        yield Line(profile.format_line(sequence.next()))
        yield Pause(opts.interval)
        if n % opts.drop_after == 0 and n < opts.count:
            yield Drop(opts.drop_seconds)


async def from_file(profile: ReaderProfile, opts: ScenarioOptions, rng: random.Random) -> AsyncIterator[Event]:
    if not opts.file:
        raise SystemExit("El escenario 'csv' necesita --file")
    for eid in load_tag_file(__import__("pathlib").Path(opts.file)):
        yield Line(profile.format_line(eid))
        yield Pause(opts.interval)


SCENARIOS: dict[str, Callable[[ReaderProfile, ScenarioOptions, random.Random], AsyncIterator[Event]]] = {
    "manual": manual,
    "stream": stream,
    "repeat": repeat,
    "mixed": mixed,
    "split": split,
    "corrupt": corrupt_reads,
    "disconnect": disconnect,
    "csv": from_file,
}
