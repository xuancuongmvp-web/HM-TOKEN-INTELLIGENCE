import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt, optimizePrompt, countTokens } from "../server.js";

test("counts text with a supported tokenizer", () => {
  assert.ok(countTokens("Hello world", "o200k_base") > 0);
});
test("flags vague scope and missing output format", () => {
  const result = analyzePrompt("Hãy phân tích tất cả mọi thứ giúp tôi.");
  assert.ok(result.issues.some(issue => issue.code === "scope"));
  assert.ok(result.issues.some(issue => issue.code === "output"));
});
test("does not flag a clear, scoped prompt as vague", () => {
  const result = analyzePrompt("Hãy lập bảng gồm 3 rủi ro chính, nguyên nhân và biện pháp xử lý cho công trình này.");
  assert.equal(result.issues.some(issue => issue.code === "scope"), false);
});
test("format cleanup preserves wording", () => {
  const source = "Task   \r\n\r\n\r\nDetails  ";
  const result = optimizePrompt(source);
  assert.equal(result.optimized, "Task\n\nDetails");
  assert.equal(result.original, source);
});
