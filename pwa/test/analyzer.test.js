import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt, cleanFormatting, countTokens } from "../src/analyzer.js";
test("counts supplied text with selected tokenizer", () => {
  assert.ok(countTokens("Xin chào thế giới", "o200k_base") > 0);
  assert.ok(countTokens("Hello world", "cl100k_base") > 0);
});
test("flags broad scope and missing output criteria", () => {
  const result = analyzePrompt("Hãy phân tích tất cả mọi thứ giúp tôi.");
  assert.ok(result.issues.some(item => item.code === "scope"));
  assert.ok(result.issues.some(item => item.code === "output"));
});
test("format cleanup preserves original wording", () => {
  const source = "Task   \r\n\r\n\r\nDetails  ";
  const result = cleanFormatting(source);
  assert.equal(result.optimized, "Task\n\nDetails");
  assert.equal(result.original, source);
  assert.ok(Number.isInteger(result.beforeTokens));
  assert.ok(Number.isInteger(result.afterTokens));
});
test("empty prompt produces an explicit warning", () => {
  const result = analyzePrompt("");
  assert.equal(result.tokens, 0);
  assert.equal(result.issues[0].code, "empty");
});

test("counts Chinese text and flags broad Chinese requests", () => {
  assert.ok(countTokens("请分析全部内容", "o200k_base") > 0);
  const result = analyzePrompt("请分析全部内容并帮我处理一下。");
  assert.ok(result.issues.some(item => item.code === "scope"));
  assert.ok(result.issues.some(item => item.code === "output"));
});
test("detects repeated instruction lines without deleting them", () => {
  const result = analyzePrompt("Keep the original structure.\nKeep the original structure.");
  assert.ok(result.issues.some(item => item.code === "duplicates"));
  assert.equal(cleanFormatting("Keep the original structure.\nKeep the original structure.").optimized,
    "Keep the original structure.\nKeep the original structure.");
});

test("returns an explicit breakdown of prompt structure dimensions", () => {
  const result = analyzePrompt("Hãy phân tích báo cáo bán hàng dựa trên dữ liệu tôi gửi. Trình bày thành bảng và giữ nguyên số liệu.");
  assert.equal(result.totalDimensions, 6);
  assert.ok(result.dimensions.find(item => item.key === "task").found);
  assert.ok(result.dimensions.find(item => item.key === "context").found);
  assert.ok(result.dimensions.find(item => item.key === "output").found);
  assert.ok(result.dimensions.find(item => item.key === "constraints").found);
  assert.ok(result.presentDimensions >= 4);
  assert.equal(typeof result.note, "string");
});
test("does not label a short direct question as missing a deliverable", () => {
  const result = analyzePrompt("5 nhân 7 bằng bao nhiêu?");
  assert.equal(result.issues.some(item => item.code === "output"), false);
});
