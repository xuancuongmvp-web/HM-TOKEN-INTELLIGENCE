# Roadmap

The product's core is prompt quality and token efficiency: detect avoidable waste, explain why it matters, suggest improvements, and preserve the user's intended result. Token reduction alone is not success.

## 0.1 foundation
- [x] Explicit tiktoken encoding counts
- [x] FastAPI endpoints and browser playground
- [x] Conservative deterministic cleanup
- [x] Tests and CI workflow files created (CI/runtime status must be verified)
- [x] Accuracy boundaries documented
- [x] Early Chrome/Edge Prompt Monitor extension scaffold

## 0.2 prompt intelligence (core)
- [x] Initial transparent prompt score with explainable findings (heuristic MVP; calibration and evaluation remain)
- [x] Initial detection for vague scope, missing output criteria, ambiguous references, duplicate lines, long prompts, and suspicious repeated characters
- [ ] Expand and validate detection quality across Vietnamese, Chinese, and English with a human-reviewed golden corpus
- [ ] Inline issue highlighting and actionable suggestions
- [ ] Before/after comparison: token estimate, quality signals, and semantic intent checklist
- [ ] Result feedback: determine whether the answer met the requested outcome and identify avoidable rework

## 0.3 one-click cross-platform experience
- [ ] Test and stabilize Chrome/Edge extension on current ChatGPT web composer
- [ ] Mobile-first companion PWA with paste/share, analysis, and copy-back workflow
- [ ] Accessible, simple onboarding and install guide
- [ ] Native desktop/mobile support only where the host officially exposes the required integration APIs

## 0.4 direct ChatGPT integration
- [x] Initial Apps SDK/MCP-compatible interactive UI and Streamable HTTP server scaffold committed
- [x] Node analyzer tests pass in GitHub Actions
- [x] Python API tests pass in GitHub Actions
- [x] Production dependency audit passes in GitHub Actions
- [x] Free-tier Render Blueprint prepared at repository root (deployment not yet performed)
- [x] Basic request-body cap and process-wide rate budget implemented
- [ ] Remote MCP server deployment with stable public HTTPS endpoint
- [ ] OAuth authentication, per-user quotas, privacy controls, and production abuse protection
- [ ] Test custom app connection and interactive widget on an eligible ChatGPT Business or Enterprise/Edu web workspace
- [ ] Verify desktop/mobile client support before claiming availability there
- [ ] Public app submission and review, subject to OpenAI requirements

## 0.5 model and cost intelligence
- [ ] Provenance-backed model-to-encoding registry
- [ ] Dated configurable pricing separated by input/output/cache/reasoning categories
- [ ] Provider usage import adapters
- [ ] Prompt diff and JSON export
- [ ] Gemini and other provider adapters

## 1.0 production readiness
- [ ] Security and privacy review
- [ ] Rate limits and quotas
- [ ] Privacy-preserving observability
- [ ] Accessibility and localization
- [ ] Reproducible release builds
- [ ] Automated tests across supported browsers and devices
