import { analyzePrompt, cleanFormatting } from "./analyzer.js";
import "./style.css";
const $ = s => document.querySelector(s);
const input = $("#prompt");
let latestClean = null;
function el(tag, cls, value) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (value !== undefined) n.textContent = String(value);
  return n;
}
function render(data) {
  const metrics = $("#metrics");
  metrics.replaceChildren();
  [["TOKEN", data.tokens], ["SỐ TỪ", data.words], ["KÝ TỰ", data.characters], ["ENCODING", data.encoding]].forEach(([k,v]) => {
    const card = el("div","metric");
    card.append(el("small","",k),el("strong","",v));
    metrics.append(card);
  });
  const quality = $("#quality");
  quality.replaceChildren(el("strong","score",data.score+"/100"));
  const label = el("div","quality-copy");
  label.append(el("b","",data.label),el("small","","Điểm cấu trúc heuristic — chỉ tham khảo."));
  quality.append(label);
  const findings = $("#findings");
  findings.replaceChildren();
  data.issues.forEach(issue => {
    const card = el("article","finding "+issue.severity);
    card.append(el("h3","",issue.title),el("p","",issue.explanation),el("p","suggestion","Đề xuất: "+issue.suggestion));
    findings.append(card);
  });
  $("#finding-count").textContent = data.issueCount+" mục cần xem xét";
  $("#count-note").textContent = data.note;
  $("#results").classList.remove("hidden");
}
function analyze() {
  if (!input.value.trim()) { input.focus(); return; }
  const encoding = $("#encoding").value;
  render(analyzePrompt(input.value,encoding));
  latestClean = cleanFormatting(input.value,encoding);
  $("#clean-preview").value = latestClean.optimized;
  const delta = latestClean.beforeTokens-latestClean.afterTokens;
  $("#compare-meta").textContent = latestClean.changed ? "Token trước/sau: "+latestClean.beforeTokens+" → "+latestClean.afterTokens+". Chênh lệch: "+delta+" token." : "Không có thay đổi định dạng cần thiết.";
  $("#cleanup").classList.remove("hidden");
}
$("#analyze").addEventListener("click",analyze);
$("#clear").addEventListener("click",() => {
  input.value = "";
  $("#char-count").textContent = "0 ký tự";
  $("#results").classList.add("hidden");
  $("#cleanup").classList.add("hidden");
  input.focus();
});
input.addEventListener("input",() => $("#char-count").textContent=input.value.length.toLocaleString("vi-VN")+" ký tự");
input.addEventListener("keydown",event => {
  if ((event.ctrlKey || event.metaKey) && event.key==="Enter") analyze();
});
$("#copy-clean").addEventListener("click",async () => {
  if (!latestClean) return;
  await navigator.clipboard.writeText(latestClean.optimized);
  $("#copy-clean").textContent="Đã sao chép ✓";
  setTimeout(() => $("#copy-clean").textContent="Sao chép bản đề xuất",1400);
});
$("#use-clean").addEventListener("click",() => {
  if (!latestClean) return;
  input.value=latestClean.optimized;
  input.dispatchEvent(new Event("input"));
  analyze();
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  addEventListener("load",() => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
