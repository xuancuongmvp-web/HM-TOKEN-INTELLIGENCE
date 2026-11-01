# HM Prompt Monitor (MVP)

Chrome/Edge extension for ChatGPT. It shows a small local analysis panel while a prompt is being typed and can be opened on demand from the extension button.

## Install (one-time setup)
1. Download the repository ZIP and extract it.
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the repository's `extension` folder.
5. Open or reload ChatGPT. Pin **HM Prompt Monitor** to the browser toolbar for one-click analysis.

## Use
- Type in the ChatGPT composer: the panel updates after a short pause.
- Or click the extension icon, then **Phân tích prompt hiện tại**.
- Close the panel with ×.

## Privacy and limitations
- The MVP analyzes visible composer text locally in the browser; it does not send prompt text to a server.
- Token count is a rough character-based estimate, NOT a tokenizer-exact count.
- It cannot inspect hidden system/developer instructions, full server-side context, tool schemas, or image/audio/video payloads.
- Findings are heuristic suggestions, not a guarantee of answer quality.
- It never edits or submits a prompt automatically.
- ChatGPT may change its page structure; selectors may need maintenance.
