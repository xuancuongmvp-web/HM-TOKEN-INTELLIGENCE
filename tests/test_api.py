from fastapi.testclient import TestClient
from hm_token_intelligence.app import app
client = TestClient(app)

def test_health():
    assert client.get("/health").json()["status"] == "ok"

def test_count_endpoint():
    response = client.post("/v1/count", json={"text": "Xin chào", "encoding": "o200k_base"})
    assert response.status_code == 200
    assert response.json()["tokens"] > 0

def test_unknown_encoding_rejected():
    response = client.post("/v1/count", json={"text": "hello", "encoding": "not-real"})
    assert response.status_code == 400

def test_optimizer_preview():
    source = "a\n\n\nb"
    body = client.post("/v1/optimize", json={"text": source}).json()
    assert body["review_required"] is True
    assert body["original"] == source
    assert body["optimized"] == "a\n\nb"
