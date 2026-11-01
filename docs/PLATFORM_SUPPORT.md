# Platform support and mobile plan

## Product requirement
HM Token Intelligence must support:
- ChatGPT in desktop browsers (Chrome/Edge extension for live composer hints).
- ChatGPT Desktop (no supported public API currently grants third-party apps access to every keystroke in the native composer; use an explicitly invoked ChatGPT app/MCP integration where available, plus the standalone web app).
- ChatGPT mobile apps (iOS/Android): provide a mobile-friendly standalone web app/PWA as the dependable companion experience. A browser extension cannot run inside the native ChatGPT mobile app.

## Important current platform constraints (checked 2026-11-01)
- OpenAI's Help Center currently says custom MCP apps/connectors are web-only, not available in the native ChatGPT mobile apps. See https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt
- The Apps SDK is the supported way to build an interactive app inside ChatGPT, but availability and client support are subject to OpenAI rollout and workspace plan. See https://help.openai.com/en/articles/12515353-building-with-the-apps-sdk
- ChatGPT mobile apps can use GPTs, but that does not provide a general mechanism to inspect text while it is being typed in the native composer. See https://help.openai.com/en/articles/8554407-gpts-in-chatgpt

## User experience by platform
| Platform | Supported experience | Limitation |
|---|---|---|
| Chrome/Edge desktop | HM Prompt Monitor extension; local composer heuristics | Depends on ChatGPT DOM selectors; no hidden context access |
| ChatGPT Desktop | Invoke HM via a supported app/tool integration where available; otherwise use companion web app | No supported general keystroke/composer observer API |
| ChatGPT iOS/Android | Responsive companion web app/PWA; analyze text pasted/shared by user | Native ChatGPT app does not support custom MCP apps per current OpenAI documentation; no live composer overlay |
| Mobile browser | Responsive companion web app; extension support varies and is not relied upon | No guaranteed native-app integration |

## Privacy and accuracy
- Live browser-extension analysis should remain local by default.
- Token estimates must be labelled as estimates unless a specific tokenizer and encoding are actually used.
- The tool cannot inspect hidden system/developer prompts, server-side conversation state, or multimodal payloads.
- Never auto-edit or auto-submit the user's prompt.
- A PWA companion is not the same as an in-composer integration. Do not advertise it as such.

## Next engineering steps
1. Make the existing web UI mobile-first and installable as a PWA.
2. Add share/paste flow so a user can send selected text to HM for analysis and copy an improved prompt back.
3. Deploy the API/web app to a stable HTTPS host before offering one-click mobile access.
4. Continue Apps SDK/MCP integration for supported ChatGPT web clients; retain text fallback for clients that do not render the interactive widget.
5. Do not claim full native mobile ChatGPT integration until OpenAI documents and enables it.
