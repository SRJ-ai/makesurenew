from fastapi import APIRouter
from fastapi.responses import Response
from sqlalchemy.orm import Session
from fastapi import Depends

from ..database import get_db
from ..models import Repository

router = APIRouter()

_COLORS = {
    "green":  "#4ade80",
    "yellow": "#facc15",
    "red":    "#f87171",
    "gray":   "#94a3b8",
}


def _badge_svg(score: int | None) -> str:
    if score is None:
        label_val, color = "not scanned", _COLORS["gray"]
        val_w = 90
    elif score >= 80:
        label_val, color = f"{score} / 100", _COLORS["green"]
        val_w = 60
    elif score >= 50:
        label_val, color = f"{score} / 100", _COLORS["yellow"]
        val_w = 60
    else:
        label_val, color = f"{score} / 100", _COLORS["red"]
        val_w = 60

    label = "makesurenew"
    label_w = 105
    total_w = label_w + val_w

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{total_w}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="{total_w}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="{label_w}" height="20" fill="#1e293b"/>
    <rect x="{label_w}" width="{val_w}" height="20" fill="{color}"/>
    <rect width="{total_w}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="{label_w // 2}" y="15" fill="#000" fill-opacity=".3">{label}</text>
    <text x="{label_w // 2}" y="14">{label}</text>
    <text x="{label_w + val_w // 2}" y="15" fill="#000" fill-opacity=".3">{label_val}</text>
    <text x="{label_w + val_w // 2}" y="14" fill="{'#0f172a' if score and score >= 50 else '#fff'}">{label_val}</text>
  </g>
</svg>"""


@router.get("/{owner}/{repo_name}", include_in_schema=False)
def repo_badge(owner: str, repo_name: str, db: Session = Depends(get_db)):
    full_name = f"{owner}/{repo_name}"
    repo = db.query(Repository).filter(Repository.full_name == full_name).first()
    score = repo.health_score if repo else None
    svg = _badge_svg(score)
    return Response(
        content=svg,
        media_type="image/svg+xml",
        headers={
            "Cache-Control": "no-cache, max-age=0",
            "Pragma": "no-cache",
        },
    )
