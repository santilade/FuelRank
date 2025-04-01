import os
from dotenv import load_dotenv

load_dotenv()

REGIONS = [
    {"name": "capital", "url": os.getenv("GSMBENSIN_CAPITAL")},
    {"name": "southwest", "url": os.getenv("GSMBENSIN_SOUTHWEST")},
    {"name": "south", "url": os.getenv("GSMBENSIN_SOUTH")},
    {"name": "east", "url": os.getenv("GSMBENSIN_EAST")},
    {"name": "north", "url": os.getenv("GSMBENSIN_NORTH")},
    {"name": "westfjords", "url": os.getenv("GSMBENSIN_WESTFJORDS")},
    {"name": "west", "url": os.getenv("GSMBENSIN_WEST")},
]