# HM Token Intelligence

HM Token Intelligence is a local-first prompt quality and token-efficiency assistant. Its core experience is designed to be available regardless of whether someone uses ChatGPT Free, Go, Plus, Pro/MAX, or a workspace plan.

## Main product

- **PWA:** standalone browser app for desktop and mobile. Counts tokens with a real tokenizer, explains prompt warnings, and previews formatting cleanup. Does not require an OpenAI API key, MCP connection, or ChatGPT plan check.
- **Browser extension (new in-composer MVP):** an HM button appears beside supported AI chat composers. It analyzes the current prompt, lets users fill missing details, creates a structured draft, and inserts it into the composer only after an explicit click. It never presses Send. Current targets: ChatGPT, Gemini, Claude, Copilot, and Perplexity Web; live DOM compatibility still needs per-site verification.
- **Optional MCP app:** an additional route for eligible ChatGPT web workspaces. Not required for the universal PWA or extension.
- **Python API:** developer foundation.

Using HM does not change the features or usage limits of the user's ChatGPT account.

## Run the PWA locally

Requires Node.js 20.19+ (or Node.js 22.12+).

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

## ChatGPT Plugin / Skill route

A portable Agent Plugin package is now included under `plugins/hm-token-intelligence/`.

- The bundled `hm-prompt-intelligence` skill teaches the AI how to review prompt intent, detect task-specific risks, explain findings, suggest an improved version, and evaluate an answer against the original request.
- The repo-scoped local plugin marketplace is at `.agents/plugins/marketplace.json`. It is intended for development/testing in the ChatGPT desktop app where local plugin marketplaces and Skills are enabled.
- Invoke the skill explicitly from a supported ChatGPT surface with `@hm-prompt-intelligence`, or allow the host to select it when the user's request matches its description.

A skill is a workflow instruction, not a composer hook. It cannot automatically read an unsent draft from the chat box. The user must invoke HM and include/identify the prompt to review. It also cannot produce exact tokenizer counts until the authenticated MCP tool service is connected.

OpenAI's current help article lists ChatGPT Skills for eligible Business, Enterprise, Healthcare, and Edu accounts, subject to workspace settings and rollout. Do not assume that a custom Skill is available on every Free, Go, Plus, or Pro account. See [Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt). The browser extension and PWA remain fallback routes for account tiers/surfaces without Skills.

The optional MCP service is not yet bundled into the plugin: it needs remote HTTPS hosting plus user authentication, privacy controls, and security review before it can receive user prompts.

## Windows desktop companion

An early Windows WPF companion source project is in `desktop-windows/`. It uses a user-invoked clipboard workflow (Ctrl+A, Ctrl+C, Ctrl+Shift+H) and does not inject into the native ChatGPT composer. It is a separate prototype; it has not yet been verified as a packaged Windows release.

## Optional MCP route

OpenAI currently documents full custom MCP support for Business and Enterprise/Edu on ChatGPT web; Pro custom connections have read/fetch restrictions, and mobile custom MCP connections are not supported. See [OpenAI's current guide](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt). HM's primary PWA does not depend on MCP.

See [docs/ROADMAP.md](docs/ROADMAP.md), [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md), and [extension/README.md](extension/README.md).
