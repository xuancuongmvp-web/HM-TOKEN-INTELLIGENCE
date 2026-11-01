# HM Token Intelligence

**HM Token Intelligence** is an open-source prompt quality and token-efficiency project. Its purpose is to help people see why a prompt may waste tokens or produce weak results, understand the problem, and choose how to improve it. It must never silently rewrite or submit a user's prompt.

> **Project status (1 Nov 2026):** The repository contains a local Python web/API foundation, an early Chrome/Edge extension, and an experimental ChatGPT MCP server/widget. A free-tier Render Blueprint is prepared, but no hosted service has been deployed and no ChatGPT account has completed a connection test. This is not a released production app.

## What exists

- Token counting for text explicitly supplied to the API with a selected `tiktoken` encoding.
- Conservative, mechanical text-cleanup preview.
- FastAPI web interface and API.
- Early Chrome/Edge extension MVP that analyzes visible ChatGPT Web composer text using local heuristics.
- Experimental MCP server with `analyze_prompt` and `optimize_prompt_formatting` tools plus an interactive widget.
- Root-level Render Blueprint configured for a Free pilot in Singapore.
- Platform support notes in [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md).

The extension's token figure is a rough estimate based on visible text length, not an exact tokenizer count. Warnings are heuristic signals, not guarantees of answer quality.

## Current ways to use the development build

### A. Local Python web/API development (Windows)

These instructions are for developers testing the source on their own computer. They do **not** install HM inside ChatGPT.

1. Install Python 3.10 or newer.
2. Open PowerShell in the project folder.
3. Run:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e ".[dev]"
hm-token
```

4. Open **http://127.0.0.1:8000** for local testing.

If PowerShell blocks environment activation:

```powershell
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m hm_token_intelligence.app
```

The address `http://127.0.0.1:8000` is only available on your own computer. ChatGPT's hosted app connection cannot use it.

### B. Chrome/Edge extension MVP

1. Download the repository ZIP and extract it.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Turn on **Developer mode**.
4. Select **Load unpacked** and choose the repository's `extension` folder.
5. Open or reload ChatGPT in that browser.

The extension can show heuristic warnings while typing in the browser composer. It is an early developer build and has not been verified across all ChatGPT page layouts. It does not run inside the native ChatGPT Desktop or phone apps.

### C. Direct ChatGPT MCP integration (experimental)

The MCP server and widget are in [mcp-server](mcp-server/README.md). The root [render.yaml](render.yaml) prepares one Render Free web service in Singapore. Deployment still requires the repository owner to connect a Render account, review the free-tier terms, and apply the Blueprint. No live endpoint currently exists.

**OpenAI plan/client eligibility:** OpenAI currently documents full custom MCP support for ChatGPT Business and Enterprise/Edu on the web. Pro users are limited to read/fetch permissions. The current Help Center says custom MCP connections are not supported on mobile. Go and Free are not listed as eligible for full custom MCP. Check the current [OpenAI connection guide](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt) and workspace permissions before proceeding.

The pilot uses no authentication, so its endpoint is public and must not receive sensitive or confidential prompts. It has a bounded request body and process-wide rate budget but is not production-secure. Read [ChatGPT setup](docs/CHATGPT_SETUP.md) before deployment.

### D. Mobile companion (planned)

A responsive, installable HM PWA is planned for pasting/sharing prompt text, analyzing it, and copying a user-approved revision back to ChatGPT. It is a companion workflow, not a live overlay inside the native ChatGPT mobile app.

## Accuracy and privacy boundaries

- Exact token counts apply only to the exact text submitted and the explicitly selected encoding.
- Never claim to count hidden system/developer instructions, server-side conversation history, tool definitions, or image/audio/video payloads.
- For real API usage, provider-reported usage is authoritative.
- The browser extension analyzes visible composer text locally; it does not need to send prompt text to a server.
- Warnings are indicators for user review, not definitive proof that a prompt will fail.
- HM must explain potential waste and suggest improvements, but the user remains in control. Never auto-edit or auto-submit.

## Core product principles

1. Easy to install and understand.
2. Analyze prompts at the point of composition wherever the host platform permits.
3. Visually identify ambiguity, missing context, repetition, unnecessary verbosity, and unclear output requirements.
4. Explain why each issue matters and offer a user-approved improvement.
5. Protect answer quality: fewer tokens is not better if it makes the result worse.
6. Evaluate whether the response achieved the user's stated goal and identify avoidable rework where measurable.
7. Clearly distinguish exact counts, estimates, and inferred savings.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md).
