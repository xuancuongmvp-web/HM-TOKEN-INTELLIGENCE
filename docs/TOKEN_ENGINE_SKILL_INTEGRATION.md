# HM Skill ↔ Token Engine integration

The Skill is the workflow layer; the MCP server is the deterministic measurement layer.

| Tool | Function |
|---|---|
| `count_tokens` | Exact count for supplied text and selected encoding |
| `analyze_prompt` | Exact count plus heuristic prompt findings |
| `compare_prompts` | Same-encoding original/revised counts and token delta |

The Skill now names these tools and must call them when available. It must never claim exact counting when they are unavailable.

## Status
- [x] Implement `count_tokens`, `analyze_prompt`, and `compare_prompts`.
- [x] Update Skill workflow to invoke those tools when exposed by the host.
- [x] Test exact counts and same-encoding comparisons.
- [ ] Add production authentication, per-user quotas, privacy controls, and security review.
- [ ] Deploy the MCP server to HTTPS.
- [ ] Register the live endpoint in the Plugin's root `mcp.json`.
- [ ] Reinstall the Plugin and verify tool calls in a fresh session.

## Why it is not live yet
A Skill cannot create its own MCP connection. The plugin must point to a real, reachable MCP endpoint. The current server has no end-user OAuth/authentication or per-user quotas and must not be exposed publicly to private prompts. The current Render Blueprint deploys the PWA, not the MCP service.

## Accuracy
Counts are exact for the text submitted and selected encoding only. Hidden instructions, server-side conversation history, tool schemas, and multimodal payloads are excluded. Token-count comparison does not prove semantic equivalence; HM must review meaning separately.
