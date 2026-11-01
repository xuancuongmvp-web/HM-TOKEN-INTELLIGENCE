> **Important:** This guide is only for the optional MCP integration on eligible ChatGPT web workspaces. It is not the universal installation path. The main HM experience is the standalone [PWA](../pwa/README.md), which is designed to work independently of ChatGPT subscription tier and does not need MCP or an OpenAI API key. The root Render Blueprint deploys the PWA only; it does not deploy the MCP service.

# Connect HM Token Intelligence to ChatGPT

## What is implemented

The `mcp-server/` folder contains an experimental MCP server and interactive widget with two tools:

- `analyze_prompt`
- `optimize_prompt_formatting`

The widget accepts prompt text, lets the user select an encoding, displays token counts and heuristic findings, and can produce a conservative formatting-cleanup preview. It does not silently replace or submit text.

## Local developer test

1. Install Node.js 20 or newer.
2. Open a terminal in `mcp-server`.
3. Run `npm install`.
4. Run `npm test`.
5. Run `npm start`.
6. Check `http://localhost:8787/health`.
7. Test Streamable HTTP at `http://localhost:8787/mcp` with MCP Inspector.

A local server cannot be reached directly by ChatGPT's hosted service.

## Create the hosted pilot

The repository includes a root-level Render Blueprint in `render.yaml`:

1. Sign in to Render and choose **New → Blueprint**.
2. Connect `xuancuongmvp-web/HM-TOKEN-INTELLIGENCE`.
3. Review the detected service. It should be a single Free Docker web service in Singapore.
4. Confirm that no paid service, database, disk, or add-on is being added.
5. Apply the Blueprint.
6. When deployment completes, verify `https://YOUR-SERVICE.onrender.com/health` returns `{"status":"ok"}`.
7. Use `https://YOUR-SERVICE.onrender.com/mcp` as the MCP URL.

The deployment remains an account-owner action. The repository configuration cannot sign in to Render or authorize a deployment.

**Free service warning:** Render Free is for evaluation, not production. It sleeps after 15 minutes of inactivity and can take about one minute to wake. Its filesystem is ephemeral. Review the provider's current usage and billing terms before deploying.

## ChatGPT eligibility and connection

OpenAI's current Help Center says:

- Full custom MCP connections are available to ChatGPT Business and Enterprise/Edu on the web.
- Business workspace admins/owners control creating and publishing custom MCP integrations.
- Enterprise/Edu admins can grant permissions to selected members; only admins/owners can publish.
- Pro users can connect custom MCP servers with read/fetch permissions only. Do not assume the HM analysis tools or interactive widget will work under that restriction.
- Custom MCP connections are web-only; mobile is not supported.
- Go and Free are not listed as eligible for full custom MCP.

When an eligible account/workspace is available:

1. Open ChatGPT on the web and go to **Plugins**.
2. Select the plus button, then **Add custom MCP server**.
3. Enter **HM Token Intelligence** as the name.
4. Enter the public HTTPS endpoint ending in `/mcp`.
5. The current pilot uses **No authentication**. This makes the endpoint public; do not send sensitive prompt content.
6. Review the risk warning and select **Create as a plugin**.
7. Review the discovered tools, install the resulting plugin, then start a new chat and test it.

OpenAI may change these screens and workspace permissions. Check the current official instructions before use:
- [Connect custom MCP servers in ChatGPT](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)
- [Apps SDK overview](https://help.openai.com/en/articles/12515353-building-with-the-apps-sdk)
- [MCP server authentication](https://developers.openai.com/plugins/build/auth)

## Important limitations

The service only analyzes text explicitly supplied to its tools. It cannot observe what someone is typing in the native ChatGPT composer, read hidden instructions, or inspect server-side conversation history. The browser extension is a separate early MVP for visible ChatGPT Web composer text in Chrome/Edge.

The pilot is unauthenticated. Its MCP route caps HTTP request bodies at 512 KiB and each tool's prompt text at 100,000 characters. A configurable process-wide budget defaults to 120 requests per minute and is shared by all callers; this is not per-user authentication. Do not send confidential/company data or use it for production workloads. Before wider use, implement an OAuth authorization server compatible with ChatGPT, per-user quotas, privacy/retention controls, monitoring, and security review.

Do not describe HM as installed in ChatGPT until an eligible account completes a real connection and tool/widget test.
