# Optional HM Token Intelligence MCP App

This is an experimental integration for supported ChatGPT web workspaces. It is **not required** for universal HM access.

The main HM product is the standalone [PWA](../pwa/README.md). It works independently of ChatGPT subscription tier and does not require MCP or an OpenAI API key.

## Run locally

Requires Node.js 20+.

```bash
cd mcp-server
npm install
npm test
npm start
```

Health: `http://localhost:8787/health`  
MCP endpoint: `http://localhost:8787/mcp`

## Tools

- `count_tokens`: exact count for supplied text and selected encoding.
- `compare_prompts`: same-encoding before/after counts and token delta.
- `analyze_prompt`: tokenizer count plus heuristic prompt findings.
- `optimize_prompt_formatting`: conservative whitespace/newline cleanup preview.

## Authentication and hosting status

The MCP endpoint supports a bearer token via `HM_MCP_API_TOKEN`. When configured, every `/mcp` request must include `Authorization: Bearer <token>`. Production startup refuses to run without this secret. The public `/` and `/health` endpoints do not accept prompt content. Never commit the token; configure it as a hosting-provider secret.

This is a single shared bearer credential, not OAuth and not per-user identity or per-user quotas. The current rate limit remains process-wide. Before a public multi-user launch, implement OAuth or per-user credentials, per-user quotas, stronger abuse controls, privacy review, and security testing.

The root `render.yaml` currently deploys only the static PWA. This MCP server is not part of the default Blueprint and still needs a separately configured, authenticated HTTPS deployment.

