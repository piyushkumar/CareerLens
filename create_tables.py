from database import engine
from models import Base, User

Base.metadata.create_all(bind=engine)

print("CareerLens database tables created successfully!")