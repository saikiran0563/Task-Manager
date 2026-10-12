import os
from datetime import timedelta

from dotenv import load_dotenv
from sqlalchemy.engine import URL, make_url

load_dotenv()


def normalize_database_url(database_url):
    """Normalize provider MySQL URLs for SQLAlchemy/PyMySQL and configure TLS."""
    url = make_url(database_url)

    if url.drivername == "mysql":
        url = url.set(drivername="mysql+pymysql")

    query = dict(url.query)
    ssl_mode = query.pop("ssl-mode", None) or query.pop("ssl_mode", None)
    ssl_ca = query.pop("ssl-ca", None) or query.pop("ssl_ca", None)
    url = url.set(query=query)

    connect_args = {}
    if ssl_ca:
        connect_args["ssl"] = {"ca": ssl_ca}
    elif ssl_mode and str(ssl_mode).lower() in {"required", "verify_ca", "verify_identity"}:
        connect_args["ssl"] = {}

    if str(ssl_mode).lower() in {"verify_ca", "verify_identity"} if ssl_mode else False:
        if not ssl_ca:
            raise ValueError("DATABASE_URL must include ssl-ca when SSL mode verifies certificates.")

    engine_options = {"connect_args": connect_args} if connect_args else {}
    return url.render_as_string(hide_password=False), engine_options


class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "task_manager")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))

    DATABASE_URL = os.getenv("DATABASE_URL")
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI, SQLALCHEMY_ENGINE_OPTIONS = normalize_database_url(DATABASE_URL)
    else:
        SQLALCHEMY_DATABASE_URI = URL.create(
            "mysql+pymysql",
            username=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
        )
        SQLALCHEMY_ENGINE_OPTIONS = {}

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-secret-in-env-file"
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
