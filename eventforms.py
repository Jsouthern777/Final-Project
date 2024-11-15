from flask_wtf import FlaskForm
from wtforms.fields import PasswordField, SubmitField, EmailField, SelectField, FileField, StringField
from wtforms.validators import InputRequired, Email, EqualTo, Length, Optional
from enum import Enum

# define our own FlaskForm subclass for our form
class EventForm(FlaskForm):
    name = StringField("Event name: ", validators=[InputRequired()])
    groupName = StringField("Group name: ", validators=[InputRequired()])
    logo = FileField("Upload Event Logo: ")
    submit = SubmitField("Add Event")


