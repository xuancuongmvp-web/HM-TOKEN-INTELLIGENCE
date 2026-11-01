# Connect HM Token Intelligence to ChatGPT

## What is ready in the repository

The `mcp-server/` folder now contains an initial MCP server with an interactive MCP Apps widget and two tools:
- `analyze_prompt`
- `optimize_prompt_formatting`

The widget lets a user paste prompt text, choose a tokenizer encoding, inspect the score and warnings, and request conservative formatting cleanup. The user must review/copy any proposed text; nothing is submitted automatically.

## Local developer test

1. Install Node.js 20 or newer.
2. Open a terminal in `mcp-server`.
3. Run `npm install`.
4. Run `npm test`.
5. Run `npm start`.
6. Check `http://localhost:8787/health`.
7. Use MCP Inspector with Streamable HTTP at `http://localhost:8787/mcp`.

A local server is for development. ChatGPT's hosted service cannot use your localhost address.

## Connect to ChatGPT after deployment

1. Deploy the `mcp-server` service to a stable HTTPS host.
2. Confirm `https://YOUR-DOMAIN/health` returns `{"status":"ok"}`.
3. Confirm the MCP endpoint is `https://YOUR-DOMAIN/mcp`.
4. In an eligible ChatGPT account/workspace, enable the developer/custom app connection flow described by OpenAI.
5. Add the remote MCP URL, name it **HM Token Intelligence**, review the permissions/warning, and create the app.
6. Start a new chat and ask ChatGPT to analyze a prompt with HM. The app's tool should return the interactive inspector where supported.

Official setup references:
- [Apps SDK overview](https://help.openai.com/en/articles/12515353-building-with-the-apps-sdk)
- [Connect custom MCP servers](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)
- [MCP app quickstart](https://developers.openai.com/plugins/build/app-quickstart)

## What still requires external setup

This repository change does not itself create a hosted service. A deployment owner must connect a hosting account, deploy the Docker service, configure the production domain and verify HTTPS. Public app-directory distribution also requires OpenAI's separate submission/review process.

Do not tell users the app is already installed in ChatGPT until a real connection test has succeeded.

## Client compatibility

The supported direct custom MCP connection path must be checked against current OpenAI client documentation. Do not claim native mobile/desktop composer monitoring. The app analyzes only text passed to its tool. It cannot see what the user is typing into an unrelated native ChatGPT composer or inspect hidden conversation context.
