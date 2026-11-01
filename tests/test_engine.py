import pytest
from hm_token_intelligence.engine import UnknownEncodingError, count_text, optimize_text

@pytest.mark.parametrize("encoding", ["o200k_base", "cl100k_base", "p50k_base", "r50k_base"])
@pytest.mark.parametrize("text", ["", "Hello world", "Xin chào Việt Nam 🇻🇳", "你好，世界。", "def f(x):\n    return x + 1"])
def test_count_consistent(encoding, text):
    result = count_text(text, encoding, include_ids=True)
    assert result.tokens == len(result.token_ids)
    assert result.tokens >= 0
    assert result.tokens == count_text(text, encoding).tokens

def test_unknown_encoding_fails_closed():
    with pytest.raises(UnknownEncodingError):
        count_text("hello", "unknown")

def test_optimizer_preview_is_transparent():
    source = "hello  \n\n\nworld\n"
    result = optimize_text(source)
    assert result.original == source
    assert result.optimized == "hello\n\nworld\n"
    assert result.changed

def test_duplicate_removal_is_opt_in():
    source = "Keep this\nKeep this\n"
    assert optimize_text(source).optimized == source
    assert optimize_text(source, remove_exact_duplicate_lines=True).optimized != source
