from flask_wtf import FlaskForm
from wtforms import HiddenField, StringField, PasswordField, BooleanField, SubmitField, TextAreaField, DateTimeLocalField, SelectField, IntegerField
from wtforms.validators import DataRequired, EqualTo, Email, NumberRange, ValidationError

from app.helpers import color_choices
from app.database_manager import get_db

class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember_me = BooleanField("Remember me")
    submit = SubmitField("Sign In")


class RegistrationForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    password2 = PasswordField("Repeat Password", validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField("Register")


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
        finally:
            db.commit()
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
        finally:
            db.commit()
            db.close()
        return True

class SettingsForm(FlaskForm):
    color_mode = BooleanField("Dark Mode")
    region = SelectField("Region", choices=((1, "None"), (2, "India")))
    submit = SubmitField("Save Changes")


class PomodoroSettingsForm(FlaskForm):
    pomodoro_duration = IntegerField("Pomodoro Duration", validators=[DataRequired(), NumberRange(min=1)], default=25)
    short_break = IntegerField("Short Break", validators=[DataRequired(), NumberRange(min=1)], default=5)
    long_break = IntegerField("Long Break", validators=[DataRequired(), NumberRange(min=1)], default=15)
    long_break_interval = IntegerField("Long Break Interval", validators=[DataRequired(), NumberRange(min=1)], default=4)
    submit = SubmitField("Save")

    def validate_long_break(self, long_break):
        if self.short_break.data > long_break.data:
            raise ValidationError("The short break cannot be longer than the long break.")
