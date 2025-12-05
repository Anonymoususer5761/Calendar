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
    submit = SubmitField("Add Event")

    def validate_event_color(self, event_color):
        is_valid = event_color.data in (hex_code for hex_code, color in color_choices)
        if not is_valid:
            raise ValidationError("Invalid color.")
        
    def validate_end_time(self, end_time):
        if self.start_time.data > end_time.data:
            raise ValidationError("The event cannot end before it begins.")

    def submit_to_db(self, user_id):
        db = get_db()
        try:
            db.execute("""INSERT INTO events(name, description, start_time, end_time, color, user_id) VALUES (?, ?, unixepoch(?), unixepoch(?), ?, ?)""",
                (self.name.data, self.description.data, self.start_time.data, self.end_time.data, self.event_color.data, user_id,)           
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
    event_id = HiddenField("Event ID", validators=[DataRequired()])
    submit = SubmitField("Add Event")

    def validate_event_color(self, event_color):
        is_valid = event_color.data in (hex_code for hex_code, color in color_choices)
        if not is_valid:
            raise ValidationError("Invalid color.")
        
    def validate_end_time(self, end_time):
        if self.start_time.data > end_time.data:
            raise ValidationError("The event cannot end before it begins.")
        
    def submit_to_db(self, user_id):
        db = get_db()
        try:
            event_exists = db.execute("""SELECT id FROM events WHERE user_id = ? and id = ?""",
                (user_id, self.event_id.data)           
            ).fetchone()
            if not event_exists:
                raise ValidationError("Error! Could not find event.")
            
            db.execute("""UPDATE events SET name = ?, description = ?, start_time = unixepoch(?), end_time = unixepoch(?), color = ? WHERE id = ?""",
                (self.edit_name.data, self.edit_description.data, self.edit_start_time.data, self.edit_end_time.data, self.edit_event_color.data, self.event_id.data,)           
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
