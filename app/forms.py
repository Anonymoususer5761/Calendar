from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, DateTimeLocalField, SelectField
from wtforms.validators import DataRequired, EqualTo, Email

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
    name = StringField("Event", validators=[DataRequired()], placeholder="Event Name")
    description = TextAreaField("Description", placeholder="Event Description")
    start_time = DateTimeLocalField("From", validators=[DataRequired()])
    end_time = DateTimeLocalField("To", validators=[DataRequired()])
    event_color = SelectField("Color", choices=[("#ff0000", "Red"), ("#00ff00", "Green"), ("#0000ff", "Blue")])
    submit = SubmitField("Add Event")