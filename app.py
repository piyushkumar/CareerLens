from fastapi import FastAPI, HTTPException
from database import test_database_connection



app = FastAPI(
    title="CareerLens API",
    description="Backend API for the CareerLens career guidance platform",
    version="1.0.0",
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