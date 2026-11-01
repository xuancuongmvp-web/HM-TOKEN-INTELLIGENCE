# HM Token Intelligence — ChatGPT MCP App

This is the first remote MCP + interactive MCP Apps implementation for HM Token Intelligence.

## Run locally

Requires Node.js 20+.

```bash
cd mcp-server
npm install
npm start
```

Health: `http://localhost:8787/health`  
MCP endpoint: `http://localhost:8787/mcp`

Test with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector@latest
```

Choose Streamable HTTP and enter `http://localhost:8787/mcp`.

## Tools

- `analyze_prompt`: exact tokenizer count for the supplied text/encoding plus explainable heuristic warnings and a quality signal.
- `optimize_prompt_formatting`: conservative whitespace/newline cleanup only. It never paraphrases or submits.

## Connect to ChatGPT

ChatGPT must be able to reach the server over a stable HTTPS URL. Deploy this folder to a Node-compatible host, then connect:

`https://YOUR-DOMAIN/mcp`

Use ChatGPT's custom app/MCP connection flow where available. Do not use localhost as the production URL.

## Limitations

- The tool only analyzes text explicitly supplied to it by ChatGPT/user. It cannot observe the native ChatGPT composer or inspect hidden context.
- Direct MCP connection availability differs by ChatGPT client and account/workspace. Current OpenAI documentation should be checked before promising desktop/mobile native app support.
- This is an unauthenticated analysis-only prototype. Add authentication, rate limits, privacy policy, monitoring, and deployment hardening before public launch.
