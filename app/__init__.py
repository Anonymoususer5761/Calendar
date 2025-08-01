from flask import Flask
from flask_login import LoginManager

from config import Config

app = Flask(__name__)

login_manager = LoginManager(app)
login_manager.login_view = "login"

app.config.from_object(Config)

from app import routes
