from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

# DB settings
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
HOSTNAME_DB = os.getenv("HOSTNAME_DB")
SCHEMA_NAME = os.getenv("DB_SCHEMA", "public")

# Contact info
CONTACT = os.getenv("CONTACT")

# APIs endpoints
ATLANTSOLIA_ENDPOINT = os.getenv("ATLANTSOLIA_ENDPOINT")
N1_ENDPOINT = os.getenv("N1_ENDPOINT")
OLIS_OB_ENDPOINT = os.getenv("OLIS_OB_ENDPOINT")
ORKAN_ENDPOINT = os.getenv("ORKAN_ENDPOINT")
