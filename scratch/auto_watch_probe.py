"""Probe file to test codebase-memory-mcp auto-index / auto-watch."""


def probe_adder(a: int, b: int) -> int:
    return a + b


def probe_consumer(values: list[int]) -> int:
    return probe_adder(sum(values), len(values))


PROBE_CONSTANT: str = "auto-watch-probe"
