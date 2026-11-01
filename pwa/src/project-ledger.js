import { countTokens, ENCODINGS } from "./analyzer.js";

export const LEDGER_STORAGE_KEY = "hm-token-intelligence.project-ledger.v1";

export function createProjectLedger() {
  return { version: 1, projects: [] };
}

export function addUsageEntry(ledger, { projectName, conversationName = "Cuộc trò chuyện", role, kind = "normal", text, encoding = "o200k_base", model = "", date = new Date().toISOString() }) {
  const name = String(projectName || "").trim();
  const content = String(text ?? "");
  if (!name) throw new Error("Hãy nhập tên dự án.");
  if (!content.trim()) throw new Error("Hãy nhập nội dung cần ghi nhận.");
  if (!["user", "assistant", "system", "other"].includes(role)) throw new Error("Vai trò không hợp lệ.");
  if (!["normal", "rework", "clarification", "revision"].includes(kind)) throw new Error("Loại tương tác không hợp lệ.");
  if (!ENCODINGS.includes(encoding)) throw new Error("Encoding không được hỗ trợ.");

  let project = ledger.projects.find(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
  if (!project) {
    project = { id: globalThis.crypto?.randomUUID?.() || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`, name, encoding, createdAt: date, entries: [] };
    ledger.projects.push(project);
  }
  if (project.encoding && project.encoding !== encoding) throw new Error(`Dự án này đang dùng ${project.encoding}. Hãy giữ cùng encoding để tổng token có thể so sánh chính xác.`);
  project.encoding = project.encoding || encoding;
  const tokens = countTokens(content, encoding);
  const entry = {
    id: globalThis.crypto?.randomUUID?.() || `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    conversationName: String(conversationName || "Cuộc trò chuyện").trim() || "Cuộc trò chuyện",
    role, kind, model: String(model || "").trim(), encoding, tokens,
    characters: content.length, words: content.trim().split(/\s+/u).length,
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

export function buildProjectReport(project) {
  const entries = project?.entries || [];
  const summary = summarizeEntries(entries);
  const byConversation = new Map();
  let reworkTokens = 0;
  let reworkEntries = 0;
  let clarificationTokens = 0;
  for (const entry of entries) {
    const key = entry.conversationName || "Cuộc trò chuyện";
    const item = byConversation.get(key) || { name: key, tokens: 0, userTokens: 0, assistantTokens: 0, entries: 0 };
    item.tokens += entry.tokens; item.entries += 1;
    if (entry.role === "user") item.userTokens += entry.tokens;
    if (entry.role === "assistant") item.assistantTokens += entry.tokens;
    byConversation.set(key, item);
    if (entry.kind === "rework" || entry.kind === "revision") { reworkTokens += entry.tokens; reworkEntries += 1; }
    if (entry.kind === "clarification") clarificationTokens += entry.tokens;
  }
  const conversations = [...byConversation.values()].sort((a, b) => b.tokens - a.tokens);
  const reworkPercent = summary.totalTokens ? Number((reworkTokens / summary.totalTokens * 100).toFixed(1)) : 0;
  const userToAiRatio = summary.assistantTokens ? Number((summary.userTokens / summary.assistantTokens).toFixed(2)) : null;
  const insights = [];
  if (conversations[0]) insights.push({ title: "Cuộc trò chuyện tiêu tốn nhiều token nhất", detail: conversations[0].name + ": " + conversations[0].tokens.toLocaleString("vi-VN") + " token." });
  if (reworkEntries) insights.push({ title: "Token được gắn nhãn làm lại / chỉnh sửa", detail: reworkTokens.toLocaleString("vi-VN") + " token (" + reworkPercent + "% tổng số), qua " + reworkEntries + " mục ghi nhận. Nhãn do người dùng chọn, không tự chứng minh nguyên nhân làm lại." });
  if (clarificationTokens) insights.push({ title: "Token làm rõ yêu cầu", detail: clarificationTokens.toLocaleString("vi-VN") + " token được gắn nhãn hỏi lại / làm rõ." });
  if (userToAiRatio !== null) insights.push({ title: "Tỷ lệ token prompt / phản hồi AI", detail: userToAiRatio + ":1 theo số liệu đã ghi nhận; tỷ lệ cao không mặc định là lãng phí." });
  if (!insights.length) insights.push({ title: "Chưa đủ dữ liệu để rút kinh nghiệm", detail: "Hãy ghi nhận cả prompt và phản hồi; đánh dấu các lần hỏi lại hoặc làm lại để báo cáo có thêm ngữ cảnh." });
  return { project: project?.name || "Dự án", ...summary, reworkTokens, reworkEntries, reworkPercent, clarificationTokens, userToAiRatio, topConversation: conversations[0] || null, conversations, insights, limitation: "Báo cáo chỉ phản ánh các đoạn văn bản người dùng chủ động ghi nhận, không phải toàn bộ lịch sử hay usage/billing chính thức của nhà cung cấp AI." };
}
export function exportProjectReportCSV(project) {
  const report = buildProjectReport(project);
  const rows = [
    ["project", "metric", "value"],
    [report.project, "total_tokens", report.totalTokens],
    [report.project, "user_prompt_tokens", report.userTokens],
    [report.project, "ai_response_tokens", report.assistantTokens],
    [report.project, "rework_revision_tokens", report.reworkTokens],
    [report.project, "rework_percent", report.reworkPercent],
    [report.project, "clarification_tokens", report.clarificationTokens],
    ...report.conversations.map(item => [report.project, "conversation:" + item.name, item.tokens]),
    ...Object.entries(report.byModel).map(([model, tokens]) => [report.project, "model:" + model, tokens])
  ];
  const escape = value => '"' + String(value ?? "").replace(/"/gu, '""') + '"';
  return "\uFEFF" + rows.map(row => row.map(escape).join(",")).join("\r\n");
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
