import test from "node:test";
import assert from "node:assert/strict";
import { addUsageEntry, createProjectLedger, summarizeEntries, buildProjectReport, exportProjectReportCSV, removeProject, exportLedger, loadLedger, saveLedger, LEDGER_STORAGE_KEY } from "../src/project-ledger.js";

test("records exact supplied message tokens without retaining message content", () => {
  const ledger = createProjectLedger();
  const { project, entry } = addUsageEntry(ledger, {
    projectName: "Website launch", conversationName: "Planning", role: "user",
    text: "Please prepare a launch checklist.", model: "GPT", encoding: "o200k_base",
    date: "2026-11-01T10:00:00.000Z"
  });
  assert.ok(entry.tokens > 0);
  assert.equal(project.name, "Website launch");
  assert.equal("text" in entry, false);
  assert.equal("content" in entry, false);
});

test("aggregates project and conversation token usage by role and model", () => {
  const ledger = createProjectLedger();
  addUsageEntry(ledger, { projectName: "P", conversationName: "Chat A", role: "user", text: "Question", model: "GPT-6" });
  addUsageEntry(ledger, { projectName: "P", conversationName: "Chat A", role: "assistant", text: "Answer", model: "GPT-6" });
  addUsageEntry(ledger, { projectName: "P", conversationName: "Chat B", role: "user", text: "Another question", model: "Claude" });
  const summary = summarizeEntries(ledger.projects[0].entries);
  assert.equal(summary.messages, 3);
  assert.equal(summary.conversations, 2);
  assert.equal(summary.totalTokens, summary.userTokens + summary.assistantTokens + summary.systemTokens + summary.otherTokens);
  assert.ok(summary.byModel["GPT-6"] > 0);
  assert.ok(summary.byModel.Claude > 0);
});

test("rejects empty project or empty message", () => {
  const ledger = createProjectLedger();
  assert.throws(() => addUsageEntry(ledger, { projectName: "", role: "user", text: "x" }));
  assert.throws(() => addUsageEntry(ledger, { projectName: "P", role: "user", text: " " }));
});

test("exports and removes a project", () => {
  const ledger = createProjectLedger();
  const { project } = addUsageEntry(ledger, { projectName: "Archive", role: "other", text: "data" });
  assert.match(exportLedger(ledger), /privacyNote/);
  removeProject(ledger, project.id);
  assert.equal(ledger.projects.length, 0);
});

test("persists ledger metadata in local storage", () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const ledger = createProjectLedger();
  addUsageEntry(ledger, { projectName: "Local", role: "user", text: "Only local" });
  saveLedger(ledger, storage);
  assert.equal(loadLedger(storage).projects[0].name, "Local");
  assert.equal(memory.has(LEDGER_STORAGE_KEY), true);
});

test("prevents mixing tokenizer encodings inside one project", () => {
  const ledger = createProjectLedger();
  addUsageEntry(ledger, { projectName: "Consistent", role: "user", text: "A", encoding: "o200k_base" });
  assert.throws(() => addUsageEntry(ledger, { projectName: "Consistent", role: "assistant", text: "B", encoding: "cl100k_base" }), /giữ cùng encoding/);
});

test("builds a project retrospective with manually tagged rework and clarification", () => {
  const ledger = createProjectLedger();
  addUsageEntry(ledger, { projectName: "Retro", conversationName: "Design", role: "user", kind: "normal", text: "Create the design brief" });
  addUsageEntry(ledger, { projectName: "Retro", conversationName: "Design", role: "assistant", kind: "normal", text: "Here is the design brief" });
  addUsageEntry(ledger, { projectName: "Retro", conversationName: "Design", role: "user", kind: "rework", text: "Please redo the layout" });
  addUsageEntry(ledger, { projectName: "Retro", conversationName: "Review", role: "user", kind: "clarification", text: "Clarify the dimensions" });
  const report = buildProjectReport(ledger.projects[0]);
  assert.equal(report.conversations.length, 2);
  assert.ok(report.reworkTokens > 0);
  assert.equal(report.reworkEntries, 1);
  assert.ok(report.clarificationTokens > 0);
  assert.equal(report.topConversation.name, "Design");
  assert.ok(report.limitation.includes("usage/billing"));
});

test("counts words by whitespace and records no pasted text", () => {
  const ledger = createProjectLedger();
  const { entry } = addUsageEntry(ledger, { projectName: "Words", role: "user", text: "one two\\nthree" });
  assert.equal(entry.words, 3);
  assert.equal(Object.hasOwn(entry, "text"), false);
});

test("exports a CSV retrospective with project, conversation and model totals", () => {
  const ledger = createProjectLedger();
  addUsageEntry(ledger, { projectName: "CSV Test", conversationName: "Planning", role: "user", text: "Plan it", model: "GPT" });
  const csv = exportProjectReportCSV(ledger.projects[0]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /total_tokens/);
  assert.match(csv, /conversation:Planning/);
  assert.match(csv, /model:GPT/);
});
