from datetime import datetime


def test_create_and_list_events(client):
    payload = {
        "title": "Planning",
        "start": "2024-01-10T10:00:00",
        "end": "2024-01-10T11:00:00",
        "all_day": False,
        "color": "#2563eb",
        "notes": "Weekly sync",
        "created_by": "Test"
    }
    response = client.post("/events", json=payload, headers={"Authorization": "Bearer token"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["all_day"] is False

    list_response = client.get(
        "/events",
        params={
            "start": "2024-01-01T00:00:00",
            "end": "2024-01-31T23:59:59"
        },
    )
    assert list_response.status_code == 200
    events = list_response.json()
    assert any(event["title"] == "Planning" for event in events)
