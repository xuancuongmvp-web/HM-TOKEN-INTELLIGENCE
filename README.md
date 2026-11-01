# HM Token Intelligence

Open-source toolkit for model-aware token counting and conservative prompt optimization.

**Status:** experimental foundation. Exact counts apply to the supplied text and explicitly selected tokenizer only. This does not inspect hidden ChatGPT instructions, full hosted conversation context, tool schemas or multimodal payloads. For real API requests, provider-reported usage is authoritative.

## Run on Windows

Install Python 3.10 or newer, then open PowerShell in the project folder:

\`\`\`powershell
py -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
pip install -e ".[dev]"
hm-token
\`\`\`

Open http://127.0.0.1:8000 in your browser. If PowerShell blocks activation, run the server without activating the environment:

\`\`\`powershell
.\\.venv\\Scripts\\python.exe -m pip install -e ".[dev]"
.\\.venv\\Scripts\\python.exe -m hm_token_intelligence.app
\`\`\`

## Run on macOS/Linux

\`\`\`bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
hm-token
\`\`\`

## Use the browser tool

1. Select the tokenizer encoding. Use the encoding documented for the model being measured; \`o200k_base\` is only the default, not a universal mapping.
2. Paste the exact text into the input box.
3. Select **Count tokens** to see tokens, characters, words and UTF-8 bytes.
4. Select **Optimize safely** to preview mechanical cleanup and compare before/after token counts.
5. Review the proposed text. The original is not overwritten automatically.

## API

- \`GET /health\`
- \`GET /v1/encodings\`
- \`POST /v1/count\`
- \`POST /v1/optimize\`

Example:

\`\`\`bash
curl -X POST http://127.0.0.1:8000/v1/count \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Xin chào thế giới","encoding":"o200k_base"}'
\`\`\`

Interactive API documentation is available at http://127.0.0.1:8000/docs.

## GPT Actions

A Custom GPT cannot call a service running only on your PC. To connect a GPT Action, deploy the API to a public HTTPS host, add appropriate authentication and configure an OpenAPI Action. An Action only counts text explicitly sent to it; it cannot inspect ChatGPT's hidden instructions or entire internal context.

## Planned
- Provenance-backed model registry.
- Cost estimation from dated, configurable pricing.
- GPT Actions/API integrations.
- Multilingual golden test corpus and community evaluation.

See [Roadmap](docs/ROADMAP.md).
