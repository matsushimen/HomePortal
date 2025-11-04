def test_create_and_click_link(client):
    create_response = client.post(
        "/links",
        json={"title": "Family Calendar", "url": "https://calendar.example.com", "tags": ["family"]},
        headers={"Authorization": "Bearer test-token"},
    )
    assert create_response.status_code == 201
    link = create_response.json()
    assert link["title"] == "Family Calendar"
    assert link["click_count"] == 0

    click_response = client.post(f"/links/{link['id']}/click")
    assert click_response.status_code == 200
    assert click_response.json()["click_count"] == 1

    list_response = client.get("/links")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

