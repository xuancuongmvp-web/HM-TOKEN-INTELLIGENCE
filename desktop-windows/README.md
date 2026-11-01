# HM Desktop Companion for Windows

A local-first Windows companion for ChatGPT Desktop and other AI desktop apps. It is separate from the browser extension and does not inject code into the native ChatGPT app.

## Current interaction model

1. Focus the unsent prompt in ChatGPT Desktop.
2. Press **Ctrl+A**, then **Ctrl+C** to copy the composer text.
3. Press the global shortcut **Ctrl+Shift+H**. HM opens and reads the clipboard text.
4. Review the token estimate, structure checks, warnings, and explanations.
5. Fill in clarification fields where relevant.
6. Generate the improved prompt. The original text is retained in the proposal.
7. Review and edit the proposal, then click **Sao chép bản đề xuất**.
8. Return to ChatGPT Desktop, focus the composer, press **Ctrl+A**, then **Ctrl+V**. Review it and send manually.

The app never sends messages or edits the ChatGPT composer automatically. This clipboard workflow works with any desktop AI client that permits ordinary text copy/paste.

## Privacy and accuracy

- All analysis runs locally in the Windows app. No prompt text is sent to a server.
- The desktop MVP reads the clipboard only after the user presses the hotkey or the Read Clipboard button.
- Token count is currently an estimate based on character length, not an exact tokenizer count.
- Findings are rule-based signals, not semantic AI evaluation or a guarantee of answer quality.
- The tool only sees copied text. It cannot read hidden system prompts, hidden chat history, or attachments.
- Missing information is shown as explicit placeholders; HM does not invent facts.

## Build from source

Requires Windows 10/11 and .NET 8 SDK with the Windows Desktop workload.

```powershell
cd desktop-windows
dotnet build -c Release
dotnet run
```

The global shortcut is Ctrl+Shift+H. If another app already owns it, use **ĐỌC CLIPBOARD** inside HM instead.

## Scope

This is the first Windows desktop companion MVP. It does not yet embed inside the ChatGPT desktop composer. Direct integration through Windows UI Automation is a future enhancement and will require live testing against the current ChatGPT desktop app.
