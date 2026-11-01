# Platform support and integration status

Last checked: 2026-11-01 against OpenAI Help Center documentation.

## Product requirement

HM Token Intelligence is intended to support:
- ChatGPT in Chrome/Edge desktop browsers, with live composer hints through a browser extension.
- ChatGPT Desktop (Windows/macOS), with the closest supported in-app integration when OpenAI exposes custom app/MCP connections to that client; otherwise use the HM companion web app.
- ChatGPT on iOS/Android, with an easy mobile companion/PWA until native custom app connections are supported.

The requirement is multi-platform usability. It is **not** acceptable to describe a companion website as if it were embedded in the native ChatGPT composer.

## Verified platform constraints

- OpenAI's current custom MCP connection help page describes connecting custom MCP servers in ChatGPT on the web and explicitly says custom MCP connections on mobile are not supported. It also says local MCP servers cannot be connected directly; a remote public HTTPS endpoint or supported Secure MCP Tunnel is required. See [Connecting custom MCP servers in ChatGPT](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt).
- Apps SDK is the supported development route for an interactive app inside ChatGPT, but creating/testing/publishing the app has separate requirements. See [Building with the Apps SDK](https://help.openai.com/en/articles/12515353-building-with-the-apps-sdk).
- A public app/plugin endpoint requires stable, publicly reachable HTTPS and an MCP-compatible endpoint; localhost is not a production endpoint. See [Build an MCP server](https://developers.openai.com/plugins/build/mcp-server).
- A browser extension can inspect visible composer text on supported browser pages, but it cannot inject itself into the native ChatGPT Windows/macOS app or native iOS/Android apps.

## Platform matrix

| Host | Current practical experience | Status / limitation |
|---|---|---|
| ChatGPT in Chrome/Edge desktop | HM Prompt Monitor browser extension | Early MVP committed; must be tested against current ChatGPT DOM. |
| ChatGPT in other desktop browsers | Not guaranteed | Extension compatibility and page selectors need separate testing. |
| Native ChatGPT Desktop (Windows/macOS) | HM companion web app; future custom app integration only if client support is available | Do not claim direct composer monitoring or custom MCP availability without verified client support. |
| ChatGPT web with custom MCP app | Intended Apps SDK + remote MCP interactive app | Not implemented/deployed yet; availability depends on account/workspace eligibility. |
| Native ChatGPT mobile apps (iOS/Android) | HM mobile companion web app/PWA; paste/share text for analysis | Current OpenAI docs say custom MCP connections are web-only, not mobile. No live overlay in native ChatGPT composer. |
| ChatGPT in mobile browser | Responsive companion workflow; extension is not assumed | No guaranteed native-app or live-composer integration. |

## Required user experience

Where host permissions allow:
1. Detect the prompt the user is composing.
2. Show an unobtrusive token estimate and quality signals.
3. Highlight specific issues: unclear intent, missing context, duplicate/repeated content, unspecified output, and potentially unnecessary verbosity.
4. Explain why each issue matters.
5. Offer a revised prompt and show the before/after comparison.
6. Never overwrite or submit without an explicit user action.

Where direct composer access is unavailable:
- Provide a mobile-first companion page that accepts pasted/shared text.
- Return a clear visual report and copyable improved prompt.
- State plainly that this is a companion workflow, not a native ChatGPT overlay.

## Privacy and accuracy

- Prefer local analysis in the browser extension.
- Do not transmit prompt text unless the user explicitly chooses a cloud analysis feature and has been informed.
- Label character-based token estimates as estimates.
- Exact tokenizer counts apply only to submitted text and a known encoding.
- Never imply access to hidden system/developer instructions, server-side conversation context, tool schemas, or multimodal payloads.
- Do not equate token reduction with improved quality; protect the user's intended outcome.

## Engineering sequence

1. Keep the existing local API/web playground as a developer tool, not the end-user integration.
2. Finish and test the Chrome/Edge extension.
3. Build a mobile-first companion PWA with paste/share, analysis, and copy-back flow.
4. Implement the Apps SDK + remote MCP server and interactive UI.
5. Deploy a stable HTTPS endpoint, add authentication/privacy controls as required, and test in an eligible ChatGPT web account/workspace.
6. Test desktop and mobile native clients separately; only advertise direct integration after a real client test and current OpenAI documentation confirm support.
