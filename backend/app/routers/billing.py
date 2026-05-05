import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import User
from ..routers.auth import get_current_user

router = APIRouter()

stripe.api_key = settings.stripe_secret_key

PLAN_PRICES = {
    "pro":  settings.stripe_pro_price_id,
    "team": settings.stripe_team_price_id,
}

REPOS_LIMITS = {"free": 5, "pro": -1, "team": -1}


@router.post("/checkout")
def create_checkout(plan: str, token: str, db: Session = Depends(get_db)):
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan")
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Billing not configured")

    user = get_current_user(token, db)

    customer_id = user.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(
            email=user.email or "",
            metadata={"user_id": user.id},
        )
        customer_id = customer.id
        user.stripe_customer_id = customer_id
        db.commit()

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": PLAN_PRICES[plan], "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.frontend_url}/dashboard?upgraded=1",
        cancel_url=f"{settings.frontend_url}/pricing",
        metadata={"user_id": user.id, "plan": plan},
    )
    return {"url": session.url}


@router.post("/portal")
def billing_portal(token: str, db: Session = Depends(get_db)):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Billing not configured")
    user = get_current_user(token, db)
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found")
    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=f"{settings.frontend_url}/dashboard",
    )
    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db),
):
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Billing not configured")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.stripe_webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        _handle_checkout_completed(event["data"]["object"], db)
    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.updated"):
        _handle_subscription_change(event["data"]["object"], db)

    return {"received": True}


def _handle_checkout_completed(session: dict, db: Session) -> None:
    user_id = int(session.get("metadata", {}).get("user_id", 0))
    plan = session.get("metadata", {}).get("plan", "free")
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.plan = plan
        user.repos_limit = REPOS_LIMITS.get(plan, 5)
        db.commit()


def _handle_subscription_change(subscription: dict, db: Session) -> None:
    customer_id = subscription.get("customer")
    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        return
    status = subscription.get("status")
    if status in ("canceled", "unpaid", "incomplete_expired"):
        user.plan = "free"
        user.repos_limit = REPOS_LIMITS["free"]
    db.commit()
