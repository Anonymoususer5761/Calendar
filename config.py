import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "placeholder-secret-key-please-change-this"
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_PERMANENT = os.environ.get("SESSION_PERMANENT") or True
    SESSION_TYPE = os.environ.get("SESSION_TYPE") or "filesystem"