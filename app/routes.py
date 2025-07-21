from app import app
from app.calendar_db import get_dates, get_months, get_years, get_day_name, get_date, submit_event_form_to_db, get_events
from app.error_handler import error
from app.forms import LoginForm, RegistrationForm
from app.user import sign_in_user, register_user, User
from app.helpers import validate_form
from app.pytemplates import events_svg

from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import logout_user, login_required, current_user

from datetime import datetime

@app.route('/')
@app.route('/index')
@app.route('/home')
def index():
    menses = get_months()
    years = get_years()
    return render_template("index.html", menses=menses, years=years)


@app.route("/dates", methods=["GET", "POST"])
def dates():
    date_id = request.args.get("id")
    if not date_id:
        return redirect(url_for("index"))

    if request.method == "POST":
        if not current_user.is_authenticated:
            flash("You must sign in to add events.")
            return redirect(url_for("login"))
        form = request.form
        if validate_form(form, required_fields=("event-name", "event-timings-date-start", "event-timings-time-start", "event-timings-date-end", "event-timings-time-end", "event-color")):
            if submit_event_form_to_db(form, current_user.id):
                flash("Event has been successfully added to calendar.")
                return redirect(url_for("dates", id=date_id))
            else:
                flash("User entered invalid datetime. Event not submitted.")
                return redirect(url_for("dates", id=date_id))
        else:
            flash("Event name and timings field cannot be empty.")
            return redirect(url_for("dates", id=date_id))
    date = get_date(date_id)
    day_name = get_day_name(date_id)
    html = events_svg(date_id, current_user.id)
    events = get_events(date_id, current_user.id)
    return render_template("dates.html", date=date, day_name=day_name, html=html, events=events)


@app.route("/settings")
def settings():
    if request.method == "POST":
        if request.form:
            for setting, option in request.form.items():
                if setting != "settings":
                    if current_user.set_user_settings(setting, int(option)):
                        return redirect(url_for("settings"))
                    flash("Form doesn't work.")
        else:
            flash("Something went wrong!")

    return render_template("settings.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    form = RegistrationForm()

    if form.validate_on_submit():
        status, message = register_user(form)
        flash(message)
        if status:
            return redirect(url_for('login'))
        
        return redirect(url_for('register'))

    return render_template("register.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        status, message = sign_in_user(form)
        flash(message)
        if status:
            return redirect(url_for('index'))
        return redirect(url_for('login'))
    return render_template("login.html", form=form)


@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('index'))


# This is only supposed to exist during development
@app.route("/test")
def api_test():
    return render_template("test.html")


# The below routes are APIs
@app.route("/api/global")
def api_global():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("index"))
    
    if request.args.get("auth"):
        if current_user.is_authenticated:
            return jsonify(True)
    return jsonify(False)


@app.route('/api/index/dates')
def api_dates():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("index"))
    month = request.args.get("month")
    year = request.args.get("year") 
    dates = get_dates(int(month), int(year))
    return jsonify(dates)


@app.route("/api/dates/events")
def api_events():
    # if request.headers.get("Request-Source") != "JS-AJAX":
    #     return redirect(url_for("index"))
    date_id = request.args.get("date_id")
    events = get_events(date_id, current_user.id)
    return jsonify(events)



@app.route("/api/settings/set-settings")
def api_set_settings():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("index"))
    if current_user.is_authenticated:
        current_user.set_user_settings(int(request.args.get("setting")), int(request.args.get("option")))
        return "Successfully changed settings!"
    return "User is not logged in."


@app.route("/api/settings/get-settings")
def api_get_settings():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("index"))
    if current_user.is_authenticated:
        return jsonify(current_user.settings)
    return jsonify("User is not logged in.")
