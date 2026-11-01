import { analyzePrompt, cleanFormatting } from "./analyzer.js";
import { addUsageEntry, summarizeEntries, buildProjectReport, exportProjectReportCSV, parseLedgerImport, loadLedger, saveLedger, exportLedger, removeProject } from "./project-ledger.js";
import "./style.css";
const $ = selector => document.querySelector(selector);
const input = $("#prompt");
let latestClean = null;

function el(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = String(value);
  return node;
}

function render(data) {
  const metrics = $("#metrics");
  metrics.replaceChildren();
  [["TOKEN", data.tokens.toLocaleString("vi-VN")], ["SỐ TỪ", data.words.toLocaleString("vi-VN")],
    ["KÝ TỰ", data.characters.toLocaleString("vi-VN")], ["ENCODING", data.encoding]].forEach(([label, value]) => {
    const card = el("div", "metric");
    card.append(el("small", "", label), el("strong", "", value));
    metrics.append(card);
  });

  const quality = $("#quality");
  quality.replaceChildren(el("strong", "score", data.presentDimensions + "/" + data.totalDimensions));
  const summary = el("div", "quality-copy");
  summary.append(el("b", "", data.label), el("small", "", "Số thành phần cấu trúc HM nhận diện được — không phải điểm chất lượng tuyệt đối."));
  quality.append(summary);

  const dimensions = $("#dimensions");
  dimensions.replaceChildren();
  data.dimensions.forEach(item => {
    const row = el("div", "dimension " + (item.found ? "found" : "missing"));
    const icon = el("span", "dimension-state", item.found ? "✓" : "–");
    const copy = el("div", "dimension-copy");
    copy.append(el("b", "", item.label), el("small", "", item.found ? "Đã nhận diện dấu hiệu trong prompt" : item.hint + " — chưa nhận diện thấy"));
    row.append(icon, copy);
    dimensions.append(row);
  });

  const findings = $("#findings");
  findings.replaceChildren();
  data.issues.forEach(issue => {
    const card = el("article", "finding " + issue.severity);
    card.append(el("h3", "", issue.title), el("p", "", issue.explanation), el("p", "suggestion", "Đề xuất: " + issue.suggestion));
    findings.append(card);
  });
  $("#finding-count").textContent = data.issueCount + " mục cần xem xét";
  $("#count-note").textContent = data.note;
  $("#results").classList.remove("hidden");
}

function analyze() {
  if (!input.value.trim()) {
    input.focus();
    $("#char-count").textContent = "Hãy nhập prompt trước khi phân tích.";
    return;
  }
  try {
    const encoding = $("#encoding").value;
    const result = analyzePrompt(input.value, encoding);
    render(result);
    latestClean = cleanFormatting(input.value, encoding);
    $("#clean-preview").value = latestClean.optimized;
    const delta = latestClean.beforeTokens - latestClean.afterTokens;
    $("#compare-meta").textContent = latestClean.changed
      ? "Token trước/sau: " + latestClean.beforeTokens + " → " + latestClean.afterTokens + ". Chênh lệch do dọn định dạng: " + delta + " token."
      : "Không có thay đổi định dạng cần thiết; không có token nào được loại bỏ.";
    $("#cleanup").classList.remove("hidden");
    $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    $("#count-note").textContent = "Không thể phân tích: " + error.message;
    $("#results").classList.remove("hidden");
  }
}

$("#analyze").addEventListener("click", analyze);
$("#clear").addEventListener("click", () => {
  input.value = "";
  $("#char-count").textContent = "0 ký tự";
  $("#results").classList.add("hidden");
  $("#cleanup").classList.add("hidden");
  latestClean = null;
  input.focus();
});
input.addEventListener("input", () => {
  $("#char-count").textContent = input.value.length.toLocaleString("vi-VN") + " ký tự";
});
input.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") analyze();
});
$("#encoding").addEventListener("change", () => {
  if (input.value.trim() && !$("#results").classList.contains("hidden")) analyze();
});
$("#copy-clean").addEventListener("click", async () => {
  if (!latestClean) return;
  try {
    await navigator.clipboard.writeText(latestClean.optimized);
    $("#copy-clean").textContent = "Đã sao chép ✓";
    setTimeout(() => { $("#copy-clean").textContent = "Sao chép bản đề xuất"; }, 1400);
  } catch {
    $("#clean-preview").focus();
    $("#clean-preview").select();
  }
});
$("#use-clean").addEventListener("click", () => {
  if (!latestClean) return;
  input.value = latestClean.optimized;
  input.dispatchEvent(new Event("input"));
  analyze();
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

const ledger = loadLedger();

function renderLedger() {
  const summaryNode = $("#ledger-summary");
  const projectsNode = $("#ledger-projects");
  const retrospectiveNode = $("#ledger-retrospective");
  summaryNode.replaceChildren();
  projectsNode.replaceChildren();
  retrospectiveNode.replaceChildren();
  const allEntries = ledger.projects.flatMap(project => project.entries);
  const total = summarizeEntries(allEntries);
  const encodingNames = Object.keys(total.byEncoding);
  const cards = encodingNames.length <= 1
    ? [["TỔNG TOKEN", total.totalTokens], ["PROMPT NGƯỜI DÙNG", total.userTokens],
      ["PHẢN HỒI AI", total.assistantTokens], ["CUỘC TRÒ CHUYỆN", total.conversations]]
    : encodingNames.map(encoding => [encoding, total.byEncoding[encoding]]);
  cards.forEach(([label, value]) => {
    const card = el("div", "metric");
    card.append(el("small", "", label), el("strong", "", Number(value).toLocaleString("vi-VN")));
    summaryNode.append(card);
  });
  ledger.projects.forEach(project => {
    const stats = summarizeEntries(project.entries);
    const card = el("article", "ledger-project");
    const heading = el("div", "ledger-project-head");
    const title = el("div");
    title.append(el("h3", "", project.name), el("small", "", stats.conversations + " cuộc trò chuyện · " + stats.messages + " mục ghi nhận · " + project.encoding));
    heading.append(title);
    const remove = el("button", "secondary ledger-remove", "Xóa dự án");
    remove.type = "button";
    remove.addEventListener("click", () => {
      removeProject(ledger, project.id);
      saveLedger(ledger);
      renderLedger();
      $("#ledger-status").textContent = "Đã xóa dữ liệu dự án khỏi trình duyệt này.";
    });
    heading.append(remove);
    card.append(heading);
    card.append(el("p", "ledger-breakdown", "Tổng " + stats.totalTokens.toLocaleString("vi-VN") +
      " token · Prompt " + stats.userTokens.toLocaleString("vi-VN") + " · AI " + stats.assistantTokens.toLocaleString("vi-VN")));
    const conversations = new Map();
    project.entries.forEach(entry => {
      conversations.set(entry.conversationName, (conversations.get(entry.conversationName) || 0) + entry.tokens);
    });
    conversations.forEach((tokens, name) => card.append(
      el("small", "ledger-model", name + ": " + tokens.toLocaleString("vi-VN") + " token")));
    Object.entries(stats.byModel).forEach(([model, tokens]) => card.append(
      el("small", "ledger-model", model + ": " + tokens.toLocaleString("vi-VN") + " token")));
    projectsNode.append(card);

    const report = buildProjectReport(project);
    const reportCard = el("article", "ledger-report");
    reportCard.append(el("h3", "", "Tổng kết & rút kinh nghiệm: " + project.name));
    const reportMetrics = el("div", "ledger-report-metrics");
    [
      ["LÀM LẠI / CHỈNH SỬA", report.reworkTokens.toLocaleString("vi-VN") + " token (" + report.reworkPercent + "%)"],
      ["HỎI LẠI / LÀM RÕ", report.clarificationTokens.toLocaleString("vi-VN") + " token"],
      ["PROMPT / AI", report.userToAiRatio === null ? "Chưa đủ dữ liệu" : report.userToAiRatio + ":1"]
    ].forEach(([label, value]) => {
      const metric = el("div", "metric");
      metric.append(el("small", "", label), el("strong", "", value));
      reportMetrics.append(metric);
    });
    reportCard.append(reportMetrics);
    report.insights.forEach(insight => {
      const row = el("div", "ledger-insight");
      row.append(el("b", "", insight.title), el("p", "", insight.detail));
      reportCard.append(row);
    });
    reportCard.append(el("p", "note", report.limitation));
    const reportActions = el("div", "actions");
    const csvButton = el("button", "secondary", "Xuất báo cáo dự án CSV");
    csvButton.type = "button";
    csvButton.addEventListener("click", () => {
      const blob = new Blob([exportProjectReportCSV(project)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = el("a");
      link.href = url;
      link.download = "hm-project-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    });
    reportActions.append(csvButton);
    reportCard.append(reportActions);
    retrospectiveNode.append(reportCard);
  });
}

$("#ledger-add").addEventListener("click", () => {
  try {
    const { entry } = addUsageEntry(ledger, {
      projectName: $("#project-name").value,
      conversationName: $("#conversation-name").value,
      model: $("#model-name").value,
      role: $("#message-role").value,
      text: $("#ledger-text").value,
      kind: $("#message-kind").value,
      encoding: $("#encoding").value
    });
    saveLedger(ledger);
    $("#ledger-status").textContent = "Đã ghi nhận " + entry.tokens.toLocaleString("vi-VN") +
      " token (" + entry.role + "). Nội dung tin nhắn không được lưu.";
    $("#ledger-text").value = "";
    renderLedger();
  } catch (error) {
    $("#ledger-status").textContent = error.message;
  }
});

$("#ledger-export").addEventListener("click", () => {
  const blob = new Blob([exportLedger(ledger)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = el("a");
  link.href = url;
  link.download = "hm-token-project-usage.json";
  link.click();
  URL.revokeObjectURL(url);
  $("#ledger-status").textContent = "Đã xuất báo cáo thống kê. File không chứa nội dung tin nhắn.";
});

$("#ledger-import-trigger").addEventListener("click", () => $("#ledger-import-file").click());
$("#ledger-import-file").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const restored = parseLedgerImport(await file.text());
    if (!confirm("Khôi phục " + restored.projects.length + " dự án từ file? Dữ liệu theo dõi hiện tại trên trình duyệt sẽ được thay thế.")) return;
    ledger.projects = restored.projects;
    saveLedger(ledger);
    renderLedger();
    $("#ledger-status").textContent = "Đã khôi phục " + ledger.projects.length + " dự án từ bản sao lưu.";
  } catch (error) {
    $("#ledger-status").textContent = "Không thể khôi phục: " + error.message;
  } finally {
    event.target.value = "";
  }
});

$("#ledger-clear").addEventListener("click", () => {
  if (!confirm("Xóa toàn bộ sổ theo dõi token dự án trên trình duyệt này?")) return;
  ledger.projects = [];
  saveLedger(ledger);
  renderLedger();
  $("#ledger-status").textContent = "Đã xóa toàn bộ sổ theo dõi.";
});

renderLedger();
