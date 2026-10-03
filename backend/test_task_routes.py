from datetime import date

from task_routes import _parse_due_date, VALID_PRIORITY, VALID_STATUS


def test_parse_due_date_valid():
    assert _parse_due_date("2026-10-03") == date(2026, 10, 3)


def test_parse_due_date_empty_returns_none():
    assert _parse_due_date("") is None
    assert _parse_due_date(None) is None


def test_parse_due_date_invalid_returns_none():
    assert _parse_due_date("03-10-2026") is None
    assert _parse_due_date("not-a-date") is None


def test_allowed_task_statuses():
    assert VALID_STATUS == {"pending", "in_progress", "done"}


def test_allowed_task_priorities():
    assert VALID_PRIORITY == {"low", "medium", "high"}
