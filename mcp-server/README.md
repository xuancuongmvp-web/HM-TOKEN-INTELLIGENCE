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

- `analyze_prompt`: tokenizer count for supplied text and selected encoding, plus heuristic findings.
- `optimize_prompt_formatting`: conservative whitespace/newline cleanup preview.

## Hosting status

The root `render.yaml` now deploys only the static PWA. This MCP server is not part of the default Blueprint and needs a separate deployment if an eligible ChatGPT workspace is available.

OpenAI's current documentation limits full custom MCP to Business and Enterprise/Edu on ChatGPT web. Pro is restricted to read/fetch permissions; mobile custom MCP is not supported. See [OpenAI's guide](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt).

This code remains experimental. Authentication is an initial bearer-token gate only; it does not provide user accounts, OAuth, per-user quotas, or production-grade privacy controls. Do not expose it as a public multi-user service until those controls and a security review are complete.
