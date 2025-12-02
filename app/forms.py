from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, DateTimeLocalField, SelectField, IntegerField
from wtforms.validators import DataRequired, EqualTo, Email, NumberRange, ValidationError

from app.helpers import COLOR_HEX_RE

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
    event_color = StringField("Color Picker", validators=[DataRequired()])
    submit = SubmitField("Add Event")

    def validate_event_color(self, event_color):
        if not (COLOR_HEX_RE.fullmatch(event_color.data)):
            raise ValidationError("Invalid color!")
        
    def validate_end_time(self, end_time):
        if self.start_time.data > end_time.data:
            raise ValidationError("The event cannot end before it begins.")


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
        if self.short_break > long_break:
            raise ValidationError("The short break cannot be longer than the long break.")
