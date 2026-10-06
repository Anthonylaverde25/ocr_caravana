#!/usr/bin/env python3
"""Chute reader simulator: the Mac advertises as a BLE tag reader and emits readings.

    python simulate.py --profile gallagher_like --scenario mixed --count 30 --interval 2
    python simulate.py --profile allflex_like --scenario split --dry-run
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import random

from profiles import available_codes, load_profile
from scenarios import SCENARIOS, Drop, Line, Pause, ScenarioOptions, Split


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simulador de lector de caravanas BLE para manga")
    parser.add_argument("--profile", required=True, choices=available_codes())
    parser.add_argument("--scenario", default="manual", choices=sorted(SCENARIOS))
    parser.add_argument("--count", type=int, default=20, help="animales a emitir")
    parser.add_argument("--interval", type=float, default=2.0, help="segundos entre animales")
    parser.add_argument("--known-ratio", type=float, default=0.3, help="mixed: proporción de ya registradas")
    parser.add_argument("--drop-after", type=int, default=5, help="disconnect: lecturas antes de cada corte")
    parser.add_argument("--drop-seconds", type=float, default=8.0, help="disconnect: duración del corte")
    parser.add_argument("--file", help="csv: archivo con una caravana por línea")
    parser.add_argument("--seed", type=int, help="semilla aleatoria, para repetir una corrida")
    parser.add_argument("--start", type=int, help="número nacional de la primera caravana nueva")
    parser.add_argument("--dry-run", action="store_true", help="imprime las líneas sin usar Bluetooth")
    return parser.parse_args()


async def run(args: argparse.Namespace) -> None:
    profile = load_profile(args.profile)
    rng = random.Random(args.seed)
    options = ScenarioOptions(
        count=args.count,
        interval=args.interval,
        known_ratio=args.known_ratio,
        drop_after=args.drop_after,
        drop_seconds=args.drop_seconds,
        file=args.file,
        seed=args.seed,
        start=args.start,
    )
    events = SCENARIOS[args.scenario](profile, options, rng)
    terminator = repr(profile.line_terminator)

    if args.dry_run:
        async for event in events:
            if isinstance(event, Line):
                print(f"LINE   {event.text!r} + {terminator}")
            elif isinstance(event, Split):
                print(f"SPLIT  {event.text!r} + {terminator} en {event.pieces} partes")
            elif isinstance(event, Drop):
                print(f"DROP   {event.seconds:.0f} s")
        return

    from peripheral import SimulatedReader  # CoreBluetooth only loads when it is needed

    reader = SimulatedReader(profile)
    await reader.start()
    sent = 0
    try:
        await reader.wait_for_subscriber()
        async for event in events:
            if isinstance(event, Line):
                await reader.send_line(event.text)
                sent += 1
                logging.info("#%d → %s", sent, event.text)
            elif isinstance(event, Split):
                await reader.send_split(event.text, event.pieces, event.gap_seconds)
                sent += 1
                logging.info("#%d → %s (en %d partes)", sent, event.text, event.pieces)
            elif isinstance(event, Pause):
                await asyncio.sleep(event.seconds)
            elif isinstance(event, Drop):
                await reader.drop(event.seconds)
                await reader.wait_for_subscriber()
        logging.info("Escenario terminado: %d lecturas enviadas. Ctrl+C para cortar.", sent)
        await asyncio.Event().wait()
    finally:
        await reader.stop()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S")
    try:
        asyncio.run(run(parse_args()))
    except KeyboardInterrupt:
        print("\nSimulador detenido.")


if __name__ == "__main__":
    main()
