# HM Token Intelligence

**HM Token Intelligence** is an open-source prompt quality and token-efficiency project. Its core purpose is to help people see why a prompt may waste tokens or produce weak results, understand the problem, and choose how to improve it. It must never silently rewrite or submit a user's prompt.

> **Important product status (1 Nov 2026):** This repository contains an experimental local web/API foundation and an early Chrome/Edge extension. It is **not yet a published ChatGPT app**, does **not** currently integrate directly into the native ChatGPT Desktop or mobile composer, and is **not yet hosted as a public service**.

## What exists now

- Token counting for text explicitly supplied to the API with a selected `tiktoken` encoding.
- Conservative, mechanical text cleanup preview.
- FastAPI web interface and API.
- Early Chrome/Edge extension MVP that analyzes visible text in the ChatGPT browser composer using local heuristics.
- Platform support notes in [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md).

The extension's token figure is a rough estimate based on visible text length, not an exact tokenizer count. Its warnings are heuristic suggestions, not a guarantee of answer quality.

## Choose how to use the current development build

### A. Local web/API development (Windows)

These instructions are for developers testing the current source code on their own computer. They do **not** install HM inside ChatGPT.

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

4. For local testing only, open **http://127.0.0.1:8000** in your browser.

If PowerShell blocks environment activation:

```powershell
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m hm_token_intelligence.app
```

The address `http://127.0.0.1:8000` is a loopback address available only on your own computer. It is not a public link and cannot be used by ChatGPT's hosted app connection.

### B. Current Chrome/Edge extension MVP

1. Download the repository ZIP and extract it.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Turn on **Developer mode**.
4. Select **Load unpacked** and choose the repository's `extension` folder.
5. Open or reload ChatGPT in that browser.

The extension can show heuristic warnings while typing in the browser composer. It is an early developer build and has not yet been verified across all ChatGPT page layouts. It does not run inside the native ChatGPT Desktop application or the ChatGPT phone apps.

### C. Direct ChatGPT app integration (not released yet)

The intended in-ChatGPT experience is an **Apps SDK + remote MCP app**, with an interactive analysis UI. This requires a deployed, stable HTTPS MCP endpoint, implementation of the MCP server and app UI, privacy/security review, and the applicable ChatGPT account/workspace permissions.

The local address `http://127.0.0.1:8000` is not sufficient. A public deployment and ChatGPT connection setup are still outstanding. See [OpenAI's Apps SDK guide](https://help.openai.com/en/articles/12515353-building-with-the-apps-sdk) and [custom MCP connection guide](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt).

**Current platform limitation:** OpenAI's current custom MCP connection guide says custom MCP servers can be connected in ChatGPT on the web and explicitly says mobile connections are not supported. Do not assume that an app connected on the web will appear in the native Windows/macOS or iOS/Android ChatGPT apps. Until OpenAI enables those clients, the practical fallbacks are the browser extension for ChatGPT in Chrome/Edge and a mobile-friendly HM companion web app/PWA.

### D. Mobile companion (planned, not released)

A responsive, installable HM web app/PWA will let users paste or share prompt text into HM, see token and quality analysis, and copy an improved version back to ChatGPT. This is a companion workflow, **not** a live overlay inside the native ChatGPT mobile app.

## Accuracy and privacy boundaries

- Exact token counts apply only to the exact text submitted and the explicitly selected encoding.
- Never claim to count hidden system/developer instructions, server-side conversation history, tool definitions, or image/audio/video payloads.
- For real API usage, provider-reported usage is authoritative.
- The browser extension analyzes visible composer text locally; it does not need to send prompt text to a server.
- Warnings are indicators for user review, not definitive proof that a prompt will fail.
- HM must explain potential waste and suggest improvements, but the user remains in control. Never auto-edit or auto-submit.

## API

- `GET /health`
- `GET /v1/encodings`
- `POST /v1/count`
- `POST /v1/optimize`

Interactive API documentation in local development is available at `http://127.0.0.1:8000/docs`.

## Core product principles

1. Easy to install and understand.
2. Analyze prompts at the point of composition wherever the host platform permits.
3. Visually identify ambiguity, missing context, repetition, unnecessary verbosity, and unclear output requirements.
4. Explain why each issue matters and offer a user-approved improvement.
5. Protect answer quality: fewer tokens is not better if it makes the result worse.
6. Evaluate whether the response achieved the user's stated goal and identify avoidable rework where measurable.
7. Clearly distinguish exact counts, estimates, and inferred savings.

## Development roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md).
