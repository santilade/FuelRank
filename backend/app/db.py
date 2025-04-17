from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

metadata = MetaData(schema='dev')
db = SQLAlchemy(metadata=metadata)
