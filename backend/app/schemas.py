from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    github_id: int
    username: str
    email: Optional[str]
    avatar_url: Optional[str]
    api_key: Optional[str] = None
    email_notifications: bool = False

    model_config = {"from_attributes": True}


class ScanHistoryOut(BaseModel):
    id: int
    health_score: int
    scanned_at: datetime

    model_config = {"from_attributes": True}


class RepoOut(BaseModel):
    id: int
    full_name: str
    name: str
    description: Optional[str]
    is_private: bool
    health_score: Optional[int]
    last_scanned_at: Optional[datetime]
    scan_results: Optional[Any]

    model_config = {"from_attributes": True}


class DashboardSummary(BaseModel):
    total_repos: int
    scanned_repos: int
    average_health_score: Optional[int]
    healthy: int
    needs_attention: int


class AffectedRepo(BaseModel):
    id: int
    full_name: str


class TopIssue(BaseModel):
    check: str
    failing_count: int
    total_scanned: int
    repos: list[AffectedRepo]
