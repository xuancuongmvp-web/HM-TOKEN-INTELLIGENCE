# HM Token Intelligence

Open-source toolkit for model-aware token counting and conservative prompt optimization.

**Status:** experimental foundation. Exact counts apply to the supplied text and explicitly selected tokenizer only. This does not inspect hidden ChatGPT instructions, full hosted conversation context, tool schemas or multimodal payloads. For real API requests, provider-reported usage is authoritative.

## Planned
- Explicit tokenizer-backed counts (OpenAI `tiktoken`).
- Prompt optimization with before/after preview and no silent replacement.
- Cost estimation from dated, configurable pricing.
- GPT Actions/API integrations.
- Multilingual test corpus and community evaluation.

See [Roadmap](docs/ROADMAP.md).