# Install HM Token Intelligence in ChatGPT Desktop

This guide covers the repository-local plugin marketplace. It is intended for development and personal testing; it is not the same as publishing HM to the public Plugins Directory.

## Requirements

- ChatGPT desktop app with the Plugins / local marketplace experience enabled.
- A local copy of this repository on your computer.
- Permission for the desktop app to read the repository folder.
- A ChatGPT plan and workspace configuration that expose the relevant plugin/Skills features.

The portable HM plugin is at `plugins/hm-token-intelligence/`. The repo marketplace file is `.agents/plugins/marketplace.json`.

## Windows setup

1. Download the latest ZIP from GitHub and extract the full repository to a stable folder, for example `D:\A.I\HM-TOKEN-INTELLIGENCE`.
2. Keep the folder structure intact. Do not move the `plugins` folder away from the repository root.
3. Open the ChatGPT desktop app.
4. Open the Plugins Directory / Plugins panel. In the desktop app's Work or Codex plugin environment, choose the local/repository marketplace source and select the marketplace discovered from this repository.
5. If the marketplace does not appear automatically, restart the ChatGPT desktop app after the repository is available locally.
6. Find **HM Token Intelligence** in the local marketplace and install it.
7. Start a new chat after installation so the newly installed skill is available.
8. Invoke `@hm-prompt-intelligence` on surfaces that support explicit skill invocation, or ask ChatGPT to use HM to review a prompt.

## Test HM

Try this request:

```text
Use HM to review this prompt before I send it:

"Hãy phân tích tất cả mọi thứ giúp tôi."
```

HM should identify that the scope is too broad, ask what object or topic should be analyzed, and explain that data, intended output, and success criteria may be required depending on the task. It should not invent the missing facts.

Then try a well-specified prompt and confirm HM does not force unnecessary extra sections onto a simple task.

## What this plugin currently does

The current release bundles reusable prompt-review and answer-evaluation instructions. It is a skill-led plugin, not yet an MCP-connected application.

- It can review text explicitly supplied in the conversation.
- It can propose an improved prompt for user review.
- It can evaluate an answer when the original request and answer are supplied.
- It cannot inspect unsent composer text automatically.
- It does not provide exact tokenizer counts until the authenticated HM MCP tools are connected.
- It never silently edits or sends prompts.

## Plan and surface eligibility

ChatGPT Skills are currently documented for eligible Business, Enterprise, Healthcare, and Edu users, subject to workspace settings and product availability. Local marketplace / plugin support can also vary by ChatGPT surface and account. Installing this package does not bypass account or workspace restrictions.

For users without the Skills or local marketplace feature, use the HM browser extension or standalone PWA.

## Updating HM

1. Download or pull the latest repository changes into the same local repository.
2. Restart the ChatGPT desktop app or refresh its Plugins Directory.
3. Update/reinstall the local marketplace plugin if the installed copy does not refresh.
4. Start a new conversation to test the current skill instructions.
