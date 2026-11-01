# HM Token Intelligence — ChatGPT MCP App

This repository contains an experimental MCP server and interactive MCP Apps widget. It is suitable for a controlled pilot, not production use.

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

Test with MCP Inspector using Streamable HTTP at `http://localhost:8787/mcp`.

## Tools

- `analyze_prompt`: exact tokenizer count for the supplied text and selected encoding, plus explainable heuristic warnings.
- `optimize_prompt_formatting`: conservative whitespace/newline cleanup only. It returns a preview and never paraphrases or submits.

## Deploy a free pilot on Render

A root-level `render.yaml` Blueprint is included. It provisions one **Free** Docker web service in Singapore.

1. Sign in to Render and choose **New → Blueprint**.
2. Connect the GitHub repository `xuancuongmvp-web/HM-TOKEN-INTELLIGENCE`.
3. Let Render detect the root `render.yaml`.
4. Before applying, verify the service is named `hm-token-intelligence-mcp`, the plan is **Free**, the region is **Singapore**, and no paid add-ons or extra services are selected.
5. Apply the Blueprint and wait for the first deployment to finish.
6. Open `https://YOUR-RENDER-SERVICE.onrender.com/health`. It should return `{"status":"ok"}`.
7. The MCP endpoint is `https://YOUR-RENDER-SERVICE.onrender.com/mcp`.

The Blueprint does not create a Render account, accept terms, or authorize deployment on your behalf. Review the plan and any usage/billing screen before clicking deploy.

### Free-tier caveats

Render Free web services are for evaluation, not production. They spin down after 15 minutes without inbound traffic and can take about a minute to wake up. Their local filesystem is ephemeral. Check Render's current free-service limits before use.

## Connect to ChatGPT

ChatGPT needs the public HTTPS endpoint `https://YOUR-RENDER-SERVICE.onrender.com/mcp`. Follow the account/workspace-specific steps in [ChatGPT setup](../docs/CHATGPT_SETUP.md).

**Current access limitation:** OpenAI currently documents full custom MCP support for ChatGPT Business and Enterprise/Edu on the web. Pro is limited to read/fetch permissions. The current documentation says custom MCP connections are not supported on mobile. Go and Free are not listed as eligible for full custom MCP. Verify eligibility in the actual account/workspace before planning around this integration.

## Privacy and security boundaries

- This pilot does not implement user authentication or OAuth. Anyone who discovers the public URL may call its tools. Do not submit confidential, personal, customer, employee, or proprietary prompt text.
- The server does not intentionally persist prompt content or log request bodies. Treat this as a prototype, not a security guarantee.
- The MCP route has a 512 KiB request-body cap, a configurable 120-requests-per-minute process-wide budget, and a 16-element tool-input limit.
- The rate budget is shared by every caller of this single service; it is not per-user authentication or an abuse-proof quota.
- Before public or business use, add OAuth, per-user quotas, privacy notice/retention controls, monitoring, and a security review.
- The server only analyzes text explicitly supplied to it. It cannot see the native ChatGPT composer or hidden instructions/history.
- Token counts cover only the supplied text and selected encoding. They are not the total tokens of a ChatGPT turn.

## Product rule

HM must explain why a prompt may be ambiguous or wasteful, but the user remains in control. Never silently edit or submit the user's prompt.
