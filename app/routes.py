from app import app
from app.calendar_db import *
from app.forms import LoginForm, RegistrationForm, AddEventForm, SettingsForm
from app.user import sign_in_user, register_user
from app.pytemplates import get_events_and_format_events_svg

from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import logout_user, login_required, current_user

@app.route('/')
@app.route('/index')
@app.route('/home')
def index():
    menses = get_months()
    years = get_years()
    holidays = get_holidays()
    return render_template("index.html", menses=menses, years=years, holidays=holidays)


@app.route("/dates", methods=["GET", "POST"])
def dates():
    add_event_form = AddEventForm()

    date_id = request.args.get("id")

    if add_event_form.validate_on_submit():
        if submit_event_form_to_db(add_event_form, current_user.id):
            flash("Event has been successfully added to the calendar.")
            return redirect(url_for("dates", id=date_id))
        else:
            flash("User entered invalid datetime. Event not submitted")
            return redirect(url_for("dates", id=date_id))
    if not date_id:
        return redirect(url_for("index"))
    
    date = get_date(date_id)
    add_event_form.start_time.default = f"{date} 00:00"
    day_name = get_day_name(date_id)
    events, event_polylines = get_events_and_format_events_svg(date_id, current_user.id) if current_user.is_authenticated else [None, None]
    return render_template("dates.html", date=date, day_name=day_name, event_polylines=event_polylines, events=events, add_event_form=add_event_form)


@app.route("/clock")
def clock():
    return render_template("stopwatch.html")

@app.route("/clock/stopwatch")
def stopwatch():
    return render_template("stopwatch.html")

@app.route("/clock/session")
def session():
    return render_template("session.html")


@app.route("/settings", methods=["POST", "GET"])
def settings():
    settings = SettingsForm()

    if settings.validate_on_submit():
        current_user.set_user_settings(settings)

    return render_template("settings.html", settings=settings)


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
    dates = get_calendar(int(month), int(year))
    return jsonify(dates)

@app.route('/api/index/holidays')
def api_holidays():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("index"))
    date_id = int(request.args.get("id"))
    holidays = get_specific_holidays(date_id)
    return jsonify(holidays)


@app.route("/api/dates/events")
def api_events():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("index"))
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
