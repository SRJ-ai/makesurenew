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

    __table_args__ = (
        Index("ix_repo_owner_score", "owner_id", "health_score"),
    )
