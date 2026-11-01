"""FastAPI service and a small browser playground."""
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from .engine import SUPPORTED_ENCODINGS, UnknownEncodingError, count_text, optimize_text

app = FastAPI(title="HM Token Intelligence API", version="0.1.0", description="Text tokenizer counts and conservative prompt optimization")

class CountRequest(BaseModel):
    text: str = Field(..., description="Exact text to count")
    encoding: str = "o200k_base"
    include_ids: bool = False

class OptimizeRequest(BaseModel):
    text: str
    encoding: str = "o200k_base"
    trim_trailing_whitespace: bool = True
    normalize_newlines: bool = True
    collapse_blank_lines: bool = True
    remove_exact_duplicate_lines: bool = False

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}

@app.get("/v1/encodings")
def encodings():
    return {"encodings": list(SUPPORTED_ENCODINGS), "default": "o200k_base"}

@app.post("/v1/count")
def count(request: CountRequest):
    try:
        return count_text(request.text, request.encoding, request.include_ids).to_dict()
    except UnknownEncodingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@app.post("/v1/optimize")
def optimize(request: OptimizeRequest):
    try:
        r = optimize_text(request.text, request.encoding, trim_trailing_whitespace=request.trim_trailing_whitespace, normalize_newlines=request.normalize_newlines, collapse_blank_lines=request.collapse_blank_lines, remove_exact_duplicate_lines=request.remove_exact_duplicate_lines)
        return {"original": r.original, "optimized": r.optimized, "before_tokens": r.before_tokens, "after_tokens": r.after_tokens, "saved_tokens": r.saved_tokens, "saved_percent": r.saved_percent, "operations": r.operations, "changed": r.changed, "review_required": r.changed}
    except UnknownEncodingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@app.get("/", response_class=HTMLResponse)
def index():
    return HTMLResponse("""<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HM Token Intelligence</title><style>body{max-width:1000px;margin:36px auto;padding:0 18px;background:#101621;color:#edf2f8;font-family:system-ui}textarea{width:100%;min-height:230px;background:#080e18;color:white;padding:14px;box-sizing:border-box;border:1px solid #3a4960;border-radius:10px}section{background:#182333;border:1px solid #304158;padding:18px;border-radius:14px;margin:16px 0}button,select{padding:10px;background:#2d4059;color:white;border:1px solid #58708e;border-radius:8px}pre{white-space:pre-wrap;overflow-wrap:anywhere}.stats{display:flex;gap:12px;flex-wrap:wrap}.stat{background:#0e1725;padding:14px;border-radius:9px}b{display:block;font-size:25px}</style><body><h1>🐈‍⬛ HM TOKEN INTELLIGENCE</h1><p>Count the supplied text with the selected encoding. Review all proposed edits.</p><section><label>Encoding <select id="enc"><option>o200k_base</option><option>cl100k_base</option><option>p50k_base</option><option>r50k_base</option></select></label><p><textarea id="txt" placeholder="Paste your prompt or text..."></textarea></p><button onclick="run('/v1/count')">Count tokens</button> <button onclick="run('/v1/optimize')">Optimize safely</button><div id="stats" class="stats"></div></section><section><h3>Optimization preview</h3><small>Original is never overwritten automatically.</small><pre id="preview"></pre><button onclick="navigator.clipboard.writeText(optimized)">Copy optimized text</button></section><script>let optimized='';async function run(path){const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:document.querySelector('#txt').value,encoding:document.querySelector('#enc').value})});const d=await r.json();if(!r.ok){alert(d.detail);return}if(path.endsWith('count'))show([['Tokens',d.tokens],['Characters',d.characters],['Words',d.words_whitespace_split],['UTF-8 bytes',d.utf8_bytes]]);else{optimized=d.optimized;show([['Before',d.before_tokens],['After',d.after_tokens],['Saved',d.saved_tokens],['Saved %',d.saved_percent+'%']]);document.querySelector('#preview').textContent=d.optimized}}function show(items){document.querySelector('#stats').innerHTML=items.map(([k,v])=>'<div class="stat">'+k+'<b>'+v+'</b></div>').join('')}</script></body></html>""")

def main():
    import uvicorn
    uvicorn.run("hm_token_intelligence.app:app", host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()
