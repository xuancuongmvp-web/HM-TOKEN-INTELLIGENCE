# Accuracy boundaries

For a given text string and a given tokenizer encoding, the token count is the length of the token ID sequence. This project delegates tokenization to tiktoken.

Plain-text counts do not include hidden hosted-chat system/developer instructions, unsupplied conversation messages, message framing, tool schemas, image/audio/video payloads, cache usage, or provider-specific reasoning accounting.

The current API takes explicit encoding names and does not guess arbitrary model mappings. A future registry must cite provider documentation, record provenance and date, and include regression tests. Unknown mappings must fail closed.

For real API calls, provider-reported usage is authoritative. Cost calculations require a dated, configurable price sheet; this foundation deliberately avoids hard-coded prices that may become stale.
