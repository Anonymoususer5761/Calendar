from app import app
from app.calendar_db import get_dates, get_months, get_years
from app.error_handler import error
from app.forms import LoginForm, RegistrationForm
from app.user import sign_in_user, register_user

from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import logout_user, login_required, current_user

@app.route('/')
@app.route('/index')
@app.route('/home')
def index():
    menses = get_months()
    years = get_years()
    return render_template("index.html", menses=menses, years=years)


@app.route("/settings", methods=["GET", "POST"])
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
@app.route("/api/test")
def api_test():
    if request.headers.get('Request-Source') != 'JS-AJAX':
        return redirect(url_for("test"))
    query = request.args.get("q") 
    if query:
        return_value = query
    else:
        return_value = ""
    return jsonify(return_value)

# The below routes are APIs
@app.route('/api/index/dates')
def api_dates():
    if request.headers.get("Request-Source") != "JS-AJAX":
        return redirect(url_for("index"))
    month = request.args.get("month")
    year = request.args.get("year") 
    dates = get_dates(int(month), int(year))
    return jsonify(dates)


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
        print(request.args.get("setting"))
        print(current_user.settings[request.args.get("setting")])
        return jsonify(current_user.settings[request.args.get("setting")])
    return jsonify("User is not logged in.")