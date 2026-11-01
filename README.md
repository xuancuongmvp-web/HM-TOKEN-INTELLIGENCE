# HM Token Intelligence

HM Token Intelligence is a local-first prompt quality and token-efficiency assistant. Its core experience is designed to be available regardless of whether someone uses ChatGPT Free, Go, Plus, Pro/MAX, or a workspace plan.

## Main product

- **PWA:** standalone browser app for desktop and mobile. Counts tokens with a real tokenizer, explains prompt warnings, and previews formatting cleanup. Does not require an OpenAI API key, MCP connection, or ChatGPT plan check.
- **Chrome/Edge extension:** local hints beside the visible ChatGPT Web composer. Desktop browser only; early MVP.
- **Optional MCP app:** an additional route for eligible ChatGPT web workspaces. Not required for the universal PWA or extension.
- **Python API:** developer foundation.

Using HM does not change the features or usage limits of the user's ChatGPT account.

## Run the PWA locally

Requires Node.js 20+.

```powershell
cd pwa
npm install
npm test
npm run dev
```

Open the local address printed by Vite. See [pwa/README.md](pwa/README.md).

## Hosting

The root `render.yaml` defines one free Render Static Site built from `pwa/`. Connect this repository through Render **New → Blueprint**, confirm only the static site is selected, and apply it. Render provides a public HTTPS address. Static-site usage is subject to current provider terms: [Render Free](https://render.com/docs/free).

## Privacy and accuracy

- PWA prompt analysis happens locally in the browser; prompt text is not sent to an HM backend.
- Exact token counts cover only the text supplied and the selected encoding.
- Hidden instructions, server-side chat history, tool definitions, and multimodal payloads are not included.
- The browser extension uses a rough character-based token estimate.
- Quality scores and warnings are experimental heuristics, not guarantees.
- HM never silently rewrites or submits a prompt. The user reviews every suggestion.
- Fewer tokens are not better when meaning or answer quality is lost.

## Optional MCP route

OpenAI currently documents full custom MCP support for Business and Enterprise/Edu on ChatGPT web; Pro custom connections have read/fetch restrictions, and mobile custom MCP connections are not supported. See [OpenAI's current guide](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt). HM's primary PWA does not depend on MCP.

See [docs/ROADMAP.md](docs/ROADMAP.md), [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md), and [extension/README.md](extension/README.md).
