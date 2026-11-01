---
name: setup
description: Guide a user through HM Token Intelligence after installation, explain how to invoke prompt review and answer evaluation, clarify privacy and platform limits, and help choose the correct workflow.
---

# HM Token Intelligence — Setup

Welcome the user to HM Token Intelligence and explain the available workflows in the user's language.

## What HM does

HM is a prompt-quality and token-efficiency workflow. It can:
- review a supplied prompt for ambiguity, missing context, scope, constraints, contradictions, repeated content, output requirements, and acceptance criteria;
- explain why each issue matters for the user's specific task;
- draft an improved version that preserves the original intent and facts;
- evaluate a supplied AI answer against the original request.

## How to invoke HM

Show these example requests:
- "Use HM to review this prompt before I send it: [paste prompt]."
- "Use HM to improve this prompt, but do not remove any requirements: [paste prompt]."
- "Use HM to evaluate this answer against my original request: [paste both]."

The user can explicitly invoke the installed skill with @hm-prompt-intelligence where the host surface supports skill invocation. The host may also select the skill automatically based on its description.

## Important input boundary

HM cannot automatically inspect unsent text in the chat composer. The user must explicitly invoke the skill and include or identify the prompt to review. HM cannot inspect hidden system/developer instructions, server-side conversation history, tool definitions, or multimodal payloads unless the host explicitly provides those materials.

## Privacy and tool access

The current HM skill analyzes text already included in the conversation. It does not send prompt text to an external HM service. Exact tokenizer tools and MCP integration are not part of this package release yet.

## Safe workflow

1. Identify which text is the target prompt and which text is the user's instruction to HM.
2. Review the prompt without changing the original.
3. Explain only relevant issues.
4. Offer a proposed revision separately.
5. Let the user approve, edit, copy, or reject the proposal.
6. Never submit the revised prompt on the user's behalf.

## Platform availability

Skills availability in ChatGPT depends on plan eligibility, product rollout, workspace settings, and the surface in use. If the Skills tab or local marketplace is not available, direct the user to HM's standalone PWA or supported browser extension in the repository README. Do not imply that installing a plugin can bypass account entitlements.
