from flask_wtf import FlaskForm
from wtforms import DateTimeField
from wtforms.fields import PasswordField, SubmitField, EmailField, SelectField, FileField, StringField
from wtforms.validators import InputRequired, Email, EqualTo, Length, Optional
from wtforms.widgets import DateTimeLocalInput
from enum import Enum

# define our own FlaskForm subclass for our form
class EventForm(FlaskForm):
    name = StringField("Event name: ", validators=[InputRequired()])
    groupName = StringField("Group name: ", validators=[InputRequired()])
    description = StringField("Event description", validators=[InputRequired()])
    logo = FileField("Upload Event Logo: ")
    submit = SubmitField("Add Event: ")
    dateTime = DateTimeField("Date:  ", validators=[Optional()], widget=DateTimeLocalInput(), format='%Y-%m-%dT%H:%M' )


