
from sqlalchemy import select
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from models.user import User
from schemas.auth import RegisterRequest

password_hash = PasswordHash.recommended()


def register_user(data: RegisterRequest, db: Session) -> User:
    normalized_email = str(data.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user:
        raise ValueError("An account with this email already exists.")

    user = User(
        full_name=data.full_name.strip(),
        email=normalized_email,
        password_hash=password_hash.hash(data.password),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        raise


def login_user(email: str, password: str, db: Session) -> User | None:
    normalized_email = email.strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None:
        return None

    if not password_hash.verify(password, user.password_hash):
        return None

    return user
