"""Explicit-encoding token counts and deterministic prompt cleanup."""
from __future__ import annotations
import re
from dataclasses import asdict, dataclass
from typing import Any
import tiktoken

SUPPORTED_ENCODINGS = ("cl100k_base", "o200k_base", "p50k_base", "r50k_base")

class UnknownEncodingError(ValueError):
    """The requested tokenizer is not supported; never guess silently."""

def get_encoding(name: str):
    if name not in SUPPORTED_ENCODINGS:
        raise UnknownEncodingError(f"Unsupported encoding: {name}. Choose one of: {', '.join(SUPPORTED_ENCODINGS)}")
    return tiktoken.get_encoding(name)

@dataclass
class CountResult:
    encoding: str
    tokens: int
    characters: int
    words_whitespace_split: int
    utf8_bytes: int
    lines: int
    token_ids: list[int]
    tokens_per_line: list[int]
    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

def count_text(text: str, encoding: str = "o200k_base", include_ids: bool = False) -> CountResult:
    enc = get_encoding(encoding)
    ids = enc.encode(text, disallowed_special=())
    lines = [len(enc.encode(line, disallowed_special=())) for line in text.splitlines()]
    return CountResult(encoding, len(ids), len(text), len(text.split()), len(text.encode("utf-8")), len(text.splitlines()) if text else 0, ids if include_ids else [], lines)

@dataclass
class OptimizationResult:
    original: str
    optimized: str
    before_tokens: int
    after_tokens: int
    saved_tokens: int
    saved_percent: float
    operations: list[str]
    changed: bool

def optimize_text(text: str, encoding: str = "o200k_base", *, trim_trailing_whitespace: bool = True, normalize_newlines: bool = True, collapse_blank_lines: bool = True, remove_exact_duplicate_lines: bool = False) -> OptimizationResult:
    """Apply explicitly enabled mechanical transformations; never paraphrase."""
    result = text
    operations: list[str] = []
    if normalize_newlines:
        new = result.replace("\\r\\n", "\\n").replace("\\r", "\\n")
        if new != result:
            result = new
            operations.append("normalized_newlines")
    if trim_trailing_whitespace:
        new = "\\n".join(line.rstrip() for line in result.split("\\n"))
        if new != result:
            result = new
            operations.append("trimmed_trailing_whitespace")
    if collapse_blank_lines:
        new = re.sub(r"\\n{3,}", "\\n\\n", result)
        if new != result:
            result = new
            operations.append("collapsed_excess_blank_lines")
    if remove_exact_duplicate_lines:
        seen: set[str] = set()
        kept: list[str] = []
        for line in result.split("\\n"):
            key = line.strip()
            if key and key in seen:
                continue
            if key:
                seen.add(key)
            kept.append(line)
        new = "\\n".join(kept)
        if new != result:
            result = new
            operations.append("removed_exact_duplicate_lines")
    before = count_text(text, encoding).tokens
    after = count_text(result, encoding).tokens
    saved = before - after
    return OptimizationResult(text, result, before, after, saved, round(saved / before * 100, 2) if before else 0.0, operations, result != text)
