import { getEncoding } from "js-tiktoken";

export const ENCODINGS = ["o200k_base", "cl100k_base", "p50k_base", "r50k_base"];

const PHRASES = {
  vague: ["tất cả mọi thứ", "mọi thứ", "càng nhiều càng tốt", "thật chi tiết", "everything", "as much as possible"],
  tasks: ["hãy làm", "giúp tôi", "xử lý", "phân tích", "kiểm tra", "please", "help me", "analyze", "review", "check", "create"],
  outputs: ["đầu ra", "định dạng", "bảng", "danh sách", "từng bước", "file", "tệp", "tiêu chí", "kết luận", "format", "table", "steps", "deliverable", "criteria"],
  references: ["nó", "cái này", "ở đó", "như trên", "như đã nói", "this", "that", "it", "above", "as mentioned"],
  longTasks: ["tóm tắt", "phân tích", "so sánh", "trích xuất", "giữ nguyên", "không được bỏ", "summarize", "compare", "extract", "preserve", "do not omit"]
};

function hasPhrase(text, phrases) {
  const lower = text.toLocaleLowerCase();
  return phrases.some(phrase => {
    let at = lower.indexOf(phrase);
    while (at !== -1) {
      const before = at ? lower[at - 1] : "";
      const end = at + phrase.length;
      const after = end < lower.length ? lower[end] : "";
      const word = c => Boolean(c) && /[\p{L}\p{N}_]/u.test(c);
      if (!word(before) && !word(after)) return true;
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
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const lines = text.split(/\r?\n/u).map(x => x.trim()).filter(Boolean);
  const issues = [];
  const add = (severity, code, title, explanation, suggestion) =>
    issues.push({ severity, code, title, explanation, suggestion });

  if (!text.trim()) {
    add("error", "empty", "Chưa có nội dung", "HM chưa nhận được prompt để phân tích.", "Dán nội dung bạn dự định gửi cho AI.");
  } else {
    if (hasPhrase(text, PHRASES.vague))
      add("warning", "scope", "Phạm vi có thể chưa rõ", "Cụm từ bao quát chưa xác định hạng mục, giới hạn hoặc mức độ cần xử lý.", "Nêu rõ đối tượng, phạm vi, giới hạn và mức độ chi tiết.");
    if (hasPhrase(text, PHRASES.tasks) && !hasPhrase(text, PHRASES.outputs))
      add("warning", "output", "Chưa thấy tiêu chí đầu ra", "AI có thể hiểu nhiệm vụ nhưng chưa biết định dạng hoặc tiêu chí hoàn thành.", "Chỉ định định dạng, cấu trúc, độ dài hoặc tiêu chí nghiệm thu.");
    if (words < 100 && hasPhrase(text, PHRASES.references))
      add("warning", "reference", "Tham chiếu có thể thiếu ngữ cảnh", "Các từ như “nó”, “cái này”, “this” hoặc “as mentioned” có thể không xác định rõ đối tượng.", "Thay đại từ bằng tên đối tượng, tài liệu hoặc đoạn nội dung cụ thể.");
    const lower = lines.map(x => x.toLocaleLowerCase());
    const duplicates = [...new Set(lower.filter((x, i) => lower.indexOf(x) !== i))];
    if (duplicates.length)
      add("warning", "duplicates", "Có dòng nội dung trùng lặp", "Phát hiện " + duplicates.length + " dòng lặp chính xác; lặp lại đôi khi có chủ ý.", "Kiểm tra từng dòng và chỉ xóa nếu không cần nhấn mạnh.");
    if (words > 250 && !hasPhrase(text, PHRASES.longTasks))
      add("info", "long", "Prompt tương đối dài", "Độ dài không tự động là lãng phí, nhưng có thể có phần không phục vụ trực tiếp mục tiêu.", "Chia thành bối cảnh, nhiệm vụ, ràng buộc và đầu ra; chỉ bỏ phần thật sự không cần.");
    if (/(.)\1{7,}/u.test(text))
      add("info", "characters", "Chuỗi ký tự lặp bất thường", "Có chuỗi ký tự lặp liên tiếp có thể do dán nhầm.", "Kiểm tra đoạn ký tự được lặp.");
    if (!issues.length)
      add("good", "clear", "Chưa phát hiện cảnh báo nổi bật", "Các quy tắc hiện tại chưa tìm thấy dấu hiệu rõ ràng về lỗi phổ biến.", "Với tác vụ quan trọng, vẫn nên kiểm tra bối cảnh, ràng buộc và tiêu chí đầu ra.");
  }

  const penalty = issues.reduce((sum, x) => sum + ({ error: 35, warning: 14, info: 4, good: 0 }[x.severity] || 0), 0);
  const score = Math.max(0, 100 - penalty);
  return {
    encoding: encodingName, tokens: countTokens(text, encodingName), words, characters: text.length,
    score, issues, issueCount: issues.filter(x => x.severity !== "good").length,
    label: score >= 85 ? "Tín hiệu cấu trúc tốt" : score >= 65 ? "Có điểm cần làm rõ" : "Nên xem lại prompt",
    note: "Token là số đếm chính xác cho văn bản đã nhập theo encoding được chọn. Không bao gồm system/developer instructions, lịch sử hội thoại phía máy chủ, tool schema hoặc payload đa phương tiện. Điểm cấu trúc là heuristic thử nghiệm, không phải xác suất AI trả lời đúng."
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
