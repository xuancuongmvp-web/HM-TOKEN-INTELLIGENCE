(() => {
  if (window.__hmPromptMonitorLoaded) return;
  window.__hmPromptMonitorLoaded = true;
  let panel, lastText = "", timer;

  function getComposer() {
    return document.querySelector('#prompt-textarea')
      || document.querySelector('[contenteditable="true"][data-testid*="composer"]')
      || document.querySelector('textarea');
  }
  function readText(el) {
    return el ? (("value" in el && el.value) ? el.value : el.innerText || el.textContent || "").trim() : "";
  }
  function analyze(text) {
    const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
    const chars = text.length;
    const approxTokens = Math.ceil(chars / 3.2);
    const lines = text.split(/\n/u).map(x=>x.trim()).filter(Boolean);
    const issues = [];
    if (words < 8 && text.length) issues.push(["info","Prompt ngắn","Có thể đủ cho yêu cầu đơn giản; với tác vụ phức tạp hãy nêu bối cảnh và đầu ra mong muốn."]);
    if (/\b(tất cả mọi thứ|mọi thứ|thật chi tiết|toàn bộ|càng nhiều càng tốt)\b/iu.test(text))
      issues.push(["warn","Phạm vi chưa rõ","Các cụm từ bao quát chưa xác định tiêu chí. Hãy nêu rõ hạng mục cần kiểm tra và mức độ chi tiết."]);
    if (/\b(hãy làm|giúp tôi|xử lý|phân tích)\b/iu.test(text) && !/\b(đầu ra|định dạng|bảng|danh sách|từng bước|file|tiêu chí)\b/iu.test(text))
      issues.push(["warn","Chưa xác định đầu ra","Nêu rõ muốn nhận bảng, hướng dẫn từng bước, bản nháp hay tệp; thêm tiêu chí hoàn thành."]);
    if (/\b(nó|cái này|ở đó|như trên|như đã nói)\b/iu.test(text) && text.length < 500)
      issues.push(["warn","Tham chiếu có thể thiếu ngữ cảnh","Tên gọi như “nó/cái này/như trên” có thể không đủ rõ nếu ngữ cảnh trước đó không được gửi kèm."]);
    if (/(.)\1{7,}/u.test(text)) issues.push(["info","Ký tự lặp bất thường","Kiểm tra chuỗi ký tự lặp có phải vô tình dán thừa không."]);
    const normalized = lines.map(x=>x.toLocaleLowerCase()).filter(Boolean);
    const duplicates = normalized.filter((x,i)=>normalized.indexOf(x)!==i);
    if (duplicates.length) issues.push(["warn","Có dòng trùng lặp","Phát hiện "+duplicates.length+" dòng lặp chính xác; chỉ xóa nếu không mang ý nghĩa nhấn mạnh."]);
    if (words > 250 && !/\b(tóm tắt|phân tích|so sánh|trích xuất|giữ nguyên|không được bỏ)\b/iu.test(text))
      issues.push(["info","Prompt tương đối dài","Kiểm tra phần bối cảnh hoặc chỉ dẫn có thể chuyển thành tài liệu đính kèm hay không."]);
    if (!issues.length) issues.push(["good","Chưa thấy cảnh báo rõ ràng","Đây là kiểm tra theo quy tắc, không phải bảo đảm prompt sẽ cho kết quả đúng."]);
    return {words,chars,approxTokens,issues};
  }
  function ensurePanel() {
    if (panel && panel.isConnected) return panel;
    panel = document.createElement("aside");
    panel.id = "hm-prompt-monitor";
    panel.innerHTML = '<div class="hm-head"><b>🐈‍⬛ HM PROMPT MONITOR</b><button class="hm-close" title="Đóng">×</button></div><div class="hm-body"></div><div class="hm-foot">Token chỉ là ước tính từ văn bản nhìn thấy; không gồm system prompt, lịch sử ẩn hay tệp đa phương tiện.</div>';
    document.body.appendChild(panel);
    panel.querySelector(".hm-close").addEventListener("click",()=>panel.classList.remove("hm-visible"));
    return panel;
  }
  function render(text) {
    const p = ensurePanel(), d = analyze(text);
    const body = p.querySelector(".hm-body");
    body.innerHTML = "";
    const stats = document.createElement("div"); stats.className="hm-stats";
    stats.textContent = d.approxTokens+" token ~ · "+d.words+" từ · "+d.chars+" ký tự";
    body.appendChild(stats);
    d.issues.forEach(([kind,title,desc])=>{
      const card=document.createElement("div"); card.className="hm-issue "+kind;
      const h=document.createElement("strong"); h.textContent=title;
      const para=document.createElement("p"); para.textContent=desc;
      card.append(h,para); body.appendChild(card);
    });
    const hint=document.createElement("p"); hint.className="hm-hint";
    hint.textContent="HM chỉ cảnh báo và đề xuất. Không tự sửa, không tự gửi prompt.";
    body.appendChild(hint);
    p.classList.add("hm-visible");
  }
  function watch() {
    const el=getComposer();
    if (!el || el.dataset.hmWatched) return;
    el.dataset.hmWatched="1";
    el.addEventListener("input",()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const text=readText(el);
        if (text && text!==lastText) { lastText=text; render(text); }
      },900);
    });
  }
  chrome.runtime.onMessage.addListener((msg,_sender,sendResponse)=>{
    if(msg && msg.type==="HM_ANALYZE_NOW") {
      const text=readText(getComposer());
      if(!text){sendResponse({ok:false});return true;}
      lastText=text; render(text); sendResponse({ok:true});
    }
    return true;
  });
  watch();
  new MutationObserver(watch).observe(document.documentElement,{childList:true,subtree:true});
})();