import sys

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@localhost/makesurenew"
    secret_key: str = "change-me-in-production"
    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:8000/api/auth/callback"
    frontend_url: str = "http://localhost:5173"
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_pro_price_id: str = ""
    stripe_team_price_id: str = ""

    # GitHub webhook
    github_webhook_secret: str = ""

    # SMTP for score-drop notifications
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@makesurenew.dev"

    class Config:
        env_file = ".env"


settings = Settings()

# Fail fast on insecure defaults in production
if settings.secret_key == "change-me-in-production":
    import os
    if os.getenv("ENV", "development") == "production":
        sys.exit("ERROR: SECRET_KEY must be set to a secure value in production")
