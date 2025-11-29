from app.database_manager import get_db
from app import login_manager

from flask import session
from flask_login import UserMixin, login_user
from werkzeug.security import generate_password_hash, check_password_hash

from datetime import timedelta

class User(UserMixin):

    def __init__(self, id, username, email, password_hash):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash

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
            return cls(
                user["id"],
                user["username"],
                user["email"],
                user["password_hash"],
            )
            
        return None

    def __repr__(self):
        return f"username: {self.username}"


def sign_in_user(form):
    db = get_db()

    session.permanent = form.remember_me.data

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
                )

                if login_user(user, remember=form.remember_me.data, duration=timedelta(days=365000)):
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

            db.commit()

            return True, f"User {username} has been successfully registered."
        
        return False, "Registration Failed: Username or email already exists."
    finally:
        db.close()

@login_manager.user_loader
def load_user(id):
    return User.get(id)