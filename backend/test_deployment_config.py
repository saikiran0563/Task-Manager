import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "deployment-test-secret-key-long-enough"

import pytest

from config import normalize_database_url


def test_normalizes_provider_mysql_url_and_enables_tls():
    uri, engine_options = normalize_database_url(
        "mysql://demo:pass@db.example.com:12345/defaultdb?ssl-mode=REQUIRED"
    )

    assert uri == "mysql+pymysql://demo:pass@db.example.com:12345/defaultdb"
    assert engine_options == {"connect_args": {"ssl": {}}}


def test_certificate_verification_requires_ca_path():
    with pytest.raises(ValueError, match="ssl-ca"):
        normalize_database_url(
            "mysql://demo:pass@db.example.com:12345/defaultdb?ssl-mode=VERIFY_IDENTITY"
        )


def test_certificate_verification_uses_ca_path():
    uri, engine_options = normalize_database_url(
        "mysql://demo:pass@db.example.com:12345/defaultdb"
        "?ssl-mode=VERIFY_IDENTITY&ssl-ca=%2Fetc%2Fssl%2Fmysql-ca.pem"
    )

    assert "ssl-mode" not in uri
    assert "ssl-ca" not in uri
    assert engine_options == {
        "connect_args": {"ssl": {"ca": "/etc/ssl/mysql-ca.pem"}}
    }


def test_sqlite_test_url_is_preserved():
    uri, engine_options = normalize_database_url("sqlite://")

    assert uri == "sqlite://"
    assert engine_options == {}
