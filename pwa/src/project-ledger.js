import { countTokens, ENCODINGS } from "./analyzer.js";

export const LEDGER_STORAGE_KEY = "hm-token-intelligence.project-ledger.v1";

export function createProjectLedger() {
  return { version: 1, projects: [] };
}

export function addUsageEntry(ledger, { projectName, conversationName = "Cuộc trò chuyện", role, text, encoding = "o200k_base", model = "", date = new Date().toISOString() }) {
  const name = String(projectName || "").trim();
  const content = String(text ?? "");
  if (!name) throw new Error("Hãy nhập tên dự án.");
  if (!content.trim()) throw new Error("Hãy nhập nội dung cần ghi nhận.");
  if (!["user", "assistant", "system", "other"].includes(role)) throw new Error("Vai trò không hợp lệ.");
  if (!ENCODINGS.includes(encoding)) throw new Error("Encoding không được hỗ trợ.");

  let project = ledger.projects.find(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
  if (!project) {
    project = { id: globalThis.crypto?.randomUUID?.() || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`, name, createdAt: date, entries: [] };
    ledger.projects.push(project);
  }
  const tokens = countTokens(content, encoding);
  const entry = {
    id: globalThis.crypto?.randomUUID?.() || `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    conversationName: String(conversationName || "Cuộc trò chuyện").trim() || "Cuộc trò chuyện",
    role, model: String(model || "").trim(), encoding, tokens,
    characters: content.length, words: content.trim().split(/\\s+/u).length,
    date
  };
  project.entries.push(entry);
  return { project, entry };
}

export function summarizeEntries(entries = []) {
  const summary = { totalTokens: 0, userTokens: 0, assistantTokens: 0, systemTokens: 0, otherTokens: 0, messages: entries.length, conversations: 0, byModel: {}, byEncoding: {} };
  const conversations = new Set();
  for (const entry of entries) {
    summary.totalTokens += entry.tokens;
    const key = entry.role === "user" ? "userTokens" : entry.role === "assistant" ? "assistantTokens" : entry.role === "system" ? "systemTokens" : "otherTokens";
    summary[key] += entry.tokens;
    conversations.add(entry.conversationName);
    const model = entry.model || "Chưa xác định model";
    summary.byModel[model] = (summary.byModel[model] || 0) + entry.tokens;
    summary.byEncoding[entry.encoding] = (summary.byEncoding[entry.encoding] || 0) + entry.tokens;
  }
  summary.conversations = conversations.size;
  return summary;
}

export function removeProject(ledger, projectId) {
  ledger.projects = ledger.projects.filter(project => project.id !== projectId);
  return ledger;
}

export function exportLedger(ledger) {
  return JSON.stringify({ ...ledger, exportedAt: new Date().toISOString(), privacyNote: "Only usage metadata and token totals are stored; pasted message contents are not retained." }, null, 2);
}

export function loadLedger(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(LEDGER_STORAGE_KEY) || "null");
    return parsed?.version === 1 && Array.isArray(parsed.projects) ? parsed : createProjectLedger();
  } catch {
    return createProjectLedger();
  }
}

export function saveLedger(ledger, storage = globalThis.localStorage) {
  storage?.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  return ledger;
}
