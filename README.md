# HM Token Intelligence

HM Token Intelligence is a local-first prompt quality and token-efficiency assistant. Its core experience is designed to be available regardless of whether someone uses ChatGPT Free, Go, Plus, Pro/MAX, or a workspace plan.

## Main product

- **PWA:** standalone browser app for desktop and mobile. Counts tokens with a real tokenizer, explains prompt warnings, and previews formatting cleanup. Does not require an OpenAI API key, MCP connection, or ChatGPT plan check.
- **Browser extension:** HM appears beside supported AI chat composers, analyzes the visible prompt, collects clarifications, and inserts a proposal only after an explicit user action. It never presses Send. Current targets: ChatGPT, Gemini, Claude, Copilot, and Perplexity Web; live DOM compatibility still needs verification.
- **ChatGPT Plugin / Skill:** reusable prompt review, improvement, and answer-audit workflow. Install instructions: [docs/CHATGPT_PLUGIN_INSTALL.md](docs/CHATGPT_PLUGIN_INSTALL.md).
- **Optional MCP app:** an additional route for eligible ChatGPT web workspaces. Not required for the PWA or browser extension.
- **Windows desktop companion:** early clipboard-based WPF prototype, separate from native composer integration.

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

## ChatGPT Plugin / Skill route

The portable Agent Plugin package is in `plugins/hm-token-intelligence/`; the repo-local marketplace is `.agents/plugins/marketplace.json`.

- The plugin bundles the `hm-prompt-intelligence` skill and an onboarding skill.
- In ChatGPT, type `@` and select **HM Prompt Intelligence**, or ask naturally: "Use HM to review this prompt before I send it." ChatGPT may also select the skill automatically when the request matches its description.
- In Codex surfaces, type `$` and select `hm-prompt-intelligence`.
- The package has a portable `plugin.json`, OpenAI skill metadata, brand assets, acceptance tests, and an onboarding guide.
- The CI workflow produces both a standalone Skill ZIP and a portable Plugin ZIP.

A Skill is a workflow instruction, not a composer hook. It cannot read an unsent draft from the chat box. Include or identify the prompt in the conversation. This release is skill-led: it does not yet include exact tokenizer tools because the authenticated MCP service is not connected.

**Account caveat:** OpenAI currently documents ChatGPT Skills for eligible Business, Enterprise, Healthcare, and Edu users, subject to workspace settings and product availability. The Plugins Directory itself is available across plans, but individual plugin features and local marketplace access can still vary by plan and surface. Do not assume custom Skills are available on Free, Go, Plus, or Pro. See [Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) and [Plugins in ChatGPT and Codex](https://learn.chatgpt.com/docs/plugins).

The MCP prototype is intentionally not bundled into this release. Before connecting it, HM needs remote HTTPS hosting, OAuth, per-user quotas, privacy controls, and security review.

## Privacy and accuracy

- PWA prompt analysis happens locally in the browser; prompt text is not sent to an HM backend.
- Exact token counts in the PWA cover only the supplied text and selected encoding.
- Browser-extension token counts are approximate until its tokenizer is bundled.
- Skill analysis covers only content explicitly included in the conversation; it cannot inspect hidden system/developer instructions, server-side chat history, or an unsent composer draft.
- Skill token counts are estimates or unavailable until exact tokenizer tools are connected.
- Quality scores and heuristic warnings are experimental signals, not guarantees.
- HM never silently rewrites or submits a prompt. The user reviews every suggestion.
- Fewer tokens are not better when meaning or answer quality is lost.

## References

See [docs/ROADMAP.md](docs/ROADMAP.md), [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md), [extension/README.md](extension/README.md), and [plugins/hm-token-intelligence/README.md](plugins/hm-token-intelligence/README.md).
