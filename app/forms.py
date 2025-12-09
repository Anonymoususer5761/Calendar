from flask_wtf import FlaskForm
from flask import session
from flask_login import login_user
from wtforms import HiddenField, StringField, PasswordField, BooleanField, SubmitField, TextAreaField, DateTimeLocalField, SelectField, IntegerField
from wtforms.validators import DataRequired, EqualTo, Email, NumberRange, ValidationError
from werkzeug.security import generate_password_hash, check_password_hash

from app.helpers import color_choices
from app.user import User
from app.database_manager import get_db

from datetime import timedelta

class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember_me = BooleanField("Remember me")
    submit = SubmitField("Sign In")

    def validate_username(self, username):
        db = get_db()
        try:
            is_valid = db.execute("""SELECT id FROM users WHERE username = ?""", (username.data,)).fetchone()
        finally:
            db.close()
        if not is_valid:
            raise ValidationError("Username not found.")
        
    def validate_password(self, password):
        db = get_db()
        try:
            password_hash = db.execute("""SELECT password_hash FROM users WHERE username = ?""", (self.username.data,)).fetchone()[0]
        finally:
            db.close()

        if not check_password_hash(password_hash , password.data):
            raise ValidationError("Incorrect Password")
        
    def sign_in(self):
        session.permanent = self.remember_me.data

        db = get_db()
        try:
            db_user = db.execute("""SELECT * FROM users WHERE username = ?""", (self.username.data,)).fetchone()
        finally:
            db.close()

        user = User(
            id=db_user["id"],
            username=db_user["username"],
            email=db_user["email"],
            password_hash=db_user["password_hash"],
        )

        login_user(user, remember=self.remember_me.data, duration=timedelta(days=365000))
        return True


class RegistrationForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    password2 = PasswordField("Repeat Password", validators=[DataRequired(), EqualTo("password")])
    sign_in = BooleanField("Sign In")
    remember_me = BooleanField("Remember me")
    submit = SubmitField("Register")

    def validate_username(self, username):
        db = get_db()
        try:
            exists = db.execute("""SELECT id FROM users WHERE username = ?""", (username.data,)).fetchone()
        finally:
            db.close()
        if exists:
            raise ValidationError("Username already taken. Pick another name.")
        
    def validate_email(self, email):
        db = get_db()
        try:
            exists = db.execute("""SELECT id FROM users WHERE username = ?""", (email.data,)).fetchone()
        finally:
            db.close()
        if exists:
            raise ValidationError("Username already taken. Pick another name.")
        
    def validate_remember_me(self, remember_me):
        if remember_me.data and not self.sign_in.data:
            raise ValidationError("User cannot be remembered without signing in.")
        
    def register(self):
        db = get_db()
        password_hash = generate_password_hash(self.password.data)
        try:
            cursor = db.cursor()
            cursor.execute(
                """INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)""", (
                    self.username.data, self.email.data, password_hash,
                )
            )
            user_id = cursor.lastrowid
            cursor.execute(
                """INSERT INTO pomodoro_settings (user_id) VALUES (?)""", (
                    user_id,
                )
            )
            db.commit()
        finally:
            db.close()
        if self.sign_in.data:
            session.permanent = self.remember_me.data

            user = User(
                id=user_id,
                username=self.username.data,
                email=self.email.data,
                password_hash=password_hash
            )
            login_user(user, remember=self.remember_me.data, duration=timedelta(days=365000))


class AddEventForm(FlaskForm):
    name = StringField("Event", validators=[DataRequired()])
    description = TextAreaField("Description")
    start_time = DateTimeLocalField("From", validators=[DataRequired()])
    end_time = DateTimeLocalField("To", validators=[DataRequired()])
    event_color = SelectField("Color Picker", choices=color_choices, validators=[DataRequired()])
    user_id_add_event = HiddenField("User ID", validators=[DataRequired()])
    submit = SubmitField("Add Event")

    def validate_user_id(self, user_id_add_event):
        db = get_db()
        try:
            valid_user_ids = db.execute("""SELECT id FROM users""").fetchall()
        finally:
            db.close()
        for valid_user_id in valid_user_ids:
            if user_id_add_event == valid_user_id["id"]:
                return True
        raise ValidationError("User tokey not recongnized...") 

    def validate_name(self, name):
        db = get_db()
        try:
            already_exists = db.execute("""SELECT name FROM events WHERE user_id = ? AND name = ?""",
                (self.user_id_add_event.data, name.data,)           
            ).fetchone()
        finally:
            db.close()
        if already_exists:
            raise ValidationError("You have another event by the same name")

    

    def validate_event_color(self, event_color):
        is_valid = event_color.data in (hex_code for hex_code, color in color_choices)
        if not is_valid:
            raise ValidationError("Invalid color.")
        
    def validate_end_time(self, end_time):
        if self.start_time.data > end_time.data:
            raise ValidationError("The event cannot end before it begins.")

    def submit_to_db(self):
        db = get_db()
        try:
            db.execute("""INSERT INTO events(name, description, start_time, end_time, color, user_id) VALUES (?, ?, unixepoch(?), unixepoch(?), ?, ?)""",
                (self.name.data, self.description.data, self.start_time.data, self.end_time.data, self.event_color.data, self.user_id_add_event.data,)           
            )
            db.commit()
        finally:
            db.close()
        return True

        
class EditEventForm(FlaskForm):
    edit_name = StringField("Event", validators=[DataRequired()])
    edit_description = TextAreaField("Description")
    edit_start_time = DateTimeLocalField("From", validators=[DataRequired()])
    edit_end_time = DateTimeLocalField("To", validators=[DataRequired()])
    edit_event_color = SelectField("Color Picker", choices=color_choices, validators=[DataRequired()])
    edit_user_id = HiddenField("User ID", validators=[DataRequired()])
    edit_event_id = HiddenField("Event ID", validators=[DataRequired()])
    submit = SubmitField("Add Event")

    def validate_edit_name(self, edit_name):
        db = get_db()
        try:
            exists = db.execute("""SELECT name FROM events WHERE user_id = ? AND name = ? AND id != ?""", (self.edit_user_id.data, edit_name.data, self.edit_event_id.data)).fetchone()
        finally:
            db.close()
        if exists:
            raise ValidationError("Another event by that name already exists.")

    def validate_user_id(self, edit_user_id):
        db = get_db()
        try:
            is_valid = db.execute("""SELECT id FROM users WHERE id = ?""", (edit_user_id,)).fetchone()
        finally:
            db.close()
        if not is_valid:
            raise ValidationError("User token not recongnized...")
    
    def validate_edit_event_id(self, edit_event_id):
        db = get_db()
        try:
            is_valid = db.execute("""SELECT id FROM events WHERE user_id = ? AND id = ?""",
                (self.edit_user_id.data, edit_event_id.data)
            ).fetchall()
        finally:
            db.close()
        if not is_valid:
            raise ValidationError("Invalid event ID!")

    def validate_event_color(self, event_color):
        is_valid = event_color.data in (hex_code for hex_code, color in color_choices)
        if not is_valid:
            raise ValidationError("Invalid color.")
        
    def validate_end_time(self, end_time):
        if self.start_time.data > end_time.data:
            raise ValidationError("The event cannot end before it begins.")
        
    def submit_to_db(self):
        db = get_db()
        try:
            db.execute("""UPDATE events SET name = ?, description = ?, start_time = unixepoch(?), end_time = unixepoch(?), color = ? WHERE id = ?""",
                (self.edit_name.data, self.edit_description.data, self.edit_start_time.data, self.edit_end_time.data, self.edit_event_color.data, self.edit_event_id.data,)           
            )
            db.commit()
        finally:
            db.close()
        return True


class PomodoroSettingsForm(FlaskForm):
    pomodoro_duration = IntegerField("Pomodoro Duration", validators=[DataRequired(), NumberRange(min=1)], default=25)
    short_break = IntegerField("Short Break", validators=[DataRequired(), NumberRange(min=1)], default=5)
    long_break = IntegerField("Long Break", validators=[DataRequired(), NumberRange(min=1)], default=15)
    long_break_interval = IntegerField("Long Break Interval", validators=[DataRequired(), NumberRange(min=1)], default=4, render_kw={"server-value": 4})
    submit = SubmitField("Save")

    def validate_long_break(self, long_break):
        if self.short_break.data > long_break.data:
            raise ValidationError("The short break cannot be longer than the long break.")

    def submit_to_db(self, user_id):
        db = get_db()
        try:
            db.execute("""UPDATE pomodoro_settings
            SET pomodoro_duration = ?, short_break = ?, long_break = ?, long_break_interval = ? 
            WHERE user_id = ?""", (self.pomodoro_duration.data, self.short_break.data, self.long_break.data, self.long_break_interval.data, user_id,))
            db.commit()
        finally:
            db.close()

        return True
