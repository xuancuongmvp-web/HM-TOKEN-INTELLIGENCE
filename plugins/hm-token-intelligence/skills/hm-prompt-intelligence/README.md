# HM Prompt Intelligence Skill

This folder is the canonical source of the HM prompt-review skill bundled in the HM Token Intelligence plugin.

## Use in ChatGPT

After installing the HM plugin / skill on an eligible ChatGPT surface:

- Explicitly invoke it with `@hm-prompt-intelligence` and include the prompt to inspect.
- Or ask naturally, for example: "Use HM to review this prompt before I send it."
- To audit an answer, include both the original prompt and the AI answer.

The skill cannot read an unsent composer draft. It analyzes only content you explicitly provide in the conversation.

## Package structure

- `SKILL.md` — workflow instructions and required metadata.
- `agents/openai.yaml` — ChatGPT display metadata and invocation policy.

## Boundaries

The skill does not provide exact tokenizer counts without an MCP/tool runtime. It must label estimates as estimates and never claim to see hidden context. It never silently changes or submits prompts.
