
from database import test_database_connection


if test_database_connection():
    print("CareerLens MySQL connection successful!")
else:
    print("CareerLens MySQL connection failed.")
