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
