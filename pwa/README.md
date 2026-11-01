# HM Token Intelligence PWA

The PWA is the primary plan-independent way to use HM. It works independently of whether a person uses ChatGPT Free, Go, Plus, Pro/MAX, Business, or another account tier.

## Run locally

Requires Node.js 20.19+ (or Node.js 22.12+).

```bash
cd pwa
npm install
npm test
npm run dev
```

Open the local Vite address printed in the terminal.

## Deploy

The repository-root `render.yaml` defines one free Render Static Site. In Render, choose **New → Blueprint**, connect this repository, review that only the static site is being created, then apply it. Render assigns a public HTTPS `onrender.com` address.

Static sites are served from a CDN and do not need an always-running server. The PWA performs tokenization and prompt analysis inside the user's browser. It does not need an OpenAI API key, a ChatGPT plugin, MCP, or a paid ChatGPT subscription.

## Use

1. Open the public HM PWA URL.
2. Paste a prompt into the editor.
3. Select the tokenizer encoding when known; otherwise keep the default `o200k_base`.
4. Select **Phân tích prompt**.
5. Review token count, structural warnings, and explanations.
6. Review the formatting-only preview. Copy it or explicitly place it back into the editor.

HM never auto-submits a prompt. Formatting cleanup is mechanical only; it does not paraphrase or remove ideas.

## Accuracy and privacy

- Token counts are exact for the supplied text and selected encoding, not for the full ChatGPT turn.
- Hidden instructions, server-side chat history, tool schemas, and image/audio/video content are not visible to this PWA.
- The prompt is processed locally in the browser. No backend receives the prompt text.
- The score and warnings are experimental heuristics, not a prediction of answer quality.
- The same PWA can be used beside ChatGPT in desktop browsers and mobile browsers. It is not a live overlay inside the native ChatGPT mobile or desktop composer.
