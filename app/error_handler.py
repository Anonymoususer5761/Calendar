from flask import render_template

def error(message, error_code):
    return render_template("error.html", message=message, error_code=error_code)