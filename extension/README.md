# HM Prompt Assistant — browser extension MVP

HM is designed to appear beside the AI website's chat composer. It is independent of the user's ChatGPT subscription tier.

## Supported targets in this build

- ChatGPT Web: `chatgpt.com`, `chat.openai.com`
- Gemini Web: `gemini.google.com`
- Claude Web: `claude.ai`
- Microsoft Copilot Web: `copilot.microsoft.com`
- Perplexity Web: `www.perplexity.ai`

Each AI website can change its composer DOM. The selectors in this build are best-effort and must be verified against the live page. Do not claim every provider/client is fully stabilized until those tests are completed.

## Install / update locally

1. Download the latest repository ZIP and extract it.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. If an older HM extension is already installed, click its **Reload** button after replacing the source files.
5. Select **Load unpacked** and choose this repository's `extension` folder.
6. Reload the AI chat website tab.

## Use inside the chat page

1. Open ChatGPT, Gemini, Claude, Copilot or Perplexity in the browser.
2. Type or paste a prompt into the site's chat composer.
3. A small **HM** button appears next to the composer. Click it.
4. Review the detected issues, missing structural signals, and suggestions.
5. Fill only the clarification fields that apply: scope, context/data, output, constraints, audience, and completion criteria.
6. Select **Tạo bản prompt cải thiện**.
7. Review the proposal, then click **Chèn vào ô chat**. HM replaces the composer text only after this explicit click.
8. Read the text in the AI chat box and press that site's Send button yourself.

HM never clicks Send or submits the prompt automatically. The original text remains untouched until the user chooses to insert the generated draft.

The browser toolbar popup can also open HM beside the current page composer.

## What the proposal does

The proposal preserves the original request and adds only the clarification details the user supplied. It does not pretend to infer missing business facts or invent the user's intended scope. If clarification fields are left empty, HM marks the relevant unknowns instead of fabricating values.

## Privacy, accuracy, and limits

- Text analysis runs in the browser. This extension does not send prompt text to an HM server.
- The current extension token count is approximate (character-based), not tokenizer-exact.
- It cannot read hidden system/developer instructions, server-side history, tool schemas, or multimodal payloads.
- Findings are rule-based signals, not a semantic AI review or a guarantee of answer quality.
- Composer selectors can break when an AI provider updates its website.
- This extension runs on supported browser pages; it does not inject into native ChatGPT desktop or mobile apps.
- Extension actions never submit the user's message.

## Update / troubleshooting the HM button

When a new version is downloaded:

1. Replace the old extracted repository folder with the new ZIP contents.
2. Open `edge://extensions` or `chrome://extensions`.
3. Click the **Reload** icon on HM Prompt Assistant.
4. Return to `https://chatgpt.com` and press `Ctrl+R` to reload the AI page.
5. Click inside the chat input once. HM should attach a small **HM** button beside the composer.
6. Click the in-page HM button. The extension toolbar popup can also be used to request opening the on-page assistant.

The toolbar popup is only a launcher. The actual analysis panel is rendered inside the AI chat page. If the launcher says it cannot find an input after reloading both the extension and page, the provider may have changed its composer DOM; the extension needs a selector adapter update.

## ChatGPT composer detection

For ChatGPT the extension tries the `#prompt-textarea` ProseMirror editor first, then role/textbox/contenteditable/textarea variants. It scores visible candidates, includes open shadow roots, and checks the last focused editor. This is best-effort because the site's DOM is not a stable public API.
