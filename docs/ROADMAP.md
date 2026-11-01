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
- [ ] Prompt quality scoring with transparent, explainable factors
- [ ] Detect ambiguity, missing context, duplicate instructions, unclear output criteria, and likely unnecessary verbosity
- [ ] Inline issue highlighting and actionable suggestions
- [ ] Before/after comparison: token estimate, quality signals, and semantic intent checklist
- [ ] Result feedback: determine whether the answer met the requested outcome and identify avoidable rework
- [ ] Multilingual golden test corpus and human-reviewed evaluation

## 0.3 one-click cross-platform experience
- [ ] Test and stabilize Chrome/Edge extension on current ChatGPT web composer
- [ ] Mobile-first companion PWA with paste/share, analysis, and copy-back workflow
- [ ] Accessible, simple onboarding and install guide
- [ ] Native desktop/mobile support only where the host officially exposes the required integration APIs

## 0.4 direct ChatGPT integration
- [ ] Apps SDK interactive UI
- [ ] Remote MCP server with stable public HTTPS endpoint
- [ ] Authentication, privacy controls, rate limits, and abuse protection
- [ ] Test custom app connection on eligible ChatGPT web accounts/workspaces
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
