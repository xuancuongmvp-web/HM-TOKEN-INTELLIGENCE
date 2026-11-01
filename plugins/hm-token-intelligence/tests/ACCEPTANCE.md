# HM Prompt Intelligence — acceptance tests

Run these cases manually after the plugin/skill is installed. They test task understanding, restraint, preservation, and response evaluation. A good result is not a rigid 6/6 checklist: HM must judge only what matters for the specific task.

## Case 1 — Broad scope

Input:
```text
Hãy phân tích tất cả mọi thứ giúp tôi.
```

Expected:
- Identify the request as underspecified and broad.
- Ask what topic/object should be analyzed.
- Explain that needed source data and desired output depend on the chosen topic.
- Do not invent the topic or automatically add a long generic template.

## Case 2 — Simple factual question

Input:
```text
5 nhân 7 bằng bao nhiêu?
```

Expected:
- Recognize this as a simple arithmetic question.
- Do not demand audience, context, output format, or acceptance criteria.
- Do not make up a token-saving rewrite when none is needed.

## Case 3 — Specific business analysis

Input:
```text
Phân tích doanh thu theo tháng từ file Excel tôi đính kèm. So sánh 6 tháng gần nhất với 6 tháng trước đó, nêu 3 nguyên nhân biến động lớn nhất và đề xuất 5 hành động cải thiện. Trình bày bằng bảng và phần kết luận ngắn cho ban giám đốc. Không tự thay đổi số liệu gốc.
```

Expected:
- Recognize a defined task, source file, comparison period, output, audience, and preservation constraint.
- Check whether the file is actually attached/accessible. If not, say so.
- Avoid warning that all six prompt dimensions are missing.
- Ask for clarification only if the date range or dataset is genuinely ambiguous.

## Case 4 — Conflicting requirements

Input:
```text
Viết báo cáo thật ngắn gọn nhưng phải phân tích toàn bộ 20 rủi ro, nguyên nhân, mức độ ảnh hưởng, biện pháp và trách nhiệm của từng bộ phận. Giới hạn tối đa 100 từ.
```

Expected:
- Flag a likely conflict between breadth of coverage and a 100-word limit.
- Explain what would be lost if the limit is obeyed literally.
- Ask which requirement has priority or propose a concise executive summary plus detailed appendix.
- Do not silently choose a priority.

## Case 5 — Repetition with deliberate emphasis

Input:
```text
Không được thay đổi bất kỳ con số nào trong bảng.
Lưu ý: tuyệt đối không thay đổi các con số gốc.
```

Expected:
- Recognize semantic repetition, but explain that the second sentence may be intentional emphasis.
- Offer a combined wording only as a proposal.
- Preserve the constraint exactly in meaning.

## Case 6 — Evaluate answer quality

Input includes both:
- An original prompt with a required table of 5 items and a conclusion.
- An AI answer that contains only 3 items and no conclusion.

Expected:
- Compare answer against explicit requirements.
- Mark the table as partially met and conclusion as missing.
- Distinguish omissions in the answer from any ambiguity in the prompt.
- Draft a focused follow-up that asks for the two missing items and conclusion.

## Release gate

Do not call the skill production-ready merely because its files parse. Review every case, record false positives/false negatives, and refine the instructions when the same failure recurs. No claim of exact token counts is allowed without a real tokenizer tool.
