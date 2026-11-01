import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt, optimizePrompt, countTokens, createRateLimiter } from "../server.js";

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

test("rate limiter resets after its configured window", () => {
  const limited = createRateLimiter(2, 1000);
  assert.equal(limited(10000), false);
  assert.equal(limited(10001), false);
  assert.equal(limited(10002), true);
  assert.equal(limited(11000), false);
});
