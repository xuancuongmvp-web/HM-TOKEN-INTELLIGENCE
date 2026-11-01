import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { getEncoding } from "js-tiktoken";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const widgetHtml = readFileSync(join(__dirname, "public", "widget.html"), "utf8");
const PORT = Number(process.env.PORT || 8787);
const MCP_PATH = "/mcp";
const ENCODINGS = ["o200k_base", "cl100k_base", "p50k_base", "r50k_base"];

function createRateLimiter(limit = 120, windowMs = 60_000) {
  let windowStart = null;
  let requestCount = 0;
  return (now = Date.now()) => {
    if (windowStart === null || now - windowStart >= windowMs || now < windowStart) {
      windowStart = now;
      requestCount = 0;
    }
    requestCount += 1;
    return requestCount > limit;
  };
}
const isRateLimited = createRateLimiter(
  Number.parseInt(process.env.HM_MCP_REQUESTS_PER_MINUTE || "120", 10)
);

function hasAnyPhrase(text, phrases) {
  const lower = text.toLocaleLowerCase("vi-VN");
  return phrases.some(phrase => {
    let index = lower.indexOf(phrase);
    while (index !== -1) {
      const before = index > 0 ? lower[index - 1] : "";
      const end = index + phrase.length;
      const after = end < lower.length ? lower[end] : "";
      const isWord = character => Boolean(character) && /[\p{L}\p{N}_]/u.test(character);
      if (!isWord(before) && !isWord(after)) return true;
      index = lower.indexOf(phrase, index + 1);
    }
    return false;
  });
}

function countTokens(text, encodingName = "o200k_base") {
  if (!ENCODINGS.includes(encodingName)) throw new Error("Unsupported encoding. Choose: " + ENCODINGS.join(", "));
  const encoding = getEncoding(encodingName);
  return encoding.encode(text).length;
}

function analyzePrompt(text, encodingName = "o200k_base") {
  const tokens = countTokens(text, encodingName);
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const lines = text.split(/\r?\n/u).map(line => line.trim()).filter(Boolean);
  const issues = [];
  const add = (severity, code, title, explanation, suggestion) =>
    issues.push({ severity, code, title, explanation, suggestion });

  if (!text.trim()) add("error", "empty", "Chưa có nội dung", "Hãy nhập prompt để HM có thể phân tích.", "Mô tả việc bạn muốn AI thực hiện.");
  if (hasAnyPhrase(text, ["tất cả mọi thứ", "mọi thứ", "thật chi tiết", "toàn bộ", "càng nhiều càng tốt"]))
    add("warning", "scope", "Phạm vi chưa rõ", "Các cụm từ bao quát không xác định hạng mục hoặc giới hạn cần kiểm tra.", "Nêu rõ phạm vi, thứ tự ưu tiên và mức độ chi tiết.");
  if (hasAnyPhrase(text, ["hãy làm", "giúp tôi", "xử lý", "phân tích", "kiểm tra"]) && !hasAnyPhrase(text, ["đầu ra", "định dạng", "bảng", "danh sách", "từng bước", "file", "tiêu chí", "kết luận"]))
    add("warning", "output", "Chưa xác định đầu ra", "AI chưa được chỉ rõ cần trả về dạng kết quả nào.", "Bổ sung định dạng đầu ra và tiêu chí hoàn thành.");
  if (hasAnyPhrase(text, ["nó", "cái này", "ở đó", "như trên", "như đã nói"]) && words < 100)
    add("warning", "reference", "Tham chiếu có thể thiếu ngữ cảnh", "Các từ thay thế có thể không rõ nếu nội dung trước đó không nằm trong ngữ cảnh.", "Thay bằng tên đối tượng, vị trí hoặc thông tin cụ thể.");
  const normalized = lines.map(line => line.toLocaleLowerCase());
  const repeated = [...new Set(normalized.filter((line, index) => normalized.indexOf(line) !== index))];
  if (repeated.length) add("warning", "duplicates", "Có dòng lặp chính xác", "Phát hiện " + repeated.length + " dòng nội dung trùng nhau.", "Kiểm tra và chỉ xóa dòng lặp nếu không có chủ ý nhấn mạnh.");
  if (words > 250) add("info", "long", "Prompt tương đối dài", "Prompt có " + words + " từ. Độ dài không tự động là lãng phí nếu nội dung cần thiết.", "Tách rõ bối cảnh, nhiệm vụ, ràng buộc và đầu ra; bỏ phần không phục vụ mục tiêu.");
  if (/(.)\1{7,}/u.test(text)) add("info", "characters", "Chuỗi ký tự lặp bất thường", "Có thể có ký tự được dán lặp ngoài ý muốn.", "Kiểm tra đoạn ký tự bất thường.");
  if (!issues.length) add("good", "clear", "Chưa phát hiện vấn đề rõ ràng", "Theo các quy tắc hiện có, prompt chưa có dấu hiệu cảnh báo nổi bật.", "Nếu nhiệm vụ phức tạp, vẫn nên xác định bối cảnh, tiêu chí và định dạng đầu ra.");

  const penalty = issues.reduce((sum, issue) => sum + ({ error: 35, warning: 14, info: 4, good: 0 }[issue.severity] || 0), 0);
  const score = Math.max(0, 100 - penalty);
  return {
    encoding: encodingName, tokens, words, characters: text.length,
    score, score_label: score >= 85 ? "Tốt" : score >= 65 ? "Cần cải thiện" : "Nên chỉnh sửa",
    issue_count: issues.filter(issue => issue.severity !== "good").length,
    issues,
    estimate_note: "Token được đếm chính xác cho văn bản này với encoding đã chọn; không bao gồm hidden instructions, lịch sử hội thoại phía máy chủ, tool schema hoặc nội dung đa phương tiện."
  };
}

function comparePrompts(original, revised, encodingName = "o200k_base") {
  const originalTokens = countTokens(original, encodingName);
  const revisedTokens = countTokens(revised, encodingName);
  const tokensSaved = originalTokens - revisedTokens;
  return {
    encoding: encodingName,
    original_tokens: originalTokens,
    revised_tokens: revisedTokens,
    tokens_saved: tokensSaved,
    reduction_percent: originalTokens ? Number((tokensSaved / originalTokens * 100).toFixed(2)) : 0,
    original_characters: original.length,
    revised_characters: revised.length,
    exact_for_supplied_text: true,
    semantic_equivalence_checked: false,
    note: "Counts are exact for the two supplied texts and selected encoding. This tool does not prove that the revised prompt preserves the original meaning; HM must perform a separate semantic comparison."
  };
}

function optimizePrompt(text) {
  const before = text;
  let output = text.replace(/\r\n?/gu, "\n");
  output = output.split("\n").map(line => line.replace(/[ \t]+$/u, "")).join("\n");
  output = output.replace(/\n{3,}/gu, "\n\n");
  return { original: before, optimized: output, changed: before !== output,
    operations: before === output ? [] : ["Chuẩn hóa xuống dòng", "Xóa khoảng trắng cuối dòng", "Gộp nhiều dòng trống liên tiếp"],
    note: "Chỉ dọn dẹp định dạng; không diễn đạt lại và không tự gửi prompt." };
}

function createMcpServer() {
  const server = new McpServer(
    { name: "hm-token-intelligence", version: "0.2.0" },
    { instructions: "HM Token Intelligence helps users detect prompt ambiguity, missing output criteria, repetition and unnecessary verbosity. Explain each finding plainly, protect the user's intended outcome, and never claim access to hidden ChatGPT context. Token counts cover only supplied text and the selected encoding. Never rewrite or submit a prompt without explicit user approval." }
  );

  registerAppResource(server, "hm-prompt-inspector", "ui://hm-token-intelligence/inspector.html", {},
    async () => ({ contents: [{ uri: "ui://hm-token-intelligence/inspector.html", mimeType: RESOURCE_MIME_TYPE, text: widgetHtml }] })
  );

  const analyzeInput = { text: z.string().max(100000, "Prompt is too long (maximum 100,000 characters)."), encoding: z.enum(ENCODINGS).default("o200k_base") };
  const outputSchema = {
    encoding: z.string(), tokens: z.number(), words: z.number(), characters: z.number(),
    score: z.number(), score_label: z.string(), issue_count: z.number(),
    issues: z.array(z.object({ severity: z.string(), code: z.string(), title: z.string(), explanation: z.string(), suggestion: z.string() })),
    estimate_note: z.string()
  };

  registerAppTool(server, "count_tokens", {
    title: "Đếm token chính xác",
    description: "Đếm token bằng js-tiktoken cho toàn bộ văn bản người dùng cung cấp, theo một trong các encoding được hỗ trợ. Chỉ số này không bao gồm hidden context, lịch sử máy chủ hoặc payload đa phương tiện.",
    inputSchema: { text: z.string().max(100000, "Text is too long (maximum 100,000 characters)."), encoding: z.enum(ENCODINGS).default("o200k_base") },
    outputSchema: {
      encoding: z.string(), tokens: z.number(), words: z.number(), characters: z.number(),
      exact_for_supplied_text: z.boolean(), scope_note: z.string()
    }
  }, async ({ text, encoding = "o200k_base" }) => {
    const result = {
      encoding,
      tokens: countTokens(text, encoding),
      words: text.trim() ? text.trim().split(/\\s+/u).length : 0,
      characters: text.length,
      exact_for_supplied_text: true,
      scope_note: "Exact tokenizer count for the supplied text only. Does not include hidden instructions, server-side history, tool schemas, or multimodal payloads."
    };
    return {
      content: [{ type: "text", text: `HM Token Count: ${result.tokens} tokens (${encoding}) for the supplied text. ${result.scope_note}` }],
      structuredContent: result
    };
  });

  registerAppTool(server, "compare_prompts", {
    title: "So sánh token trước và sau",
    description: "Đếm chính xác hai phiên bản prompt bằng cùng một tokenizer; trả về chênh lệch token và tỷ lệ thay đổi. Không tự đánh giá tương đương ngữ nghĩa.",
    inputSchema: {
      original: z.string().max(100000),
      revised: z.string().max(100000),
      encoding: z.enum(ENCODINGS).default("o200k_base")
    },
    outputSchema: {
      encoding: z.string(), original_tokens: z.number(), revised_tokens: z.number(),
      tokens_saved: z.number(), reduction_percent: z.number(),
      original_characters: z.number(), revised_characters: z.number(),
      exact_for_supplied_text: z.boolean(), semantic_equivalence_checked: z.boolean(), note: z.string()
    }
  }, async ({ original, revised, encoding = "o200k_base" }) => {
    const result = comparePrompts(original, revised, encoding);
    return {
      content: [{ type: "text", text: `HM comparison (${encoding}): original ${result.original_tokens}, revised ${result.revised_tokens}, difference ${result.tokens_saved} tokens (${result.reduction_percent}%). Semantic equivalence has not been established by the tokenizer.` }],
      structuredContent: result
    };
  });

  registerAppTool(server, "analyze_prompt", {
    title: "Phân tích prompt",
    description: "Đếm token chính xác cho văn bản được cung cấp theo encoding đã chọn; đánh giá các dấu hiệu mơ hồ, thiếu đầu ra, nội dung lặp và độ dài. Chỉ phân tích phần văn bản được gửi, không đọc hidden context.",
    inputSchema: analyzeInput,
    outputSchema,
    _meta: { ui: { resourceUri: "ui://hm-token-intelligence/inspector.html" } }
  }, async ({ text, encoding = "o200k_base" }) => {
    const result = analyzePrompt(text, encoding);
    return { content: [{ type: "text", text: `HM Prompt Score: ${result.score}/100. Token: ${result.tokens}. Phát hiện: ${result.issue_count}. ${result.issues.map(i => i.title + ": " + i.explanation + " Đề xuất: " + i.suggestion).join("\n")}` }], structuredContent: result };
  });

  registerAppTool(server, "optimize_prompt_formatting", {
    title: "Dọn định dạng prompt an toàn",
    description: "Chỉ chuẩn hóa xuống dòng và khoảng trắng; không diễn đạt lại, không xóa ý và không gửi prompt. Trả về bản gốc và bản đề xuất để người dùng tự quyết định.",
    inputSchema: { text: z.string().max(100000) },
    outputSchema: { original: z.string(), optimized: z.string(), changed: z.boolean(), operations: z.array(z.string()), note: z.string() },
    _meta: { ui: { resourceUri: "ui://hm-token-intelligence/inspector.html" } }
  }, async ({ text }) => {
    const result = optimizePrompt(text);
    return { content: [{ type: "text", text: result.changed ? "Đã tạo bản dọn định dạng để bạn xem xét. HM không thay thế văn bản gốc." : "Không cần dọn định dạng." }], structuredContent: result };
  });

  return server;
}

const httpServer = createServer(async (req, res) => {
  if (!req.url) return res.writeHead(400).end("Missing URL");
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ name: "HM Token Intelligence MCP", status: "ok", endpoint: MCP_PATH, version: "0.2.0" }));
    return;
  }
  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ status: "ok" }));
    return;
  }
  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type, mcp-session-id", "Access-Control-Expose-Headers": "Mcp-Session-Id" }).end();
    return;
  }
  if (url.pathname === MCP_PATH && ["POST", "GET", "DELETE"].includes(req.method || "")) {
    if (isRateLimited()) {
      res.writeHead(429, { "content-type": "application/json", "retry-after": "60" })
        .end(JSON.stringify({ error: "Rate limit exceeded. Retry in 60 seconds." }));
      return;
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true, maxRequestBodySize: 512 * 1024 });
    res.on("close", () => { transport.close(); server.close(); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("MCP request failed:", error);
      if (!res.headersSent) res.writeHead(500).end("Internal server error");
    }
    return;
  }
  res.writeHead(404).end("Not Found");
});
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (process.env.NODE_ENV === "production" && !process.env.HM_MCP_API_TOKEN) {\n    throw new Error("Refusing to start HM MCP in production without HM_MCP_API_TOKEN.");\n  }\n  httpServer.listen(PORT, process.env.HOST || "0.0.0.0", () => console.log(`HM Token Intelligence MCP listening on port ${PORT} at ${MCP_PATH}`));
}

export { analyzePrompt, optimizePrompt, countTokens, comparePrompts, createRateLimiter };
