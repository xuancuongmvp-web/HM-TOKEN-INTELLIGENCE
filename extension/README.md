# HM Prompt Monitor

Early Chrome/Edge extension for ChatGPT Web. Its browser-side analysis does not depend on whether the ChatGPT user has Free, Go, Plus, Pro/MAX, or a workspace plan.

## Install for development

1. Download the repository ZIP and extract it.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the repository's `extension` folder.
5. Open or reload ChatGPT Web.

## Use

- Type in the ChatGPT composer. The analysis panel updates after a short pause.
- Or click the extension icon and select **Phân tích prompt hiện tại**.
- Close the panel with ×.

## Privacy and limits

- The extension reads visible composer text locally in the browser; it does not send prompt text to an HM server.
- The token count is a rough character-based estimate, not an exact tokenizer count.
- It cannot inspect hidden system/developer instructions, server-side history, tool schemas, or image/audio/video payloads.
- Findings are heuristic suggestions, not a guarantee of answer quality.
- It never edits or submits a prompt automatically.
- It runs in supported Chrome/Edge browser pages, not inside native ChatGPT Desktop or mobile apps.
- ChatGPT may change its page structure; composer selectors need maintenance.

For exact tokenizer counts on desktop and mobile browsers, use the standalone [HM PWA](../pwa/README.md).
