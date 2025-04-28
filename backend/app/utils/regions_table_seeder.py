from app.db import db
from app.models.region import Region
from app.utils.constants import REGIONS


def seed_regions_table():
    regions_count = 0
    for region_id, region_name in REGIONS.items():
        if not db.session.get(Region, region_id):
            region = Region(id=region_id, name=region_name)
            db.session.add(region)
            regions_count += 1
    db.session.commit()
    return regions_count
