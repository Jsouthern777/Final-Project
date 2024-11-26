from flask_wtf import FlaskForm
from wtforms.fields import PasswordField, SubmitField, EmailField, SelectField, StringField
from wtforms.validators import InputRequired, Email, EqualTo, Length, Optional, ValidationError
from enum import Enum

class Role(Enum):
    Viewer = 1
    Editor = 2
    Admin = 3

#custom validator for gcc email addresses
def gcc_email_validator(form, field):
    if not field.data.endswith('@gcc.edu'):
        raise ValidationError("Email must be a Grove City College email address")
# define our own FlaskForm subclass for our form
class RegisterForm(FlaskForm):
    firstName = StringField("First Name :", validators=[InputRequired()])
    lastName = StringField("Last Name :", validators=[InputRequired()])
    email = EmailField("Email: ", validators=[InputRequired(), Email(), gcc_email_validator])
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


