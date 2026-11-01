# HM Token Intelligence — portable ChatGPT Plugin

Version: **0.3.0**

This portable Agent Plugin packages HM's reusable prompt-intelligence skill for supported ChatGPT and Codex surfaces.

## What is included

- `plugin.json` — portable plugin manifest, OpenAI listing metadata, onboarding entrypoint.
- `skills/hm-prompt-intelligence/SKILL.md` — the main HM review / improve / answer-audit workflow.
- `skills/hm-prompt-intelligence/agents/openai.yaml` — skill display and invocation metadata.
- `skills/setup/SKILL.md` — first-run orientation.
- `assets/` — HM icon and logo.
- `tests/ACCEPTANCE.md` — manual acceptance cases for prompt types and answer evaluation.

## Invoke

In ChatGPT, type `@` and select **HM Prompt Intelligence**, or ask naturally: "Use HM to review this prompt before I send it." ChatGPT may also select the skill automatically when the request matches its description.

In Codex surfaces, type `$` and select `hm-prompt-intelligence`.

Examples:
- `@hm-prompt-intelligence Review this prompt before I send it: [paste target prompt]`
- `@hm-prompt-intelligence Improve this prompt but preserve every requirement: [paste target prompt]`
- `@hm-prompt-intelligence Compare this answer with my original request: [include both]`

## Install from this repository

This repository includes a local marketplace at `../../.agents/plugins/marketplace.json`. In supported ChatGPT desktop Work/Codex plugin surfaces, open the repository as the active project, open the Plugins Directory, select the local/repo marketplace, and install **HM Token Intelligence**. See [the full install guide](../../docs/CHATGPT_PLUGIN_INSTALL.md).

For a standalone ChatGPT Skill upload, upload a ZIP whose top-level folder contains `SKILL.md` and its optional supporting files. The GitHub Actions workflow publishes a `hm-prompt-intelligence-skill.zip` artifact for eligible users.

## Boundaries in this release

This is **Skill + Token Engine integration-ready**. The Skill now has an explicit tool workflow for the HM MCP tools `count_tokens`, `analyze_prompt`, and `compare_prompts`. The server implements these tools with `js-tiktoken` and tests their counting/comparison behavior. However, the remote MCP service has not yet been deployed and connected to this plugin, so exact counts are not yet callable from the installed Skill session.

- The skill reviews text and files the user explicitly provides in the conversation.
- It cannot inspect unsent text in the chat composer or hidden ChatGPT context.
- It can prepare an improved prompt as a separate proposal, but does not replace or submit the original.
- Exact tokenizer code and MCP tools are implemented in `mcp-server/`; they become available inside this Skill only after the MCP server is deployed and its endpoint is registered in the plugin's MCP configuration. Until then, the Skill must say exact counting is not connected in the current session.
- The current MCP prototype is not wired into this package; it still needs HTTPS deployment, OAuth, per-user quotas, privacy controls, and security review.

## Availability

Plugins are supported across ChatGPT Chat/Work on web, desktop, and mobile, but individual plugin capabilities vary by plan, role, region, workspace, and surface. ChatGPT Skills are currently documented for eligible Business, Enterprise, Healthcare, and Edu users, subject to availability and workspace settings. Do not assume a custom Skill works on every Free, Go, Plus, or Pro account.

For users without Skills/plugin support, use the HM browser extension or standalone PWA.
