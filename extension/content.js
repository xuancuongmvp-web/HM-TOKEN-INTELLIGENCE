(() => {
  if (window.__hmPromptMonitorLoaded) return;
  window.__hmPromptMonitorLoaded = true;

  const STATE = { composer: null, trigger: null, panel: null, timer: null, lastText: "" };
  const WORD = value => Boolean(value) && /[\p{L}\p{N}_]/u.test(value);
  const TERMS = {
    task: ["hãy","giúp tôi","viết","soạn","tạo","lập","thiết kế","dịch","kiểm tra","sửa","xây dựng","giải thích","tìm","so sánh","tổng hợp","liệt kê","đánh giá","phân tích","triển khai","tính toán","vẽ","lập trình","chuyển đổi","tóm tắt","đề xuất","hướng dẫn","write","draft","create","build","design","translate","check","fix","review","explain","find","compare","summarize","list","evaluate","analyze","calculate","implement","draw","convert","recommend","guide","help me","please","请","帮我","写","创建","设计","翻译","检查","修改","建立","解释","查找","比较","总结","列出","评估","分析","计算","实现","绘制","推荐"],
    broad: ["tất cả mọi thứ","mọi thứ","càng nhiều càng tốt","thật chi tiết","everything","as much as possible","越详细越好","尽可能详细","全部内容","所有内容"],
    analytical: ["phân tích","đánh giá","so sánh","rà soát","kiểm tra","lập kế hoạch","đề xuất","analyze","evaluate","compare","review","audit","plan","recommend","分析","评估","比较","审查","计划"],
    creation: ["viết","soạn","tạo","lập","thiết kế","xây dựng","write","draft","create","design","build","写","创建","设计","建立"],
    output: ["đầu ra","định dạng","bảng","danh sách","từng bước","file","tệp","tiêu chí","kết luận","báo cáo","email","thư","mẫu","biểu mẫu","kịch bản","mã nguồn","code","excel","word","pdf","json","csv","slide","powerpoint","checklist","format","table","list","steps","deliverable","criteria","report","template","script","source code","spreadsheet","document","presentation","表格","清单","步骤","格式","结论","输出","报告","邮件","模板","代码","文档"],
    context: ["bối cảnh","hiện trạng","dữ liệu","thông tin nền","tài liệu đính kèm","dựa trên","theo tài liệu","tôi gửi","tôi cung cấp","dưới đây","sau đây","đối tượng là","hiện tại","context","background","based on","according to","attached","provided","the following","source material","current situation","given data","背景","根据","附件","以下内容","目前情况","提供的资料"],
    constraints: ["không được","không thay đổi","không tự ý","giữ nguyên","chỉ sử dụng","chỉ được","tối đa","ít nhất","giới hạn","bắt buộc","tránh","đừng","phải giữ","do not","don't","must not","never","preserve","keep unchanged","only use","at most","at least","limit","avoid","must","不得","不要","必须","保持不变","仅使用","最多","至少","限制"],
    audience: ["dành cho","người đọc","khách hàng","nhân viên","ban giám đốc","for the","audience","reader","customer","employee","executive","for beginners","面向","读者","客户","员工","管理层"],
    criteria: ["tiêu chí đánh giá","tiêu chí hoàn thành","điều kiện nghiệm thu","đáp ứng yêu cầu","thành công khi","kiểm chứng","xác minh","đảm bảo rằng","success criteria","acceptance criteria","definition of done","verify that","validate","success means","must satisfy","验收标准","成功标准","验证","确保满足"],
    references: ["nó","cái này","ở đó","như trên","như đã nói","this","that","it","above","as mentioned","这个","那个","如上所述"],
    longTasks: ["tóm tắt","phân tích","so sánh","trích xuất","giữ nguyên","không được bỏ","summarize","analyze","compare","extract","preserve","do not omit","总结","分析","比较","提取","不要删除"]
  };

  function has(text, phrases) {
    const lower = text.toLocaleLowerCase();
    return phrases.some(phrase => {
      if (/[\u3400-\u9fff]/u.test(phrase)) return lower.includes(phrase.toLocaleLowerCase());
      let at = lower.indexOf(phrase);
      while (at !== -1) {
        const before = at ? lower[at - 1] : "";
        const end = at + phrase.length;
        const after = end < lower.length ? lower[end] : "";
        if (!WORD(before) && !WORD(after)) return true;
        at = lower.indexOf(phrase, at + 1);
      }
      return false;
    });
  }

  function findComposer() {
    // Chat products change their DOM often. Search common editor patterns,
    // then score visible candidates instead of trusting one brittle selector.
    const roots = [document];
    const seenRoots = new Set();
    for (let index = 0; index < roots.length; index++) {
      const root = roots[index];
      if (!root || seenRoots.has(root)) continue;
      seenRoots.add(root);
      let elements = [];
      try { elements = [...root.querySelectorAll("*")]; } catch { continue; }
      for (const el of elements) {
        if (el.shadowRoot) roots.push(el.shadowRoot);
        if (el.tagName === "IFRAME") {
          try { if (el.contentDocument) roots.push(el.contentDocument); } catch { /* cross-origin iframe */ }
        }
      }
    }

    const selectors = [
      "#prompt-textarea",
      '#prompt-textarea[contenteditable="true"]',
      'div.ProseMirror[contenteditable="true"]',
      'textarea[name="prompt-textarea"]',
      '[data-testid="prompt-textarea"]',
      '[data-testid="composer"] [contenteditable="true"]',
      '[data-testid*="composer"] [contenteditable="true"]',
      '[contenteditable]:not([contenteditable="false"])',
      '[role="textbox"]',
      '[data-placeholder]',
      '[aria-multiline="true"]',
      '[data-lexical-editor="true"]',
      '[data-slate-editor="true"]',
      "textarea",
      'input:not([type="search"]):not([type="hidden"]):not([type="password"])'
    ];
    const candidates = new Set();
    for (const root of roots) {
      for (const selector of selectors) {
        try { root.querySelectorAll(selector).forEach(el => candidates.add(el)); } catch { /* invalid selector in unusual host */ }
      }

      // When the toolbar popup steals focus, the page may still retain the
      // last focused composer as activeElement. Include it as a candidate.
      let active = root.activeElement;
      if (active && active !== root.body && active !== root.documentElement) {
        candidates.add(active);
        let parent = active;
        while (parent && parent.parentElement) {
          parent = parent.parentElement;
          if (parent.matches?.('[contenteditable]:not([contenteditable="false"]),[role="textbox"],textarea')) candidates.add(parent);
        }
      }
    }

    let best = null;
    let bestScore = -Infinity;
    for (const el of candidates) {
      if (el.closest?.("#hm-inline-panel") || el.disabled || el.readOnly || el.getAttribute("aria-hidden") === "true") continue;
      const editable = el.isContentEditable ||
        el.getAttribute("contenteditable") === "true" ||
        el.getAttribute("role") === "textbox" ||
        el.tagName === "TEXTAREA" ||
        (el.tagName === "INPUT" && ["text","search",""].includes(el.type)) ||
        el.hasAttribute("data-lexical-editor") ||
        el.hasAttribute("data-slate-editor");
      if (!editable) continue;
      const rect = el.getBoundingClientRect();
      const style = el.ownerDocument.defaultView.getComputedStyle(el);
      if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight ||
          rect.right <= 0 || rect.left >= innerWidth || style.visibility === "hidden" || style.display === "none") continue;

      const label = [
        el.id, el.getAttribute("aria-label"), el.getAttribute("placeholder"),
        el.getAttribute("data-placeholder"), el.getAttribute("data-testid"),
        el.getAttribute("name")
      ].filter(Boolean).join(" ").toLocaleLowerCase();
      if (/(search|filter|find in page|tìm kiếm)/i.test(label)) continue;

      const text = (("value" in el ? el.value : el.innerText || el.textContent) || "").trim();
      let score = 0;
      if (el === document.activeElement || roots.some(root => root.activeElement === el)) score += 120;
      if (el.id === "prompt-textarea" || el.getAttribute("data-testid") === "prompt-textarea") score += 100;
      if (el.isContentEditable || el.getAttribute("contenteditable") === "true") score += 65;
      if (el.tagName === "TEXTAREA") score += 60;
      if (el.getAttribute("role") === "textbox") score += 35;
      if (el.hasAttribute("data-lexical-editor") || el.hasAttribute("data-slate-editor")) score += 45;
      if (/(message|prompt|ask|chat|reply|nhắn tin|hỏi)/i.test(label)) score += 35;
      if (text.length) score += 30;
      if (rect.width > 260) score += 12;
      if (rect.bottom > innerHeight * 0.55) score += 18;
      if (el.closest("form")) score += 6;
      if (score > bestScore) { best = el; bestScore = score; }
    }
    return bestScore >= 35 ? best : null;
  }
  function readComposer(el = STATE.composer) {
    if (!el) return "";
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") return String(el.value || "").trim();
    const visibleText = typeof el.innerText === "string" ? el.innerText : "";
    const text = visibleText || el.textContent || "";
    return String(text).replace(/\\u00a0/gu, " ").trim();
  }

  function isEditableNode(el) {
    if (!el || el.nodeType !== 1 || el.closest?.("#hm-inline-panel")) return false;
    const tag = el.tagName;
    const editable = el.isContentEditable ||
      el.getAttribute("contenteditable") === "true" ||
      el.getAttribute("contenteditable") === "plaintext-only" ||
      el.getAttribute("role") === "textbox" ||
      el.getAttribute("aria-multiline") === "true" ||
      tag === "TEXTAREA" ||
      (tag === "INPUT" && ["text","search",""].includes(el.type)) ||
      el.hasAttribute("data-lexical-editor") ||
      el.hasAttribute("data-slate-editor");
    if (!editable || el.disabled || el.readOnly) return false;
    const rect = el.getBoundingClientRect();
    const view = el.ownerDocument?.defaultView;
    if (!rect.width || !rect.height || !view) return false;
    const style = view.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function composerFromEvent(event) {
    const eventPath = typeof event.composedPath === "function" ? event.composedPath() : [event.target];
    const candidates = eventPath.filter(node => isEditableNode(node));
    // Prefer the actual editor root over a paragraph/span nested inside it.
    const explicitRoot = candidates.find(node =>
      node.getAttribute("contenteditable") === "true" ||
      node.getAttribute("contenteditable") === "plaintext-only" ||
      node.getAttribute("role") === "textbox" ||
      node.getAttribute("aria-multiline") === "true" ||
      node.tagName === "TEXTAREA" || node.tagName === "INPUT" ||
      node.hasAttribute("data-lexical-editor") || node.hasAttribute("data-slate-editor")
    );
    if (explicitRoot) return explicitRoot;
    if (candidates.length) return candidates[candidates.length - 1];
    let node = event.target;
    while (node && node.nodeType === 1) {
      if (isEditableNode(node)) return node;
      node = node.parentElement || node.getRootNode?.().host || null;
    }
    return null;
  }

  function rememberComposer(event) {
    const candidate = composerFromEvent(event);
    if (!candidate) return;
    if (STATE.composer !== candidate) {
      if (STATE.composer) STATE.composer.removeEventListener("input", onInput);
      STATE.composer = candidate;
      candidate.addEventListener("input", onInput);
    }
    ensureUI();
    updateTrigger();
    positionUI();
  }

  function composerDiagnostics() {
    const visible = [...document.querySelectorAll('textarea,input,[contenteditable],[role="textbox"],[aria-multiline="true"]')]
      .filter(el => isEditableNode(el));
    const active = document.activeElement;
    const activeName = active ? [active.tagName, active.id, active.getAttribute?.("role"), active.getAttribute?.("contenteditable")].filter(Boolean).join("#") : "none";
    return { visibleEditableCount: visible.length, activeElement: activeName, knownComposerConnected: Boolean(STATE.composer?.isConnected), knownComposerTag: STATE.composer?.tagName || null };
  }

  function detect(text) {
    const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
    const lines = text.split(/\r?\n/u).map(x => x.trim()).filter(Boolean);
    const dims = {
      task: has(text, TERMS.task),
      context: has(text, TERMS.context),
      output: has(text, TERMS.output),
      constraints: has(text, TERMS.constraints),
      audience: has(text, TERMS.audience),
      criteria: has(text, TERMS.criteria)
    };
    const analytical = has(text, TERMS.analytical);
    const creation = has(text, TERMS.creation);
    const issues = [];
    const add = (level, title, detail, suggestion) => issues.push({ level, title, detail, suggestion });
    if (!dims.task && words > 5) add("warn","Chưa rõ hành động chính","Chưa nhận diện được động từ mô tả AI cần làm gì.","Bắt đầu bằng hành động cụ thể như phân tích, so sánh, viết, dịch hoặc kiểm tra.");
    if (has(text, TERMS.broad)) add("warn","Phạm vi quá rộng","Các từ như “tất cả mọi thứ” chưa giới hạn phần cần xử lý.","Chỉ rõ hạng mục, đối tượng và phạm vi cần tập trung.");
    if ((analytical || (creation && words > 25)) && !dims.context) add("warn","Thiếu bối cảnh hoặc dữ liệu","Yêu cầu này có vẻ cần dữ liệu/hiện trạng nhưng prompt chưa nêu nguồn đầu vào.","Cung cấp tài liệu, dữ kiện, đối tượng và tình trạng hiện tại.");
    if ((analytical || creation) && !dims.output) add("warn","Chưa rõ đầu ra","Chưa thấy loại kết quả hoặc cấu trúc bạn muốn nhận.","Chọn đầu ra như bảng, báo cáo, checklist, email, bản dịch hoặc tệp.");
    if ((analytical || creation) && !dims.constraints && words > 20) add("info","Thiếu ràng buộc","Chưa thấy các giới hạn hoặc điều kiện cần tuân thủ.","Nêu điều phải giữ nguyên, điều không được làm, giới hạn và nguồn được phép sử dụng.");
    if (words < 120 && has(text, TERMS.references)) add("warn","Tham chiếu chưa rõ","Một số từ có thể không xác định được tài liệu hoặc đối tượng đang nói tới.","Thay “nó/cái này/this” bằng tên đối tượng hoặc tài liệu cụ thể.");
    const lower = lines.map(x => x.toLocaleLowerCase());
    const duplicates = [...new Set(lower.filter((line,i) => lower.indexOf(line) !== i))];
    if (duplicates.length) add("warn","Có dòng lặp chính xác","Phát hiện "+duplicates.length+" dòng lặp. Có thể là nhấn mạnh có chủ ý.","Kiểm tra trước khi bỏ; HM không tự xóa dòng lặp.");
    if (/(ngắn gọn|brief|concise)/iu.test(text) && /(thật chi tiết|càng chi tiết càng tốt|comprehensive|as detailed as possible)/iu.test(text))
      add("info","Có thể mâu thuẫn về độ chi tiết","Prompt vừa muốn ngắn gọn vừa muốn rất chi tiết.","Chọn ưu tiên hoặc đặt giới hạn độ dài.");
    if (words > 250 && !has(text, TERMS.longTasks)) add("info","Prompt khá dài","Độ dài chưa chắc là lãng phí; nên kiểm tra phần trùng hoặc ngoài mục tiêu.","Chỉ rút gọn những câu lặp hoặc không ảnh hưởng kết quả.");
    if (!issues.length) add("good","Chưa thấy cảnh báo rõ ràng","Các quy tắc hiện tại chưa phát hiện lỗi phổ biến.","Vẫn nên rà soát mục tiêu, nguồn dữ liệu và yêu cầu đầu ra.");
    return { words, chars:text.length, approxTokens:Math.ceil(text.length/3.2), dims, issues, analytical, creation };
  }

  function make(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function ensureUI() {
    if (!STATE.trigger || !STATE.trigger.isConnected) {
      const trigger = make("button","hm-inline-trigger","HM · Phân tích");
      trigger.type = "button";
      trigger.addEventListener("click", () => openPanel());
      document.body.appendChild(trigger);
      STATE.trigger = trigger;
    }
    if (!STATE.panel || !STATE.panel.isConnected) {
      const panel = make("section","hm-inline-panel");
      panel.id = "hm-inline-panel";
      const head = make("div","hm-panel-head");
      const title = make("div","hm-panel-title");
      title.append(make("b","","HM TOKEN INTELLIGENCE"),make("small","","Trợ lý ngay trong ô chat"));
      const close = make("button","hm-close","×");
      close.type = "button";
      close.setAttribute("aria-label","Đóng");
      close.addEventListener("click",() => panel.classList.remove("hm-open"));
      head.append(title,close);
      const body = make("div","hm-panel-body");
      panel.append(head,body);
      document.body.appendChild(panel);
      STATE.panel = panel;
    }
  }

  function positionUI() {
    if (!STATE.composer || !STATE.composer.isConnected) return;
    ensureUI();
    const rect = STATE.composer.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const triggerWidth = 118;
    const left = Math.max(10,Math.min(innerWidth-triggerWidth-10,rect.right-triggerWidth-8));
    const top = Math.max(8,Math.min(innerHeight-48,rect.top-44));
    STATE.trigger.style.left = left+"px";
    STATE.trigger.style.top = top+"px";
    if (STATE.panel.classList.contains("hm-open")) {
      const width = Math.min(410,innerWidth-20);
      const panelLeft = Math.max(10,Math.min(innerWidth-width-10,rect.right-width));
      const panelHeight = Math.min(650,innerHeight-24);
      const panelTop = Math.max(10,Math.min(innerHeight-panelHeight-10,rect.top-panelHeight-12));
      STATE.panel.style.left = panelLeft+"px";
      STATE.panel.style.top = panelTop+"px";
      STATE.panel.style.width = width+"px";
      STATE.panel.style.maxHeight = panelHeight+"px";
    }
  }

  function renderPanel(text) {
    ensureUI();
    const body = STATE.panel.querySelector(".hm-panel-body");
    body.replaceChildren();
    const d = detect(text);
    const stats = make("div","hm-inline-stats",d.approxTokens+" token ~  ·  "+d.words+" từ  ·  "+d.chars+" ký tự");
    body.append(stats);

    const coverage = make("div","hm-coverage");
    const labels = [["task","Nhiệm vụ"],["context","Bối cảnh"],["output","Đầu ra"],["constraints","Ràng buộc"],["audience","Đối tượng"],["criteria","Tiêu chí"]];
    labels.forEach(([key,label]) => {
      const item = make("span",d.dims[key]?"is-found":"is-missing",(d.dims[key]?"✓ ":"○ ")+label);
      coverage.append(item);
    });
    body.append(coverage);

    const issueTitle = make("h3","hm-section-title","HM nhận thấy");
    body.append(issueTitle);
    d.issues.forEach(issue => {
      const card = make("article","hm-finding "+issue.level);
      card.append(make("b","",issue.title),make("p","",issue.detail),make("p","hm-suggestion","Gợi ý: "+issue.suggestion));
      body.append(card);
    });

    const instruction = make("p","hm-explain","HM không tự sửa hoặc gửi. Điền các phần còn thiếu để tạo một bản prompt rõ ràng hơn, sau đó bạn quyết định có chèn vào ô chat hay không.");
    body.append(instruction);

    const form = make("div","hm-fields");
    const fieldDefs = [
      ["scope","Phạm vi cụ thể","Bạn muốn AI tập trung vào những hạng mục nào?"],
      ["context","Bối cảnh / dữ liệu đầu vào","Nguồn dữ liệu, tài liệu, hiện trạng hoặc thông tin nền..."],
      ["output","Đầu ra mong muốn","Ví dụ: bảng, báo cáo, checklist, bản dịch, tệp..."],
      ["constraints","Ràng buộc cần tuân thủ","Điều phải giữ nguyên, điều không được làm, giới hạn..."],
      ["audience","Đối tượng sử dụng kết quả","Ví dụ: ban giám đốc, khách hàng, kỹ sư, người mới..."],
      ["criteria","Tiêu chí hoàn thành","Làm sao biết câu trả lời đã đáp ứng đúng yêu cầu?"]
    ];
    const fields = {};
    fieldDefs.forEach(([key,label,placeholder]) => {
      const wrap = make("label","hm-field");
      wrap.append(make("span","",label));
      const area = make("textarea","");
      area.rows = 2;
      area.placeholder = placeholder;
      area.dataset.hmField = key;
      fields[key] = area;
      wrap.append(area);
      form.append(wrap);
    });
    body.append(form);

    const build = make("button","hm-build","Tạo bản prompt cải thiện");
    build.type = "button";
    const previewLabel = make("h3","hm-section-title","Bản đề xuất — bạn duyệt trước khi chèn");
    const preview = make("textarea","hm-proposal");
    preview.rows = 8;
    preview.readOnly = true;
    const actions = make("div","hm-panel-actions");
    const insert = make("button","hm-insert","Chèn vào ô chat");
    insert.type = "button";
    insert.disabled = true;
    const copy = make("button","hm-copy","Sao chép");
    copy.type = "button";
    copy.disabled = true;
    actions.append(insert,copy);
    const status = make("p","hm-status","Bản gốc vẫn nằm nguyên trong ô chat.");
    body.append(build,previewLabel,preview,actions,status);

    let draft = "";
    build.addEventListener("click",() => {
      const extra = Object.entries(fields).filter(([,field]) => field.value.trim()).map(([key,field]) => {
        const label = fieldDefs.find(def => def[0]===key)[1];
        return label+": "+field.value.trim();
      });
      const openItems = [];
      if (!fields.scope.value.trim() && has(text,TERMS.broad)) openItems.push("Phạm vi cụ thể: [Liệt kê các hạng mục hoặc đối tượng cần tập trung; không mở rộng sang phần không liên quan.]");
      if (!fields.context.value.trim() && (d.analytical || d.creation) && !d.dims.context) openItems.push("Bối cảnh và dữ liệu đầu vào: [Nêu hiện trạng, tài liệu hoặc dữ liệu làm căn cứ.]");
      if (!fields.output.value.trim() && (d.analytical || d.creation) && !d.dims.output) openItems.push("Đầu ra mong muốn: [Chọn định dạng, cấu trúc và mức độ chi tiết.]");
      if (!fields.constraints.value.trim() && (d.analytical || d.creation) && !d.dims.constraints && d.words > 20) openItems.push("Ràng buộc: [Nêu điều phải giữ nguyên, giới hạn và điều cần tránh.]");
      if (!fields.audience.value.trim() && !d.dims.audience && (d.analytical || d.creation)) openItems.push("Đối tượng sử dụng: [Nêu người đọc/người dùng kết quả nếu ảnh hưởng cách trình bày.]");
      if (!fields.criteria.value.trim() && !d.dims.criteria && (d.analytical || d.creation)) openItems.push("Tiêu chí hoàn thành: [Nêu điều kiện để xác nhận kết quả đáp ứng yêu cầu.]");
      const lines = ["YÊU CẦU GỐC",text.trim()];
      if (extra.length || openItems.length) lines.push("\nTHÔNG TIN LÀM RÕ",...extra.map(x=>"- "+x),...openItems.map(x=>"- "+x)); 
      lines.push("\nNguyên tắc thực hiện: giữ nguyên ý định và dữ kiện trong yêu cầu gốc; không tự suy đoán thông tin chưa được cung cấp. Nếu phạm vi hoặc dữ liệu chưa đủ rõ, hãy hỏi lại trước khi kết luận.");
      draft = lines.join("\n");
      preview.value = draft;
      insert.disabled = false;
      copy.disabled = false;
      status.textContent = "Đã tạo bản đề xuất. Chưa có nội dung nào được chèn hoặc gửi.";
    });
    insert.addEventListener("click",() => {
      if (!draft || !STATE.composer || !STATE.composer.isConnected) {
        status.textContent = "Không tìm thấy ô chat hiện tại. Hãy mở lại bảng HM.";
        return;
      }
      writeComposer(STATE.composer,draft);
      status.textContent = "Đã chèn vào ô chat. HM không tự bấm nút gửi.";
      STATE.panel.classList.remove("hm-open");
    });
    copy.addEventListener("click",async () => {
      if (!draft) return;
      try {
        await navigator.clipboard.writeText(draft);
        status.textContent = "Đã sao chép bản đề xuất.";
      } catch {
        preview.focus(); preview.select();
        status.textContent = "Hãy nhấn Ctrl+C để sao chép.";
      }
    });
    positionUI();
  }

  function writeComposer(el,value) {
    el.focus();
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto,"value")?.set;
      if (setter) setter.call(el,value); else el.value=value;
    } else {
      try {
        document.execCommand("selectAll",false,null);
        document.execCommand("insertText",false,value);
      } catch {
        el.textContent = value;
      }
    }
    el.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:value}));
    el.dispatchEvent(new Event("change",{bubbles:true}));
  }

  function openPanel() {
    if (!STATE.composer || !STATE.composer.isConnected) STATE.composer=findComposer();
    const text=readComposer();
    if (!text) {
      ensureUI();
      STATE.panel.querySelector(".hm-panel-body").replaceChildren(make("p","hm-status","Hãy nhập prompt vào ô chat trước, sau đó mở HM để phân tích."));
    } else {
      renderPanel(text);
    }
    STATE.panel.classList.add("hm-open");
    positionUI();
  }

  function attach() {
    const detected = findComposer();
    const composer = detected || (STATE.composer?.isConnected ? STATE.composer : null);
    if (!composer) return;
    if (STATE.composer !== composer) {
      if (STATE.composer) STATE.composer.removeEventListener("input",onInput);
      STATE.composer=composer;
      composer.addEventListener("input",onInput);
    }
    ensureUI();
    updateTrigger();
    positionUI();
  }

  function onInput() {
    clearTimeout(STATE.timer);
    STATE.timer=setTimeout(updateTrigger,300);
    if (STATE.panel?.classList.contains("hm-open")) {
      const status = STATE.panel.querySelector(".hm-status");
      if (status) status.textContent = "Ô chat vừa thay đổi. Đóng/mở lại HM để phân tích nội dung mới; các trường bạn đang điền được giữ nguyên.";
    }
  }

  function updateTrigger() {
    if (!STATE.composer || !STATE.composer.isConnected) {
      STATE.composer=findComposer();
      if (!STATE.composer) return;
    }
    const text=readComposer();
    STATE.trigger.textContent=text ? "HM · "+Math.ceil(text.length/3.2)+" token ~" : "HM · Phân tích";
    positionUI();
  }

  chrome.runtime.onMessage.addListener((msg,_sender,sendResponse) => {
    if (msg?.type==="HM_ANALYZE_NOW") {
      // Opening the browser action popup steals focus from the page editor.
      // Do not discard the last composer that was remembered while the user typed.
      const remembered = STATE.composer?.isConnected && readComposer(STATE.composer) ? STATE.composer : null;
      const detected = remembered || findComposer();
      if (detected) {
        if (STATE.composer && STATE.composer !== detected) STATE.composer.removeEventListener("input",onInput);
        STATE.composer = detected;
        STATE.composer.addEventListener("input",onInput);
      }
      if (!STATE.composer?.isConnected) {
        sendResponse({ok:false,reason:"NO_COMPOSER",diagnostics:composerDiagnostics()});
        return true;
      }
      // Opening HM on an empty chat is valid: it must not trap focus in
      // the browser toolbar popup. The popup closes and the user can type
      // into the actual chat composer after HM has opened on the page.
      const text = readComposer(STATE.composer);
      openPanel();
      sendResponse({ok:true,empty:!text,diagnostics:composerDiagnostics()});
      return true;
    }
    return false;
  });

  attach();
  document.addEventListener("focusin", event => rememberComposer(event), true);
  document.addEventListener("input", event => rememberComposer(event), true);
  document.addEventListener("click", () => setTimeout(attach, 80), true);
  let attachTimer = null;
  new MutationObserver(() => {
    clearTimeout(attachTimer);
    attachTimer = setTimeout(attach, 180);
  }).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener("resize",positionUI,{passive:true});
  addEventListener("scroll",positionUI,{passive:true,capture:true});
})();
