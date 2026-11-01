import { getEncoding } from "js-tiktoken";

export const ENCODINGS = ["o200k_base", "cl100k_base", "p50k_base", "r50k_base"];

const TERMS = {
  task: [
    "hãy", "giúp tôi", "viết", "soạn", "tạo", "lập", "thiết kế", "dịch", "kiểm tra", "sửa",
    "xây dựng", "giải thích", "tìm", "so sánh", "tổng hợp", "liệt kê", "đánh giá", "phân tích",
    "triển khai", "tính toán", "vẽ", "lập trình", "chuyển đổi", "tóm tắt", "đề xuất", "hướng dẫn",
    "write", "draft", "create", "build", "design", "translate", "check", "fix", "review",
    "explain", "find", "compare", "summarize", "list", "evaluate", "analyze", "calculate",
    "implement", "draw", "convert", "recommend", "guide", "help me", "please",
    "请", "帮我", "写", "创建", "设计", "翻译", "检查", "修改", "建立", "解释", "查找",
    "比较", "总结", "列出", "评估", "分析", "计算", "实现", "绘制", "推荐"
  ],
  broad: ["tất cả mọi thứ", "mọi thứ", "càng nhiều càng tốt", "thật chi tiết", "everything", "as much as possible", "越详细越好", "尽可能详细", "全部内容", "所有内容"],
  analytical: ["phân tích", "đánh giá", "so sánh", "rà soát", "kiểm tra", "lập kế hoạch", "đề xuất", "analyze", "evaluate", "compare", "review", "audit", "plan", "recommend", "分析", "评估", "比较", "审查", "计划"],
  creation: ["viết", "soạn", "tạo", "lập", "thiết kế", "xây dựng", "write", "draft", "create", "design", "build", "写", "创建", "设计", "建立"],
  simpleAnswer: ["là gì", "vì sao", "tại sao", "như thế nào", "how do", "what is", "why does", "explain", "是什么", "为什么", "如何"],
  output: [
    "đầu ra", "định dạng", "bảng", "danh sách", "từng bước", "file", "tệp", "tiêu chí", "kết luận",
    "báo cáo", "email", "thư", "mẫu", "biểu mẫu", "kịch bản", "mã nguồn", "code", "excel", "word",
    "pdf", "json", "csv", "slide", "powerpoint", "đoạn văn", "bản dịch", "checklist",
    "format", "table", "list", "steps", "deliverable", "criteria", "report", "email", "letter",
    "template", "script", "source code", "spreadsheet", "document", "presentation", "paragraph", "translation",
    "表格", "清单", "步骤", "格式", "结论", "输出", "报告", "邮件", "模板", "代码", "文档", "演示文稿"
  ],
  context: [
    "bối cảnh", "hiện trạng", "dữ liệu", "thông tin nền", "tài liệu đính kèm", "dựa trên", "theo tài liệu",
    "tôi gửi", "tôi cung cấp", "dưới đây", "sau đây", "đối tượng là", "hiện tại",
    "context", "background", "based on", "according to", "attached", "provided", "the following",
    "source material", "current situation", "given data",
    "背景", "根据", "附件", "以下内容", "目前情况", "提供的资料"
  ],
  constraint: [
    "không được", "không thay đổi", "không tự ý", "giữ nguyên", "chỉ sử dụng", "chỉ được",
    "tối đa", "ít nhất", "giới hạn", "bắt buộc", "tránh", "đừng", "phải giữ",
    "do not", "don't", "must not", "never", "preserve", "keep unchanged", "only use", "at most",
    "at least", "limit", "avoid", "must", "exactly",
    "不得", "不要", "必须", "保持不变", "仅使用", "最多", "至少", "限制"
  ],
  audience: [
    "đối tượng đọc", "dành cho", "người đọc", "khách hàng", "nhân viên", "ban giám đốc",
    "for the", "audience", "reader", "customer", "employee", "executive", "for beginners",
    "面向", "读者", "客户", "员工", "管理层"
  ],
  criteria: [
    "tiêu chí đánh giá", "tiêu chí hoàn thành", "điều kiện nghiệm thu", "đáp ứng yêu cầu",
    "thành công khi", "kiểm chứng", "xác minh", "đảm bảo rằng",
    "success criteria", "acceptance criteria", "definition of done", "verify that", "validate",
    "success means", "must satisfy",
    "验收标准", "成功标准", "验证", "确保满足"
  ],
  vagueReference: ["nó", "cái này", "ở đó", "như trên", "như đã nói", "this", "that", "it", "above", "as mentioned", "这个", "那个", "如上所述"],
  longTasks: ["tóm tắt", "phân tích", "so sánh", "trích xuất", "giữ nguyên", "không được bỏ", "summarize", "analyze", "compare", "extract", "preserve", "do not omit", "总结", "分析", "比较", "提取", "不要删除"]
};

function contains(text, phrases) {
  const lower = text.toLocaleLowerCase();
  return phrases.some(phrase => {
    // CJK text has no whitespace word boundaries, so use substring matching.
    if (/[\\u3400-\\u9fff]/u.test(phrase)) return lower.includes(phrase.toLocaleLowerCase());
    let at = lower.indexOf(phrase);
    while (at !== -1) {
      const before = at ? lower[at - 1] : "";
      const end = at + phrase.length;
      const after = end < lower.length ? lower[end] : "";
      const isWord = c => Boolean(c) && /[\p{L}\p{N}_]/u.test(c);
      if (!isWord(before) && !isWord(after)) return true;
      at = lower.indexOf(phrase, at + 1);
    }
    return false;
  });
}

export function countTokens(text, encodingName = "o200k_base") {
  if (!ENCODINGS.includes(encodingName)) throw new Error("Encoding không được hỗ trợ.");
  return getEncoding(encodingName).encode(text).length;
}

export function analyzePrompt(text, encodingName = "o200k_base") {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const lines = text.split(/\r?\n/u).map(line => line.trim()).filter(Boolean);
  const detected = {
    task: contains(text, TERMS.task),
    context: contains(text, TERMS.context),
    output: contains(text, TERMS.output),
    constraints: contains(text, TERMS.constraint),
    audience: contains(text, TERMS.audience),
    criteria: contains(text, TERMS.criteria)
  };
  const issues = [];
  const add = (severity, code, title, explanation, suggestion) =>
    issues.push({ severity, code, title, explanation, suggestion });

  if (!trimmed) {
    add("error", "empty", "Chưa có nội dung", "HM chưa nhận được prompt để phân tích.", "Dán nội dung bạn dự định gửi cho AI.");
  } else {
    const isAnalytical = contains(text, TERMS.analytical);
    const isCreation = contains(text, TERMS.creation);
    const isSimpleAnswer = contains(text, TERMS.simpleAnswer);
    const isBroad = contains(text, TERMS.broad);

    if (!detected.task && words > 5) {
      add("warning", "task", "Chưa xác định rõ hành động chính", "HM chưa nhận diện được động từ mô tả việc AI cần thực hiện. Có thể yêu cầu đã bị ẩn trong ngữ cảnh hoặc diễn đạt theo cách khác.", "Viết rõ động từ hành động ở đầu yêu cầu: phân tích, so sánh, viết, dịch, kiểm tra, lập bảng...");
    }
    if (isBroad) {
      add("warning", "scope", "Phạm vi yêu cầu quá bao quát", "Các cụm như “mọi thứ”, “càng nhiều càng tốt” chưa giới hạn hạng mục, phạm vi hoặc mức độ chi tiết.", "Chia nhiệm vụ thành các hạng mục cụ thể và nêu giới hạn cần tập trung.");
    }
    if ((isAnalytical || (isCreation && words > 25)) && !detected.context) {
      add("warning", "context", "Thiếu dấu hiệu về bối cảnh hoặc dữ liệu đầu vào", "Với yêu cầu phân tích/đánh giá hoặc tạo nội dung theo tình huống cụ thể, HM chưa thấy nguồn dữ liệu, hiện trạng hay bối cảnh được nêu trong prompt.", "Bổ sung tài liệu, dữ kiện, đối tượng, tình trạng hiện tại hoặc nói rõ AI chỉ được dùng thông tin nào.");
    }
    if ((isCreation || isAnalytical) && !detected.output) {
      add("warning", "output", "Chưa mô tả rõ sản phẩm đầu ra", "Yêu cầu tạo nội dung nhưng chưa xác định rõ muốn nhận loại sản phẩm hoặc cấu trúc nào.", "Nêu loại đầu ra: email, báo cáo, bảng, checklist, bản dịch, mã nguồn, tệp hoặc dàn ý.");
    }
    if (detected.task && !detected.constraints && (isAnalytical || isCreation) && words > 20) {
      add("info", "constraints", "Chưa thấy ràng buộc thực hiện", "Prompt chưa thể hiện giới hạn về phạm vi, nội dung phải giữ, điều cần tránh hoặc quy tắc bắt buộc.", "Bổ sung các điều kiện quan trọng như không được thay đổi dữ liệu, giới hạn độ dài, nguồn được phép dùng hoặc nội dung cần giữ nguyên.");
    }
    if (words < 120 && contains(text, TERMS.vagueReference)) {
      add("warning", "reference", "Có tham chiếu chưa xác định đối tượng", "Các từ như “nó”, “cái này”, “this” hoặc “that” có thể khiến AI không biết chính xác bạn đang nói đến tài liệu hay đối tượng nào.", "Thay tham chiếu bằng tên tài liệu, đối tượng hoặc đoạn nội dung cụ thể.");
    }
    const lowerLines = lines.map(line => line.toLocaleLowerCase());
    const duplicateLines = [...new Set(lowerLines.filter((line, index) => lowerLines.indexOf(line) !== index))];
    if (duplicateLines.length) {
      add("warning", "duplicates", "Có dòng chỉ dẫn lặp chính xác", "Phát hiện " + duplicateLines.length + " dòng bị lặp. Việc lặp có thể là chủ ý nhấn mạnh nên HM không tự xóa.", "Kiểm tra xem đây là nhấn mạnh có chủ ý hay nội dung bị dán trùng.");
    }
    if (/(ngắn gọn|brief|concise)/iu.test(text) && /(thật chi tiết|càng chi tiết càng tốt|comprehensive|as detailed as possible)/iu.test(text)) {
      add("info", "tension", "Có thể xung đột về mức độ chi tiết", "Prompt vừa yêu cầu ngắn gọn vừa yêu cầu trình bày thật chi tiết. Hai mục tiêu có thể kéo kết quả theo hai hướng khác nhau.", "Chọn ưu tiên: ngắn gọn nhưng đủ ý, hoặc phân tích chi tiết theo giới hạn độ dài cụ thể.");
    }
    if (words > 250 && !contains(text, TERMS.longTasks)) {
      add("info", "long", "Prompt dài — nên rà soát mức độ cần thiết", "Độ dài tự nó không phải vấn đề. HM chỉ khuyến nghị kiểm tra các đoạn bối cảnh hoặc chỉ dẫn có lặp lại hay không.", "Giữ nguyên dữ kiện cần thiết; chỉ rút gọn phần trùng hoặc không ảnh hưởng đến kết quả.");
    }
    if (/(.)\1{7,}/u.test(text)) {
      add("info", "characters", "Có chuỗi ký tự lặp bất thường", "Một chuỗi ký tự lặp liên tiếp có thể xuất hiện do dán nhầm.", "Kiểm tra đoạn ký tự lặp trước khi gửi.");
    }
    if (!issues.length) {
      add("good", "clear", "Chưa phát hiện vấn đề rõ ràng theo bộ quy tắc hiện tại", "Điều này không đồng nghĩa prompt đã hoàn hảo. HM chỉ kiểm tra được những dấu hiệu mà bộ quy tắc hiện tại nhận diện.", "Kiểm tra lại mục tiêu, dữ liệu đầu vào, định dạng đầu ra và tiêu chí thành công theo mức độ cần thiết của tác vụ.");
    }
  }

  const dimensions = [
    { key: "task", label: "Nhiệm vụ chính", found: detected.task, hint: "Hành động AI cần thực hiện" },
    { key: "context", label: "Bối cảnh / dữ liệu", found: detected.context, hint: "Thông tin nền hoặc nguồn đầu vào" },
    { key: "output", label: "Sản phẩm đầu ra", found: detected.output, hint: "Định dạng hoặc loại kết quả" },
    { key: "constraints", label: "Ràng buộc", found: detected.constraints, hint: "Điều kiện, giới hạn, nội dung cần giữ" },
    { key: "audience", label: "Đối tượng sử dụng", found: detected.audience, hint: "Người đọc hoặc người dùng kết quả" },
    { key: "criteria", label: "Tiêu chí hoàn thành", found: detected.criteria, hint: "Cách xác định kết quả đạt yêu cầu" }
  ];
  const present = dimensions.filter(item => item.found).length;
  const score = Math.round((present / dimensions.length) * 100);
  const applicable = isNaN(score) ? 0 : score;
  return {
    encoding: encodingName, tokens: countTokens(text, encodingName), words, characters: text.length,
    score: applicable, dimensions, presentDimensions: present, totalDimensions: dimensions.length,
    issues, issueCount: issues.filter(item => item.severity !== "good").length,
    label: present >= 5 ? "Nhiều thành phần cấu trúc đã được nêu" : present >= 3 ? "Đã có một số thành phần cấu trúc" : "Prompt còn ít dấu hiệu cấu trúc",
    note: "Đây là kiểm tra sự xuất hiện của dấu hiệu cấu trúc, không phải điểm chất lượng tuyệt đối. Không phải tác vụ nào cũng cần đủ 6 thành phần. Token là số đếm chính xác cho văn bản đã nhập theo encoding được chọn; không bao gồm hidden context, lịch sử hội thoại phía máy chủ, tool schema hoặc payload đa phương tiện."
  };
}

export function cleanFormatting(text, encodingName = "o200k_base") {
  let output = text.replace(/\r\n?/gu, "\n");
  output = output.split("\n").map(line => line.replace(/[ \t]+$/u, "")).join("\n");
  output = output.replace(/\n{3,}/gu, "\n\n");
  return {
    original: text, optimized: output, changed: output !== text,
    beforeTokens: countTokens(text, encodingName), afterTokens: countTokens(output, encodingName)
  };
}
