from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, DateTimeLocalField, SelectField, IntegerField
from wtforms.validators import DataRequired, EqualTo, Email, NumberRange

from app.helpers import color_choices

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
    name = StringField("Event", validators=[DataRequired()], render_kw={"placeholder": "Event Name"})
    description = TextAreaField("Description", render_kw={"placeholder": "Event Description"})
    start_time = DateTimeLocalField("From", validators=[DataRequired()])
    end_time = DateTimeLocalField("To", validators=[DataRequired()])
    event_color = StringField("Color Picker", validators=[DataRequired()])
    submit = SubmitField("Add Event")


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
