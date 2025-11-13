from app import app
from app.calendar_db import *
from app.forms import LoginForm, RegistrationForm, AddEventForm, SettingsForm, PomodoroSettingsForm
from app.user import sign_in_user, register_user
from app.pytemplates import get_events_and_format_events_svg
from app.helpers import update_dictionary

from flask import render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import logout_user, login_required, current_user

import time

milliseconds_in_second = 1000

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
@app.route("/clock/stopwatch")
def stopwatch():
    return render_template("stopwatch.html")


@app.route("/clock/pomodoro", methods=["GET", "POST"])
def pomodoro():
    form = PomodoroSettingsForm()
    return render_template("pomodoro.html", form=form)


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


@login_required
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


@app.route("/api/clock/stopwatch/initialize")
@app.route("/api/clock/stopwatch/reset")
def api_stopwatch_initialize(bypass_verification=False):
    if not bypass_verification:
        if request.headers.get("Request-Source") != "JS-AJAX":
            return redirect(url_for("clock"))

    session["stopwatch"] = {
        "start_time": 0,
        "paused": True,
        "elapsed_time": 0,
        "paused_at": 0,
        "lap_times": [
            {
                "lapTime": 0,
                "totalTime": 0,
            }
        ]
    }
    return jsonify(True)

@app.route("/api/clock/stopwatch/start")
def api_stopwatch_start():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))

    if not session.get("stopwatch"):
        api_stopwatch_initialize(bypass_verification=True)
    
    session["stopwatch"] = update_dictionary(
        session["stopwatch"],
        start_time = int(request.args.get("start_time")),
        paused = False,
    )
    return jsonify(session["stopwatch"])

# AI Usage Disclaimer: I used ChatGPT to send POST requests using fetch api.
@app.route("/api/clock/stopwatch/lap", methods=["POST"])
def api_stopwatch_lap():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))

    data = request.get_json()
    lap_time = data.get("lap_time")

    session["stopwatch"]["lap_times"].append(lap_time)
    session.modified = True
    return jsonify(session["stopwatch"])

@app.route("/api/clock/stopwatch/stop")
def api_stopwatch_stop():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))
    
    session["stopwatch"] = update_dictionary(
        session["stopwatch"],
        paused = True,
        elapsed_time = int(request.args.get("elapsed_time")),
        paused_at = int(request.args.get("elapsed_time")),
    )
    return jsonify(session["stopwatch"])

@app.route("/api/clock/stopwatch/elapsed_time")
def api_stopwatch_elapsed_time(bypass_verification=False):
    if not bypass_verification:
        if request.headers.get("Request-Source") != "JS-AJAX":
            return redirect(url_for("clock"))

    elapsed_time  = round(time.time() * milliseconds_in_second) - session["stopwatch"]["start_time"]
    session["stopwatch"] = update_dictionary(
        session["stopwatch"],
        elapsed_time = elapsed_time,
    )
    return jsonify(session["stopwatch"]["elapsed_time"])

@app.route("/api/clock/stopwatch")
def api_stopwatch():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))
    
    if not session.get("stopwatch"):
        return jsonify(False)
    if not session["stopwatch"]["paused"]:
        api_stopwatch_elapsed_time(bypass_verification=True)
    stopwatch = session["stopwatch"]
    return jsonify(stopwatch)


@app.route("/api/clock/pomodoro/initialize")
@app.route("/api/clock/pomodoro/reset")
def api_pomodoro_initialize(bypass_verification=False):
    if not bypass_verification:
        if request.headers.get("Request-Source") != "JS-AJAX":
            return redirect(url_for("clock"))

    session["pomodoro"] = {
        "start_time": 0,
        "session_duration": 0,
        "remaining_duration": 0,
        "paused": True,
        "paused_at": 0,
        "break_time": False,
        "session_counter": 0,
        "break_counter": 0,
        "_exists": False,
    }
    return jsonify(True)

@app.route("/api/clock/pomodoro/start")
def api_pomodoro_start():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))
    
    if not session.get("stopwatch"):
        api_pomodoro_initialize(bypass_verification=True)
    
    session["pomodoro"] = update_dictionary(
        session["pomodoro"],
        start_time = int(request.args.get("start_time")),
        session_duration = int(request.args.get("session_duration")),
        paused = False,
        _exists = True,
    )
    # print(f'Duration: {session["pomodoro"]["session_duration"]}')
    return jsonify(session["pomodoro"])

@app.route("/api/clock/pomodoro/stop")
def api_pomodoro_stop():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))
    
    session["pomodoro"] = update_dictionary(
        session["pomodoro"],
        paused = True,
        paused_at = int(request.args.get("paused_at")),
        remaining_duration = int(request.args.get("remaining_duration")),
    )
    return jsonify(session["pomodoro"])

@app.route("/api/clock/pomodoro/switch_session")
def api_switch_session():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))
    
    break_time = True if request.args.get("break_time") == "true" else False,
    session_counter = session["pomodoro"]["session_counter"]
    break_counter = session["pomodoro"]["break_counter"]
    break_time = True if request.args.get("break_time") == "true" else False
    if break_time:
        session_counter += 1
    else:
        break_counter += 1
    session["pomodoro"] = update_dictionary(
        session["pomodoro"],
        start_time = int(request.args.get("start_time")),
        session_duration = int(request.args.get("session_duration")),
        break_time = break_time,
        session_counter = session_counter,
        break_counter = break_counter,
    )
    print(f'SESSION: {session["pomodoro"]["session_counter"]}!!!!!!!!!!!')
    print(f'BREAK: {session["pomodoro"]["break_counter"]}!!!!!!!!!!!')
    return jsonify(True)

@app.route("/api/clock/pomodoro/remaining_duration")
def api_pomodoro_remaining_duration(bypass_verification=False):
    if not bypass_verification:
        if request.headers.get("Request-Source") != "JS-AJAX":
            return redirect(url_for("clock"))
    
    elapsed_time  = round(time.time() * milliseconds_in_second) - session["pomodoro"]["start_time"]
    remaining_duration = session["pomodoro"]["session_duration"] - elapsed_time
    session["pomodoro"] = update_dictionary(
        session["pomodoro"],
        remaining_duration = remaining_duration,
    )
    return jsonify(session["pomodoro"]["remaining_duration"])

@app.route("/api/clock/pomodoro/")
def api_pomodoro():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("clock"))
    
    if not session.get("pomodoro"):
        api_pomodoro_initialize(bypass_verification=True)
    if not session["pomodoro"]["paused"]:
        api_pomodoro_remaining_duration(bypass_verification=True)
    pomodoro = session["pomodoro"]
    return jsonify(pomodoro)

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