from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repository

router = APIRouter()

_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="160" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect rx="3" width="160" height="20" fill="#555"/>
  <rect rx="3" x="100" width="60" height="20" fill="{color}"/>
  <rect x="100" width="4" height="20" fill="{color}"/>
  <rect rx="3" width="160" height="20" fill="url(#s)"/>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="50" y="15" fill="#010101" fill-opacity=".3">makesurenew</text>
    <text x="50" y="14">makesurenew</text>
    <text x="129" y="15" fill="#010101" fill-opacity=".3">{label}</text>
    <text x="129" y="14">{label}</text>
  </g>
</svg>"""

_COLORS = {
    "green":  "#4ade80",
    "yellow": "#facc15",
    "red":    "#f87171",
    "gray":   "#9ca3af",
}


@router.get("/{owner}/{repo_name}", include_in_schema=False)
def repo_badge(owner: str, repo_name: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(
        Repository.full_name == f"{owner}/{repo_name}",
        Repository.is_private == False,  # noqa: E712
    ).first()

    if repo is None or repo.health_score is None:
        color, label = _COLORS["gray"], "not scanned"
    elif repo.health_score >= 80:
        color, label = _COLORS["green"], f"{repo.health_score}/100"
    elif repo.health_score >= 50:
        color, label = _COLORS["yellow"], f"{repo.health_score}/100"
    else:
        color, label = _COLORS["red"], f"{repo.health_score}/100"

    svg = _SVG.format(color=color, label=label)
    return Response(content=svg, media_type="image/svg+xml",
                    headers={"Cache-Control": "no-cache, max-age=0"})
