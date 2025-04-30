import os
from dotenv import load_dotenv

load_dotenv()
SCHEMA_NAME = os.getenv("DB_SCHEMA", "public")
