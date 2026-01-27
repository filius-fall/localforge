from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_timezones_list():
    response = client.get("/api/timezone/zones")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_timezone_conversion():
    payload = {
        "source_tz": "UTC",
        "target_tz": "America/New_York",
        "datetime": "2024-01-01T12:00",
    }
    response = client.post("/api/timezone/convert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source_tz"] == "UTC"
    assert data["target_tz"] == "America/New_York"
    assert "output_datetime" in data
