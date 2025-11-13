from app.database_manager import get_db
from app import login_manager

from flask_login import UserMixin, login_user
from werkzeug.security import generate_password_hash, check_password_hash

default_settings = {
    "color_mode": "light_mode",
    "region": "None",
}

class User(UserMixin):

    def __init__(self, id, username, email, password_hash, settings):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.settings = settings

    # AI Usage Disclaimer: The original code had me return None `if user:` was `True`
    @classmethod
    def get(cls, id):
        db = get_db()

        user = db.execute(
            "SELECT * FROM users WHERE id = ?", (
                id,
            )
        ).fetchone()

        if user:
            user_settings = get_user_settings(user["id"])
            return cls(
                user["id"],
                user["username"],
                user["email"],
                user["password_hash"],
                user_settings
            )
            
        return None
    
    def set_user_settings(self, settings):
        db = get_db()

        try:
            settings.color_mode.data = 1 if settings.color_mode.data else 2
            for setting_id, setting in enumerate(settings, 1):
                if setting.id != "submit" and setting.id != "csrf_token":
                    db.execute("""
                        UPDATE settings
                        SET option_id = ?
                        WHERE setting_id = ?
                            AND
                        user_id = ?
                        """, (
                            int(setting.data),
                            setting_id,
                            self.id
                        )
                    )
                db.commit()
        finally:
            db.close()

        return True

    def __repr__(self):
        return f"username: {self.username}"


def sign_in_user(form):
    db = get_db()

    try:
        user = db.execute(
            "SELECT * FROM users WHERE username = ?", (
                form.username.data,
            )
        ).fetchone()

        if user:
            if check_password_hash(user["password_hash"] ,form.password.data):
                user = User(
                    id=user["id"],
                    username=user["username"],
                    email=user["email"],
                    password_hash=user["password_hash"],
                    settings=get_user_settings(user["id"])
                )

                if login_user(user):
                    return True, f"You have been successfully logged in as {user.username}."

                return False, "Sorry! Something went wrong."
            
            return False, "Incorrect password."

        return  False, "Username not found."
    finally:
        db.close()


def register_user(form):
    db = get_db()

    username = form.username.data
    email = form.email.data

    try:
        exists = db.execute(
            "SELECT * FROM users WHERE username = ? OR email = ?", (
                username,
                email,
            )
        ).fetchone()

        if not exists:
            cursor = db.cursor()
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", (
                    username,
                    email,
                    generate_password_hash(form.password.data),
                )
            )

            user_id = cursor.lastrowid
            for setting, option in default_settings.items():
                db.execute(
                    "INSERT INTO settings (setting_id, user_id, option_id) VALUES ((SELECT id FROM settings_name WHERE setting = ?), ?, (SELECT id FROM settings_options WHERE option = ?))", (
                        setting,
                        user_id,
                        option,
                    )
                )

            db.commit()

            return True, f"User {username} has been successfully registered."
        
        return False, "Registration Failed: Username or email already exists."
    finally:
        db.close()


def get_user_settings(id):
    db = get_db()

    try:
        user_settings = db.execute("""
            SELECT setting, option
            FROM settings
            JOIN users ON settings.user_id = users.id
            JOIN settings_options ON settings.option_id = settings_options.id AND settings.setting_id = settings_options.setting_id
            JOIN settings_name ON settings.setting_id = settings_name.id
            WHERE user_id = ?
        """, (
            id,
        )
        ).fetchall()

        dict_user_settings = {setting["setting"]:setting["option"] for setting in user_settings}

        return dict_user_settings
    finally:
        db.close()


@login_manager.user_loader
def load_user(id):
    return User.get(id)