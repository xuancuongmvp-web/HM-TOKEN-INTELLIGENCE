# Roadmap

HM's primary product must work independently from ChatGPT subscription level. The central goal is prompt quality and token efficiency without weakening the user's intended result.

## 0.1 foundation
- [x] Exact tokenizer counting for explicitly supplied text
- [x] Python API and local playground
- [x] Conservative formatting cleanup preview
- [x] Automated Python tests
- [x] Early Chrome/Edge composer monitor
- [x] Experimental MCP server and widget

## 0.2 universal local-first core
- [x] Standalone PWA project and responsive interface
- [x] Exact local tokenizer counts for four supported encodings
- [x] Initial heuristic detection for vague scope, missing output criteria, ambiguous references, duplicate lines, long prompts, repeated characters
- [x] User-reviewed formatting cleanup with before/after token counts
- [x] Installable PWA manifest and service worker shell
- [x] Validate PWA build and tests in GitHub Actions (verified in GitHub Actions)
- [x] Add optional local-first project/conversation token ledger with per-role and per-model aggregation, JSON export, and no message-content retention
- [x] Add project retrospective insights for conversation, model, rework and clarification totals with CSV export
- [ ] Expand multilingual test corpus across Vietnamese, English, and Chinese
- [ ] Calibrate quality indicators against human-reviewed examples
- [ ] Improve semantic intent checks and actionable rewrite suggestions

## 0.25 ChatGPT Plugin / Skill entrypoint
- [x] Add portable Agent Plugin package manifest
- [x] Add HM prompt-intelligence skill with semantic review and answer-evaluation workflows
- [x] Add repo-scoped ChatGPT desktop plugin marketplace manifest
- [x] Add first-run onboarding skill and ChatGPT skill UI metadata
- [x] Add manual acceptance scenarios covering common and edge-case prompts
- [x] Validate portable plugin paths and marketplace entry in CI
- [x] Generate standalone Skill ZIP and portable Plugin ZIP as CI artifacts
- [ ] Test local marketplace discovery and explicit skill invocation in ChatGPT Desktop / Work / Codex surfaces
- [ ] Confirm feature eligibility and install flow across personal/workspace plans
- [x] Implement MCP exact tokenizer and prompt-comparison tools (`count_tokens`, `analyze_prompt`, `compare_prompts`)
- [x] Connect HM Skill workflow instructions to exact tokenizer tool names
- [ ] Deploy authenticated MCP service and register its endpoint in Plugin `mcp.json`
- [ ] Add interactive in-chat MCP app UI where supported
- [ ] Publish reviewed portable plugin package to the universal directory when eligible

## 0.3 one-click cross-platform access
- [x] Free static-site hosting Blueprint for PWA prepared
- [ ] Deploy the PWA to a public HTTPS address
- [ ] Verify install flow on Windows, macOS, Android, and iOS browsers
- [ ] Add reliable share-to-HM workflow on supported mobile browsers
- [x] Build in-composer HM extension MVP with analysis, clarification fields, prompt proposal preview, and explicit insert action
- [ ] Stabilize Chrome/Edge extension and verify live composer selectors on ChatGPT, Gemini, Claude, Copilot, and Perplexity
- [ ] Add exact tokenizer to packaged extension build
- [ ] Publish signed/reviewed browser extension packages
- [ ] Verify native ChatGPT Desktop/mobile options only where host APIs permit

## 0.4 optional ChatGPT MCP integration
- [x] Initial Apps SDK/MCP-compatible server and widget committed
- [x] Node analyzer tests and production dependency audit configured
- [x] Docker build check configured
- [ ] OAuth, per-user quotas, privacy controls, production security review
- [ ] Deploy MCP only when an eligible ChatGPT web workspace and a clear use case exist
- [ ] Verify app/widget interaction in an eligible workspace

## 0.5 response quality and cost intelligence
- [ ] Result feedback: determine whether the requested outcome was achieved
- [ ] Identify avoidable rework and distinguish prompt-caused versus model-caused failure
- [ ] Provenance-backed model-to-encoding registry
- [ ] Dated pricing by input/output/cache/reasoning category
- [ ] Prompt diff, intent checklist, and export
- [ ] Additional provider adapters

## 1.0 production readiness
- [ ] Security and privacy review
- [ ] Browser/device regression testing
- [ ] Accessibility and localization
- [ ] Reproducible release builds
- [ ] Privacy-preserving observability and support process
