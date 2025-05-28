import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "placeholder-secret-key-please-change-this"

    # SESSION_PERMANENT = os.environ.get("SESSION_PERMANENT") or False
    # SESSION_TYPE = os.environ.get("SESSION_TYPE") or "filesystem"