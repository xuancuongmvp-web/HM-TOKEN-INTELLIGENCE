# HM Token Intelligence — ChatGPT Plugin / Skill package

This portable package contains the hm-prompt-intelligence skill. It teaches ChatGPT to diagnose and improve supplied prompts and to evaluate AI responses against the original request.

## Invoke

In a ChatGPT surface that supports Skills/Plugins, explicitly select the skill (the ChatGPT skill picker is invoked with @) and provide the target prompt, or let the host select it based on the skill description.

Examples:
- @hm-prompt-intelligence Review this prompt before I send it: [paste target prompt]
- @hm-prompt-intelligence Compare this answer with my original prompt: [include both]

## Important boundary

A skill is a reusable workflow instruction. By itself it cannot intercept or read unsent text in the composer, silently modify the current draft, count exact tokens unless a tokenizer tool/runtime is available, or inspect hidden ChatGPT context.

For exact tokenizer counts and deterministic analysis tools, HM will add an authenticated MCP tool connection as a later plugin component. The current MCP prototype is not wired into this package: it has not yet been deployed with end-user authentication and production privacy controls.

## Availability

The skill and portable plugin package are committed to this repository for development and testing. ChatGPT Skills availability is subject to account eligibility, rollout, and workspace admin settings. OpenAI currently documents Skills for eligible Business, Enterprise, Healthcare, and Edu users; this should not be assumed to be available on every Free, Go, Plus, or Pro account.

For broader access, retain the HM browser extension and standalone web app as fallback routes. Neither requires the AI platform to support custom Skills.

## Package format

This follows the current Agent Plugins package structure:
- plugin.json — portable plugin manifest
- skills/hm-prompt-intelligence/SKILL.md — reusable workflow

No unauthenticated MCP endpoint is bundled.
