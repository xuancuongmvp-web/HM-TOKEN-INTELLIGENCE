# Platform support and account-tier independence

Last checked: 1 Nov 2026.

## Product requirement

HM's essential functions must be available to people using any ChatGPT account tier, from Free to the highest paid personal tier (including Pro/MAX terminology used by users). HM must not depend on ChatGPT MCP, an OpenAI API key, or account-specific plugin permissions for its main workflow.

## Access architecture

| User environment | HM route | Account-plan dependence | Current status |
|---|---|---|---|
| Chrome/Edge on Windows/macOS | HM Prompt Monitor extension beside visible ChatGPT Web composer | None at HM level; user still needs browser access to ChatGPT | Early MVP; heuristic warnings, approximate token count |
| Desktop browser, any OS | Standalone HM PWA open beside ChatGPT | None | PWA code in repository; public deployment pending |
| Android/iOS browser | Responsive HM PWA; paste prompt, analyze, copy result back | None | Responsive first version committed; device verification pending |
| Native ChatGPT Desktop | PWA beside the native app or extension in a supported browser | None for PWA | No direct native composer overlay is claimed |
| Native ChatGPT mobile app | PWA in a browser or share/paste workflow | None for PWA | No direct native composer overlay is claimed |
| ChatGPT web custom app | Optional MCP app | Depends on current ChatGPT plan, workspace role, and permissions | Experimental MCP implementation, not required for core use |

## Why MCP is optional

OpenAI's current help documentation says full custom MCP connections are available for ChatGPT Business and Enterprise/Edu on the web. Pro custom MCP is restricted to read/fetch permissions, and custom MCP connections are not supported on mobile. Workspace administration and access permissions also apply.

Sources:
- [Connect custom MCP servers in ChatGPT](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)
- [Build with the Apps SDK](https://help.openai.com/en/articles/12515353-building-with-the-apps-sdk)

Therefore MCP is an optional advanced integration, not the foundation for Free-to-Pro/MAX access.

## Required PWA experience

1. Open the HM URL in any modern desktop or mobile browser.
2. Paste or share prompt text into HM.
3. Count tokens using the selected tokenizer.
4. Show specific issues, reasons, and suggestions.
5. Preview formatting-only cleanup and compare before/after token counts.
6. Let the user copy or apply the proposed text explicitly.
7. Never automatically send a prompt.

The PWA runs tokenization and heuristic analysis inside the browser. Prompt text should not be transmitted to an HM backend.

## Required browser-extension experience

- Inspect visible ChatGPT Web composer text locally.
- Display low-distraction warnings after a typing pause and on request.
- Label its current token count as approximate until a bundled tokenizer is shipped.
- Never auto-edit or submit.
- Do not claim it works in native ChatGPT desktop/mobile applications.

## Accuracy and privacy

- Exact counts apply only to supplied text and a selected encoding.
- Hidden system/developer instructions, server-side history, tool schemas, and multimodal payloads are unavailable.
- Heuristic scores are experimental structural signals, not guarantees of answer correctness.
- Token reduction is not success when it removes meaning or harms answer quality.
- The PWA must remain usable without login or API credentials.
