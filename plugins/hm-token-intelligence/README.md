# HM Token Intelligence — portable ChatGPT Plugin

Version: **0.2.0**

This portable Agent Plugin packages HM's reusable prompt-intelligence skill for supported ChatGPT and Codex surfaces.

## What is included

- `plugin.json` — portable plugin manifest, OpenAI listing metadata, onboarding entrypoint.
- `skills/hm-prompt-intelligence/SKILL.md` — the main HM review / improve / answer-audit workflow.
- `skills/hm-prompt-intelligence/agents/openai.yaml` — skill display and invocation metadata.
- `skills/setup/SKILL.md` — first-run orientation.
- `assets/` — HM icon and logo.
- `tests/ACCEPTANCE.md` — manual acceptance cases for prompt types and answer evaluation.

## Invoke

In ChatGPT, explicitly select the skill with `@hm-prompt-intelligence`, or ask naturally: "Use HM to review this prompt before I send it." The host can also implicitly select the skill when a request matches the skill description.

In Codex surfaces, use `$hm-prompt-intelligence` or select it from the Skills picker.

Examples:
- `@hm-prompt-intelligence Review this prompt before I send it: [paste target prompt]`
- `@hm-prompt-intelligence Improve this prompt but preserve every requirement: [paste target prompt]`
- `@hm-prompt-intelligence Compare this answer with my original request: [include both]`

## Install from this repository

This repository includes a local marketplace at `../../.agents/plugins/marketplace.json`. In supported ChatGPT desktop Work/Codex plugin surfaces, open the repository as the active project, open the Plugins Directory, select the local/repo marketplace, and install **HM Token Intelligence**. See [the full install guide](../../docs/CHATGPT_PLUGIN_INSTALL.md).

For a standalone ChatGPT Skill upload, use the `hm-prompt-intelligence` folder as a skill bundle (ZIP the folder with `SKILL.md` at its root). The ChatGPT Skills interface is available only on eligible plans/workspaces; verify the account has the Skills tab before attempting upload.

## Boundaries in this release

This is a **skill-led plugin**, not yet an MCP-connected application.

- The skill reviews text and files the user explicitly provides in the conversation.
- It cannot inspect unsent text in the chat composer or hidden ChatGPT context.
- It can prepare an improved prompt as a separate proposal, but does not replace or submit the original.
- Exact tokenizer counts are not included yet. Without a tokenizer tool, the skill must label counts as estimates or say that exact counting is unavailable.
- The current MCP prototype is not wired into this package; it still needs HTTPS deployment, OAuth, per-user quotas, privacy controls, and security review.

## Availability

Plugins are supported across ChatGPT Chat/Work on web, desktop, and mobile, but individual plugin capabilities vary by plan, role, region, workspace, and surface. ChatGPT Skills are currently documented for eligible Business, Enterprise, Healthcare, and Edu users, subject to availability and workspace settings. Do not assume a custom Skill works on every Free, Go, Plus, or Pro account.

For users without Skills/plugin support, use the HM browser extension or standalone PWA.
