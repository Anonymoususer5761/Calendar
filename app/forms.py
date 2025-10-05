from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, DateTimeLocalField, SelectField
from wtforms.validators import DataRequired, EqualTo, Email

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
    name = StringField("Event", validators=[DataRequired()], render_kw={"placeholder": "Event Time"})
    description = TextAreaField("Description", render_kw={"placeholder": "Event Description"})
    start_time = DateTimeLocalField("From", validators=[DataRequired()])
    end_time = DateTimeLocalField("To", validators=[DataRequired()])
    event_color = SelectField("Color", choices=color_choices)
    submit = SubmitField("Add Event")

class SettingsForm(FlaskForm):
    color_mode = BooleanField("Dark Mode")
    region = SelectField("Region", choices=["None", "India"])
    submit = SubmitField("Save Changes")
