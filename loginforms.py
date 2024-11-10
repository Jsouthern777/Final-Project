from flask_wtf import FlaskForm
from wtforms.fields import PasswordField, SubmitField, EmailField, SelectField
from wtforms.validators import InputRequired, Email, EqualTo, Length, Optional
from enum import Enum

class Role(Enum):
    Viewer = 1
    Editor = 2
    Admin = 3

# define our own FlaskForm subclass for our form
class RegisterForm(FlaskForm):
    email = EmailField("Email: ", validators=[InputRequired(), Email()])
    password = PasswordField("Password: ", 
        validators=[InputRequired(), Length(min=8, max=256)])
    confirm_password = PasswordField("Confirm Password: ", 
        validators=[EqualTo('password')])
    role = SelectField("Role:", choices=[(role.name) for role in Role], validators=[InputRequired()])
    verification_password = PasswordField("Verification Password:", validators=[Optional()])
    submit = SubmitField("Register")

# define our own FlaskForm subclass for our form
class LoginForm(FlaskForm):
    email = EmailField("Email: ", validators=[InputRequired(), Email()])
    password = PasswordField("Password: ", 
        validators=[InputRequired(), Length(min=8, max=256)])
    verification_password = PasswordField("Verification Password:")
    submit = SubmitField("Login")
