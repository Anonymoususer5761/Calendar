from app.database_manager import get_db
from app import login_manager

from flask_login import UserMixin, login_user
from werkzeug.security import generate_password_hash, check_password_hash


class User(UserMixin):
    default_settings = {
        "color-palette": 1,
    }

    def __init__(self, id, username, email, password_hash, settings=default_settings):
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
            if user_settings:
                return cls(
                    user["id"],
                    user["username"],
                    user["email"],
                    user["password_hash"],
                    user_settings
                )
            return cls(
                user["id"],
                user["username"],
                user["email"],
                user["password_hash"],
                cls.default_settings
            )
            
        return None
    
    def set_user_settings(self, setting_id, option_id):
        db = get_db()

        exists_query = """SELECT * FROM settings WHERE user_id = ? AND setting_id = ?"""

        sql_stmt = ""
        if (db.execute(exists_query, (self.id, setting_id))).fetchone():
            sql_stmt = """UPDATE settings
SET option_id = ?
WHERE setting_id = ?
AND user_id = ?"""
        else:
            sql_stmt = """INSERT INTO settings (option_id, setting_id, user_id) 
VALUES (?, ?, ?)"""

        try:
            db.execute(sql_stmt, (option_id, setting_id, self.id,))
        except Exception:
            db.rollback()
            db.close()
            return False, 403

        db.commit()
        db.close()
        
        return True, 200
    

    def __repr__(self):
        return f"username: {self.username}"


def sign_in_user(form):
    db = get_db()

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
            )

            if login_user(user):
                return True, f"You have been successfully logged in as {user.username}."

            return False, "Sorry! Something went wrong."
        
        return False, "Incorrect password."

    return  False, "Username not found."


def register_user(form):
    db = get_db()

    username = form.username.data
    email = form.email.data

    exists = db.execute(
        "SELECT * FROM users WHERE username = ? OR email = ?", (
            username,
            email,
        )
    ).fetchone()

    if not exists:
        db.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", (
                username,
                email,
                generate_password_hash(form.password.data),
            )
        )

        db.commit()

        return True, f"User {username} has been successfully registered."
    
    return False, "Registration Failed: Username or email already exists."


def get_user_settings(id):
    db = get_db()

    sql_stmt = """SELECT setting, option
FROM settings
JOIN users ON settings.user_id = users.id
JOIN settings_options ON settings.option_id = settings_options.id AND settings.setting_id = settings_options.setting_id
JOIN settings_name ON settings.setting_id = settings_name.id
WHERE user_id = ?"""

    user_settings = db.execute(sql_stmt, (id,)).fetchall()

    dict_user_settings = {setting["setting"]:setting["option"] for setting in user_settings}

    return dict_user_settings


@login_manager.user_loader
def load_user(id):
    return User.get(id)