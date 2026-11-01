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

## Optional project / conversation token ledger

Open **Theo dõi token dự án (tùy chọn)** to create a local usage record. Enter a project name, conversation name, model label, and whether the pasted content is a user prompt, AI response, or other text. Paste one message or a transcript segment and select **Ghi nhận token**. Reuse the same project and conversation names to aggregate usage across work sessions.

The ledger shows total tokens by project, user prompts, AI responses, conversations, and model. It can export a JSON usage report and delete individual projects or the entire local ledger.

Privacy by design:
- This feature is opt-in. Nothing is recorded unless the user presses the record button.
- It stores only counts and metadata; pasted message contents are not retained.
- Data stays in this browser's local storage and is not synced across devices.
- Exported reports contain usage metadata, not conversation text.
- To avoid double counting, record either individual messages or one combined transcript per conversation, not both.

Accuracy boundary:
- Counts are exact for the text pasted into HM using the selected encoding.
- HM cannot automatically read a user's complete ChatGPT, Claude, or Gemini history, hidden system/developer instructions, tool calls, or provider billing records.
- Provider billing may differ because models may use different tokenizers and may count cached input, reasoning, tool, image, audio, and video tokens differently.
- For a provider's actual usage, import or manually enter official usage metadata separately; do not mix it with tokenizer-derived estimates.

## Optional project / conversation token ledger

Open **Theo dõi token dự án (tùy chọn)** to create a local usage record. Enter a project name, conversation name, model label, role (user prompt, AI response, system instruction, or combined transcript), and interaction purpose (normal, clarification, revision, or rework). Paste one message or a transcript segment and select **Ghi nhận token**.

The retrospective summarizes total tokens, prompt and AI-response tokens, per-conversation totals, per-model totals, manually tagged clarification/revision/rework tokens, and the conversation with the highest recorded token count. Export the full metadata ledger as JSON or an individual project retrospective as CSV.

- The feature is opt-in. Only text explicitly submitted with the record button is counted.
- It stores token counts and metadata, never the pasted message content.
- Data remains in this browser's local storage and is not synced across devices.
- Keep the same tokenizer encoding within a project. Different encodings are not added into a single misleading total.
- Avoid double-counting: record individual messages or one combined transcript per conversation, not both.
- Rework and clarification labels are manually selected indicators, not proof that the prompt caused the rework.
- Counts are exact only for the text supplied to HM. They are not provider billing totals and do not include hidden context, tool payloads, caching, or multimodal content.

## Accuracy and privacy

- Token counts are exact for the supplied text and selected encoding, not for the full ChatGPT turn.
- Hidden instructions, server-side chat history, tool schemas, and image/audio/video content are not visible to this PWA.
- The prompt is processed locally in the browser. No backend receives the prompt text.
- The score and warnings are experimental heuristics, not a prediction of answer quality.
- The same PWA can be used beside ChatGPT in desktop browsers and mobile browsers. It is not a live overlay inside the native ChatGPT mobile or desktop composer.

## What the current analysis shows

Select **Phân tích prompt** (or press Ctrl+Enter) after pasting the text. Results appear below the editor and the page scrolls to them.

The first analysis version checks for six visible structural signals: task, context/source, output format, constraints, audience, and completion criteria. It also looks for broad scope, missing context/output on analytical or creation tasks, vague references, exact duplicate lines, conflicting brevity/detail instructions, and unusually long prompts.

This is a transparent rule-based MVP, not an AI model judging meaning. A phrase may be missed or a warning may not apply to a particular task. The six-part coverage indicator is not an absolute quality grade; simple questions do not need every dimension.

The original prompt is deliberately left unchanged. HM shows findings and a separate formatting-only preview. Only the user's explicit action can copy or apply that preview.
