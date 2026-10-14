# Import FastAPI tools for creating endpoints and handling errors.
from fastapi import FastAPI, HTTPException, Depends

# Import tools for extracting Bearer tokens from requests.
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Import SQLAlchemy's database session type.
from sqlalchemy.orm import Session

# Import database connection and session dependency functions.
from database import test_database_connection, get_db

# Import request and response schemas for authentication.
from schemas.auth import RegisterRequest, LoginRequest
from schemas.auth_response import UserResponse, LoginResponse

# Import registration and login business logic.
from services.auth import register_user, login_user

# Import JWT token creation and verification functions.
from security import create_access_token, verify_access_token

# Import the User model for database lookups.
from models.user import User
# Import middleware that allows browser requests from your frontend.
from fastapi.middleware.cors import CORSMiddleware

# Set up Bearer-token authentication for protected endpoints.
bearer_scheme = HTTPBearer()


app = FastAPI(
    title="CareerLens API",
    description="Backend API for the CareerLens career guidance platform",
    version="1.0.0",
)
# Allow the local frontend to communicate with the FastAPI backend.
# Update the origin if your frontend runs on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.get("/")
def root():
    return {
        "message": "Welcome to CareerLens API",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "CareerLens",
    }

@app.get("/api/health/database")
def database_health():
    if test_database_connection():
        return {
            "status": "healthy",
            "database": "connected",
        }

    raise HTTPException(
        status_code=503,
        detail={
            "status": "unhealthy",
            "database": "disconnected",
        },
    )

@app.post(
    "/api/auth/register",
    response_model=UserResponse,
    status_code=201,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        return register_user(data, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc



@app.post(
    "/api/auth/login",
    response_model=LoginResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = login_user(data.email, data.password, db)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(user.id)

    return LoginResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        created_at=user.created_at,
        access_token=access_token,
        token_type="bearer",
    )




bearer_scheme = HTTPBearer()


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_access_token(credentials.credentials)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token.",
        )

    user_id = int(payload["sub"])
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found.",
        )

    return user
