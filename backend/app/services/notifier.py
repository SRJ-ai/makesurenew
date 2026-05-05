import logging
import smtplib
from email.mime.text import MIMEText

from ..config import settings

logger = logging.getLogger(__name__)


async def notify_score_drop(user, repo, old_score: int, new_score: int) -> None:
    if not user.email or not user.email_notifications:
        return
    if not settings.smtp_host:
        return

    issues = repo.scan_results.get("issues", []) if repo.scan_results else []
    issue_lines = "\n".join(f"  • {i['message']}" for i in issues) or "  (none)"

    body = f"""\
Your repository health score dropped.

Repository:  {repo.full_name}
Score:       {old_score} → {new_score} (-{old_score - new_score} pts)

Issues to fix:
{issue_lines}

View your dashboard: {settings.frontend_url}/repos/{repo.id}

---
Unsubscribe: {settings.frontend_url}/settings
"""
    msg = MIMEText(body)
    msg["Subject"] = f"[makesurenew] {repo.name} health score dropped to {new_score}/100"
    msg["From"] = settings.smtp_from
    msg["To"] = user.email

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            if settings.smtp_user:
                smtp.starttls()
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
    except Exception:
        logger.exception("Failed to send score-drop email to %s", user.email)
