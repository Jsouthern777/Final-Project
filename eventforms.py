from datetime import datetime
from sqlite3 import Date
from flask_wtf import FlaskForm
from wtforms import DateTimeField, ValidationError
from wtforms.fields import PasswordField, SubmitField, EmailField, SelectField, FileField, StringField, FloatField
from wtforms.validators import InputRequired, Email, EqualTo, Length, Optional
from wtforms.widgets import DateTimeLocalInput
from enum import Enum

def validate_2023(form, field):
    try:
        date_value = field.data
        if date_value.year != 2023:
            raise ValidationError('Date must be in the year 2023.')
    except Exception as e:
        raise ValidationError('Invalid date format.')
    
def yearAgoToday():
    now = datetime.now()
    return datetime(2023, 6, now.day, now.hour, now.minute)

# define our own FlaskForm subclass for our form
class EventForm(FlaskForm):
    name = StringField("Event name: ", validators=[InputRequired()])
    groupName = StringField("Group name: ", validators=[InputRequired()])
    description = StringField("Event description", validators=[InputRequired()])
    logo = FileField("Upload Event Logo: ", validators=[Optional()])
    latitude = FloatField("Latitude: ", validators=[Optional()])
    longitude = FloatField("Longitude: ", validators=[Optional()])
    dateTime = DateTimeField("Date (Must be in the year 2023):  ", validators=[Optional(), validate_2023], widget=DateTimeLocalInput(), format='%Y-%m-%dT%H:%M', default=yearAgoToday)
    submit = SubmitField("Add Event: ")





