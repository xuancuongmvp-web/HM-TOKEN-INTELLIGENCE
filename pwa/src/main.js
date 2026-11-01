import { analyzePrompt, cleanFormatting } from "./analyzer.js";
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
