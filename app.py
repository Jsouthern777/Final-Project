"""
INSTALLING REQUIRED PACKAGES
Run the following commands to install all required packages.
python -m pip install --upgrade pip
python -m pip install --upgrade flask-login
"""

###############################################################################
# Imports
###############################################################################
from __future__ import annotations
import os
from flask import Flask, render_template, url_for, redirect, current_app
from flask import request, session, flash
from flask import url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_required
from flask_login import login_user, logout_user, current_user
from functools import wraps
from enum import Enum
from eventforms import EventForm
from werkzeug.utils import secure_filename
import base64

# Import from local package files
from hashing_examples import UpdatedHasher
from loginforms import RegisterForm, LoginForm

###############################################################################
# Basic Configuration
###############################################################################

# Identify necessary files
scriptdir = os.path.dirname(os.path.abspath(__file__))
dbfile = os.path.join(scriptdir, "users.sqlite3")
pepfile = os.path.join(scriptdir, "pepper.bin")

# open and read the contents of the pepper file into your pepper key
# NOTE: you should really generate your own and not use the one from the starter
with open(pepfile, 'rb') as fin:
  pepper_key = fin.read()

# create a new instance of UpdatedHasher using that pepper key
pwd_hasher = UpdatedHasher(pepper_key)

# Configure the Flask Application
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'correcthorsebatterystaple'
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbfile}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["ADMIN_VERIFICATION_PASSWORD"] = "collegekidsanddivorcedmen697"
app.config["EDITOR_VERIFICATION_PASSWORD"] = "drdudthatesthezetas99"

#Configure uploading image
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Getting the database object handle from the app
db = SQLAlchemy(app)

# Prepare and connect the LoginManager to this app
login_manager = LoginManager()
login_manager.init_app(app)
# function name of the route that has the login form (so it can redirect users)
login_manager.login_view = 'get_login' # type: ignore
login_manager.session_protection = "strong"
# function that takes a user id and
@login_manager.user_loader
def load_user(uid: int) -> User|None:
    return User.query.get(int(uid))

###############################################################################
# Database Setup
###############################################################################

# enum for role selection
class Role(Enum):
    Viewer = 1
    Editor = 2
    Admin = 3

# Create a database model for Users
class User(UserMixin, db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.Unicode, nullable=False)
    lastName = db.Column(db.Unicode, nullable=False)
    email = db.Column(db.Unicode, nullable=False)
    password_hash = db.Column(db.LargeBinary) # hash is a binary attribute
    role = db.Column(db.Enum(Role), nullable=False)

    def is_admin(self):
        return self.role == Role.Admin
    

    # make a write-only password property that just updates the stored hash
    @property
    def password(self):
        raise AttributeError("password is a write-only attribute")
    @password.setter
    def password(self, pwd: str) -> None:
        self.password_hash = pwd_hasher.hash(pwd)
    
    # add a verify_password convenience method
    def verify_password(self, pwd: str) -> bool:
        return pwd_hasher.check(pwd, self.password_hash)

# Create a database model for Event
class Event(db.Model):
    #names, group(s), logos/flyers, RSVP lists
    __tablename__ = 'Events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode, nullable=False)
    groupName = db.Column(db.Unicode, nullable=False)
    logo = db.Column(db.String, nullable=True) 
    numRSVP = db.Column(db.Integer, nullable=True)
    numReports = db.Column(db.Integer, nullable=True)

class RegisteredUser(db.Model):
    __tablename__ = 'RegisteredUsers'
    id = db.Column(db.Integer, primary_key=True)
    eventID = db.Column(db.Integer, db.ForeignKey('Events.id'))
    userID = db.Column(db.Integer, db.ForeignKey('Users.id'))
    event = db.relationship('Event', backref='registrations')
    user = db.relationship('User', backref='rsvps')

class Reported(db.Model):
    __tablename__ = 'ReportedEvents'
    id = db.Column(db.Integer, primary_key=True)
    eventID = db.Column(db.Integer, db.ForeignKey('Events.id'))
    userID = db.Column(db.Integer, db.ForeignKey('Users.id'))
    event = db.relationship('Event', backref='reportedEvent')
    user = db.relationship('User', backref='reportedBy')



# remember that all database operations must occur within an app context
with app.app_context():
    db.create_all() # this is only needed if the database doesn't already exist


###############################################################################
#decorator for different permissions
###############################################################################

def login_required(role="Any"):
    def wrapper(fn):
        @wraps(fn)
        def decorated_view(*args, **kwargs):
            if not current_user.is_authenticated:
                flash("You need to be logged in to access this page.")
                return redirect(current_app.login_manager.unauthorized())
            
            if role != "Any" and (not hasattr(current_user, 'role') or current_user.role.name not in role.split(", ")):
                flash("You do not have permission to access this page")
                return redirect(url_for('index'))

            return fn(*args, **kwargs)
        return decorated_view
    return wrapper

###############################################################################
# Route Handlers
###############################################################################

@app.get('/register/')
def get_register():
    form = RegisterForm()
    return render_template('register.html', form=form)

@app.post('/register/')
def post_register():
    form = RegisterForm()
    if form.validate():
        #check if editor or admin role is selected and verify the password
        if form.role.data == "Editor":
            if form.verification_password.data != app.config["EDITOR_VERIFICATION_PASSWORD"]:
                flash("Incorrect password for editor position")
                return redirect(url_for('get_register'))
            role = Role.Editor  
        elif form.role.data == "Admin":
            if form.verification_password.data != app.config["ADMIN_VERIFICATION_PASSWORD"]:
                flash("Incorrect password for admin position")
                return redirect(url_for('get_register'))
            role = Role.Admin
        else:
            role = Role.Viewer
        # check if there is already a user with this email address
        user = User.query.filter_by(email=form.email.data).first()
        # if the email address is free, create a new user and send to login
        if user is None:
            user = User(firstName=form.firstName.data,
             lastName=form.lastName.data,
             email=form.email.data, 
             password=form.password.data, 
             role=form.role.data) 
            db.session.add(user)
            db.session.commit()
            form = LoginForm()
            if form.validate():
                user = User.query.filter_by(email=form.email.data).first()
                if user is not None and user.verify_password(form.password.data):
                    login_user(user)
                    next = request.args.get('next')
                    if next is None or not next.startswith('/'):
                        next = url_for('index')
                    return redirect(next)
                else: 
                    flash('Invalid email address or password')
                    return redirect(url_for('get_login'))

            return redirect(url_for('get_login'))
        else: # if the user already exists
            # flash a warning message and redirect to get registration form
            flash('There is already an account with that email address')
            return redirect(url_for('get_register'))
    else: # if the form was invalid
        # flash error messages and redirect to get registration form again
        for field, error in form.errors.items():
            flash(f"{field}: {error}")
        return redirect(url_for('get_register'))

@app.get('/login/')
def get_login():
    form = LoginForm()
    return render_template('login.html', form=form)

@app.post('/login/')
def post_login():
    form = LoginForm()
    if form.validate():
        user = User.query.filter_by(email=form.email.data).first()
        if user is not None and user.verify_password(form.password.data):

            login_user(user)
            next = request.args.get('next')
            if next is None or not next.startswith('/'):
                next = url_for('index')
            return redirect(next)
        else: 
            flash('Invalid email address or password')
            return redirect(url_for('get_login'))
    else: 
        for field, error in form.errors.items():
            flash(f"{field}: {error}")
        return redirect(url_for('get_login'))

@app.get('/')
def index():
    events = Event.query.all()
    if current_user.is_authenticated:
        print(current_user.is_admin())
        return render_template('home.html', current_user=current_user, events=events)
    else:
        return render_template('loggedOut.html', current_user=current_user, events=events)
    


@app.get('/logout/')
@login_required()
def get_logout():
    logout_user()
    flash('You have been logged out')
    return redirect(url_for('index'))

@app.get('/add_event/')
@login_required(role="Editor, Admin")
def get_add_event():
    form = EventForm()
    return render_template('eventforms.html', form=form)

#add event
@app.post('/add_event/')
@login_required(role="Editor, Admin")
def post_add_event():
    form = EventForm()
    if form.validate_on_submit():
        file = request.files['logo']  
        
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])

            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            relative_path = os.path.join('uploads', filename)
            new_event = Event(name=form.name.data, groupName=form.groupName.data, logo=relative_path)
            db.session.add(new_event)
            db.session.commit()
            flash('Event added successfully!')
            return redirect(url_for('index'))
        else:
            flash('No file uploaded or invalid file.')

    return render_template('eventforms.html', form=form)


#RSVP for an event
@app.post('/rsvp/<int:event_id>/')
@login_required()
def rsvp_event(event_id):
    event = Event.query.get_or_404(event_id)

    existing_rsvp = RegisteredUser.query.filter_by(eventID=event_id, userID=current_user.id).first()

    if existing_rsvp:
        db.session.delete(existing_rsvp)
        event.numRSVP = (event.numRSVP or 1) -1
        db.session.commit()
        flash('You un-rsvpd from this event')
    else:
        new_rsvp = RegisteredUser(eventID=event_id, userID=current_user.id)
        db.session.add(new_rsvp)
        event.numRSVP = (event.numRSVP or 0) + 1 
        db.session.commit()
        flash('Successful RSVP for this event!')
    
    return redirect(url_for('index'))


#Report an event
@app.post('/report/<int:event_id>')
@login_required()
def report_event(event_id):
    print("called")
    event = Event.query.get_or_404(event_id)
    existing_report = Reported.query.filter_by(eventID=event_id, userID=current_user.id).first()

    if existing_report:
        db.session.delete(existing_report)
        event.numReports = (event.numReports or 1) -1
        db.session.commit()
        flash('You unreported this event')
    else:
        new_report = Reported(eventID=event_id, userID=current_user.id)
        db.session.add(new_report)
        event.numReports = (event.numReports or 0) + 1
        db.session.commit()
        flash('Reported this event')
        
    return redirect(url_for('index'))

@app.get('/report_event/')
@login_required(role="Admin")
def get_reported():
    events = Event.query.all()
    form = EventForm()
    for event in events:
        if event.logo:
            event.logo_base64 = base64.b64encode(event.logo).decode('utf-8')
    return render_template('reportedContent.html', form=form, events=events)

#deleting an event
@app.post('/delete/<int:event_id>/')
@login_required(role="Admin")
def delete_event(event_id):
    form = EventForm()
    events = Event.query.all()
    existing_report = Reported.query.filter_by(eventID=event_id, userID=current_user.id).first()
    event = Event.query.get_or_404(event_id)
    db.session.delete(existing_report)
    db.session.delete(event)
    db.session.commit()
    flash('Deleted Event')
    return redirect(url_for('get_reported'))


