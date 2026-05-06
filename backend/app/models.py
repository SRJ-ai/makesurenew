from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    access_token = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Subscription / billing
    plan = Column(String, default="free")           # "free" | "pro" | "team"
    stripe_customer_id = Column(String, nullable=True, unique=True)
    subscription_ends_at = Column(DateTime(timezone=True), nullable=True)
    repos_limit = Column(Integer, default=5)        # free=5, pro=unlimited(-1), team=-1
    api_key = Column(String, nullable=True, unique=True, index=True)
    email_notifications = Column(Boolean, default=False)

    repos = relationship("Repository", back_populates="owner")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    github_repo_id = Column(Integer, unique=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    full_name = Column(String, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    is_private = Column(Boolean, default=False)
    health_score = Column(Integer, nullable=True)
    last_scanned_at = Column(DateTime(timezone=True), nullable=True)
    scan_results = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="repos")
    history = relationship(
        "ScanHistory",
        back_populates="repository",
        order_by="ScanHistory.scanned_at.desc()",
        passive_deletes=True,
    )


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), index=True)
    health_score = Column(Integer, nullable=False)
    scanned_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    repository = relationship("Repository", back_populates="history")

    __table_args__ = (
        Index("ix_scan_history_repo_time", "repository_id", "scanned_at"),

    __table_args__ = (
        Index("ix_repo_owner_score", "owner_id", "health_score"),
    )
